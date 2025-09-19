import { resolveApiBaseUrl } from '@/lib/config/env';

// API Base URL
const API_BASE_URL = resolveApiBaseUrl();

// 토큰 가져오기 함수
const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// 재시도 로직을 위한 헬퍼 함수
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 동시 요청 제한을 위한 큐
class RequestQueue {
    private queue: Array<() => Promise<any>> = [];
    private running = 0;
    private maxConcurrent = 5; // 최대 동시 요청 수

    async add<T>(request: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await request();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.running--;
                    this.processNext();
                }
            });
            this.processNext();
        });
    }

    private processNext() {
        if (this.running < this.maxConcurrent && this.queue.length > 0) {
            this.running++;
            const request = this.queue.shift()!;
            request();
        }
    }
}

const requestQueue = new RequestQueue();

// Generic API function with better error handling and automatic token inclusion
export async function apiCall<T>(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<T> {
    const maxRetries = 3;
    const retryDelay = 1000; // 1초
    const timeout = 10000; // 10초 타임아웃

    // 동시 요청 제한을 위해 큐에 추가
    return requestQueue.add(async () => {
        try {
            const token = getAuthToken();

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                ...options.headers,
            };

            // 토큰이 있으면 Authorization 헤더에 추가
            if (token) {
                (headers as any)['Authorization'] = `Bearer ${token}`;
            }

            // AbortController를 사용한 타임아웃 설정
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // 401 Unauthorized 오류 시 토큰 제거
                if (response.status === 401) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                    // 인증 토큰이 만료되어 자동 로그아웃
                }

                // 공개 데이터 조회 시 401 에러는 무시하고 빈 데이터 반환
                if (response.status === 401 && (
                    endpoint.includes('/artists') ||
                    endpoint.includes('/funding/projects') ||
                    endpoint.includes('/community/posts') ||
                    endpoint.includes('/stats/platform')
                )) {
                    console.warn(`공개 데이터 조회 실패 (401): ${endpoint}`);
                    return { success: false, data: [], message: '인증이 필요합니다' } as T;
                }

                throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);

            // 타임아웃 에러 처리
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
            }

            // ERR_INSUFFICIENT_RESOURCES는 재시도하면 안 되는 에러
            if (error instanceof TypeError && error.message.includes('ERR_INSUFFICIENT_RESOURCES')) {
                throw new Error('서버 리소스가 부족합니다. 잠시 후 다시 시도해주세요.');
            }

            // 네트워크 에러이고 재시도 횟수가 남아있으면 재시도
            if (retryCount < maxRetries && (
                (error instanceof TypeError && error.message.includes('Failed to fetch')) ||
                (error instanceof TypeError && error.message.includes('NetworkError'))
            )) {
                console.log(`API 호출 재시도 중... (${retryCount + 1}/${maxRetries})`);
                await delay(retryDelay * (retryCount + 1)); // 지수 백오프
                return apiCall<T>(endpoint, options, retryCount + 1);
            }

            throw error;
        }
    });
}

