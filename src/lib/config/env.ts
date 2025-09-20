const getImportMetaEnv = (): Record<string, string | boolean | undefined> | undefined => {
  try {
    if (typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined') {
      return import.meta.env as Record<string, string | boolean | undefined>;
    }
  } catch {
    // ignore - accessing import.meta can throw in non-module contexts (e.g. Jest)
  }

  return undefined;
};

const importMetaEnv = getImportMetaEnv();

export const getEnvVar = (key: string): string | undefined => {
  const fromImportMeta = importMetaEnv?.[key];
  if (typeof fromImportMeta === 'string') {
    return fromImportMeta;
  }

  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    const fromProcess = process.env[key];
    if (typeof fromProcess === 'string') {
      return fromProcess;
    }
  }

  return undefined;
};

export const isLocalEnvironment = (): boolean => {
  if (typeof window === 'undefined') {
    return getEnvVar('NODE_ENV') !== 'production';
  }

  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

const sanitizeBaseUrl = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const ensureApiPath = (baseUrl: string): string => {
  if (!baseUrl) {
    return '/api';
  }

  const trimmed = baseUrl.trim();

  try {
    const url = new URL(trimmed);

    if (!url.pathname || url.pathname === '/' || url.pathname === '') {
      url.pathname = '/api';
    }

    return url.toString().replace(/\/+$, '');
  } catch {
    const withoutTrailingSlash = trimmed.replace(/\/+$, '');

    if (!withoutTrailingSlash || withoutTrailingSlash === '/' || withoutTrailingSlash === '.') {
      return '/api';
    }

    return withoutTrailingSlash;
  }
};

export const resolveApiBaseUrl = (): string => {
  const fallback = isLocalEnvironment()
    ? 'http://localhost:5000/api'
    : 'https://collaboreumplatform-production.up.railway.app/api';

  const envBaseUrl =
    sanitizeBaseUrl(getEnvVar('VITE_API_BASE_URL')) ??
    sanitizeBaseUrl(getEnvVar('REACT_APP_API_URL'));

  const baseUrl = envBaseUrl ?? fallback;

  return ensureApiPath(baseUrl);
};
