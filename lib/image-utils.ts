import sharp from 'sharp';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const RESULTS_DIR = path.join(process.cwd(), 'public', 'results');

export async function ensureDirectories() {
  await mkdir(UPLOAD_DIR, { recursive: true });
  await mkdir(RESULTS_DIR, { recursive: true });
}

export async function processUploadedImage(
  buffer: Buffer,
  originalName: string
): Promise<{ filename: string; filepath: string; url: string }> {
  await ensureDirectories();

  const ext = path.extname(originalName).toLowerCase();
  const filename = `${uuidv4()}${ext === '.png' ? '.png' : '.jpg'}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  // 이미지 리사이즈 (최대 1536px, API 비용 절감)
  const processed = await sharp(buffer)
    .resize(1536, 1536, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 90 })
    .toBuffer();

  await writeFile(filepath, processed);

  return {
    filename,
    filepath,
    url: `/uploads/${filename}`,
  };
}

export async function saveResultImage(
  imageData: string | Buffer,
  isBase64 = false
): Promise<{ filename: string; url: string }> {
  await ensureDirectories();

  const filename = `${uuidv4()}.jpg`;
  const filepath = path.join(RESULTS_DIR, filename);

  if (isBase64) {
    const buffer = Buffer.from(imageData as string, 'base64');
    await writeFile(filepath, buffer);
  } else if (Buffer.isBuffer(imageData)) {
    await writeFile(filepath, imageData);
  } else {
    // URL에서 다운로드
    const response = await fetch(imageData as string);
    const arrayBuffer = await response.arrayBuffer();
    await writeFile(filepath, Buffer.from(arrayBuffer));
  }

  return {
    filename,
    url: `/results/${filename}`,
  };
}
