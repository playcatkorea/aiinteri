'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/cn';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

export default function ImageUploader({ onImageUploaded, className }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('JPG, PNG, WebP 형식만 지원합니다');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('파일 크기는 10MB 이하만 가능합니다');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success) {
          onImageUploaded(data.data.url);
        } else {
          setError(data.error || '업로드 실패');
        }
      } catch {
        setError('네트워크 오류');
      }
    },
    [onImageUploaded]
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      const fileArr = Array.from(files);
      setUploading(fileArr.length);
      for (const file of fileArr) {
        await uploadFile(file);
      }
      setUploading(0);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [handleFiles]
  );

  return (
    <div className={cn('w-full', className)}>
      <motion.div
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/20 hover:border-white/40 hover:bg-white/5'
        )}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleChange}
        />

        {uploading > 0 ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
            <p className="text-white/60 text-sm">{uploading}장 업로드 중...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-7 h-7 text-blue-400" />
              ) : (
                <Upload className="w-7 h-7 text-white/50" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">
                {isDragging ? '여기에 놓으세요' : '클릭 또는 드래그로 업로드'}
              </p>
              <p className="text-white/40 text-xs mt-1">여러 장 동시 선택 가능 · JPG, PNG, WebP · 최대 10MB</p>
            </div>
          </div>
        )}
      </motion.div>

      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-2 text-red-400 text-sm text-center">{error}</motion.p>
      )}
    </div>
  );
}
