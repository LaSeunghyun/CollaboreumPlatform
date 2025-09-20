const AUTH_TOKEN_KEY = 'authToken';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export type StoredTokens = {
  accessToken: string | null;
  refreshToken: string | null;
};

export const sanitizeToken = (token?: string | null): string | null => {
  if (!token) return null;

  const trimmed = token.trim();
  if (trimmed === '' || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }

  return trimmed;
};

export const storeTokens = (
  accessToken?: string | null,
  refreshToken?: string | null,
): StoredTokens => {
  const sanitizedAccessToken = sanitizeToken(accessToken);
  const sanitizedRefreshToken = sanitizeToken(refreshToken);

  if (!sanitizedAccessToken) {
    console.warn('⚠️ Tried to store invalid access token. Clearing existing tokens.');
    clearTokens();
    return { accessToken: null, refreshToken: null };
  }

  localStorage.setItem(AUTH_TOKEN_KEY, sanitizedAccessToken);
  localStorage.setItem(ACCESS_TOKEN_KEY, sanitizedAccessToken);

  if (sanitizedRefreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, sanitizedRefreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  return {
    accessToken: sanitizedAccessToken,
    refreshToken: sanitizedRefreshToken,
  };
};

export const clearTokens = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const cleanInvalidTokens = () => {
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (authToken === 'undefined' || authToken === 'null' || authToken === '') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  if (accessToken === 'undefined' || accessToken === 'null' || accessToken === '') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (refreshToken === 'undefined' || refreshToken === 'null' || refreshToken === '') {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export const getStoredAccessToken = () => {
  return localStorage.getItem(AUTH_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getStoredRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const tokenStorageKeys = {
  auth: AUTH_TOKEN_KEY,
  access: ACCESS_TOKEN_KEY,
  refresh: REFRESH_TOKEN_KEY,
} as const;
