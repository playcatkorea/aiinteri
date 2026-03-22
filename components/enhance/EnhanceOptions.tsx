'use client';

import { cn } from '@/lib/cn';
import { ENHANCE_OPTIONS } from '@/lib/constants';
import type { EnhanceOption } from '@/types';
import {
  Ruler,
  Maximize2,
  Trash2,
  EyeOff,
  ImageOff,
  Sun,
  Palette,
} from 'lucide-react';
import { Check } from 'lucide-react';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Ruler,
  Maximize2,
  Trash2,
  EyeOff,
  ImageOff,
  Sun,
  Palette,
};

interface EnhanceOptionsProps {
  selected: EnhanceOption[];
  onToggle: (option: EnhanceOption) => void;
  onSelectAll: () => void;
}

export default function EnhanceOptions({ selected, onToggle, onSelectAll }: EnhanceOptionsProps) {
  const allSelected = selected.length === ENHANCE_OPTIONS.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-lg">보정 옵션 선택</h3>
        <button
          onClick={onSelectAll}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          {allSelected ? '전체 해제' : '전체 선택'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ENHANCE_OPTIONS.map((option) => {
          const Icon = ICONS[option.icon];
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              onClick={() => onToggle(option.id)}
              className={cn(
                'flex items-start gap-4 p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer',
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                  isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/50'
                )}
              >
                {Icon && <Icon className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{option.name}</p>
                <p className="text-white/40 text-xs mt-1">{option.description}</p>
              </div>

              <div
                className={cn(
                  'flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center mt-0.5',
                  isSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-white/20 bg-transparent'
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
