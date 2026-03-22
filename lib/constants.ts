import type { InteriorStyle, RoomType, EnhanceOption } from '@/types';

export const INTERIOR_STYLES: {
  id: InteriorStyle;
  name: string;
  description: string;
  emoji: string;
}[] = [
  { id: 'modern', name: '모던', description: '깔끔한 라인과 중성 색감', emoji: '🏢' },
  { id: 'minimalist', name: '미니멀', description: '최소한의 가구, 넓은 공간감', emoji: '⬜' },
  { id: 'scandinavian', name: '스칸디나비안', description: '밝은 톤, 원목, 아늑한 분위기', emoji: '🌿' },
  { id: 'industrial', name: '인더스트리얼', description: '노출 벽돌, 금속, 콘크리트', emoji: '🏭' },
  { id: 'japanese', name: '일본 젠', description: '자연 소재, 심플, 와비사비', emoji: '🎋' },
  { id: 'mediterranean', name: '지중해', description: '아치, 테라코타, 밝은 색감', emoji: '☀️' },
  { id: 'classic', name: '클래식', description: '우아한 가구, 격조 있는 분위기', emoji: '👑' },
  { id: 'bohemian', name: '보헤미안', description: '다채로운 패턴, 자유로운 느낌', emoji: '🎨' },
  { id: 'art-deco', name: '아르데코', description: '기하학 패턴, 금색 포인트', emoji: '✨' },
  { id: 'mid-century', name: '미드센추리', description: '레트로 가구, 유기적 곡선', emoji: '🪑' },
  { id: 'coastal', name: '코스탈', description: '해변 느낌, 밝은 블루와 화이트', emoji: '🏖️' },
  { id: 'farmhouse', name: '팜하우스', description: '시골풍, 빈티지, 따뜻한 분위기', emoji: '🏡' },
];

export const ROOM_TYPES: {
  id: RoomType;
  name: string;
  icon: string;
}[] = [
  { id: 'living-room', name: '거실', icon: 'Sofa' },
  { id: 'bedroom', name: '침실', icon: 'Bed' },
  { id: 'kitchen', name: '주방', icon: 'ChefHat' },
  { id: 'bathroom', name: '욕실', icon: 'Bath' },
  { id: 'dining-room', name: '다이닝룸', icon: 'UtensilsCrossed' },
  { id: 'office', name: '서재/사무실', icon: 'Monitor' },
  { id: 'kids-room', name: '아이방', icon: 'Baby' },
  { id: 'entrance', name: '현관', icon: 'DoorOpen' },
];

export const ENHANCE_OPTIONS: {
  id: EnhanceOption;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'straighten',
    name: '수평/수직 보정',
    description: '기울어진 사진의 가로세로를 바르게 교정합니다',
    icon: 'Ruler',
  },
  {
    id: 'perspective',
    name: '정면 보정',
    description: '비스듬히 찍은 사진을 정면에서 본 것처럼 보정합니다',
    icon: 'Maximize2',
  },
  {
    id: 'declutter',
    name: '잡동사니 제거',
    description: '옷, 신발, 생활용품 등 어지러운 물건을 깔끔히 정리합니다',
    icon: 'Trash2',
  },
  {
    id: 'remove-reflection',
    name: '유리 반사 제거',
    description: '창문, 거울, 유리에 비친 모습을 제거합니다',
    icon: 'EyeOff',
  },
  {
    id: 'remove-wall-items',
    name: '벽 부착물 제거',
    description: '벽에 걸린 사진, 포스터, 시계 등을 깨끗하게 지웁니다',
    icon: 'ImageOff',
  },
  {
    id: 'lighting-fix',
    name: '조명 보정',
    description: '어둡거나 불균일한 조명을 밝고 자연스럽게 보정합니다',
    icon: 'Sun',
  },
  {
    id: 'color-enhance',
    name: '색감 보정',
    description: '색감을 선명하고 매력적으로 향상시킵니다',
    icon: 'Palette',
  },
];

export const COLOR_THEMES = [
  { id: 'warm', name: '따뜻한 톤', color: '#D4956B' },
  { id: 'cool', name: '차가운 톤', color: '#6B8AD4' },
  { id: 'neutral', name: '뉴트럴', color: '#B0A99F' },
  { id: 'monochrome', name: '모노크롬', color: '#4A4A4A' },
  { id: 'pastel', name: '파스텔', color: '#C4B5D4' },
  { id: 'earth', name: '어스톤', color: '#8B7355' },
  { id: 'vivid', name: '비비드', color: '#E04F5F' },
  { id: 'natural', name: '내추럴', color: '#7BA05B' },
];
