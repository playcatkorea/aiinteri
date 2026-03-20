import { NextRequest, NextResponse } from 'next/server';
import { enhanceRealEstatePhoto } from '@/lib/openai';
import { buildEnhancePrompt } from '@/lib/prompts';
import { saveResultImage } from '@/lib/image-utils';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, options, additionalNotes } = body;

    if (!imageUrl || !options || options.length === 0) {
      return NextResponse.json(
        { success: false, error: '이미지와 보정 옵션을 선택해주세요' },
        { status: 400 }
      );
    }

    const editPrompt = buildEnhancePrompt(options, additionalNotes);
    const imagePath = path.join(process.cwd(), 'public', imageUrl);

    const result = await enhanceRealEstatePhoto({
      imagePath,
      editPrompt,
    });

    // 결과 이미지 저장
    let saved;
    if (result.b64_json) {
      saved = await saveResultImage(result.b64_json, true);
    } else if (result.url) {
      saved = await saveResultImage(result.url);
    } else {
      throw new Error('AI로부터 결과 이미지를 받지 못했습니다');
    }

    const resultId = uuidv4();

    return NextResponse.json({
      success: true,
      data: {
        id: resultId,
        originalImageUrl: imageUrl,
        resultImageUrl: saved.url,
        options,
      },
    });
  } catch (error) {
    console.error('Enhance error:', error);
    return NextResponse.json(
      { success: false, error: '사진 보정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
