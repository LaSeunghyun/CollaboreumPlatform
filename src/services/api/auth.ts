import { apiCall } from './base';

export const authAPI = {
  checkEmailDuplicate: (email: string) =>
    apiCall<{ success: boolean; isDuplicate: boolean; message?: string }>(
      '/auth/check-email',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      },
    ),
  signup: (userData: any) =>
    apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  login: (credentials: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),
  verify: () =>
    apiCall('/auth/verify', {
      method: 'GET',
    }),
  refreshToken: () =>
    apiCall('/auth/refresh', {
      method: 'POST',
    }),
  get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),
  post: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  put: (endpoint: string, data?: any) =>
    apiCall(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: (endpoint: string) => apiCall(endpoint, { method: 'DELETE' }),
};
