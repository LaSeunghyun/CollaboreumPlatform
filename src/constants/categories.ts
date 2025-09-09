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
  [CATEGORIES.MUSIC]: 'bg-primary/10 text-primary',
  [CATEGORIES.ART]: 'bg-accent/10 text-accent-foreground',
  [CATEGORIES.LITERATURE]: 'bg-success/10 text-success',
  [CATEGORIES.PERFORMANCE]: 'bg-destructive/10 text-destructive',
  [CATEGORIES.PHOTOGRAPHY]: 'bg-warning/10 text-warning',
  [CATEGORIES.TECHNOLOGY]: 'bg-muted text-muted-foreground',
  [CATEGORIES.CULTURE]: 'bg-secondary text-secondary-foreground',
  [CATEGORIES.ARTIST]: 'bg-primary/20 text-primary',
  [CATEGORIES.FAN]: 'bg-warning/20 text-warning',
  [CATEGORIES.GENERAL]: 'bg-muted text-muted-foreground',
  [CATEGORIES.OTHER]: 'bg-muted text-muted-foreground'
};

// 카테고리 배지 색상 (진한 버전)
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  [CATEGORIES.MUSIC]: 'bg-primary',
  [CATEGORIES.ART]: 'bg-accent',
  [CATEGORIES.LITERATURE]: 'bg-success',
  [CATEGORIES.PERFORMANCE]: 'bg-destructive',
  [CATEGORIES.PHOTOGRAPHY]: 'bg-warning',
  [CATEGORIES.TECHNOLOGY]: 'bg-muted',
  [CATEGORIES.CULTURE]: 'bg-secondary',
  [CATEGORIES.ARTIST]: 'bg-primary/80',
  [CATEGORIES.FAN]: 'bg-warning/80',
  [CATEGORIES.GENERAL]: 'bg-muted',
  [CATEGORIES.OTHER]: 'bg-muted'
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
  return CATEGORY_COLORS[category] || CATEGORY_COLORS[CATEGORIES.OTHER] || '#6b7280';
};

export const getCategoryBadgeColor = (category: string): string => {
  return CATEGORY_BADGE_COLORS[category] || CATEGORY_BADGE_COLORS[CATEGORIES.OTHER] || 'bg-gray-100 text-gray-800';
};

// 카테고리 검증 함수
export const isValidCategory = (category: string): boolean => {
  return Object.values(CATEGORIES).includes(category as any);
};
