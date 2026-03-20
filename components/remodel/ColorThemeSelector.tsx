'use client';

import { cn } from '@/lib/cn';
import { COLOR_THEMES } from '@/lib/constants';

interface ColorThemeSelectorProps {
  selected: string | null;
  onSelect: (color: string | null) => void;
}

export default function ColorThemeSelector({ selected, onSelect }: ColorThemeSelectorProps) {
  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-2">색상 테마 <span className="text-white/40 text-sm font-normal">(선택)</span></h3>
      <div className="flex flex-wrap gap-3">
        {COLOR_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(selected === theme.id ? null : theme.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200 cursor-pointer',
              selected === theme.id
                ? 'border-blue-500 bg-blue-500/15'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            )}
          >
            <div
              className="w-4 h-4 rounded-full border border-white/20"
              style={{ backgroundColor: theme.color }}
            />
            <span className="text-sm text-white/80">{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
