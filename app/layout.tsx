import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AI 인테리어 - AI로 꿈꾸는 인테리어를 현실로',
  description:
    '실내 사진을 업로드하면 AI가 최신 인테리어 디자인으로 변환하고, 부동산 사진을 전문가 수준으로 보정해드립니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0F1117] text-white">
        <Header />
        <main className="flex-1 pt-16">{children}</main>
      </body>
    </html>
  );
}
