'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/cn';
import Image from 'next/image';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  className,
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
    },
    [handleMove]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      handleMove(e.clientX);
    };
    const onMouseUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleMove]);

  return (
    <div
      ref={containerRef}
      className={cn('relative aspect-[4/3] rounded-2xl overflow-hidden cursor-col-resize select-none', className)}
      onMouseDown={handleMouseDown}
      onTouchMove={handleTouchMove}
      onClick={(e) => handleMove(e.clientX)}
    >
      {/* After (뒤) */}
      <div className="absolute inset-0">
        <Image src={afterImage} alt="보정 후" fill className="object-cover" />
      </div>

      {/* Before (앞, 클리핑) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image src={beforeImage} alt="보정 전" fill className="object-cover" />
      </div>

      {/* 슬라이더 라인 */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L3 10L7 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 4L17 10L13 16" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* 라벨 */}
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium z-20">
        BEFORE
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium z-20">
        AFTER
      </div>
    </div>
  );
}
