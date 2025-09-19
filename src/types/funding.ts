// 팬 페이지용 펀딩 프로젝트 상태
export type FanFundingProjectStatus = 'success' | 'failed' | 'ongoing';

// 팬 페이지용 펀딩 프로젝트 카테고리
export type FanFundingProjectCategory = '음악' | '미술' | '문학' | '공연';

// 팬 페이지용 정렬 옵션
export type FanFundingSortOption = 'date' | 'amount' | 'status';

// 필터 옵션
export interface FundingHistoryFilter {
    status: 'all' | FanFundingProjectStatus;
    category: 'all' | FanFundingProjectCategory;
    sortBy: FanFundingSortOption;
}

// 프로젝트 결과물
export interface ProjectResult {
    finalAmount: number;
    successRate: number;
    deliverables: string[];
    completionDate?: string;
}

// 펀딩 프로젝트
export interface FundingProject {
    id: string; // number에서 string으로 변경
    title: string;
    description: string;
    artist: string;
    status: FanFundingProjectStatus;
    targetAmount: number;
    currentAmount: number;
    backers: number;
    daysLeft: number;
    startDate: string;
    endDate: string;
    result?: ProjectResult;
    category: FanFundingProjectCategory;
    image?: string;
}

// 아티스트 펀딩 히스토리
export interface ArtistFundingHistory {
    artistId: string; // number에서 string으로 변경
    artistName: string;
    artistAvatar?: string;
    artistCategory: FanFundingProjectCategory;
    projects: FundingProject[];
}

// 상태별 색상 매핑
export const PROJECT_STATUS_COLORS = {
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    ongoing: 'bg-blue-100 text-blue-800'
} as const;

// 카테고리별 색상 매핑
export const CATEGORY_COLORS = {
    음악: 'bg-blue-500',
    미술: 'bg-purple-500',
    문학: 'bg-green-500',
    공연: 'bg-red-500'
} as const;

// 상태별 아이콘 매핑
export const PROJECT_STATUS_ICONS = {
    success: 'CheckCircle',
    failed: 'XCircle',
    ongoing: 'Clock'
} as const;

// 상태별 텍스트 매핑
export const PROJECT_STATUS_TEXTS = {
    success: '성공',
    failed: '실패',
    ongoing: '진행중'
} as const;

// 정렬 옵션 텍스트
export const SORT_OPTION_TEXTS = {
    date: '날짜순',
    amount: '금액순',
    status: '상태순'
} as const;

// 카테고리 옵션
export const CATEGORY_OPTIONS = [
    { value: 'all', label: '모든 카테고리' },
    { value: '음악', label: '음악' },
    { value: '미술', label: '미술' },
    { value: '문학', label: '문학' },
    { value: '공연', label: '공연' }
] as const;

// 상태 옵션
export const STATUS_OPTIONS = [
    { value: 'all', label: '모든 상태' },
    { value: 'success', label: '성공' },
    { value: 'ongoing', label: '진행중' },
    { value: 'failed', label: '실패' }
] as const;

// 정렬 옵션
export const SORT_OPTIONS = [
    { value: 'date', label: '날짜순' },
    { value: 'amount', label: '금액순' },
    { value: 'status', label: '상태순' }
] as const;

// 결제 데이터
export interface PaymentData {
    id: string;
    projectId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    message?: string;
    rewardId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}