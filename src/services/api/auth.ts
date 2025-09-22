import { apiCall } from './base';

// Auth APIs
export const authAPI = {
  // 이메일 중복 검사
  checkEmailDuplicate: (email: string) =>
    apiCall<{ success: boolean; isDuplicate: boolean; message?: string }>(
      '/auth/check-email',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
    ),
  // 회원가입
  signup: (userData: any) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  // 로그인
  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  // 로그아웃
  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),
  // 토큰 검증
  verify: () =>
    apiCall('/auth/verify', {
      method: 'GET',
    }),
  // 토큰 갱신
  refreshToken: () =>
    apiCall('/auth/refresh', {
      method: 'POST',
    }),
  // GET 요청
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  // POST 요청
  post: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  // PUT 요청
  put: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  // DELETE 요청
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
};
