'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

export default function ImageUploader({ onImageUploaded, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('JPG, PNG, WebP 형식만 지원합니다');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하만 가능합니다');
        return;
      }

      // 미리보기
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // 업로드
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', file);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
          onImageUploaded(data.data.url);
        } else {
          setError(data.error || '업로드에 실패했습니다');
          setPreview(null);
        }
      } catch {
        setError('네트워크 오류가 발생했습니다');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [onImageUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const removeImage = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('w-full', className)}>
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={preview}
                alt="업로드된 이미지"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 cursor-pointer',
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/20 hover:border-white/40 hover:bg-white/5'
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleChange}
            />

            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                {isDragging ? (
                  <ImageIcon className="w-8 h-8 text-blue-400" />
                ) : (
                  <Upload className="w-8 h-8 text-white/50" />
                )}
              </div>

              <div>
                <p className="text-white font-medium text-lg">
                  {isDragging ? '여기에 놓으세요' : '이미지를 드래그하거나 클릭해서 업로드'}
                </p>
                <p className="text-white/40 text-sm mt-1">JPG, PNG, WebP · 최대 10MB</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-red-400 text-sm text-center"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
