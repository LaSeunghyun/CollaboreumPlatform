const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const ACCESS_COOKIE_NAME = 'collab_access_token';
const REFRESH_COOKIE_NAME = 'collab_refresh_token';

const isProduction = process.env.NODE_ENV === 'production';

const baseCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

const parseCookieHeader = (cookieHeader = '') => {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.split('=');
    if (!rawKey) {
      return acc;
    }

    const key = rawKey.trim();
    if (!key) {
      return acc;
    }

    const joinedValue = rawValue.join('=').trim();
    try {
      acc[key] = decodeURIComponent(joinedValue);
    } catch (error) {
      acc[key] = joinedValue;
    }
    return acc;
  }, {});
};

const resolveRequestToken = req => {
  const authHeader = req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  const cookies = parseCookieHeader(req.headers?.cookie || '');
  return (
    cookies[ACCESS_COOKIE_NAME] ||
    cookies.accessToken ||
    cookies.token ||
    null
  );
};

const withCookieOptions = overrides => ({
  ...baseCookieOptions,
  ...overrides,
});

const setAuthCookies = (
  res,
  { accessToken, refreshToken, maxAge = ONE_DAY_MS } = {},
) => {
  const cookieMaxAge = typeof maxAge === 'number' ? maxAge : ONE_DAY_MS;

  if (accessToken) {
    res.cookie(
      ACCESS_COOKIE_NAME,
      accessToken,
      withCookieOptions({ maxAge: cookieMaxAge }),
    );
  }

  if (refreshToken) {
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      withCookieOptions({ maxAge: cookieMaxAge }),
    );
  }
};

const clearAuthCookies = res => {
  res.clearCookie(ACCESS_COOKIE_NAME, withCookieOptions());
  res.clearCookie(REFRESH_COOKIE_NAME, withCookieOptions());
};

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  parseCookieHeader,
  resolveRequestToken,
  setAuthCookies,
  clearAuthCookies,
};
