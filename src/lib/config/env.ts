const getImportMetaEnv = ():
  | Record<string, string | boolean | undefined>
  | undefined => {
  // Jest 환경에서는 import.meta를 사용하지 않음
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return undefined;
  }

  // Jest 환경에서는 import.meta를 사용하지 않음
  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
    return undefined;
  }

  // Jest 환경에서는 import.meta를 사용하지 않음
  if (
    typeof process !== 'undefined' &&
    process.env.npm_lifecycle_event?.includes('test')
  ) {
    return undefined;
  }

  // Jest 환경에서는 import.meta를 사용하지 않음
  if (
    typeof process !== 'undefined' &&
    process.env.npm_config_user_agent?.includes('jest')
  ) {
    return undefined;
  }

  // Vite 환경에서만 import.meta 사용
  // Jest에서는 이 코드가 실행되지 않도록 위에서 체크
  if (typeof globalThis !== 'undefined' && 'import' in globalThis) {
    const importMeta = (globalThis as any).import?.meta;
    if (importMeta && typeof importMeta.env !== 'undefined') {
      return importMeta.env as Record<string, string | boolean | undefined>;
    }
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
