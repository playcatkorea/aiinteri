import { NextResponse } from 'next/server';
import { checkGpuServerHealth } from '@/lib/gpu-api';

export async function GET() {
  try {
    const health = await checkGpuServerHealth();
    const mode = process.env.AI_BACKEND_MODE || 'auto';

    return NextResponse.json({
      success: true,
      data: {
        mode,
        gpuServer: {
          url: process.env.GPU_API_URL || 'http://localhost:7860',
          ...health,
        },
        cloudApis: {
          replicate: !!process.env.REPLICATE_API_TOKEN,
          openai: !!process.env.OPENAI_API_KEY,
        },
      },
    });
  } catch (error) {
    console.error('GPU status check error:', error);
    return NextResponse.json(
      { success: false, error: 'GPU 상태 확인 실패' },
      { status: 500 }
    );
  }
}
