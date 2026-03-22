'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Download, RotateCcw, SlidersHorizontal, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import StyleSelector from '@/components/remodel/StyleSelector';
import RoomTypeSelector from '@/components/remodel/RoomTypeSelector';
import ColorThemeSelector from '@/components/remodel/ColorThemeSelector';
import BeforeAfterSlider from '@/components/enhance/BeforeAfterSlider';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import type { InteriorStyle, RoomType } from '@/types';

type Step = 'upload' | 'options' | 'processing' | 'result';
type WallType = 'window' | 'tv' | 'sofa' | 'opposite';

interface WallImage {
  type: WallType;
  url: string | null;
  resultUrl?: string;
  uploading?: boolean;
}

interface Room {
  id: string;
  name: string;
  walls: WallImage[];
  expanded: boolean;
}

const WALL_CONFIG: { type: WallType; label: string; desc: string; guide: string; svg: string }[] = [
  {
    type: 'window', label: '창문 면', desc: '창문이 있는 벽',
    guide: '창문 전체가 보이도록 정면에서 촬영',
    svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="78" height="58" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
      <rect x="20" y="8" width="40" height="30" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <line x1="40" y1="8" x2="40" y2="38" stroke="currentColor" stroke-width="1"/>
      <line x1="20" y1="23" x2="60" y2="23" stroke="currentColor" stroke-width="1"/>
      <path d="M25 13 L35 18 L25 23" fill="currentColor" opacity="0.15"/>
      <rect x="1" y="42" width="78" height="17" fill="currentColor" opacity="0.08"/>
      <text x="40" y="53" text-anchor="middle" fill="currentColor" font-size="6" opacity="0.4">floor</text>
    </svg>`
  },
  {
    type: 'tv', label: 'TV/스크린 면', desc: 'TV가 있는 벽',
    guide: 'TV와 주변 가구가 보이도록 촬영',
    svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="78" height="58" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
      <rect x="22" y="10" width="36" height="22" rx="2" stroke="currentColor" stroke-width="1.5"/>
      <rect x="24" y="12" width="32" height="18" rx="1" fill="currentColor" opacity="0.1"/>
      <rect x="30" y="35" width="20" height="8" rx="1" stroke="currentColor" stroke-width="1" opacity="0.5"/>
      <rect x="1" y="42" width="78" height="17" fill="currentColor" opacity="0.08"/>
      <line x="38" y1="32" x2="38" y2="35" stroke="currentColor" stroke-width="1" opacity="0.4"/>
      <line x="42" y1="32" x2="42" y2="35" stroke="currentColor" stroke-width="1" opacity="0.4"/>
    </svg>`
  },
  {
    type: 'sofa', label: '소파/좌석 면', desc: '소파가 있는 벽',
    guide: '소파와 바닥이 다 보이도록 뒤에서 촬영',
    svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="78" height="58" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
      <path d="M15 28 Q15 24 19 24 L61 24 Q65 24 65 28 L65 36 L15 36 Z" stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity="0.1"/>
      <path d="M12 30 Q12 26 15 26 L15 36 L12 36 Z" stroke="currentColor" stroke-width="1" fill="currentColor" opacity="0.08"/>
      <path d="M68 30 Q68 26 65 26 L65 36 L68 36 Z" stroke="currentColor" stroke-width="1" fill="currentColor" opacity="0.08"/>
      <rect x="30" y="18" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <rect x="42" y="18" width="8" height="6" rx="1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <rect x="1" y="42" width="78" height="17" fill="currentColor" opacity="0.08"/>
    </svg>`
  },
  {
    type: 'opposite', label: '창문 반대면', desc: '창문 맞은편 벽',
    guide: '창문을 등지고 반대쪽 벽을 촬영',
    svg: `<svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="78" height="58" rx="4" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
      <rect x="30" y="10" width="20" height="32" rx="2" stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
      <circle cx="40" cy="36" r="2" fill="currentColor" opacity="0.3"/>
      <rect x="10" y="15" width="12" height="16" rx="1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <rect x="58" y="12" width="14" height="20" rx="1" stroke="currentColor" stroke-width="1" opacity="0.3"/>
      <rect x="1" y="42" width="78" height="17" fill="currentColor" opacity="0.08"/>
      <path d="M5 5 L12 12" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-dasharray="2"/>
      <path d="M75 5 L68 12" stroke="currentColor" stroke-width="1" opacity="0.2" stroke-dasharray="2"/>
    </svg>`
  },
];

const ROOM_OPTIONS = ['거실','침실','방1','방2','방3','주방','서재','아이방','욕실','현관','다이닝룸','드레스룸','베란다','다용도실'];

export default function RemodelPage() {
  const [step, setStep] = useState<Step>('upload');
  const [rooms, setRooms] = useState<Room[]>([{
    id: '1', name: '거실', expanded: true,
    walls: WALL_CONFIG.map(w => ({ type: w.type, url: null }))
  }]);
  const [style, setStyle] = useState<InteriorStyle | null>(null);
  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [colorTheme, setColorTheme] = useState<string | null>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [promptStrength, setPromptStrength] = useState(0.8);
  const [error, setError] = useState<string | null>(null);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [totalToProcess, setTotalToProcess] = useState(0);
  const [viewingResult, setViewingResult] = useState<{roomIdx: number; wallIdx: number} | null>(null);

  const totalImages = rooms.reduce((sum, r) => sum + r.walls.filter(w => w.url).length, 0);

  const addRoom = () => {
    const id = String(Date.now());
    const usedNames = rooms.map(r => r.name);
    const nextName = ROOM_OPTIONS.find(n => !usedNames.includes(n)) || `방 ${rooms.length + 1}`;
    setRooms(prev => [...prev, {
      id, name: nextName, expanded: true,
      walls: WALL_CONFIG.map(w => ({ type: w.type, url: null }))
    }]);
  };

  const removeRoom = (roomId: string) => {
    if (rooms.length <= 1) return;
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const toggleRoom = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, expanded: !r.expanded } : r));
  };

  const updateRoomName = (roomId: string, name: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, name } : r));
  };

  const handleWallUpload = async (roomId: string, wallType: WallType, file: File) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return;
    if (file.size > 10 * 1024 * 1024) return;
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, walls: r.walls.map(w => w.type === wallType ? { ...w, uploading: true } : w) } : r));
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setRooms(prev => prev.map(r => r.id === roomId ? { ...r, walls: r.walls.map(w => w.type === wallType ? { ...w, url: data.data.url, uploading: false } : w) } : r));
      }
    } catch {
      setRooms(prev => prev.map(r => r.id === roomId ? { ...r, walls: r.walls.map(w => w.type === wallType ? { ...w, uploading: false } : w) } : r));
    }
  };

  const removeWallImage = (roomId: string, wallType: WallType) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, walls: r.walls.map(w => w.type === wallType ? { ...w, url: null, resultUrl: undefined } : w) } : r));
  };

  const handleSubmit = async () => {
    if (!style || !roomType || totalImages === 0) return;
    setStep('processing'); setError(null);
    const tasks: { roomId: string; wallType: WallType; url: string }[] = [];
    rooms.forEach(room => { room.walls.forEach(wall => { if (wall.url) tasks.push({ roomId: room.id, wallType: wall.type, url: wall.url }); }); });
    setTotalToProcess(tasks.length);
    for (let i = 0; i < tasks.length; i++) {
      setProcessingIndex(i + 1);
      const { roomId, wallType, url } = tasks[i];
      try {
        const res = await fetch('/api/remodel', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: url, style, roomType, colorTheme, additionalPrompt: additionalPrompt || undefined, promptStrength }) });
        const data = await res.json();
        if (data.success) {
          setRooms(prev => prev.map(r => r.id === roomId ? { ...r, walls: r.walls.map(w => w.type === wallType ? { ...w, resultUrl: data.data.resultImageUrl } : w) } : r));
        }
      } catch { /* continue */ }
    }
    setStep('result');
  };

  const handleReset = () => {
    setStep('upload');
    setRooms([{ id: '1', name: '거실', expanded: true, walls: WALL_CONFIG.map(w => ({ type: w.type, url: null })) }]);
    setStyle(null); setRoomType(null); setColorTheme(null);
    setAdditionalPrompt(''); setPromptStrength(0.8); setError(null); setViewingResult(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm mb-4">
          <Wand2 className="w-4 h-4" />AI 인테리어 리모델링
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">
          당신의 공간을{' '}
          <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">새롭게 디자인</span>
        </h1>
        <p className="text-white/50 mt-3">각 방의 4면을 올리면 같은 컨셉으로 일관성 있게 리모델링합니다</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl px-4 py-3 mb-4">
              <p className="text-blue-300 text-sm font-medium mb-1">촬영 가이드</p>
              <p className="text-white/40 text-xs leading-relaxed">
                각 면을 촬영할 때 <span className="text-white/60 font-medium">바닥부터 천장까지 전체가 보이도록 광각으로</span> 찍어주세요.
                벽의 가장자리가 모두 포함되어야 구조를 정확히 파악할 수 있습니다.
                스마트폰의 0.5x 광각 모드를 추천합니다.
              </p>
            </div>

            {rooms.map((room) => (
              <div key={room.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 cursor-pointer" onClick={() => toggleRoom(room.id)}>
                  <div className="flex items-center gap-3">
                    {room.expanded ? <ChevronUp className="w-4 h-4 text-white/50" /> : <ChevronDown className="w-4 h-4 text-white/50" />}
                    <select value={room.name}
                      onChange={(e) => { e.stopPropagation(); updateRoomName(room.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent text-white font-semibold text-sm focus:outline-none cursor-pointer"
                      style={{WebkitAppearance: 'none'}}>
                      {ROOM_OPTIONS.map(n => <option key={n} value={n} style={{background: '#1a1a2e'}}>{n}</option>)}
                    </select>
                    <span className="text-white/30 text-xs">{room.walls.filter(w => w.url).length}/4면</span>
                  </div>
                  {rooms.length > 1 && (
                    <button onClick={(e) => { e.stopPropagation(); removeRoom(room.id); }} className="p-1 text-white/30 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>

                {room.expanded && (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {room.walls.map((wall) => {
                      const config = WALL_CONFIG.find(c => c.type === wall.type)!;
                      return (
                        <div key={wall.type}>
                          {wall.url ? (
                            <div className="relative group rounded-xl overflow-hidden border border-white/10">
                              <img src={wall.url} alt={config.label} className="w-full aspect-[4/3] object-cover" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                                <div className="text-white text-xs font-medium">{config.label}</div>
                              </div>
                              <button onClick={() => removeWallImage(room.id, wall.type)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-xl border-2 border-dashed border-white/15 hover:border-blue-400/50 hover:bg-blue-400/5 cursor-pointer transition-all group">
                              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleWallUpload(room.id, wall.type, f); e.target.value = ''; }} />
                              {wall.uploading ? (
                                <div className="w-6 h-6 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin" />
                              ) : (
                                <>
                                  <div className="w-16 h-12 text-white/20 group-hover:text-blue-400/40 transition-colors mb-1"
                                    dangerouslySetInnerHTML={{ __html: config.svg }} />
                                  <span className="text-white/50 text-xs font-medium">{config.label}</span>
                                  <span className="text-white/25 text-[10px] mt-0.5 text-center px-2">{config.guide}</span>
                                </>
                              )}
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            <div className="flex justify-center gap-4 mt-4">
              <button onClick={addRoom} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-white/50 hover:border-blue-400 hover:text-blue-400 transition-colors">
                <Plus className="w-4 h-4" />방 추가
              </button>
            </div>

            {totalImages > 0 && (
              <div className="flex justify-center mt-6">
                <Button onClick={() => setStep('options')}>다음: 스타일 선택 ({totalImages}장)</Button>
              </div>
            )}
          </motion.div>
        )}

        {step === 'options' && (
          <motion.div key="options" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white/50 text-sm mb-3">업로드된 이미지 ({totalImages}장, {rooms.length}개 공간)</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {rooms.map(room => room.walls.filter(w => w.url).map(wall => {
                  const config = WALL_CONFIG.find(c => c.type === wall.type)!;
                  return (
                    <div key={`${room.id}-${wall.type}`} className="rounded-lg overflow-hidden border border-white/10">
                      <img src={wall.url!} alt="" className="w-full aspect-square object-cover" />
                      <div className="bg-white/5 px-1 py-0.5 text-[9px] text-white/40 truncate text-center">{room.name} {config.label}</div>
                    </div>
                  );
                }))}
              </div>
            </div>
            <RoomTypeSelector selected={roomType} onSelect={setRoomType} />
            <StyleSelector selected={style} onSelect={setStyle} />
            <ColorThemeSelector selected={colorTheme} onSelect={setColorTheme} />
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2"><SlidersHorizontal className="w-5 h-5" />변환 강도</h3>
                <span className="text-blue-400 font-mono">{Math.round(promptStrength * 100)}%</span>
              </div>
              <input type="range" min={0.3} max={1.0} step={0.05} value={promptStrength} onChange={(e) => setPromptStrength(parseFloat(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500" />
              <div className="flex justify-between text-xs text-white/30 mt-1"><span>원본 유지</span><span>강한 변환</span></div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">추가 요청사항 <span className="text-white/40 text-sm font-normal">(선택)</span></h3>
              <textarea value={additionalPrompt} onChange={(e) => setAdditionalPrompt(e.target.value)}
                placeholder="예: 화이트 톤 소파와 원목 테이블을 배치해주세요..."
                className="w-full h-24 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 resize-none focus:outline-none focus:border-blue-500/50 transition-colors" />
            </div>
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-lg">{error}</p>}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => setStep('upload')}>이전</Button>
              <Button onClick={handleSubmit} disabled={!style || !roomType}><Wand2 className="w-4 h-4" />전체 리모델링 ({totalImages}장)</Button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingSpinner message={`리모델링 중... (${processingIndex}/${totalToProcess})`} submessage="모든 공간을 같은 컨셉으로 일관성 있게 변환하고 있습니다." />
            <div className="max-w-md mx-auto mt-6"><div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${(processingIndex / totalToProcess) * 100}%` }} /></div></div>
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            {viewingResult !== null ? (
              <>
                <BeforeAfterSlider beforeImage={rooms[viewingResult.roomIdx].walls[viewingResult.wallIdx].url!} afterImage={rooms[viewingResult.roomIdx].walls[viewingResult.wallIdx].resultUrl!} />
                <div className="text-center text-white/50 text-sm">{rooms[viewingResult.roomIdx].name} - {WALL_CONFIG[viewingResult.wallIdx].label}</div>
                <div className="flex justify-center"><Button variant="outline" onClick={() => setViewingResult(null)}>목록으로</Button></div>
              </>
            ) : (
              <>
                {rooms.map((room, ri) => {
                  const processed = room.walls.filter(w => w.url);
                  if (!processed.length) return null;
                  return (
                    <div key={room.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <h3 className="text-white font-semibold mb-3">{room.name}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {room.walls.map((wall, wi) => {
                          if (!wall.url) return null;
                          const config = WALL_CONFIG.find(c => c.type === wall.type)!;
                          return (
                            <div key={wall.type} className="space-y-1">
                              {wall.resultUrl ? (
                                <div className="cursor-pointer rounded-lg overflow-hidden border border-white/10 hover:border-blue-400 transition-colors" onClick={() => setViewingResult({ roomIdx: ri, wallIdx: wi })}>
                                  <img src={wall.resultUrl} alt="결과" className="w-full aspect-[4/3] object-cover" />
                                </div>
                              ) : (
                                <div className="rounded-lg overflow-hidden border border-white/10 opacity-50">
                                  <img src={wall.url} alt="원본" className="w-full aspect-[4/3] object-cover" />
                                  <div className="bg-red-500/20 text-red-400 text-xs text-center py-1">실패</div>
                                </div>
                              )}
                              <div className="text-white/40 text-xs text-center">{config.label}</div>
                              {wall.resultUrl && <a href={wall.resultUrl} download className="block text-center"><span className="text-blue-400 text-xs hover:underline flex items-center justify-center gap-1"><Download className="w-3 h-3" />다운로드</span></a>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" />새로 시작</Button>
              <Button variant="secondary" onClick={() => { setStep('options'); setRooms(prev => prev.map(r => ({ ...r, walls: r.walls.map(w => ({ ...w, resultUrl: undefined })) }))); }}>다른 스타일 적용</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
