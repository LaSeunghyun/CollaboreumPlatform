import { storeTokens, sanitizeToken } from '../authService';

describe('authService helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('sanitizeToken', () => {
    it('returns trimmed token when value is valid', () => {
      expect(sanitizeToken('  valid-token  ')).toBe('valid-token');
    });

    it('returns null for blank-like values', () => {
      expect(sanitizeToken('')).toBeNull();
      expect(sanitizeToken('   ')).toBeNull();
      expect(sanitizeToken('undefined')).toBeNull();
      expect(sanitizeToken('null')).toBeNull();
      expect(sanitizeToken(null)).toBeNull();
    });
  });

  describe('storeTokens', () => {
    it('prefers sanitized accessToken but falls back to token when needed', () => {
      const { accessToken, refreshToken } = storeTokens('   ', '  undefined  ', 'fallback-token');

      expect(accessToken).toBe('fallback-token');
      expect(refreshToken).toBeNull();
      expect(localStorage.getItem('authToken')).toBe('fallback-token');
      expect(localStorage.getItem('accessToken')).toBe('fallback-token');
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('clears tokens when no valid value is provided', () => {
      localStorage.setItem('authToken', 'stale');
      localStorage.setItem('accessToken', 'stale');
      localStorage.setItem('refreshToken', 'stale');

      const { accessToken, refreshToken } = storeTokens(undefined, undefined, undefined);

      expect(accessToken).toBeNull();
      expect(refreshToken).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it("does not leave the string 'undefined' in storage", () => {
      const { accessToken } = storeTokens('undefined', 'undefined', 'undefined');

      expect(accessToken).toBeNull();
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
