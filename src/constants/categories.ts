// 카테고리 상수 정의
export const CATEGORIES = {
  FREE: '자유',
  QUESTION: '질문',
  MUSIC: '음악',
  ART: '미술',
  LITERATURE: '문학',
  PERFORMANCE: '공연',
  PHOTOGRAPHY: '사진',
  TECHNOLOGY: '기술',
  OTHER: '기타',
} as const;

// 카테고리 라벨 매핑 (한국어 키 사용으로 동일)
export const CATEGORY_LABELS: Record<string, string> = {
  [CATEGORIES.FREE]: '자유',
  [CATEGORIES.QUESTION]: '질문',
  [CATEGORIES.MUSIC]: '음악',
  [CATEGORIES.ART]: '미술',
  [CATEGORIES.LITERATURE]: '문학',
  [CATEGORIES.PERFORMANCE]: '공연',
  [CATEGORIES.PHOTOGRAPHY]: '사진',
  [CATEGORIES.TECHNOLOGY]: '기술',
  [CATEGORIES.OTHER]: '기타',
};

// 카테고리 색상 매핑
export const CATEGORY_COLORS: Record<string, string> = {
  [CATEGORIES.FREE]: 'bg-primary/10 text-primary',
  [CATEGORIES.QUESTION]: 'bg-accent/10 text-accent-foreground',
  [CATEGORIES.MUSIC]: 'bg-success/10 text-success',
  [CATEGORIES.ART]: 'bg-destructive/10 text-destructive',
  [CATEGORIES.LITERATURE]: 'bg-warning/10 text-warning',
  [CATEGORIES.PERFORMANCE]: 'bg-secondary/10 text-secondary-foreground',
  [CATEGORIES.PHOTOGRAPHY]: 'bg-muted/10 text-muted-foreground',
  [CATEGORIES.TECHNOLOGY]: 'bg-primary/20 text-primary',
  [CATEGORIES.OTHER]: 'bg-muted text-muted-foreground',
};

// 카테고리 배지 색상 (진한 버전)
export const CATEGORY_BADGE_COLORS: Record<string, string> = {
  [CATEGORIES.FREE]: 'bg-primary',
  [CATEGORIES.QUESTION]: 'bg-accent',
  [CATEGORIES.MUSIC]: 'bg-success',
  [CATEGORIES.ART]: 'bg-destructive',
  [CATEGORIES.LITERATURE]: 'bg-warning',
  [CATEGORIES.PERFORMANCE]: 'bg-secondary',
  [CATEGORIES.PHOTOGRAPHY]: 'bg-muted',
  [CATEGORIES.TECHNOLOGY]: 'bg-primary/80',
  [CATEGORIES.OTHER]: 'bg-muted',
};

// 기본 카테고리 목록
export const DEFAULT_CATEGORIES = [
  CATEGORIES.FREE,
  CATEGORIES.QUESTION,
  CATEGORIES.MUSIC,
  CATEGORIES.ART,
  CATEGORIES.LITERATURE,
  CATEGORIES.PERFORMANCE,
  CATEGORIES.PHOTOGRAPHY,
  CATEGORIES.TECHNOLOGY,
  CATEGORIES.OTHER,
];

// 한국어 카테고리 목록 (API에서 사용)
export const KOREAN_CATEGORIES = [
  '전체',
  '자유',
  '질문',
  '음악',
  '미술',
  '문학',
  '공연',
  '사진',
  '기술',
  '기타',
];

// 카테고리 유틸리티 함수들
export const getCategoryLabel = (category: string): string => {
  return CATEGORY_LABELS[category] || category;
};

export const getCategoryColor = (category: string): string => {
  return (
    CATEGORY_COLORS[category] || CATEGORY_COLORS[CATEGORIES.OTHER] || '#6b7280'
  );
};

export const getCategoryBadgeColor = (category: string): string => {
  return (
    CATEGORY_BADGE_COLORS[category] ||
    CATEGORY_BADGE_COLORS[CATEGORIES.OTHER] ||
    'bg-gray-100 text-gray-800'
  );
};

// 카테고리 검증 함수
export const isValidCategory = (category: string): boolean => {
  return Object.values(CATEGORIES).includes(category as any);
};
