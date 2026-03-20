import Replicate from 'replicate';
import { gpuGenerateInteriorDesign, checkGpuServerHealth } from './gpu-api';
import { saveResultImage } from './image-utils';

/**
 * AI 백엔드 모드:
 *   'gpu'      - 자체 GPU PC 서버만 사용
 *   'cloud'    - Replicate 클라우드 API만 사용
 *   'auto'     - GPU 서버 우선, 실패 시 클라우드 폴백
 */
type AiBackendMode = 'gpu' | 'cloud' | 'auto';

function getBackendMode(): AiBackendMode {
  return (process.env.AI_BACKEND_MODE as AiBackendMode) || 'auto';
}

// Replicate 클라우드 (폴백용)
function getReplicateClient() {
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  });
}

async function replicateGenerate(params: {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  promptStrength?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}): Promise<string> {
  const replicate = getReplicateClient();
  const output = await replicate.run(
    'adirik/interior-design:76604baddc85b1b4616e1c6475eca080da339c8875bd4996705440484a6eac38',
    {
      input: {
        image: params.imageUrl,
        prompt: params.prompt,
        negative_prompt:
          params.negativePrompt ||
          'lowres, watermark, banner, logo, contactinfo, text, deformed, blurry, blur, out of focus, out of frame, surreal, ugly',
        prompt_strength: params.promptStrength ?? 0.8,
        guidance_scale: params.guidanceScale ?? 15,
        num_inference_steps: params.numInferenceSteps ?? 50,
      },
    }
  );

  if (Array.isArray(output)) {
    return String(output[0]);
  }
  return String(output);
}

export async function generateInteriorDesign(params: {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  promptStrength?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
}): Promise<string> {
  const mode = getBackendMode();

  // GPU 모드 또는 Auto 모드
  if (mode === 'gpu' || mode === 'auto') {
    try {
      const health = await checkGpuServerHealth();
      if (health.online) {
        console.log('[AI] GPU 서버 사용 중...');
        const result = await gpuGenerateInteriorDesign(params);

        // 결과 저장 후 로컬 URL 반환
        if (result.b64_json) {
          const saved = await saveResultImage(result.b64_json, true);
          return saved.url;
        }
        if (result.url) {
          return result.url;
        }
        throw new Error('GPU 서버에서 빈 결과를 반환했습니다');
      }

      if (mode === 'gpu') {
        throw new Error('GPU 서버에 연결할 수 없습니다. GPU_API_URL을 확인해주세요.');
      }

      console.log('[AI] GPU 서버 오프라인, 클라우드 폴백...');
    } catch (error) {
      if (mode === 'gpu') throw error;
      console.log('[AI] GPU 서버 실패, 클라우드 폴백:', error);
    }
  }

  // 클라우드 모드 (Replicate)
  console.log('[AI] Replicate 클라우드 사용 중...');
  return replicateGenerate(params);
}
