import {
    sanitizeToken,
    persistTokens,
    clearTokens,
    getStoredAccessToken,
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
});
