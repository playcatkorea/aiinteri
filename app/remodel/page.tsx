'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Download, RotateCcw, SlidersHorizontal } from 'lucide-react';
import ImageUploader from '@/components/upload/ImageUploader';
import StyleSelector from '@/components/remodel/StyleSelector';
import RoomTypeSelector from '@/components/remodel/RoomTypeSelector';
import ColorThemeSelector from '@/components/remodel/ColorThemeSelector';
import BeforeAfterSlider from '@/components/enhance/BeforeAfterSlider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { InteriorStyle, RoomType } from '@/types';

type Step = 'upload' | 'options' | 'processing' | 'result';

export default function RemodelPage() {
  const [step, setStep] = useState<Step>('upload');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<InteriorStyle | null>(null);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [promptStrength, setPromptStrength] = useState(0.8);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
    setStep('options');
  };

  const handleSubmit = async () => {
    if (!imageUrl || !style || !roomType) return;

    setStep('processing');
    setError(null);

    try {
      const res = await fetch('/api/remodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          style,
          roomType,
          colorTheme,
          additionalPrompt: additionalPrompt || undefined,
          promptStrength,
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
    setStyle(null);
    setRoomType(null);
    setColorTheme(null);
    setAdditionalPrompt('');
    setPromptStrength(0.8);
    setResultUrl(null);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 헤더 */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
          <Wand2 className="w-4 h-4" />
          AI 인테리어 리모델링
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          당신의 공간을{' '}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            새롭게 디자인
          </span>
        </h1>
        <p className="text-white/50 mt-3">
          실내 사진을 올리고, 원하는 스타일을 선택하면 AI가 리모델링합니다
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
                <div className={`w-8 h-0.5 ${isActive ? 'bg-blue-500' : 'bg-white/10'}`} />
              )}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/30'
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
            {/* 업로드된 이미지 미리보기 */}
            {imageUrl && (
              <div className="max-w-sm mx-auto rounded-xl overflow-hidden border border-white/10">
                <img src={imageUrl} alt="업로드된 사진" className="w-full" />
              </div>
            )}

            <RoomTypeSelector selected={roomType} onSelect={setRoomType} />
            <StyleSelector selected={style} onSelect={setStyle} />
            <ColorThemeSelector selected={colorTheme} onSelect={setColorTheme} />

            {/* 변환 강도 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  변환 강도
                </h3>
                <span className="text-blue-400 font-mono">{Math.round(promptStrength * 100)}%</span>
              </div>
              <input
                type="range"
                min={0.3}
                max={1.0}
                step={0.05}
                value={promptStrength}
                onChange={(e) => setPromptStrength(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
              />
              <div className="flex justify-between text-xs text-white/30 mt-1">
                <span>원본 유지</span>
                <span>강한 변환</span>
              </div>
            </div>

            {/* 추가 요청사항 */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">
                추가 요청사항 <span className="text-white/40 text-sm font-normal">(선택)</span>
              </h3>
              <textarea
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="예: 화이트 톤 소파와 원목 테이블을 배치해주세요..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-blue-500/50 transition-colors"
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
                disabled={!style || !roomType}
              >
                <Wand2 className="w-4 h-4" />
                리모델링 시작
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
              message="AI가 인테리어를 리모델링하고 있습니다..."
              submessage="약 10~30초 정도 소요됩니다. 잠시만 기다려주세요."
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
                다른 스타일 적용
              </Button>
              <a href={resultUrl} download>
                <Button>
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
