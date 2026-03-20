'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: '홈' },
  { href: '/remodel', label: 'AI 리모델링' },
  { href: '/enhance', label: '사진 보정' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0F1117]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">
              AI<span className="text-blue-400">인테리어</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
