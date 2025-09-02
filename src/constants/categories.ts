// 카테고리 상수 정의
export const CATEGORIES = {
  GENERAL: 'general',
  ARTIST: 'artist',
  FAN: 'fan',
  MUSIC: 'music',
  ART: 'art',
  TECHNOLOGY: 'technology',
  CULTURE: 'culture',
  PERFORMANCE: 'performance',
  PHOTOGRAPHY: 'photography',
  LITERATURE: 'literature',
  OTHER: 'other'
} as const;

// 카테고리 라벨 매핑
export const CATEGORY_LABELS: Record<string, string> = {
  [CATEGORIES.GENERAL]: '일반',
  [CATEGORIES.ARTIST]: '아티스트',
  [CATEGORIES.FAN]: '팬',
  [CATEGORIES.MUSIC]: '음악',
  [CATEGORIES.ART]: '미술',
  [CATEGORIES.TECHNOLOGY]: '기술',
  [CATEGORIES.CULTURE]: '문화',
  [CATEGORIES.PERFORMANCE]: '공연',
  [CATEGORIES.PHOTOGRAPHY]: '사진',
  [CATEGORIES.LITERATURE]: '문학',
  [CATEGORIES.OTHER]: '기타'
};

// 카테고리 색상 매핑
export const CATEGORY_COLORS: Record<string, string> = {
  [CATEGORIES.MUSIC]: 'bg-blue-100 text-blue-800',
  [CATEGORIES.ART]: 'bg-purple-100 text-purple-800',
  [CATEGORIES.LITERATURE]: 'bg-green-100 text-green-800',
  [CATEGORIES.PERFORMANCE]: 'bg-red-100 text-red-800',
  [CATEGORIES.PHOTOGRAPHY]: 'bg-pink-100 text-pink-800',
  [CATEGORIES.TECHNOLOGY]: 'bg-gray-100 text-gray-800',
  [CATEGORIES.CULTURE]: 'bg-yellow-100 text-yellow-800',
  [CATEGORIES.ARTIST]: 'bg-indigo-100 text-indigo-800',
  [CATEGORIES.FAN]: 'bg-orange-100 text-orange-800',
  [CATEGORIES.GENERAL]: 'bg-gray-100 text-gray-800',
  [CATEGORIES.OTHER]: 'bg-gray-100 text-gray-800'
};

// 카테고리 배지 색상 (진한 버전)
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  [CATEGORIES.MUSIC]: 'bg-blue-500',
  [CATEGORIES.ART]: 'bg-purple-500',
  [CATEGORIES.LITERATURE]: 'bg-green-500',
  [CATEGORIES.PERFORMANCE]: 'bg-red-500',
  [CATEGORIES.PHOTOGRAPHY]: 'bg-pink-500',
  [CATEGORIES.TECHNOLOGY]: 'bg-gray-500',
  [CATEGORIES.CULTURE]: 'bg-yellow-500',
  [CATEGORIES.ARTIST]: 'bg-indigo-500',
  [CATEGORIES.FAN]: 'bg-orange-500',
  [CATEGORIES.GENERAL]: 'bg-gray-500',
  [CATEGORIES.OTHER]: 'bg-gray-500'
};

// 기본 카테고리 목록
export const DEFAULT_CATEGORIES = [
  CATEGORIES.GENERAL,
  CATEGORIES.ARTIST,
  CATEGORIES.FAN,
  CATEGORIES.MUSIC,
  CATEGORIES.ART,
  CATEGORIES.TECHNOLOGY,
  CATEGORIES.CULTURE,
  CATEGORIES.PERFORMANCE,
  CATEGORIES.PHOTOGRAPHY,
  CATEGORIES.LITERATURE,
  CATEGORIES.OTHER
];

// 한국어 카테고리 목록 (API에서 사용)
export const KOREAN_CATEGORIES = [
  '전체',
  '음악',
  '미술',
  '문학',
  '공연',
  '사진',
  '기술',
  '문화',
  '기타'
];

// 카테고리 유틸리티 함수들
export const getCategoryLabel = (category: string): string => {
  return CATEGORY_LABELS[category] || category;
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS[CATEGORIES.OTHER];
};

export const getCategoryBadgeColor = (category: string): string => {
  return CATEGORY_BADGE_COLORS[category] || CATEGORY_BADGE_COLORS[CATEGORIES.OTHER];
};

// 카테고리 검증 함수
export const isValidCategory = (category: string): boolean => {
  return Object.values(CATEGORIES).includes(category as any);
};
