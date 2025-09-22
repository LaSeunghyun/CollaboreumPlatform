import { constantsService } from './constants';
import { Enums, StatusColors, StatusIcons } from '../types/constants';
import { constantsAPI } from './api';

type SortOption = {
    value: string;
    label: string;
    icon?: string;
};

// 하드코딩된 상수값들을 API에서 가져오는 서비스
export class DynamicConstantsService {
    private enumsCache: Enums | null = null;
    private statusColorsCache: StatusColors | null = null;
    private statusIconsCache: StatusIcons | null = null;
    private cacheExpiry = 5 * 60 * 1000; // 5분
    private lastFetch = 0;

    // 캐시가 유효한지 확인
    private isCacheValid(): boolean {
        return Date.now() - this.lastFetch < this.cacheExpiry;
    }

    // 모든 enum 값들을 가져오기
    async getEnums(): Promise<Enums> {
        if (this.enumsCache && this.isCacheValid()) {
            return this.enumsCache;
        }

        try {
            const response = await constantsAPI.getEnums() as any;
            if (!response || !response.data) {
                throw new Error('상수 API에서 enum 데이터를 반환하지 않았습니다.');
            }

            this.enumsCache = response.data;
            this.lastFetch = Date.now();
            return this.enumsCache;
        } catch (error) {
            console.error('Enum 값들을 가져오는 중 오류 발생:', error);
            this.enumsCache = null;
            throw error instanceof Error
                ? error
                : new Error('Enum 값들을 가져오는데 실패했습니다.');
        }
    }

    // 상태별 색상을 가져오기
    async getStatusColors(): Promise<StatusColors> {
        if (this.statusColorsCache && this.isCacheValid()) {
            return this.statusColorsCache;
        }

        try {
            const colors = await constantsService.getStatusColors();
            if (!colors) {
                throw new Error('상태 색상 데이터를 가져오지 못했습니다.');
            }

            this.statusColorsCache = colors;
            this.lastFetch = Date.now();
            return this.statusColorsCache;
        } catch (error) {
            console.error('상태 색상을 가져오는 중 오류 발생:', error);
            this.statusColorsCache = null;
            throw error instanceof Error
                ? error
                : new Error('상태 색상을 가져오는데 실패했습니다.');
        }
    }

    // 상태별 아이콘을 가져오기
    async getStatusIcons(): Promise<StatusIcons> {
        if (this.statusIconsCache && this.isCacheValid()) {
            return this.statusIconsCache;
        }

        try {
            const response = await constantsAPI.getStatusIcons() as any;
            if (!response || !response.data) {
                throw new Error('상태 아이콘 데이터가 비어 있습니다.');
            }

            this.statusIconsCache = response.data;
            this.lastFetch = Date.now();
            return this.statusIconsCache;
        } catch (error) {
            console.error('상태 아이콘을 가져오는 중 오류 발생:', error);
            this.statusIconsCache = null;
            throw error instanceof Error
                ? error
                : new Error('상태 아이콘을 가져오는데 실패했습니다.');
        }
    }

