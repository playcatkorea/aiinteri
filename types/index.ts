// 인테리어 스타일
export type InteriorStyle =
  | 'modern'
  | 'minimalist'
  | 'scandinavian'
  | 'industrial'
  | 'japanese'
  | 'mediterranean'
  | 'classic'
  | 'bohemian'
  | 'art-deco'
  | 'mid-century'
  | 'coastal'
  | 'farmhouse';

// 방 종류
export type RoomType =
  | 'living-room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'dining-room'
  | 'office'
  | 'kids-room'
  | 'entrance';

// 보정 옵션
export type EnhanceOption =
  | 'straighten'
  | 'declutter'
  | 'remove-reflection'
  | 'remove-wall-items'
  | 'lighting-fix'
  | 'color-enhance';

// 리모델링 요청
export interface RemodelRequest {
  imageUrl: string;
  style: InteriorStyle;
  roomType: RoomType;
  colorTheme?: string;
  additionalPrompt?: string;
  promptStrength?: number;
}

// 보정 요청
export interface EnhanceRequest {
  imageUrl: string;
  options: EnhanceOption[];
  additionalNotes?: string;
}

// 처리 결과
export interface ProcessingResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  originalImageUrl: string;
  resultImageUrl?: string;
  type: 'remodel' | 'enhance';
  createdAt: string;
  error?: string;
}

// API 응답
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
