const getImportMetaEnv = ():
  | Record<string, string | boolean | undefined>
  | undefined => {
  try {
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

export const resolveApiBaseUrl = (): string => {
  // 모든 환경에서 Railway 프로덕션 서버 사용
  const fallback = 'https://collaboreumplatform-production.up.railway.app/api';

  return (
    getEnvVar('VITE_API_BASE_URL') ?? getEnvVar('REACT_APP_API_URL') ?? fallback
  );
};
