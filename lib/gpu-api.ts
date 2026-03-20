import fs from 'fs';
import path from 'path';

/**
 * 자체 GPU PC API 클라이언트
 *
 * GPU 서버에서 Stable Diffusion / ControlNet / Inpainting 모델을 실행하고
 * REST API로 결과를 반환하는 구조입니다.
 *
 * GPU 서버 필수 엔드포인트:
 *   POST /api/remodel    - 인테리어 리모델링 (img2img + ControlNet)
 *   POST /api/enhance    - 사진 보정 (inpainting + img2img)
 *   GET  /api/health     - 서버 상태 확인
 *
 * 권장 GPU 서버 구현: ComfyUI API / Automatic1111 API / InvokeAI API
 */

const GPU_API_URL = process.env.GPU_API_URL || 'http://localhost:7860';
const GPU_API_KEY = process.env.GPU_API_KEY || '';

interface GpuApiOptions {
  timeout?: number;
}

async function gpuFetch(
  endpoint: string,
  body: Record<string, unknown>,
  options: GpuApiOptions = {}
): Promise<Response> {
  const { timeout = 120000 } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (GPU_API_KEY) {
    headers['Authorization'] = `Bearer ${GPU_API_KEY}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${GPU_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function gpuFetchMultipart(
  endpoint: string,
  formData: FormData,
  options: GpuApiOptions = {}
): Promise<Response> {
  const { timeout = 120000 } = options;

  const headers: Record<string, string> = {};
  if (GPU_API_KEY) {
    headers['Authorization'] = `Bearer ${GPU_API_KEY}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${GPU_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 자체 GPU 서버로 인테리어 리모델링 요청
 * 이미지를 base64로 전송하고 결과 이미지를 base64 또는 URL로 받음
 */
export async function gpuGenerateInteriorDesign(params: {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  promptStrength?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}): Promise<{ url?: string; b64_json?: string }> {
  // 이미지를 base64로 변환 (로컬 파일인 경우)
  let imageBase64: string | undefined;
  let imageUrlRemote: string | undefined;

  if (params.imageUrl.startsWith('http')) {
    // 원격 URL인 경우 이미지 다운로드 후 base64
    const response = await fetch(params.imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    imageBase64 = buffer.toString('base64');
  } else {
    // 로컬 파일 경로인 경우
    const localPath = path.join(process.cwd(), 'public', params.imageUrl);
    if (fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      imageBase64 = buffer.toString('base64');
    } else {
      imageUrlRemote = params.imageUrl;
    }
  }

  const res = await gpuFetch('/api/remodel', {
    image_base64: imageBase64,
    image_url: imageUrlRemote,
    prompt: params.prompt,
    negative_prompt:
      params.negativePrompt ||
      'lowres, watermark, banner, logo, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, ugly',
    prompt_strength: params.promptStrength ?? 0.8,
    guidance_scale: params.guidanceScale ?? 15,
    num_inference_steps: params.numInferenceSteps ?? 50,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GPU 서버 오류 (${res.status}): ${errorText}`);
  }

  const data = await res.json();

  // GPU 서버 응답 형식: { image_base64: string } 또는 { image_url: string }
  return {
    b64_json: data.image_base64 || data.b64_json,
    url: data.image_url || data.url,
  };
}

/**
 * 자체 GPU 서버로 사진 보정 요청
 * 이미지 파일을 multipart 또는 base64로 전송
 */
export async function gpuEnhancePhoto(params: {
  imagePath: string;
  editPrompt: string;
}): Promise<{ url?: string; b64_json?: string }> {
  const absolutePath = path.isAbsolute(params.imagePath)
    ? params.imagePath
    : path.join(process.cwd(), params.imagePath);

  const buffer = fs.readFileSync(absolutePath);
  const imageBase64 = buffer.toString('base64');

  const res = await gpuFetch('/api/enhance', {
    image_base64: imageBase64,
    prompt: params.editPrompt,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GPU 서버 오류 (${res.status}): ${errorText}`);
  }

  const data = await res.json();

  return {
    b64_json: data.image_base64 || data.b64_json,
    url: data.image_url || data.url,
  };
}

/**
 * GPU 서버 상태 확인
 */
export async function checkGpuServerHealth(): Promise<{
  online: boolean;
  gpu?: string;
  models?: string[];
}> {
  try {
    const headers: Record<string, string> = {};
    if (GPU_API_KEY) {
      headers['Authorization'] = `Bearer ${GPU_API_KEY}`;
    }

    const res = await fetch(`${GPU_API_URL}/api/health`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return { online: true, gpu: data.gpu, models: data.models };
    }
    return { online: false };
  } catch {
    return { online: false };
  }
}
