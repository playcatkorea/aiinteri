'use client';

import { cn } from '@/lib/cn';
import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export default function Card({ children, hover = false, glow = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6',
        hover && 'hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer',
        glow && 'hover:shadow-lg hover:shadow-blue-500/10',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
