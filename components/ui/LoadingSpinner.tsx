'use client';

import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
  className?: string;
}

export default function LoadingSpinner({
  message = 'AI가 이미지를 처리하고 있습니다...',
  submessage = '약 10~30초 정도 소요됩니다',
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-6 py-12', className)}>
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-white/10 border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-white/5 border-b-indigo-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="text-center space-y-2">
        <motion.p
          className="text-white text-lg font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {message}
        </motion.p>
        <p className="text-white/50 text-sm">{submessage}</p>
      </div>

      <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );
}
