import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { gpuEnhancePhoto, checkGpuServerHealth } from './gpu-api';
import { saveResultImage } from './image-utils';

/**
 * AI 백엔드 모드:
 *   'gpu'      - 자체 GPU PC 서버만 사용
 *   'cloud'    - OpenAI 클라우드 API만 사용
 *   'auto'     - GPU 서버 우선, 실패 시 클라우드 폴백
 */
type AiBackendMode = 'gpu' | 'cloud' | 'auto';

function getBackendMode(): AiBackendMode {
  return (process.env.AI_BACKEND_MODE as AiBackendMode) || 'auto';
}

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });
}

async function openaiEnhance(params: {
  imagePath: string;
  editPrompt: string;
}): Promise<{ url?: string; b64_json?: string }> {
  const openai = getOpenAIClient();
  const absolutePath = path.isAbsolute(params.imagePath)
    ? params.imagePath
    : path.join(process.cwd(), params.imagePath);

  const response = await openai.images.edit({
    model: 'gpt-image-1',
    image: fs.createReadStream(absolutePath),
    prompt: params.editPrompt,
    n: 1,
    size: '1024x1024',
  });

  if (!response.data || response.data.length === 0) {
    throw new Error('AI로부터 결과 이미지를 받지 못했습니다');
  }
  return response.data[0];
}

export async function enhanceRealEstatePhoto(params: {
  imagePath: string;
  editPrompt: string;
}): Promise<{ url?: string; b64_json?: string }> {
  const mode = getBackendMode();

  // GPU 모드 또는 Auto 모드
  if (mode === 'gpu' || mode === 'auto') {
    try {
      const health = await checkGpuServerHealth();
      if (health.online) {
        console.log('[AI] GPU 서버 사용 중 (사진 보정)...');
        const result = await gpuEnhancePhoto(params);

        // base64 결과인 경우 로컬에 저장
        if (result.b64_json) {
          const saved = await saveResultImage(result.b64_json, true);
          return { url: saved.url };
        }
        if (result.url) {
          return { url: result.url };
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

  // 클라우드 모드 (OpenAI)
  console.log('[AI] OpenAI 클라우드 사용 중 (사진 보정)...');
  return openaiEnhance(params);
}
