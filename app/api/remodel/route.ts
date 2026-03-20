import { NextRequest, NextResponse } from 'next/server';
import { generateInteriorDesign } from '@/lib/replicate';
import { buildRemodelPrompt } from '@/lib/prompts';
import { saveResultImage } from '@/lib/image-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, style, roomType, colorTheme, additionalPrompt, promptStrength } = body;

    if (!imageUrl || !style || !roomType) {
      return NextResponse.json(
        { success: false, error: '필수 항목을 모두 입력해주세요' },
        { status: 400 }
      );
    }

    const prompt = buildRemodelPrompt(style, roomType, colorTheme, additionalPrompt);

    // Replicate에 전달할 전체 URL 생성
    const origin = request.nextUrl.origin;
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${origin}${imageUrl}`;

    const resultUrl = await generateInteriorDesign({
      imageUrl: fullImageUrl,
      prompt,
      promptStrength: promptStrength ?? 0.8,
    });

    // 결과 이미지를 로컬에 저장 (Replicate URL은 임시)
    const saved = await saveResultImage(resultUrl);

    const resultId = uuidv4();

    return NextResponse.json({
      success: true,
      data: {
        id: resultId,
        originalImageUrl: imageUrl,
        resultImageUrl: saved.url,
        style,
        roomType,
      },
    });
  } catch (error) {
    console.error('Remodel error:', error);
    return NextResponse.json(
      { success: false, error: '리모델링 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