    // 아트워크 카테고리 가져오기
    async getArtworkCategories() {
        try {
            const response = await constantsAPI.getArtworkCategories() as any;
            if (!response || !Array.isArray(response.data)) {
                throw new Error('아트워크 카테고리 데이터가 비어 있습니다.');
            }

            return response.data;
        } catch (error) {
            console.error('아트워크 카테고리를 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('아트워크 카테고리를 가져오는데 실패했습니다.');
        }
    }

    // 비용 카테고리 가져오기
    async getExpenseCategories() {
        try {
            const response = await constantsAPI.getExpenseCategories() as any;
            if (!response || !Array.isArray(response.data)) {
                throw new Error('비용 카테고리 데이터가 비어 있습니다.');
            }

            return response.data;
        } catch (error) {
            console.error('비용 카테고리를 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('비용 카테고리를 가져오는데 실패했습니다.');
        }
    }

    // 결제 방법 가져오기
    async getPaymentMethods() {
        try {
            const response = await constantsAPI.getPaymentMethods() as any;
            if (!response || !Array.isArray(response.data)) {
                throw new Error('결제 방법 데이터가 비어 있습니다.');
            }

            return response.data;
        } catch (error) {
            console.error('결제 방법을 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('결제 방법을 가져오는데 실패했습니다.');
        }
    }

    // 상태 설정 가져오기
    async getStatusConfig(type: 'project' | 'funding' | 'event') {
        try {
            const response = await constantsAPI.getStatusConfig(type) as any;
            if (!response || !response.data) {
                throw new Error(`${type} 상태 설정 응답이 비어 있습니다.`);
            }

            return response.data;
        } catch (error) {
            console.error(`${type} 상태 설정을 가져오는 중 오류 발생:`, error);
            throw error instanceof Error
                ? error
                : new Error(`${type} 상태 설정을 가져오는데 실패했습니다.`);
        }
    }

    // 프로젝트 상태 설정 가져오기
    async getProjectStatusConfig() {
        try {
            const enums = await this.getEnums();
            const statusColors = await this.getStatusColors();

            const statusConfig: Record<string, { label: string; variant: any; color?: string }> = {};

            // 프로젝트 상태별 설정
            Object.values(enums.PROJECT_STATUSES || {}).forEach(status => {
                const statusKey = status.toLowerCase().replace('_', '');
                statusConfig[statusKey] = {
                    label: this.getStatusLabel(status),
                    variant: this.getStatusVariant(status),
                    color: statusColors[status] || this.getDefaultStatusColor(status)
                };
            });

            return statusConfig;
        } catch (error) {
            console.error('프로젝트 상태 설정을 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('프로젝트 상태 설정을 가져오는데 실패했습니다.');
        }
    }

    // 펀딩 프로젝트 상태 설정 가져오기
    async getFundingProjectStatusConfig() {
        try {
            const enums = await this.getEnums();
            const statusColors = await this.getStatusColors();

            const statusConfig: Record<string, { label: string; variant: any; color?: string }> = {};

            // 펀딩 프로젝트 상태별 설정
            Object.values(enums.FUNDING_PROJECT_STATUSES || {}).forEach(status => {
                const statusKey = status.toLowerCase().replace('_', '');
                statusConfig[statusKey] = {
                    label: this.getFundingStatusLabel(status),
                    variant: this.getFundingStatusVariant(status),
                    color: statusColors[status] || this.getDefaultStatusColor(status)
                };
            });

            return statusConfig;
        } catch (error) {
            console.error('펀딩 프로젝트 상태 설정을 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('펀딩 프로젝트 상태 설정을 가져오는데 실패했습니다.');
        }
    }

    // 이벤트 상태 설정 가져오기
    async getEventStatusConfig() {
        try {
            const enums = await this.getEnums();
            const statusColors = await this.getStatusColors();

            const statusConfig: Record<string, { label: string; variant: any; color?: string }> = {};

            // 이벤트 상태별 설정
            Object.values(enums.EVENT_STATUSES || {}).forEach(status => {
                const statusKey = status.toLowerCase().replace('_', '');
                statusConfig[statusKey] = {
                    label: this.getEventStatusLabel(status),
                    variant: this.getEventStatusVariant(status),
                    color: statusColors[status] || this.getDefaultStatusColor(status)
                };
            });

            return statusConfig;
        } catch (error) {
            console.error('이벤트 상태 설정을 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('이벤트 상태 설정을 가져오는데 실패했습니다.');
        }
    }

    // 정렬 옵션 가져오기
    async getSortOptions(type: 'project' | 'funding' | 'community' = 'project'): Promise<SortOption[]> {
        try {
            const response = await constantsAPI.getSortOptions(type);
            const rawOptions = (response as any)?.data ?? response;

            if (!Array.isArray(rawOptions)) {
                throw new Error('정렬 옵션 데이터가 배열이 아닙니다.');
            }

            return rawOptions
                .map(option => {
                    if (!option || typeof option !== 'object') {
                        return null;
                    }

                    const record = option as Record<string, unknown>;
                    const value = record.value ?? record.id;
                    const label = record.label ?? record.name ?? record.value;

                    if (typeof value !== 'string' && typeof value !== 'number') {
                        return null;
                    }

                    if (typeof label !== 'string' && typeof label !== 'number') {
                        return null;
                    }

                    return {
                        value: String(value),
                        label: String(label),
                        icon: typeof record.icon === 'string' ? record.icon : undefined,
                    };
                })
                .filter((option): option is SortOption => Boolean(option));
        } catch (error) {
            console.error('정렬 옵션을 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('정렬 옵션을 가져오는데 실패했습니다.');
        }
    }

    // 카테고리 목록 가져오기
    async getCategories(type: 'artist' | 'project' | 'event' | 'community' = 'project') {
        try {
            const enums = await this.getEnums();

            switch (type) {
                case 'artist':
                    return Object.values(enums.ARTIST_CATEGORIES || {});
                case 'project':
                    return Object.values(enums.PROJECT_CATEGORIES || {});
                case 'event':
                    return Object.values(enums.EVENT_CATEGORIES || {});
                case 'community':
                    return Object.values(enums.ARTIST_CATEGORIES || {}); // 커뮤니티는 아티스트 카테고리 사용
                default:
                    return Object.values(enums.PROJECT_CATEGORIES || {});
            }
        } catch (error) {
            console.error('카테고리를 가져오는 중 오류 발생:', error);
            throw error instanceof Error
                ? error
                : new Error('카테고리를 가져오는데 실패했습니다.');
        }
    }

    // 캐시 무효화
    invalidateCache(): void {
        this.enumsCache = null;
        this.statusColorsCache = null;
        this.statusIconsCache = null;
        this.lastFetch = 0;
    }

    // 기본값들을 제거하고 모든 데이터는 API 기반으로 처리합니다.

    // 상태 라벨 변환
    private getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'PENDING': '승인 대기',
            'IN_PROGRESS': '진행중',
            'COMPLETED': '완료',
            'FAILED': '실패',
            'CANCELLED': '취소',
            'PLANNING': '기획중',
            'PREPARING': '준비중',
            'SUCCESS': '성공',
            'EXECUTING': '실행중',
            'SCHEDULED': '예정',
            'ONGOING': '진행중',
            'ENDED': '종료'
        };
        return labels[status] || status;
    }

    private getFundingStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'PREPARING': '준비중',
            'IN_PROGRESS': '진행중',
            'SUCCESS': '성공',
            'FAILED': '실패',
            'CANCELLED': '취소',
            'EXECUTING': '실행중',
            'COMPLETED': '완료'
        };
        return labels[status] || status;
    }

    private getEventStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'SCHEDULED': '예정',
            'IN_PROGRESS': '진행중',
            'COMPLETED': '완료',
            'CANCELLED': '취소'
        };
        return labels[status] || status;
    }

    // 상태 variant 변환
    private getStatusVariant(status: string): any {
        const variants: Record<string, any> = {
            'PENDING': 'secondary',
            'IN_PROGRESS': 'default',
            'COMPLETED': 'outline',
            'FAILED': 'destructive',
            'CANCELLED': 'secondary',
            'PLANNING': 'secondary',
            'PREPARING': 'secondary',
            'SUCCESS': 'outline',
            'EXECUTING': 'default',
            'SCHEDULED': 'default',
            'ONGOING': 'secondary',
            'ENDED': 'outline'
        };
        return variants[status] || 'secondary';
    }

    private getFundingStatusVariant(status: string): any {
        const variants: Record<string, any> = {
            'PREPARING': 'secondary',
            'IN_PROGRESS': 'default',
            'SUCCESS': 'outline',
            'FAILED': 'destructive',
            'CANCELLED': 'secondary',
            'EXECUTING': 'default',
            'COMPLETED': 'outline'
        };
        return variants[status] || 'secondary';
    }

    private getEventStatusVariant(status: string): any {
        const variants: Record<string, any> = {
            'SCHEDULED': 'default',
            'IN_PROGRESS': 'secondary',
            'COMPLETED': 'outline',
            'CANCELLED': 'destructive'
        };
        return variants[status] || 'secondary';
    }

    // 기본 상태 색상
    private getDefaultStatusColor(status: string): string {
        const colors: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'IN_PROGRESS': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'FAILED': 'bg-red-100 text-red-800',
            'CANCELLED': 'bg-gray-100 text-gray-800',
            'PLANNING': 'bg-yellow-100 text-yellow-800',
            'PREPARING': 'bg-yellow-100 text-yellow-800',
            'SUCCESS': 'bg-green-100 text-green-800',
            'EXECUTING': 'bg-purple-100 text-purple-800',
            'SCHEDULED': 'bg-blue-100 text-blue-800',
            'ONGOING': 'bg-green-100 text-green-800',
            'ENDED': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }
}

export const dynamicConstantsService = new DynamicConstantsService();
