'use client';

import { cn } from '@/lib/cn';
import { INTERIOR_STYLES } from '@/lib/constants';
import type { InteriorStyle } from '@/types';
import { motion } from 'framer-motion';

interface StyleSelectorProps {
  selected: InteriorStyle | null;
  onSelect: (style: InteriorStyle) => void;
}

export default function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div>
      <h3 className="text-white font-semibold text-lg mb-4">인테리어 스타일 선택</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {INTERIOR_STYLES.map((style) => (
          <motion.button
            key={style.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(style.id)}
            className={cn(
              'relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer',
              selected === style.id
                ? 'border-blue-500 bg-blue-500/15 shadow-lg shadow-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            )}
          >
            <span className="text-2xl block mb-2">{style.emoji}</span>
            <p className="text-white font-medium text-sm">{style.name}</p>
            <p className="text-white/40 text-xs mt-1 line-clamp-2">{style.description}</p>
            {selected === style.id && (
              <motion.div
                layoutId="style-selected"
                className="absolute inset-0 rounded-xl border-2 border-blue-500 pointer-events-none"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
