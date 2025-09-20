const importEnvModule = async () => {
  jest.resetModules();
  return import('../env');
};

const originalViteApiBaseUrl = process.env.VITE_API_BASE_URL;
const originalReactAppApiUrl = process.env.REACT_APP_API_URL;

afterEach(() => {
  if (typeof originalViteApiBaseUrl === 'undefined') {
    delete process.env.VITE_API_BASE_URL;
  } else {
    process.env.VITE_API_BASE_URL = originalViteApiBaseUrl;
  }

  if (typeof originalReactAppApiUrl === 'undefined') {
    delete process.env.REACT_APP_API_URL;
  } else {
    process.env.REACT_APP_API_URL = originalReactAppApiUrl;
  }
});

describe('ensureApiPath', () => {
  it('removes trailing slashes from absolute paths', async () => {
    const { ensureApiPath } = await importEnvModule();
    expect(ensureApiPath('https://host/api/')).toBe('https://host/api');
  });

  it('leaves absolute paths without trailing slashes unchanged', async () => {
    const { ensureApiPath } = await importEnvModule();
    expect(ensureApiPath('https://host/api')).toBe('https://host/api');
  });

  it('removes trailing slashes from relative paths', async () => {
    const { ensureApiPath } = await importEnvModule();
    expect(ensureApiPath('/api/')).toBe('/api');
  });

  it('leaves relative paths without trailing slashes unchanged', async () => {
    const { ensureApiPath } = await importEnvModule();
    expect(ensureApiPath('/api')).toBe('/api');
  });
});

describe('resolveApiBaseUrl', () => {
  it('normalizes trailing slashes from environment variables', async () => {
    process.env.VITE_API_BASE_URL = 'https://host/api/';
    const { resolveApiBaseUrl } = await importEnvModule();

    expect(resolveApiBaseUrl()).toBe('https://host/api');
  });

  it('handles relative environment paths without trailing slash', async () => {
    process.env.VITE_API_BASE_URL = '/api/';
    const { resolveApiBaseUrl } = await importEnvModule();

    expect(resolveApiBaseUrl()).toBe('/api');
  });

  it('falls back to the default API path when environment variables are absent', async () => {
    delete process.env.VITE_API_BASE_URL;
    delete process.env.REACT_APP_API_URL;
    const { resolveApiBaseUrl } = await importEnvModule();

    expect(resolveApiBaseUrl()).toBe('http://localhost:5000/api');
  });
});
