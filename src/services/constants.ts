import {
    Enums,
    CsvHeaders,
    StatusColors,
    StatusIcons,
    ConstantsResponse
} from '../types/constants';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ConstantsService {
    private enumsCache: Enums | null = null;
    private csvHeadersCache: CsvHeaders | null = null;
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
            const response = await fetch(`${API_BASE_URL}/constants/enums`);
            const data: ConstantsResponse = await response.json();

            if (data.success && data.data) {
                this.enumsCache = data.data as Enums;
                this.lastFetch = Date.now();
                return this.enumsCache;
            } else {
                throw new Error(data.message || 'Enum 값들을 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('Enum 값들을 가져오는 중 오류 발생:', error);
            throw error;
        }
    }

    // CSV 헤더들을 가져오기
    async getCsvHeaders(): Promise<CsvHeaders> {
        if (this.csvHeadersCache && this.isCacheValid()) {
            return this.csvHeadersCache;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/constants/csv-headers`);
            const data: ConstantsResponse = await response.json();

            if (data.success && data.data) {
                this.csvHeadersCache = data.data as CsvHeaders;
                this.lastFetch = Date.now();
                return this.csvHeadersCache;
            } else {
                throw new Error(data.message || 'CSV 헤더를 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('CSV 헤더를 가져오는 중 오류 발생:', error);
            throw error;
        }
    }

    // 상태별 색상을 가져오기
    async getStatusColors(): Promise<StatusColors> {
        if (this.statusColorsCache && this.isCacheValid()) {
            return this.statusColorsCache;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/constants/status-colors`);
            const data: ConstantsResponse = await response.json();

            if (data.success && data.data) {
                this.statusColorsCache = data.data as StatusColors;
                this.lastFetch = Date.now();
                return this.statusColorsCache;
            } else {
                throw new Error(data.message || '상태 색상을 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('상태 색상을 가져오는 중 오류 발생:', error);
            throw error;
        }
    }

    // 상태별 아이콘을 가져오기
    async getStatusIcons(): Promise<StatusIcons> {
        if (this.statusIconsCache && this.isCacheValid()) {
            return this.statusIconsCache;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/constants/status-icons`);
            const data: ConstantsResponse = await response.json();

            if (data.success && data.data) {
                this.statusIconsCache = data.data as StatusIcons;
                this.lastFetch = Date.now();
                return this.statusIconsCache;
            } else {
                throw new Error(data.message || '상태 아이콘을 가져오는데 실패했습니다.');
            }
        } catch (error) {
            console.error('상태 아이콘을 가져오는 중 오류 발생:', error);
            throw error;
        }
    }

    // 특정 카테고리의 enum 값들을 가져오기
    async getEnumsByCategory(category: string): Promise<any> {
        try {
            const response = await fetch(`${API_BASE_URL}/constants/enums/${category}`);
            const data: ConstantsResponse = await response.json();

            if (data.success && data.data) {
                return data.data;
            } else {
                throw new Error(data.message || `${category} 카테고리의 enum 값을 가져오는데 실패했습니다.`);
            }
        } catch (error) {
            console.error(`${category} 카테고리의 enum 값을 가져오는 중 오류 발생:`, error);
            throw error;
        }
    }

    // 캐시 무효화
    invalidateCache(): void {
        this.enumsCache = null;
        this.csvHeadersCache = null;
        this.statusColorsCache = null;
        this.statusIconsCache = null;
        this.lastFetch = 0;
    }

    // 모든 상수 데이터를 한 번에 가져오기
    async getAllConstants(): Promise<{
        enums: Enums;
        csvHeaders: CsvHeaders;
        statusColors: StatusColors;
        statusIcons: StatusIcons;
    }> {
        try {
            const [enums, csvHeaders, statusColors, statusIcons] = await Promise.all([
                this.getEnums(),
                this.getCsvHeaders(),
                this.getStatusColors(),
                this.getStatusIcons()
            ]);

            return {
                enums,
                csvHeaders,
                statusColors,
                statusIcons
            };
        } catch (error) {
            console.error('모든 상수를 가져오는 중 오류 발생:', error);
            throw error;
        }
    }
}

export const constantsService = new ConstantsService();
