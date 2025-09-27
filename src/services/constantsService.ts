import { constantsService } from './constants';
import { Enums, StatusColors, StatusIcons } from '../types/constants';
import { constantsAPI } from './api/constants';

// 하드코딩된 상수값들을 API에서 가져오는 서비스
export class DynamicConstantsService {
  private enumsCache: Enums | null = null;
  private statusColorsCache: StatusColors | null = null;
  private statusIconsCache: StatusIcons | null = null;
  private cacheExpiry = 5 * 60 * 1000; // 5분
  private enumsLastFetch = 0;
  private statusColorsLastFetch = 0;
  private statusIconsLastFetch = 0;

  // 캐시가 유효한지 확인
  private isCacheValid(lastFetch: number): boolean {
    if (!lastFetch) {
      return false;
    }
    return Date.now() - lastFetch < this.cacheExpiry;
  }

  // 모든 enum 값들을 가져오기
  async getEnums(): Promise<Enums> {
    if (this.enumsCache && this.isCacheValid(this.enumsLastFetch)) {
      return this.enumsCache;
    }

    try {
      const response = (await constantsAPI.getEnums()) as any;
      this.enumsCache = response.data || this.getDefaultEnums();
      this.enumsLastFetch = Date.now();
      return this.enumsCache!;
    } catch (error) {
      console.error('Enum 값들을 가져오는 중 오류 발생:', error);
      // API 실패 시 기본값 반환
      return this.getDefaultEnums();
    }
  }

  // 상태별 색상을 가져오기
  async getStatusColors(): Promise<StatusColors> {
    if (
      this.statusColorsCache &&
      this.isCacheValid(this.statusColorsLastFetch)
    ) {
      return this.statusColorsCache;
    }

    try {
      this.statusColorsCache = await constantsService.getStatusColors();
      this.statusColorsLastFetch = Date.now();
      return this.statusColorsCache;
    } catch (error) {
      console.error('상태 색상을 가져오는 중 오류 발생:', error);
      return this.getDefaultStatusColors();
    }
  }

  // 상태별 아이콘을 가져오기
  async getStatusIcons(): Promise<StatusIcons> {
    if (this.statusIconsCache && this.isCacheValid(this.statusIconsLastFetch)) {
      return this.statusIconsCache;
    }

    try {
      const response = (await constantsAPI.getStatusIcons()) as any;
      this.statusIconsCache = response.data || this.getDefaultStatusIcons();
      this.statusIconsLastFetch = Date.now();
      return this.statusIconsCache!;
    } catch (error) {
      console.error('상태 아이콘을 가져오는 중 오류 발생:', error);
      return this.getDefaultStatusIcons();
    }
  }

  // 아트워크 카테고리 가져오기
  async getArtworkCategories() {
    try {
      const response = (await constantsAPI.getArtworkCategories()) as any;
      return response.data;
    } catch (error) {
      console.error('아트워크 카테고리를 가져오는 중 오류 발생:', error);
      return [
        { id: 'painting', label: '회화', icon: '🎨' },
        { id: 'sculpture', label: '조각', icon: '🗿' },
        { id: 'photography', label: '사진', icon: '📸' },
        { id: 'digital', label: '디지털아트', icon: '💻' },
        { id: 'craft', label: '공예', icon: '🛠️' },
      ];
    }
  }

  // 비용 카테고리 가져오기
  async getExpenseCategories() {
    try {
      const response = (await constantsAPI.getExpenseCategories()) as any;
      return response.data;
    } catch (error) {
      console.error('비용 카테고리를 가져오는 중 오류 발생:', error);
      return [
        { id: 'labor', label: '인건비', icon: '👥' },
        { id: 'material', label: '재료비', icon: '🧱' },
        { id: 'equipment', label: '장비비', icon: '⚙️' },
        { id: 'marketing', label: '마케팅비', icon: '📢' },
        { id: 'other', label: '기타', icon: '📋' },
      ];
    }
  }

  // 결제 방법 가져오기
  async getPaymentMethods() {
    try {
      const response = (await constantsAPI.getPaymentMethods()) as any;
      return response.data;
    } catch (error) {
      console.error('결제 방법을 가져오는 중 오류 발생:', error);
      return [
        { id: 'card', label: '신용카드', icon: '💳' },
        { id: 'phone', label: '휴대폰 결제', icon: '📱' },
        { id: 'bank', label: '계좌이체', icon: '🏦' },
      ];
    }
  }

