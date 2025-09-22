const getImportMetaEnv = ():
  | Record<string, string | boolean | undefined>
  | undefined => {
  try {
    // Jest 환경에서는 import.meta를 사용하지 않음
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      return undefined;
    }

    // Jest 환경에서는 import.meta를 사용하지 않음
    if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
      return undefined;
    }

    if (
      typeof import.meta !== 'undefined' &&
      typeof import.meta.env !== 'undefined'
    ) {
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

  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

const sanitizeBaseUrl = (value: string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const ensureApiPath = (path: string): string => {
  if (!path) {
    return path;
  }

  if (path === '/') {
    return path;
  }

  const normalized = path.replace(/\/+$/, '');

  if (normalized.length === 0) {
    return '/';
  }

  return normalized;
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
