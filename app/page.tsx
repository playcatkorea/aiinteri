'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Camera, ArrowRight, Upload, Palette, Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              AI 기반 인테리어 디자인 서비스
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              사진 한 장으로
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                꿈꾸는 인테리어
              </span>
              를 현실로
            </h1>

            <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-2xl mx-auto leading-relaxed">
              AI가 당신의 공간을 분석하고 최신 인테리어 트렌드에 맞춰 리모델링합니다.
              대충 찍은 사진도 전문가가 촬영한 것처럼 보정해드립니다.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/remodel">
                <Button size="lg" className="min-w-[200px]">
                  <Wand2 className="w-5 h-5" />
                  AI 리모델링 시작
                </Button>
              </Link>
              <Link href="/enhance">
                <Button variant="secondary" size="lg" className="min-w-[200px]">
                  <Camera className="w-5 h-5" />
                  사진 보정하기
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">두 가지 핵심 기능</h2>
          <p className="text-white/50 max-w-xl mx-auto">
            인테리어 전문가와 부동산 사진작가를 AI로 대체합니다
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/remodel">
              <Card hover glow className="h-full group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6">
                  <Wand2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">AI 인테리어 리모델링</h3>
                <p className="text-white/50 mb-6 leading-relaxed">
                  현재 집 사진을 올리면 모던, 스칸디나비안, 일본풍 등 12가지 스타일로
                  AI가 새롭게 디자인합니다. 방 구조는 그대로 유지하면서 인테리어만 변환합니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['모던', '미니멀', '스칸디나비안', '인더스트리얼', '일본 젠'].map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs">
                      {s}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs">
                    +7 more
                  </span>
                </div>
                <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">리모델링 시작하기</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/enhance">
              <Card hover glow className="h-full group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center mb-6">
                  <Camera className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">부동산 사진 보정</h3>
                <p className="text-white/50 mb-6 leading-relaxed">
                  대충 찍은 실내 사진을 전문가가 촬영한 것처럼 보정합니다.
                  기울어진 수평 교정, 잡동사니 제거, 유리 반사 제거, 벽 부착물 정리까지 한번에.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['수평 보정', '정면 보정', '잡동사니 제거', '반사 제거', '벽 정리', '조명 보정'].map((s) => (
                    <span key={s} className="px-3 py-1 rounded-full bg-white/5 text-white/40 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-orange-400 group-hover:gap-3 transition-all">
                  <span className="text-sm font-medium">사진 보정 시작하기</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">간단한 3단계</h2>
          <p className="text-white/50">복잡한 과정 없이 누구나 쉽게 사용할 수 있습니다</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: Upload,
              title: '사진 업로드',
              desc: '변환하고 싶은 실내 사진을 드래그하거나 클릭해서 업로드합니다.',
            },
            {
              step: '02',
              icon: Palette,
              title: '옵션 선택',
              desc: '원하는 인테리어 스타일이나 보정 옵션을 선택합니다.',
            },
            {
              step: '03',
              icon: Download,
              title: '결과 확인',
              desc: 'AI가 생성한 결과를 확인하고 고해상도 이미지를 다운로드합니다.',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <div className="relative mx-auto w-16 h-16 mb-6">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20" />
                <div className="relative w-full h-full rounded-2xl flex items-center justify-center">
                  <item.icon className="w-7 h-7 text-blue-400" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/30 text-sm">
            AI 인테리어 &copy; {new Date().getFullYear()} &middot; Powered by Replicate & OpenAI
          </p>
        </div>
      </footer>
    </div>
  );
}
