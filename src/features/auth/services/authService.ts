import {
  AuthResponse,
  RefreshTokenResponse,
  LoginCredentials,
  SignupData,
  PasswordResetRequest,
  PasswordReset,
} from '../types';
import { authAPI } from '../../../services/api';
import { ApiResponse, User } from '../../../shared/types';

class AuthService {
  /**
   * 로그인
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = (await authAPI.login(
      credentials,
    )) as ApiResponse<AuthResponse>;

    if (!response.success || !response.data) {
      throw new Error(response.error || '로그인에 실패했습니다');
    }

    // 토큰을 localStorage에 저장
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  }

  /**
   * 회원가입
   */
  async signup(signupData: SignupData): Promise<AuthResponse> {
    const response = (await authAPI.signup(
      signupData,
    )) as ApiResponse<AuthResponse>;

    if (!response.success || !response.data) {
      throw new Error(response.error || '회원가입에 실패했습니다');
    }

    // 토큰을 localStorage에 저장
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      await authAPI.logout();
    } catch (error) {
      console.warn('로그아웃 요청 실패:', error);
    }

    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    const response =
      (await authAPI.refreshToken()) as ApiResponse<RefreshTokenResponse>;

    if (!response.success || !response.data) {
      throw new Error(response.error || '토큰 갱신에 실패했습니다');
    }

    // 새로운 토큰을 localStorage에 저장
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
  }

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<User> {
    const response = (await authAPI.verify()) as ApiResponse<User>;

    if (!response.success || !response.data) {
      throw new Error(response.error || '사용자 정보 조회에 실패했습니다');
    }

    return response.data;
  }

  /**
   * 비밀번호 재설정 요청
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    const response = (await authAPI.post(
      '/auth/password-reset-request',
      data,
    )) as ApiResponse;

    if (!response.success) {
      throw new Error(response.error || '비밀번호 재설정 요청에 실패했습니다');
    }
  }

  /**
   * 비밀번호 재설정
   */
  async resetPassword(data: PasswordReset): Promise<void> {
    const response = (await authAPI.post(
      '/auth/password-reset',
      data,
    )) as ApiResponse;

    if (!response.success) {
      throw new Error(response.error || '비밀번호 재설정에 실패했습니다');
    }
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<User> {
    const response = (await authAPI.put(
      '/auth/profile',
      data,
    )) as ApiResponse<User>;

    if (!response.success || !response.data) {
      throw new Error(response.error || '프로필 업데이트에 실패했습니다');
    }

    return response.data;
  }

  /**
   * 비밀번호 변경
   */
  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const response = (await authAPI.post(
      '/auth/change-password',
      data,
    )) as ApiResponse;

    if (!response.success) {
      throw new Error(response.error || '비밀번호 변경에 실패했습니다');
    }
  }

  /**
   * 토큰 유효성 검사
   */
  isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) return false;
      const payloadPart = tokenParts[1];
      if (!payloadPart) return false;
      const payload = JSON.parse(window.atob(payloadPart));
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
    return localStorage.getItem('accessToken');
  }

  /**
   * 현재 리프레시 토큰 가져오기
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}

export const authService = new AuthService();