  // 상태 설정 가져오기
  async getStatusConfig(type: 'project' | 'funding' | 'event') {
    try {
      const response = (await constantsAPI.getStatusConfig(type)) as any;
      return response.data;
    } catch (error) {
      console.error(`${type} 상태 설정을 가져오는 중 오류 발생:`, error);
      return this.getDefaultStatusConfig(type);
    }
  }

  // 프로젝트 상태 설정 가져오기
  async getProjectStatusConfig() {
    try {
      const enums = await this.getEnums();
      const statusColors = await this.getStatusColors();

      const statusConfig: Record<
        string,
        { label: string; variant: any; color?: string }
      > = {};

      // 프로젝트 상태별 설정
      Object.values(enums.PROJECT_STATUSES || {}).forEach(status => {
        const statusKey = status.toLowerCase().replace(/_/g, '');
        statusConfig[statusKey] = {
          label: this.getStatusLabel(status),
          variant: this.getStatusVariant(status),
          color: statusColors[status] || this.getDefaultStatusColor(status),
        };
      });

      return statusConfig;
    } catch (error) {
      console.error('프로젝트 상태 설정을 가져오는 중 오류 발생:', error);
      return this.getDefaultProjectStatusConfig();
    }
  }

  // 펀딩 프로젝트 상태 설정 가져오기
  async getFundingProjectStatusConfig() {
    try {
      const enums = await this.getEnums();
      const statusColors = await this.getStatusColors();

      const statusConfig: Record<
        string,
        { label: string; variant: any; color?: string }
      > = {};

      // 펀딩 프로젝트 상태별 설정
      Object.values(enums.FUNDING_PROJECT_STATUSES || {}).forEach(status => {
        const statusKey = status.toLowerCase().replace(/_/g, '');
        statusConfig[statusKey] = {
          label: this.getFundingStatusLabel(status),
          variant: this.getFundingStatusVariant(status),
          color: statusColors[status] || this.getDefaultStatusColor(status),
        };
      });

      return statusConfig;
    } catch (error) {
      console.error('펀딩 프로젝트 상태 설정을 가져오는 중 오류 발생:', error);
      return this.getDefaultFundingProjectStatusConfig();
    }
  }

  // 이벤트 상태 설정 가져오기
  async getEventStatusConfig() {
    try {
      const enums = await this.getEnums();
      const statusColors = await this.getStatusColors();

      const statusConfig: Record<
        string,
        { label: string; variant: any; color?: string }
      > = {};

      // 이벤트 상태별 설정
      Object.values(enums.EVENT_STATUSES || {}).forEach(status => {
        const statusKey = status.toLowerCase().replace(/_/g, '');
        statusConfig[statusKey] = {
          label: this.getEventStatusLabel(status),
          variant: this.getEventStatusVariant(status),
          color: statusColors[status] || this.getDefaultStatusColor(status),
        };
      });

      return statusConfig;
    } catch (error) {
      console.error('이벤트 상태 설정을 가져오는 중 오류 발생:', error);
      return this.getDefaultEventStatusConfig();
    }
  }

  // 정렬 옵션 가져오기
  async getSortOptions() {
    try {
      const enums = await this.getEnums();

      // API에서 정렬 옵션을 가져오거나 기본값 사용
      return [
        { value: 'popular', label: '인기순' },
        { value: 'latest', label: '최신순' },
        { value: 'deadline', label: '마감임박' },
        { value: 'progress', label: '달성률' },
      ];
    } catch (error) {
      console.error('정렬 옵션을 가져오는 중 오류 발생:', error);
      return [
        { value: 'popular', label: '인기순' },
        { value: 'latest', label: '최신순' },
        { value: 'deadline', label: '마감임박' },
        { value: 'progress', label: '달성률' },
      ];
    }
  }

