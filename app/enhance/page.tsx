'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, RotateCcw } from 'lucide-react';
import ImageUploader from '@/components/upload/ImageUploader';
import EnhanceOptions from '@/components/enhance/EnhanceOptions';
import BeforeAfterSlider from '@/components/enhance/BeforeAfterSlider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { EnhanceOption } from '@/types';
import { ENHANCE_OPTIONS } from '@/lib/constants';

type Step = 'upload' | 'options' | 'processing' | 'result';

export default function EnhancePage() {
  const [step, setStep] = useState<Step>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<EnhanceOption[]>([
    'straighten',
    'perspective',
    'declutter',
    'remove-reflection',
    'remove-wall-items',
  ]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
    setStep('options');
  };

  const handleToggleOption = (option: EnhanceOption) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === ENHANCE_OPTIONS.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(ENHANCE_OPTIONS.map((o) => o.id));
    }
  };

  const handleSubmit = async () => {
    if (!imageUrl || selectedOptions.length === 0) return;

    setStep('processing');
    setError(null);

    try {
      const res = await fetch('/api/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          options: selectedOptions,
          additionalNotes: additionalNotes || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResultUrl(data.data.resultImageUrl);
        setStep('result');
      } else {
        setError(data.error || '처리에 실패했습니다');
        setStep('options');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다');
      setStep('options');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setImageUrl(null);
    setSelectedOptions(['straighten', 'perspective', 'declutter', 'remove-reflection', 'remove-wall-items']);
    setAdditionalNotes('');
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm mb-4">
          <Camera className="w-4 h-4" />
          부동산 사진 보정
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          대충 찍은 사진을{' '}
          <span className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            전문가 퀄리티
          </span>
          로
        </h1>
        <p className="text-white/50 mt-3">
          수평 보정, 잡동사니 제거, 유리 반사 제거, 벽 정리까지 AI가 한번에 처리합니다
        </p>
      </div>

      {/* 단계 표시 */}
      <div className="flex items-center justify-center gap-2 mb-10">
        {['업로드', '옵션 설정', '처리 중', '결과'].map((label, i) => {
          const steps: Step[] = ['upload', 'options', 'processing', 'result'];
          const isActive = steps.indexOf(step) >= i;
          return (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`w-8 h-0.5 ${isActive ? 'bg-orange-500' : 'bg-white/10'}`} />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/30'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-xs hidden sm:inline ${
                  isActive ? 'text-white' : 'text-white/30'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: 업로드 */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-xl mx-auto"
          >
            <ImageUploader onImageUploaded={handleImageUploaded} />
          </motion.div>
        )}

        {/* Step 2: 옵션 선택 */}
        {step === 'options' && (
          <motion.div
            key="options"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {imageUrl && (
              <div className="max-w-sm mx-auto rounded-xl overflow-hidden border border-white/10">
                <img src={imageUrl} alt="업로드된 사진" className="w-full" />
              </div>
            )}

            <EnhanceOptions
              selected={selectedOptions}
              onToggle={handleToggleOption}
              onSelectAll={handleSelectAll}
            />

            {/* 추가 요청사항 */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                추가 요청사항 <span className="text-white/40 text-sm font-normal">(선택)</span>
              </h3>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="예: 바닥의 택배 상자도 제거해주세요..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-orange-500/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleReset}>
                다시 시작
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedOptions.length === 0}
                className="bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700"
              >
                <Camera className="w-4 h-4" />
                보정 시작
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: 처리 중 */}
        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSpinner
              message="AI가 사진을 보정하고 있습니다..."
              submessage="수평 보정, 잡동사니 제거 등을 처리 중입니다. 잠시만 기다려주세요."
            />
          </motion.div>
        )}

        {/* Step 4: 결과 */}
        {step === 'result' && imageUrl && resultUrl && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <BeforeAfterSlider beforeImage={imageUrl} afterImage={resultUrl} />

            <div className="text-center text-white/50 text-sm">
              슬라이더를 좌우로 드래그하여 Before/After를 비교해보세요
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
                새로 시작
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep('options');
                  setResultUrl(null);
                }}
              >
                다른 옵션으로 재보정
              </Button>
              <a href={resultUrl} download>
                <Button className="bg-gradient-to-r from-orange-500 to-rose-600">
                  <Download className="w-4 h-4" />
                  다운로드
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
