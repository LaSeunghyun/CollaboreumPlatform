import { ensureApiPath, resolveApiBaseUrl } from '../env';

describe('ensureApiPath', () => {
  describe('절대 경로 처리', () => {
    it('후행 슬래시가 있는 절대 경로에서 슬래시를 제거해야 함', () => {
      expect(ensureApiPath('https://example.com/api/')).toBe(
        'https://example.com/api',
      );
      expect(ensureApiPath('http://localhost:5000/api/')).toBe(
        'http://localhost:5000/api',
      );
      expect(
        ensureApiPath(
          'https://collaboreumplatform-production.up.railway.app/api/',
        ),
      ).toBe('https://collaboreumplatform-production.up.railway.app/api');
    });

    it('여러 개의 후행 슬래시가 있는 경우 모두 제거해야 함', () => {
      expect(ensureApiPath('https://example.com/api///')).toBe(
        'https://example.com/api',
      );
      expect(ensureApiPath('http://localhost:5000/api//')).toBe(
        'http://localhost:5000/api',
      );
    });

    it('후행 슬래시가 없는 절대 경로는 그대로 유지해야 함', () => {
      expect(ensureApiPath('https://example.com/api')).toBe(
        'https://example.com/api',
      );
      expect(ensureApiPath('http://localhost:5000/api')).toBe(
        'http://localhost:5000/api',
      );
    });
  });

  describe('상대 경로 처리', () => {
    it('후행 슬래시가 있는 상대 경로에서 슬래시를 제거해야 함', () => {
      expect(ensureApiPath('/api/')).toBe('/api');
      expect(ensureApiPath('/users/123/')).toBe('/users/123');
      expect(ensureApiPath('/community/posts/')).toBe('/community/posts');
    });

    it('여러 개의 후행 슬래시가 있는 경우 모두 제거해야 함', () => {
      expect(ensureApiPath('/api///')).toBe('/api');
      expect(ensureApiPath('/users/123//')).toBe('/users/123');
    });

    it('후행 슬래시가 없는 상대 경로는 그대로 유지해야 함', () => {
      expect(ensureApiPath('/api')).toBe('/api');
      expect(ensureApiPath('/users/123')).toBe('/users/123');
    });
  });

  describe('특수 케이스', () => {
    it('루트 경로는 그대로 유지해야 함', () => {
      expect(ensureApiPath('/')).toBe('/');
    });

    it('빈 문자열은 그대로 유지해야 함', () => {
      expect(ensureApiPath('')).toBe('');
    });

    it('null이나 undefined는 그대로 유지해야 함', () => {
      expect(ensureApiPath(null as any)).toBe(null);
      expect(ensureApiPath(undefined as any)).toBe(undefined);
    });

    it('슬래시만 있는 경우는 그대로 유지해야 함', () => {
      expect(ensureApiPath('///')).toBe('///');
    });
  });

  describe('실제 사용 케이스', () => {
    it('API 엔드포인트 경로들을 올바르게 처리해야 함', () => {
      expect(ensureApiPath('https://api.example.com/v1/users/')).toBe(
        'https://api.example.com/v1/users',
      );
      expect(ensureApiPath('/api/auth/login/')).toBe('/api/auth/login');
      expect(ensureApiPath('/api/community/posts/123/')).toBe(
        '/api/community/posts/123',
      );
    });
  });
});

describe('resolveApiBaseUrl', () => {
  // Mock 환경 변수
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('환경 변수가 없을 때 fallback URL을 반환해야 함', () => {
    delete process.env.VITE_API_BASE_URL;
    delete process.env.REACT_APP_API_URL;

    const result = resolveApiBaseUrl();
    expect(result).toMatch(/^https?:\/\/[^\/]+\/api$/);
    expect(result).not.toMatch(/\/$/);
  });

  it('VITE_API_BASE_URL이 설정된 경우 해당 URL을 사용해야 함', () => {
    process.env.VITE_API_BASE_URL = 'https://custom-api.example.com/api/';

    const result = resolveApiBaseUrl();
    expect(result).toBe('https://custom-api.example.com/api');
  });

  it('REACT_APP_API_URL이 설정된 경우 해당 URL을 사용해야 함', () => {
    process.env.REACT_APP_API_URL = 'https://legacy-api.example.com/api/';

    const result = resolveApiBaseUrl();
    expect(result).toBe('https://legacy-api.example.com/api');
  });

  it('VITE_API_BASE_URL이 우선순위를 가져야 함', () => {
    process.env.VITE_API_BASE_URL = 'https://vite-api.example.com/api/';
    process.env.REACT_APP_API_URL = 'https://legacy-api.example.com/api/';

    const result = resolveApiBaseUrl();
    expect(result).toBe('https://vite-api.example.com/api');
  });

  it('환경 변수에 후행 슬래시가 있어도 제거해야 함', () => {
    process.env.VITE_API_BASE_URL = 'https://api.example.com/api///';

    const result = resolveApiBaseUrl();
    expect(result).toBe('https://api.example.com/api');
  });
});
