import {
  sanitizeToken,
  persistTokens,
  clearTokens,
  getStoredAccessToken,
  resolveAuthTokenCandidates,
  AUTH_TOKEN_KEY,
} from '../tokenStorage';

const SAMPLE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

describe('tokenStorage helpers', () => {
  beforeEach(() => {
    clearTokens();
    localStorage.clear();
  });

  describe('sanitizeToken', () => {
    it('returns null for non-string input', () => {
      expect(sanitizeToken(undefined)).toBeNull();
      expect(sanitizeToken(null)).toBeNull();
    });

    it('filters out bearer prefixes and undefined noise', () => {
      const noisy = `Bearer undefined${SAMPLE_JWT}`;
      expect(sanitizeToken(noisy)).toBe(SAMPLE_JWT);
    });

    it('filters quoted tokens', () => {
      const quoted = `"${SAMPLE_JWT}"`;
      expect(sanitizeToken(quoted)).toBe(SAMPLE_JWT);
    });

    it('removes explicit null-like strings', () => {
      expect(sanitizeToken('null')).toBeNull();
      expect(sanitizeToken('undefined')).toBeNull();
    });

    it('keeps already clean tokens untouched', () => {
      expect(sanitizeToken(SAMPLE_JWT)).toBe(SAMPLE_JWT);
    });
  });

  describe('persistTokens', () => {
    it('stores sanitized fallback tokens when access token is missing', () => {
      const fallbackToken = `undefined${SAMPLE_JWT}`;
      const result = persistTokens({ fallbackToken });

      expect(result.accessToken).toBe(SAMPLE_JWT);
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(SAMPLE_JWT);
    });

    it('clears storage when sanitized token is empty', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, 'stale');
      const result = persistTokens({ accessToken: 'null' });

      expect(result.accessToken).toBeNull();
      expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
  });

  describe('getStoredAccessToken', () => {
    it('returns sanitized token from storage', () => {
      localStorage.setItem(AUTH_TOKEN_KEY, `Bearer undefined${SAMPLE_JWT}`);
      expect(getStoredAccessToken()).toBe(SAMPLE_JWT);
    });
  });

  describe('resolveAuthTokenCandidates', () => {
    it('extracts tokens from nested data objects', () => {
      const response = {
        success: true,
        data: {
          accessToken: SAMPLE_JWT,
          refreshToken: `${SAMPLE_JWT}.refresh`,
        },
      };

      expect(resolveAuthTokenCandidates(response)).toEqual({
        accessToken: SAMPLE_JWT,
        fallbackToken: SAMPLE_JWT,
        refreshToken: `${SAMPLE_JWT}.refresh`,
      });
    });

    it('falls back to legacy token fields when accessToken is missing', () => {
      const response = {
        success: true,
        data: {
          token: SAMPLE_JWT,
        },
      };

      expect(resolveAuthTokenCandidates(response)).toEqual({
        accessToken: null,
        fallbackToken: SAMPLE_JWT,
        refreshToken: null,
      });
    });

    it('supports deeply nested payloads', () => {
      const response = {
        result: {
          tokens: {
            jwtToken: SAMPLE_JWT,
            refresh_token: `${SAMPLE_JWT}.refresh`,
          },
        },
      };

      expect(resolveAuthTokenCandidates(response)).toEqual({
        accessToken: SAMPLE_JWT,
        fallbackToken: SAMPLE_JWT,
        refreshToken: `${SAMPLE_JWT}.refresh`,
      });
    });

    it('returns null tokens when no candidates exist', () => {
      expect(resolveAuthTokenCandidates({ success: false })).toEqual({
        accessToken: null,
        fallbackToken: null,
        refreshToken: null,
      });
    });
  });
});
