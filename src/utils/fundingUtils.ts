import { 
  ArtistFundingHistory, 
  FundingHistoryFilter, 
  FanFundingProjectStatus,
  FanFundingProjectCategory,
  FanFundingSortOption
} from '../types/funding';

// 필터링된 펀딩 히스토리 계산
export const getFilteredFundingHistory = (
    artistFundingHistory: ArtistFundingHistory[],
    filter: FundingHistoryFilter
): ArtistFundingHistory[] => {
    let filtered = [...artistFundingHistory];

    // 상태별 필터링
    if (filter.status !== 'all') {
        filtered = filtered.map(artist => ({
            ...artist,
            projects: artist.projects.filter(project => project.status === filter.status)
        })).filter(artist => artist.projects.length > 0);
    }

    // 카테고리별 필터링
    if (filter.category !== 'all') {
        filtered = filtered.map(artist => ({
            ...artist,
            projects: artist.projects.filter(project => project.category === filter.category)
        })).filter(artist => artist.projects.length > 0);
    }

    // 정렬
    filtered.forEach(artist => {
        artist.projects.sort((a, b) => {
            switch (filter.sortBy) {
                case 'date':
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                case 'amount':
                    return b.currentAmount - a.currentAmount;
                case 'status':
                    const statusOrder = { success: 3, ongoing: 2, failed: 1 };
                    return statusOrder[b.status] - statusOrder[a.status];
                default:
                    return 0;
            }
        });
    });

    return filtered;
};

// 통계 계산
export const calculateFundingStats = (filteredHistory: ArtistFundingHistory[]) => {
    const totalProjects = filteredHistory.reduce((total, artist) => total + artist.projects.length, 0);
    const successProjects = filteredHistory.reduce((total, artist) =>
        total + artist.projects.filter(p => p.status === 'success').length, 0
    );
    const ongoingProjects = filteredHistory.reduce((total, artist) =>
        total + artist.projects.filter(p => p.status === 'ongoing').length, 0
    );
    const failedProjects = filteredHistory.reduce((total, artist) =>
        total + artist.projects.filter(p => p.status === 'failed').length, 0
    );

    return {
        total: totalProjects,
        success: successProjects,
        ongoing: ongoingProjects,
        failed: failedProjects
    };
};

// 달성률 계산
export const calculateSuccessRate = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
};

// 날짜 포맷팅
export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// 금액 포맷팅
export const formatCurrency = (amount: number): string => {
    return `₩${amount.toLocaleString()}`;
};

// 프로젝트 상태별 정렬 순서
export const getStatusOrder = (status: FanFundingProjectStatus): number => {
    const order = { success: 3, ongoing: 2, failed: 1 };
    return order[status];
};

// 카테고리별 정렬 순서
export const getCategoryOrder = (category: FanFundingProjectCategory): number => {
    const order = { 음악: 1, 미술: 2, 문학: 3, 공연: 4 };
    return order[category];
};
