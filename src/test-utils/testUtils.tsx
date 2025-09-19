import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

// 테스트용 QueryClient 설정
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// 모든 Provider를 포함한 테스트 래퍼
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// 커스텀 render 함수
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// 모든 testing-library exports와 함께 customRender export
export * from '@testing-library/react';
export { customRender as render };

// 테스트용 유틸리티 함수들
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-1',
  username: '테스트 사용자',
  email: 'test@example.com',
  role: 'fan',
  avatar: 'https://via.placeholder.com/40',
  ...overrides,
});

export const createMockArtist = (overrides = {}) => ({
  id: 'test-artist-1',
  username: '테스트 아티스트',
  email: 'artist@example.com',
  role: 'artist',
  avatar: 'https://via.placeholder.com/40',
  category: '음악',
  bio: '테스트 아티스트입니다.',
  ...overrides,
});

export const createMockProject = (overrides = {}) => ({
  id: 1,
  title: '테스트 프로젝트',
  description: '테스트 프로젝트 설명',
  artist: '테스트 아티스트',
  category: '음악',
  thumbnail: 'https://via.placeholder.com/400x300',
  currentAmount: 2500000,
  targetAmount: 5000000,
  backers: 25,
  daysLeft: 30,
  endDate: '2024-12-31',
  status: 'active',
  ...overrides,
});

export const createMockFundingProject = (overrides = {}) => ({
  id: 1,
  title: '테스트 펀딩 프로젝트',
  description: '테스트 펀딩 프로젝트 설명',
  artist: '테스트 아티스트',
  category: '음악',
  thumbnail: 'https://via.placeholder.com/400x300',
  currentAmount: 2500000,
  targetAmount: 5000000,
  backers: 25,
  daysLeft: 30,
  endDate: '2024-12-31',
  status: 'active',
  rewards: [
    {
      id: 1,
      title: '기본 리워드',
      description: '기본 리워드 설명',
      amount: 10000,
      estimatedDelivery: '2024-12-31',
    },
  ],
  ...overrides,
});

// API 모킹을 위한 헬퍼 함수
export const mockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
});

// 에러 응답 모킹
export const mockApiError = (message = 'API Error', status = 500) => ({
  success: false,
  error: message,
  status,
});

// 비동기 테스트를 위한 헬퍼
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));

// 폼 테스트를 위한 헬퍼
export const fillFormField = (getByLabelText: any, label: string, value: string) => {
  const field = getByLabelText(label);
  field.value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
};

// 버튼 클릭 테스트를 위한 헬퍼
export const clickButton = (getByRole: any, name: string) => {
  const button = getByRole('button', { name });
  button.click();
};

// 링크 클릭 테스트를 위한 헬퍼
export const clickLink = (getByRole: any, name: string) => {
  const link = getByRole('link', { name });
  link.click();
};

// 입력 필드 테스트를 위한 헬퍼
export const typeInInput = (getByLabelText: any, label: string, text: string) => {
  const input = getByLabelText(label);
  input.focus();
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

// 체크박스 테스트를 위한 헬퍼
export const checkCheckbox = (getByLabelText: any, label: string) => {
  const checkbox = getByLabelText(label);
  checkbox.checked = true;
  checkbox.dispatchEvent(new Event('change', { bubbles: true }));
};

// 셀렉트 박스 테스트를 위한 헬퍼
export const selectOption = (getByLabelText: any, label: string, value: string) => {
  const select = getByLabelText(label);
  select.value = value;
  select.dispatchEvent(new Event('change', { bubbles: true }));
};

// 파일 업로드 테스트를 위한 헬퍼
export const uploadFile = (getByLabelText: any, label: string, file: File) => {
  const input = getByLabelText(label);
  Object.defineProperty(input, 'files', {
    value: [file],
    writable: false,
  });
  input.dispatchEvent(new Event('change', { bubbles: true }));
};

// 키보드 이벤트 테스트를 위한 헬퍼
export const pressKey = (element: HTMLElement, key: string) => {
  element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
};

// 탭 네비게이션 테스트를 위한 헬퍼
export const pressTab = (element: HTMLElement) => {
  pressKey(element, 'Tab');
};

// 엔터 키 테스트를 위한 헬퍼
export const pressEnter = (element: HTMLElement) => {
  pressKey(element, 'Enter');
};

// 에스케이프 키 테스트를 위한 헬퍼
export const pressEscape = (element: HTMLElement) => {
  pressKey(element, 'Escape');
};

// 스크롤 테스트를 위한 헬퍼
export const scrollTo = (element: HTMLElement, scrollTop: number) => {
  element.scrollTop = scrollTop;
  element.dispatchEvent(new Event('scroll', { bubbles: true }));
};

// 리사이즈 테스트를 위한 헬퍼
export const resizeWindow = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  window.dispatchEvent(new Event('resize'));
};

// 로컬 스토리지 테스트를 위한 헬퍼
export const setLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key: string) => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const clearLocalStorage = () => {
  localStorage.clear();
};

// 세션 스토리지 테스트를 위한 헬퍼
export const setSessionStorage = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const getSessionStorage = (key: string) => {
  const item = sessionStorage.getItem(key);
  return item ? JSON.parse(item) : null;
};

export const clearSessionStorage = () => {
  sessionStorage.clear();
};

// URL 테스트를 위한 헬퍼
export const mockLocation = (href: string) => {
  Object.defineProperty(window, 'location', {
    value: { href },
    writable: true,
  });
};

// 네트워크 요청 모킹을 위한 헬퍼
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  ) as jest.Mock;
};

export const mockFetchError = (error: string) => {
  global.fetch = jest.fn(() => Promise.reject(new Error(error))) as jest.Mock;
};

// 타이머 모킹을 위한 헬퍼
export const mockTimers = () => {
  jest.useFakeTimers();
};

export const restoreTimers = () => {
  jest.useRealTimers();
};

export const advanceTimers = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

// 성능 측정을 위한 헬퍼
export const measurePerformance = (fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

// 메모리 사용량 측정을 위한 헬퍼
export const measureMemory = () => {
  if ('memory' in performance) {
    return (performance as any).memory;
  }
  return null;
};