// Artist APIs with improved error handling
export const artistAPI = {
    // 모든 아티스트 조회
    getAllArtists: (params?: {
        page?: number;
        limit?: number;
        category?: string;
        genre?: string;
        search?: string;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/artists${queryParams}`);
    },

    // 특정 아티스트 조회
    getArtistById: (artistId: string) => apiCall(`/artists/${artistId}`),

    // 인기 아티스트 조회
    getPopularArtists: (limit?: number) => {
        const queryParams = limit ? `?limit=${limit}` : '';
        return apiCall(`/artists/featured/popular${queryParams}`);
    },

    // 새로 가입한 아티스트 조회
    getNewArtists: (limit?: number) => {
        const queryParams = limit ? `?limit=${limit}` : '';
        return apiCall(`/artists/new${queryParams}`);
    },

    // 아티스트 팔로우/언팔로우
    followArtist: (artistId: string, action: 'follow' | 'unfollow') =>
        apiCall(`/artists/${artistId}/follow`, {
            method: 'POST',
            body: JSON.stringify({ action })
        }),

    // 아티스트 프로필 업데이트
    updateArtistProfile: (artistId: string, data: any) =>
        apiCall(`/artists/${artistId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 기존 함수들 (하위 호환성)
    getArtistData: (artistId: number) => apiCall(`/artists/${artistId}/dashboard`),
    getProjects: (artistId: number) => apiCall(`/artists/${artistId}/projects`),
    getWbsItems: (projectId: number) => apiCall(`/projects/${projectId}/wbs`),
    updateProject: (projectId: number, data: any) =>
        apiCall(`/projects/${projectId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    createProject: (data: any) =>
        apiCall('/projects', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
};

// Admin Dashboard APIs
export const adminAPI = {
    getInquiries: () => apiCall('/admin/inquiries'),
    getMatchingRequests: () => apiCall('/admin/matching-requests'),
    getFinancialData: () => apiCall('/admin/financial-data'),
    getReportedContent: () => apiCall('/admin/reported-content'),
    updateInquiryStatus: (id: number, status: string) =>
        apiCall(`/admin/inquiries/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),
    assignInquiry: (id: number, assignedTo: string) =>
        apiCall(`/admin/inquiries/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ assignedTo })
        }),
    handleUserAction: (userId: string, action: string, reason?: string) =>
        apiCall(`/admin/users/${userId}/action`, {
            method: 'POST',
            body: JSON.stringify({ action, reason })
        }),
};

// Gallery APIs
export const galleryAPI = {
    // 모든 작품 조회 (필터링 및 정렬 포함)
    getAllArtworks: (params?: {
        category?: string;
        search?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/gallery/artworks${queryParams}`);
    },

    // 특정 작품 조회
    getArtworkById: (artworkId: string) => apiCall(`/gallery/artworks/${artworkId}`),

    // 카테고리별 작품 조회
    getArtworksByCategory: (category: string, params?: {
        page?: number;
        limit?: number;
        sortBy?: string;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/gallery/artworks?category=${category}${queryParams}`);
    },

    // 아티스트별 작품 조회
    getArtworksByArtist: (artistId: string, params?: {
        page?: number;
        limit?: number;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/gallery/artists/${artistId}/artworks${queryParams}`);
    },

    // 작품 업로드
    uploadArtwork: (data: any) =>
        apiCall('/gallery/artworks', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    // 작품 수정
    updateArtwork: (artworkId: string, data: any) =>
        apiCall(`/gallery/artworks/${artworkId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 작품 삭제
    deleteArtwork: (artworkId: string) =>
        apiCall(`/gallery/artworks/${artworkId}`, {
            method: 'DELETE'
        }),

    // 작품 좋아요
    likeArtwork: (artworkId: string) =>
        apiCall(`/gallery/artworks/${artworkId}/like`, {
            method: 'POST'
        }),

    // 갤러리 카테고리 조회
    getGalleryCategories: () => apiCall('/gallery/categories'),

    // 하위 호환성을 위한 기존 함수들
    getArtworks: async (filters?: any) => {
        const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
        const response = await apiCall<any>(`/gallery/artworks${queryParams}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await apiCall<any>('/gallery/categories');
        return response.data;
    },

    getArtistArtworks: async (artistId: string, page: number = 1, limit: number = 20) => {
        const response = await apiCall<any>(`/gallery/artists/${artistId}/artworks?page=${page}&limit=${limit}`);
        return response.data;
    }
};

// Artist Profile APIs
export const profileAPI = {
    getArtistProfile: (artistId: number) => apiCall(`/artists/${artistId}/profile`),
    updateProfile: (artistId: number, data: any) =>
        apiCall(`/artists/${artistId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
    followArtist: (artistId: number) =>
        apiCall(`/artists/${artistId}/follow`, {
            method: 'POST'
        }),
    unfollowArtist: (artistId: number) =>
        apiCall(`/artists/${artistId}/unfollow`, {
            method: 'DELETE'
        }),
};

// Community APIs
export const communityAPI = {
    getForumPosts: (category?: string, options?: { sort?: string; order?: string; page?: number; limit?: number; search?: string }) => {
        const params = new URLSearchParams();
        if (category && category !== "전체") params.append('category', category);
        if (options?.sort) params.append('sort', options.sort);
        if (options?.order) params.append('order', options.order);
        if (options?.page) params.append('page', options.page.toString());
        if (options?.limit) params.append('limit', options.limit.toString());
        if (options?.search) params.append('search', options.search);

        const queryString = params.toString();
        return apiCall(`/community/posts${queryString ? `?${queryString}` : ''}`);
    },
    getEvents: () => apiCall('/events'), // 올바른 경로로 수정
    getCategories: () => apiCall('/categories'), // 카테고리 API 추가
    createPost: (data: any) =>
        apiCall('/community/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    likePost: (postId: number) =>
        apiCall(`/community/posts/${postId}/like`, {
            method: 'POST'
        }),
    commentOnPost: (postId: number, content: string) =>
        apiCall(`/community/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        }),
    // 대댓글 작성 API 추가
    replyToComment: (postId: string, commentId: string, content: string) =>
        apiCall(`/community/posts/${postId}/comments/${commentId}/replies`, {
            method: 'POST',
            body: JSON.stringify({ content })
        }),
    // 공지사항 조회수 증가
    incrementNoticeViews: (noticeId: string) =>
        apiCall(`/community/posts/${noticeId}/views`, {
            method: 'POST'
        }),
};

// Funding Projects APIs
export const fundingAPI = {
    // 프로젝트 목록 조회
    getProjects: (filters?: any) => {
        const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
        return apiCall(`/funding/projects${queryParams}`);
    },

    // 프로젝트 상세 조회
    getProject: (projectId: string) => apiCall(`/funding/projects/${projectId}`),
    getProjectDetail: (projectId: string) => apiCall(`/funding/projects/${projectId}`),

    // 프로젝트 생성
    createProject: (projectData: any) => apiCall('/funding/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
    }),

    // 후원 참여
    backProject: (projectId: string, backData: any) => apiCall(`/funding/projects/${projectId}/back`, {
        method: 'POST',
        body: JSON.stringify(backData)
    }),

    // 환불 처리
    refundProject: (projectId: string) => apiCall(`/funding/projects/${projectId}/refund`, {
        method: 'POST'
    }),

    // 집행 계획 업데이트
    updateExecutionPlan: (projectId: string, executionData: any) => apiCall(`/funding/projects/${projectId}/execution`, {
        method: 'PUT',
        body: JSON.stringify(executionData)
    }),

    // 비용 내역 추가
    addExpense: (projectId: string, expenseData: any) => apiCall(`/funding/projects/${projectId}/expenses`, {
        method: 'POST',
        body: JSON.stringify(expenseData)
    }),

    // 수익 분배 실행
    distributeRevenue: (projectId: string) => apiCall(`/funding/projects/${projectId}/distribute-revenue`, {
        method: 'POST'
    }),

    // 프로젝트 좋아요/취소
    likeProject: (projectId: string) => apiCall(`/funding/projects/${projectId}/like`, {
        method: 'POST'
    }),

    // 프로젝트 북마크/취소
    bookmarkProject: (projectId: string) => apiCall(`/funding/projects/${projectId}/bookmark`, {
        method: 'POST'
    }),

    // 기존 함수들 (호환성 유지)
    getProjectDetails: (projectId: number) => apiCall(`/funding/projects/${projectId}`),
    investInProject: (projectId: number, amount: number) => apiCall(`/funding/projects/${projectId}/invest`, {
        method: 'POST',
        body: JSON.stringify({ amount })
    }),
    getProjectUpdates: (projectId: number) => apiCall(`/funding/projects/${projectId}/updates`),
};

// User/Investor APIs
export const userAPI = {
    getUserProfile: (userId: string) => apiCall(`/users/${userId}/profile`),
    getInvestments: (userId: string) => apiCall(`/users/${userId}/investments`),
    getPoints: (userId: string) => apiCall(`/users/${userId}/points`),
    getPointsHistory: (userId: string, params?: {
        page?: number;
        limit?: number;
        type?: string;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/users/${userId}/points/history${queryParams}`);
    },
    investWithPoints: (userId: string, data: { projectId: string; amount: number }) =>
        apiCall(`/users/${userId}/points/invest`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    getFollowingArtists: (userId: string) => apiCall(`/users/${userId}/following`),
    // 팔로우하는 아티스트의 펀딩 프로젝트 히스토리 조회
    getFollowingArtistsFundingHistory: (userId: string, params?: {
        page?: number;
        limit?: number;
        status?: 'success' | 'failed' | 'ongoing';
        category?: string;
        sortBy?: 'date' | 'amount' | 'status';
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/users/${userId}/following/funding-history${queryParams}`);
    },
    // 특정 아티스트의 펀딩 프로젝트 히스토리 조회
    getArtistFundingHistory: (userId: string, artistId: string, params?: {
        page?: number;
        limit?: number;
        status?: 'success' | 'failed' | 'ongoing';
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/users/${userId}/following/${artistId}/funding-history${queryParams}`);
    },
    updateProfile: (userId: string, data: any) =>
        apiCall(`/users/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),
};

// 알림 및 상호작용 APIs
export const interactionAPI = {
    // 알림 목록 조회
    getNotifications: (params?: {
        page?: number;
        limit?: number;
        type?: string;
        read?: boolean;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/notifications${queryParams}`);
    },

    // 알림 읽음 처리
    markNotificationAsRead: (notificationId: string) => apiCall(`/notifications/${notificationId}/read`, {
        method: 'PUT'
    }),

    // 모든 알림 읽음 처리
    markAllNotificationsAsRead: () => apiCall('/notifications/read-all', {
        method: 'PUT'
    }),

    // 알림 삭제
    deleteNotification: (notificationId: string) => apiCall(`/notifications/${notificationId}`, {
        method: 'DELETE'
    }),

    // 아티스트 팔로우/언팔로우
    followArtist: (artistId: string) => apiCall(`/artists/${artistId}/follow`, {
        method: 'POST'
    }),

    // 아티스트 언팔로우
    unfollowArtist: (artistId: string) => apiCall(`/artists/${artistId}/unfollow`, {
        method: 'DELETE'
    }),

    // 검색
    search: (query: string, type?: 'artists' | 'projects' | 'events' | 'posts') => {
        const params = new URLSearchParams({ q: query });
        if (type) params.append('type', type);
        return apiCall(`/search?${params.toString()}`);
    }
};

// Auth APIs
export const authAPI = {
    // 이메일 중복 검사
    checkEmailDuplicate: (email: string) => apiCall<{ success: boolean; isDuplicate: boolean; message?: string }>('/auth/check-email', {
        method: 'POST',
        body: JSON.stringify({ email })
    }),
    // 회원가입
    signup: (userData: any) => apiCall('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    // 로그인
    login: (credentials: { email: string; password: string }) => apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    // 로그아웃
    logout: () => apiCall('/auth/logout', {
        method: 'POST'
    }),
    // 토큰 검증
    verify: () => apiCall('/auth/verify', {
        method: 'GET'
    }),
    // 토큰 갱신
    refreshToken: () => apiCall('/auth/refresh', {
        method: 'POST'
    }),
    // GET 요청
    get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
    // POST 요청
    post: (endpoint: string, data?: any) => apiCall(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined
    }),
    // PUT 요청
    put: (endpoint: string, data?: any) => apiCall(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined
    }),
    // DELETE 요청
    delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
};

// Live Stream APIs
export const liveStreamAPI = {
    getLiveStreams: () => apiCall('/live-streams') as Promise<any>,
    getLiveStream: (streamId: string) => apiCall(`/live-streams/${streamId}`) as Promise<any>,
    getScheduledStreams: () => apiCall('/live-streams/scheduled'),
    startStream: (data: any) =>
        apiCall('/live-streams', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
    endStream: (streamId: number) =>
        apiCall(`/live-streams/${streamId}/end`, {
            method: 'PUT'
        }),
};

// Category APIs
export const categoryAPI = {
    // 모든 카테고리 조회
    getAllCategories: () => apiCall('/categories'),

    // 특정 카테고리 조회
    getCategoryById: (categoryId: string) => apiCall(`/categories/${categoryId}`),

    // 카테고리 생성 (관리자용)
    createCategory: (data: any) =>
        apiCall('/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    // 카테고리 수정 (관리자용)
    updateCategory: (categoryId: string, data: any) =>
        apiCall(`/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 카테고리 삭제 (관리자용)
    deleteCategory: (categoryId: string) =>
        apiCall(`/categories/${categoryId}`, {
            method: 'DELETE'
        }),
};





// Utility function to check if API is available
export const isAPIAvailable = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return response.ok;
    } catch {
        return false;
    }
};



// Enhanced artist data fetcher - API만 사용
export const getArtistData = async () => {
    try {
        const response = await artistAPI.getPopularArtists(20);
        if ((response as any).success && (response as any).data?.artists) {
            return (response as any).data.artists;
        }
        return [];
    } catch (error) {
        console.error('API call failed:', error);
        return [];
    }
};

// Stats APIs
export const statsAPI = {
    // 플랫폼 전체 통계 조회
    getPlatformStats: () => apiCall('/stats/platform'),
    // 아티스트별 통계 조회
    getArtistStats: (artistId: string) => apiCall(`/stats/artist/${artistId}`),
    // 프로젝트 통계 조회
    getProjectStats: (params?: { category?: string; status?: string; timeframe?: string }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.timeframe) queryParams.append('timeframe', params.timeframe);

        const queryString = queryParams.toString();
        return apiCall(`/stats/projects${queryString ? `?${queryString}` : ''}`);
    },
    // 커뮤니티 통계 조회
    getCommunityStats: () => apiCall('/stats/community'),
};

// User Profile Management APIs
export const userProfileAPI = {
    // 사용자 프로필 조회
    getUserProfile: (userId: string) => apiCall(`/users/${userId}/profile`),

    // 사용자 프로필 업데이트
    updateUserProfile: (userId: string, data: any) =>
        apiCall(`/users/${userId}/profile`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 비밀번호 변경
    changePassword: (userId: string, data: { currentPassword: string; newPassword: string }) =>
        apiCall(`/users/${userId}/password`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 사용자 프로젝트 목록 조회
    getUserProjects: (userId: string, params?: {
        status?: string;
        category?: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/users/${userId}/projects${queryParams}`);
    },

    // 사용자 수익 내역 조회
    getUserRevenues: (userId: string, params?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/users/${userId}/revenues${queryParams}`);
    },

    // 사용자 백킹 내역 조회
    getUserBackings: (userId: string, params?: {
        status?: string;
        projectId?: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/users/${userId}/backings${queryParams}`);
    }
};

// Community Post APIs
export const communityPostAPI = {
    // 게시글 목록 조회
    getPosts: (params?: {
        category?: string;
        search?: string;
        author?: string;
        tags?: string[];
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.author) queryParams.append('author', params.author);
        if (params?.tags && params.tags.length > 0) queryParams.append('tags', params.tags.join(','));
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/community/posts${queryString ? `?${queryString}` : ''}`);
    },

    // 게시글 상세 조회
    getPost: (postId: string) => apiCall(`/community/posts/${postId}`),
    getPostById: (postId: string) => apiCall(`/community/posts/${postId}`),

    // 게시글 생성
    createPost: (data: any) =>
        apiCall('/community/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    // 게시글 수정
    updatePost: (postId: string, data: any) =>
        apiCall(`/community/posts/${postId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 게시글 삭제
    deletePost: (postId: string) =>
        apiCall(`/community/posts/${postId}`, {
            method: 'DELETE'
        }),

    // 게시글 좋아요/싫어요
    togglePostReaction: (postId: string, reaction: 'like' | 'dislike' | 'unlike' | 'undislike') =>
        apiCall(`/community/posts/${postId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction })
        }),

    // 게시글 조회수 증가
    incrementPostViews: (postId: string) =>
        apiCall(`/community/posts/${postId}/views`, {
            method: 'POST'
        }),

    // 게시글 사용자별 반응 상태 확인
    getPostReactions: (postId: string) =>
        apiCall(`/community/posts/${postId}/reactions`),

    // 게시글 좋아요
    likePost: (postId: string, action: 'like' | 'unlike') =>
        apiCall(`/community/posts/${postId}/like`, {
            method: 'POST',
            body: JSON.stringify({ action })
        }),

    // 게시글 북마크
    bookmarkPost: (postId: string, action: 'bookmark' | 'unbookmark') =>
        apiCall(`/community/posts/${postId}/bookmark`, {
            method: 'POST',
            body: JSON.stringify({ action })
        }),

    // 카테고리 목록 조회
    getCategories: () => apiCall('/community/categories'),

    // 통계 조회
    getStats: () => apiCall('/community/stats'),

    // 내 게시글 조회
    getMyPosts: (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        return apiCall(`/community/posts/my${queryString ? `?${queryString}` : ''}`);
    },

    // 북마크한 게시글 조회
    getBookmarkedPosts: (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        return apiCall(`/community/posts/bookmarked${queryString ? `?${queryString}` : ''}`);
    }
};

// Community Comment APIs
export const communityCommentAPI = {
    // 게시글 댓글 목록 조회
    getComments: (postId: string, params?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/community/posts/${postId}/comments${queryParams}`);
    },

    // 댓글 작성
    createComment: (postId: string, data: { content: string; parentId?: string }) =>
        apiCall(`/community/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    // 댓글 수정
    updateComment: (postId: string, commentId: string, data: { content: string }) =>
        apiCall(`/community/posts/${postId}/comments/${commentId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 댓글 삭제
    deleteComment: (postId: string, commentId: string) =>
        apiCall(`/community/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE'
        }),

    // 댓글 좋아요/싫어요
    toggleCommentReaction: (postId: string, commentId: string, reaction: 'like' | 'dislike' | 'unlike') =>
        apiCall(`/community/posts/${postId}/comments/${commentId}/reactions`, {
            method: 'POST',
            body: JSON.stringify({ reaction })
        }),

    // 댓글 좋아요
    likeComment: (commentId: string, action: 'like' | 'unlike') =>
        apiCall(`/community/comments/${commentId}/like`, {
            method: 'POST',
            body: JSON.stringify({ action })
        }),

    // 내 댓글 조회
    getMyComments: (params?: any) => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        const queryString = queryParams.toString();
        return apiCall(`/community/comments/my${queryString ? `?${queryString}` : ''}`);
    }
};

// Event Management APIs
export const eventManagementAPI = {
    // 이벤트 목록 조회
    getEvents: (params?: {
        category?: string;
        status?: string;
        location?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.location) queryParams.append('location', params.location);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/events${queryString ? `?${queryString}` : ''}`);
    },

    // 이벤트 상세 조회
    getEventById: (eventId: string) => apiCall(`/events/${eventId}`),

    // 이벤트 생성
    createEvent: (data: any) =>
        apiCall('/events', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    // 이벤트 수정
    updateEvent: (eventId: string, data: any) =>
        apiCall(`/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    // 이벤트 삭제
    deleteEvent: (eventId: string) =>
        apiCall(`/events/${eventId}`, {
            method: 'DELETE'
        }),

    // 이벤트 참가
    joinEvent: (eventId: string) =>
        apiCall(`/events/${eventId}/join`, {
            method: 'POST'
        }),

    // 이벤트 참가 취소
    leaveEvent: (eventId: string) =>
        apiCall(`/events/${eventId}/leave`, {
            method: 'DELETE'
        }),

    // 이벤트 참가자 목록 조회
    getEventParticipants: (eventId: string, params?: {
        status?: string;
        page?: number;
        limit?: number;
    }) => {
        const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiCall(`/events/${eventId}/participants${queryParams}`);
    },

    // 이벤트 좋아요/취소
    likeEvent: (eventId: string) => apiCall(`/events/${eventId}/like`, {
        method: 'POST'
    }),

    // 이벤트 북마크/취소
    bookmarkEvent: (eventId: string) => apiCall(`/events/${eventId}/bookmark`, {
        method: 'POST'
    }),

    // 이벤트 상세 조회 (별칭)
    getEvent: (eventId: string) => apiCall(`/events/${eventId}`)
};

// Admin User Management APIs
export const adminUserAPI = {
    // 모든 사용자 목록 조회
    getAllUsers: (params?: {
        role?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/admin/users${queryString ? `?${queryString}` : ''}`);
    },

    // 사용자 상태 변경
    updateUserStatus: (userId: string, status: string) =>
        apiCall(`/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),

    // 사용자 권한 변경
    updateUserRole: (userId: string, role: string) =>
        apiCall(`/admin/users/${userId}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        }),

    // 사용자 계정 정지/해제
    suspendUser: (userId: string, reason?: string) =>
        apiCall(`/admin/users/${userId}/suspend`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        }),

    // 사용자 계정 복구
    restoreUser: (userId: string) =>
        apiCall(`/admin/users/${userId}/restore`, {
            method: 'POST'
        }),

    // 사용자 계정 영구 차단
    banUser: (userId: string, reason: string) =>
        apiCall(`/admin/users/${userId}/ban`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        })
};

// Admin Project Management APIs
export const adminProjectAPI = {
    // 모든 프로젝트 목록 조회
    getAllProjects: (params?: {
        status?: string;
        category?: string;
        search?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.category) queryParams.append('category', params.category);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params?.order) queryParams.append('order', params.order);

        const queryString = queryParams.toString();
        return apiCall(`/admin/projects${queryString ? `?${queryString}` : ''}`);
    },

    // 프로젝트 승인/거절
    updateProjectStatus: (projectId: string, status: 'approved' | 'rejected', reason?: string) =>
        apiCall(`/admin/projects/${projectId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status, reason })
        }),

    // 프로젝트 조치 실행
    executeProjectAction: (projectId: string, action: string, data?: any) =>
        apiCall(`/admin/projects/${projectId}/actions`, {
            method: 'POST',
            body: JSON.stringify({ action, ...data })
        })
};

// Constants API
export const constantsAPI = {
    // 모든 enum 값들 조회
    getEnums: () => apiCall('/constants/enums'),

    // 특정 카테고리의 enum 값들 조회
    getEnumsByCategory: (category: string) => apiCall(`/constants/enums/${category}`),

    // CSV 헤더 조회
    getCsvHeaders: () => apiCall('/constants/csv-headers'),

    // 상태별 색상 조회
    getStatusColors: () => apiCall('/constants/status-colors'),

    // 상태별 아이콘 조회
    getStatusIcons: () => apiCall('/constants/status-icons'),

    // 아트워크 카테고리 조회
    getArtworkCategories: () => apiCall('/constants/artwork-categories'),

    // 비용 카테고리 조회
    getExpenseCategories: () => apiCall('/constants/expense-categories'),

    // 결제 방법 조회
    getPaymentMethods: () => apiCall('/constants/payment-methods'),

    // 상태 설정 조회
    getStatusConfig: (type: 'project' | 'funding' | 'event') => apiCall(`/constants/status-config/${type}`)
};