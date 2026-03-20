import { NextRequest, NextResponse } from 'next/server';
import { processUploadedImage } from '@/lib/image-utils';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: '이미지를 선택해주세요' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'JPG, PNG, WebP 형식만 지원합니다' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: '파일 크기는 10MB 이하만 가능합니다' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await processUploadedImage(buffer, file.name);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: '업로드 실패' }, { status: 500 });
  }
}