  // 카테고리 목록 가져오기
  async getCategories(
    type: 'artist' | 'project' | 'event' | 'community' = 'project',
  ) {
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
      return this.getDefaultCategories(type);
    }
  }

  // 캐시 무효화
  invalidateCache(): void {
    this.enumsCache = null;
    this.statusColorsCache = null;
    this.statusIconsCache = null;
    this.enumsLastFetch = 0;
    this.statusColorsLastFetch = 0;
    this.statusIconsLastFetch = 0;
  }

  // 기본값들
  private getDefaultEnums(): Enums {
    return {
      USER_ROLES: { ARTIST: 'artist', ADMIN: 'admin', FAN: 'fan' },
      ARTIST_CATEGORIES: {
        MUSIC: '음악',
        ART: '미술',
        VIDEO: '영상',
        LITERATURE: '문학',
        CRAFT: '공예',
        DESIGN: '디자인',
        OTHER: '기타',
      },
      ARTIST_GENRES: {
        POP: '팝',
        ROCK: '록',
        RNB: 'R&B',
        JAZZ: '재즈',
        CLASSICAL: '클래식',
        HIPHOP: '힙합',
        ELECTRONIC: '일렉트로닉',
        INDIE: '인디',
        ALTERNATIVE: '얼터너티브',
        COUNTRY: '컨트리',
        REGGAE: '레게',
        BLUES: '블루스',
        SOUL: '소울',
        PUNK: '펑크',
        METAL: '메탈',
        OTHER: '기타',
      },
      PROJECT_CATEGORIES: {
        MUSIC: '음악',
        VIDEO: '영상',
        PERFORMANCE: '공연',
        BOOK: '도서',
        GAME: '게임',
        OTHER: '기타',
      },
      PROJECT_STATUSES: {
        PLANNING: 'planning',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        PENDING: 'pending',
        CANCELLED: 'cancelled',
      },
      TASK_STATUSES: {
        WAITING: '대기',
        IN_PROGRESS: '진행중',
        COMPLETED: '완료',
        PENDING: '보류',
      },
      EVENT_CATEGORIES: {
        FESTIVAL: '축제',
        PERFORMANCE: '공연',
        COMPETITION: '경연',
        WORKSHOP: '워크샵',
        SEMINAR: '세미나',
        OTHER: '기타',
      },
      EVENT_STATUSES: {
        SCHEDULED: 'scheduled',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
      },
      LIVESTREAM_CATEGORIES: {
        MUSIC: '음악',
        PERFORMANCE: '공연',
        TALK: '토크',
        WORKSHOP: '워크샵',
        OTHER: '기타',
      },
      LIVESTREAM_STATUSES: {
        SCHEDULED: '예정',
        LIVE: '라이브',
        ENDED: '종료',
        CANCELLED: '취소',
      },
      FUNDING_PROJECT_STATUSES: {
        PREPARING: 'preparing',
        IN_PROGRESS: 'in_progress',
        SUCCESS: 'success',
        FAILED: 'failed',
        CANCELLED: 'cancelled',
        EXECUTING: 'executing',
        COMPLETED: 'completed',
      },
      DISTRIBUTION_STATUSES: {
        WAITING: '대기',
        DISTRIBUTED: '분배완료',
        PAID: '지급완료',
      },
      EXPENSE_CATEGORIES: {
        LABOR: '인건비',
        MATERIAL: '재료비',
        EQUIPMENT: '장비비',
        MARKETING: '마케팅비',
        OTHER: '기타',
      },
      TRACK_GENRES: {
        INDIE_POP: '인디팝',
        ROCK: '록',
        ACOUSTIC: '어쿠스틱',
        JAZZ: '재즈',
        CLASSICAL: '클래식',
        ELECTRONIC: '일렉트로닉',
        HIPHOP: '힙합',
        RNB: 'R&B',
        OTHER: '기타',
      },
      MUSIC_KEYS: [
        'C',
        'C#',
        'D',
        'D#',
        'E',
        'F',
        'F#',
        'G',
        'G#',
        'A',
        'A#',
        'B',
      ],
      MUSIC_MOODS: {
        EXCITING: '신나는',
        EMOTIONAL: '감성적인',
        CALM: '잔잔한',
        INTENSE: '강렬한',
        MELANCHOLY: '우울한',
        HOPEFUL: '희망적인',
        ROMANTIC: '로맨틱한',
        MYSTERIOUS: '신비로운',
      },
      LICENSES: {
        ALL_RIGHTS_RESERVED: 'All Rights Reserved',
        CREATIVE_COMMONS: 'Creative Commons',
        PUBLIC_DOMAIN: 'Public Domain',
      },
      ARTWORK_TYPES: {
        AUDIO: 'audio',
        IMAGE: 'image',
        VIDEO: 'video',
        TEXT: 'text',
      },
      ARTWORK_STATUSES: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        ARCHIVED: 'archived',
      },
      EVENT_TICKET_TYPES: {
        REGULAR: '일반',
        VIP: 'VIP',
        EARLY_BIRD: '얼리버드',
        STUDENT: '학생',
      },
      MILESTONE_STATUSES: {
        SCHEDULED: '예정',
        IN_PROGRESS: '진행중',
        COMPLETED: '완료',
        DELAYED: '지연',
      },
      PRIORITIES: { LOW: '낮음', MEDIUM: '보통', HIGH: '높음', URGENT: '긴급' },
      FUNDING_PROJECT_TYPES: {
        REGULAR: '일반',
        EXECUTION_IN_PROGRESS: '집행진행',
        EXPENSE_PUBLIC: '비용공개',
        REVENUE_DISTRIBUTION: '수익분배',
      },
      STATUS_COMPLETED: [],
      STATUS_IN_PROGRESS: [],
      STATUS_WAITING: [],
      STATUS_FAILED: [],
      STATUS_PRIORITIES: {},
      STATUS_DESCRIPTIONS: {},
    } as Enums;
  }

  private getDefaultStatusColors(): StatusColors {
    return {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      executing: 'bg-purple-100 text-purple-800',
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      ended: 'bg-gray-100 text-gray-800',
    };
  }

  private getDefaultStatusIcons(): StatusIcons {
    return {
      pending: 'clock',
      active: 'play',
      completed: 'check',
      failed: 'x',
      cancelled: 'x-circle',
      in_progress: 'play-circle',
      success: 'check-circle',
      preparing: 'settings',
      executing: 'zap',
      scheduled: 'calendar',
      ongoing: 'radio',
      ended: 'stop-circle',
    };
  }

  private getDefaultProjectStatusConfig() {
    return {
      pending: { label: '승인 대기', variant: 'secondary' },
      active: { label: '진행중', variant: 'default' },
      completed: { label: '완료', variant: 'outline' },
      failed: { label: '실패', variant: 'destructive' },
      cancelled: { label: '취소', variant: 'secondary' },
    };
  }

  private getDefaultFundingProjectStatusConfig() {
    return {
      preparing: { label: '준비중', variant: 'secondary' },
      in_progress: { label: '진행중', variant: 'default' },
      success: { label: '성공', variant: 'outline' },
      failed: { label: '실패', variant: 'destructive' },
      cancelled: { label: '취소', variant: 'secondary' },
      executing: { label: '실행중', variant: 'default' },
      completed: { label: '완료', variant: 'outline' },
    };
  }

  private getDefaultEventStatusConfig() {
    return {
      scheduled: { label: '예정', variant: 'default' },
      in_progress: { label: '진행중', variant: 'secondary' },
      completed: { label: '완료', variant: 'outline' },
      cancelled: { label: '취소', variant: 'destructive' },
    };
  }

  private getDefaultCategories(type: string) {
    switch (type) {
      case 'artist':
        return ['음악', '미술', '영상', '문학', '공예', '디자인', '기타'];
      case 'project':
        return ['음악', '영상', '공연', '도서', '게임', '기타'];
      case 'event':
        return ['페스티벌', '공연', '대회', '워크샵', '세미나', '기타'];
      case 'community':
        return ['음악', '미술', '영상', '문학', '공예', '디자인', '기타'];
      default:
        return ['음악', '영상', '공연', '도서', '게임', '기타'];
    }
  }

  private getDefaultStatusConfig(type: 'project' | 'funding' | 'event') {
    switch (type) {
      case 'project':
        return {
          planning: {
            label: '계획중',
            variant: 'secondary',
            color: 'bg-yellow-100 text-yellow-800',
          },
          in_progress: {
            label: '진행중',
            variant: 'default',
            color: 'bg-blue-100 text-blue-800',
          },
          completed: {
            label: '완료',
            variant: 'success',
            color: 'bg-green-100 text-green-800',
          },
          pending: {
            label: '보류',
            variant: 'warning',
            color: 'bg-orange-100 text-orange-800',
          },
          cancelled: {
            label: '취소',
            variant: 'destructive',
            color: 'bg-red-100 text-red-800',
          },
        };
      case 'funding':
        return {
          preparing: {
            label: '준비중',
            variant: 'secondary',
            color: 'bg-gray-100 text-gray-800',
          },
          in_progress: {
            label: '진행중',
            variant: 'default',
            color: 'bg-blue-100 text-blue-800',
          },
          success: {
            label: '성공',
            variant: 'success',
            color: 'bg-green-100 text-green-800',
          },
          failed: {
            label: '실패',
            variant: 'destructive',
            color: 'bg-red-100 text-red-800',
          },
          cancelled: {
            label: '취소',
            variant: 'destructive',
            color: 'bg-red-100 text-red-800',
          },
          executing: {
            label: '집행중',
            variant: 'warning',
            color: 'bg-orange-100 text-orange-800',
          },
          completed: {
            label: '완료',
            variant: 'success',
            color: 'bg-green-100 text-green-800',
          },
        };
      case 'event':
        return {
          scheduled: {
            label: '예정',
            variant: 'default',
            color: 'bg-blue-100 text-blue-800',
          },
          in_progress: {
            label: '진행중',
            variant: 'success',
            color: 'bg-green-100 text-green-800',
          },
          completed: {
            label: '완료',
            variant: 'secondary',
            color: 'bg-gray-100 text-gray-800',
          },
          cancelled: {
            label: '취소',
            variant: 'destructive',
            color: 'bg-red-100 text-red-800',
          },
        };
      default:
        return {};
    }
  }

  // 상태 라벨 변환
  private getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: '승인 대기',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      FAILED: '실패',
      CANCELLED: '취소',
      PLANNING: '기획중',
      PREPARING: '준비중',
      SUCCESS: '성공',
      EXECUTING: '실행중',
      SCHEDULED: '예정',
      ONGOING: '진행중',
      ENDED: '종료',
    };
    return labels[status] || status;
  }

  private getFundingStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PREPARING: '준비중',
      IN_PROGRESS: '진행중',
      SUCCESS: '성공',
      FAILED: '실패',
      CANCELLED: '취소',
      EXECUTING: '실행중',
      COMPLETED: '완료',
    };
    return labels[status] || status;
  }

  private getEventStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      SCHEDULED: '예정',
      IN_PROGRESS: '진행중',
      COMPLETED: '완료',
      CANCELLED: '취소',
    };
    return labels[status] || status;
  }

  // 상태 variant 변환
  private getStatusVariant(status: string): any {
    const variants: Record<string, any> = {
      PENDING: 'secondary',
      IN_PROGRESS: 'default',
      COMPLETED: 'outline',
      FAILED: 'destructive',
      CANCELLED: 'secondary',
      PLANNING: 'secondary',
      PREPARING: 'secondary',
      SUCCESS: 'outline',
      EXECUTING: 'default',
      SCHEDULED: 'default',
      ONGOING: 'secondary',
      ENDED: 'outline',
    };
    return variants[status] || 'secondary';
  }

  private getFundingStatusVariant(status: string): any {
    const variants: Record<string, any> = {
      PREPARING: 'secondary',
      IN_PROGRESS: 'default',
      SUCCESS: 'outline',
      FAILED: 'destructive',
      CANCELLED: 'secondary',
      EXECUTING: 'default',
      COMPLETED: 'outline',
    };
    return variants[status] || 'secondary';
  }

  private getEventStatusVariant(status: string): any {
    const variants: Record<string, any> = {
      SCHEDULED: 'default',
      IN_PROGRESS: 'secondary',
      COMPLETED: 'outline',
      CANCELLED: 'destructive',
    };
    return variants[status] || 'secondary';
  }

  // 기본 상태 색상
  private getDefaultStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      PLANNING: 'bg-yellow-100 text-yellow-800',
      PREPARING: 'bg-yellow-100 text-yellow-800',
      SUCCESS: 'bg-green-100 text-green-800',
      EXECUTING: 'bg-purple-100 text-purple-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-green-100 text-green-800',
      ENDED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

export const dynamicConstantsService = new DynamicConstantsService();
