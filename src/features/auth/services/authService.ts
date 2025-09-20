import { resolveApiBaseUrl } from '@/lib/config/env';
import { AuthResponse, RefreshTokenResponse, LoginCredentials, SignupData, PasswordResetRequest, PasswordReset } from '../types';
import { ApiResponse } from '../../../shared/types';
// import { fetch } from '../../../utils/fetch';

const API_BASE_URL = resolveApiBaseUrl();
const AUTH_TOKEN_KEY = 'authToken';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

const clearTokens = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const getStoredAccessToken = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
};

class AuthService {
    private baseUrl = `${API_BASE_URL}/auth`;

    /**
     * 로그인
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        }).then(res => res.json()) as ApiResponse<AuthResponse>;

        if (!response.success || !response.data) {
            throw new Error(response.error || '로그인에 실패했습니다');
        }

        // 토큰을 localStorage에 저장
        console.log('🔐 Login Success - Storing tokens:', {
            accessToken: response.data.accessToken ? `${response.data.accessToken.substring(0, 20)}...` : 'null',
            refreshToken: response.data.refreshToken ? `${response.data.refreshToken.substring(0, 20)}...` : 'null'
        });
        
        storeTokens(response.data.accessToken, response.data.refreshToken);
        
        // 저장 후 확인
        console.log('🔐 Tokens stored - Verification:', {
            authToken: localStorage.getItem(AUTH_TOKEN_KEY) ? `${localStorage.getItem(AUTH_TOKEN_KEY)!.substring(0, 20)}...` : 'null',
            accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) ? `${localStorage.getItem(ACCESS_TOKEN_KEY)!.substring(0, 20)}...` : 'null',
            refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) ? `${localStorage.getItem(REFRESH_TOKEN_KEY)!.substring(0, 20)}...` : 'null'
        });

        return response.data;
    }

    /**
     * 회원가입
     */
    async signup(signupData: SignupData): Promise<AuthResponse> {
        const response = await fetch(`${this.baseUrl}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData),
        }).then(res => res.json()) as ApiResponse<AuthResponse>;

        if (!response.success || !response.data) {
            throw new Error(response.error || '회원가입에 실패했습니다');
        }

        // 토큰을 localStorage에 저장
        storeTokens(response.data.accessToken, response.data.refreshToken);

        return response.data;
    }

    /**
     * 로그아웃
     */
    async logout(): Promise<void> {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (refreshToken) {
            try {
                await fetch(`${this.baseUrl}/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getStoredAccessToken()}`,
                    },
                    body: JSON.stringify({ refreshToken }),
                });
            } catch (error) {
                console.warn('로그아웃 요청 실패:', error);
            }
        }

        // 로컬 스토리지에서 토큰 제거
        clearTokens();
    }

    /**
     * 토큰 갱신
     */
    async refreshToken(): Promise<RefreshTokenResponse> {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            throw new Error('리프레시 토큰이 없습니다');
        }

        const response = await fetch(`${this.baseUrl}/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        }).then(res => res.json()) as ApiResponse<RefreshTokenResponse>;

        if (!response.success || !response.data) {
            throw new Error(response.error || '토큰 갱신에 실패했습니다');
        }

        // 새로운 토큰을 localStorage에 저장
        storeTokens(response.data.accessToken, response.data.refreshToken);

        return response.data;
    }

    /**
     * 현재 사용자 정보 조회
     */
    async getCurrentUser(): Promise<any> {
        const token = getStoredAccessToken();

        if (!token) {
            throw new Error('인증 토큰이 없습니다');
        }

        const response = await fetch(`${this.baseUrl}/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }).then(res => res.json()) as ApiResponse<any>;

        if (!response.success || !response.data) {
            throw new Error(response.error || '사용자 정보 조회에 실패했습니다');
        }

        return response.data;
    }

    /**
     * 비밀번호 재설정 요청
     */
    async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
        const response = await fetch(`${this.baseUrl}/password-reset-request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json()) as ApiResponse;

        if (!response.success) {
            throw new Error(response.error || '비밀번호 재설정 요청에 실패했습니다');
        }
    }

    /**
     * 비밀번호 재설정
     */
    async resetPassword(data: PasswordReset): Promise<void> {
        const response = await fetch(`${this.baseUrl}/password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(res => res.json()) as ApiResponse;

        if (!response.success) {
            throw new Error(response.error || '비밀번호 재설정에 실패했습니다');
        }
    }

    /**
     * 프로필 업데이트
     */
    async updateProfile(data: any): Promise<any> {
        const token = getStoredAccessToken();

        if (!token) {
            throw new Error('인증 토큰이 없습니다');
        }

        const response = await fetch(`${this.baseUrl}/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }).then(res => res.json()) as ApiResponse<any>;

        if (!response.success || !response.data) {
            throw new Error(response.error || '프로필 업데이트에 실패했습니다');
        }

        return response.data;
    }

    /**
     * 비밀번호 변경
     */
    async changePassword(data: any): Promise<void> {
        const token = getStoredAccessToken();

        if (!token) {
            throw new Error('인증 토큰이 없습니다');
        }

        const response = await fetch(`${this.baseUrl}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        }).then(res => res.json()) as ApiResponse;

        if (!response.success) {
            throw new Error(response.error || '비밀번호 변경에 실패했습니다');
        }
    }

    /**
     * 토큰 유효성 검사
     */
    isTokenValid(): boolean {
        const token = getStoredAccessToken();
        if (!token) return false;

        try {
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) return false;
            const payloadPart = tokenParts[1];
            if (!payloadPart) return false;
            const payload = JSON.parse(atob(payloadPart));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch {
            return false;
        }
    }

    /**
     * 현재 토큰 가져오기
     */
    getAccessToken(): string | null {
        return getStoredAccessToken();
    }

    /**
     * 현재 리프레시 토큰 가져오기
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }
}

export const authService = new AuthService();
