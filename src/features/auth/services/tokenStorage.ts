const AUTH_TOKEN_KEY = 'authToken';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

type ObjectRecord = Record<string, unknown>;

const COLLECTABLE_KEYS = new Set(['data', 'result', 'payload', 'tokens']);

const isObjectLike = (value: unknown): value is ObjectRecord => {
  return Boolean(value) && typeof value === 'object';
};

const collectCandidateObjects = (
  root: unknown,
  maxDepth = 4,
): ObjectRecord[] => {
  if (!isObjectLike(root)) {
    return [];
  }

  const queue: Array<{ node: ObjectRecord; depth: number }> = [
    { node: root, depth: 0 },
  ];
  const seen = new Set<ObjectRecord>();
  seen.add(root);
  const collected: ObjectRecord[] = [];

  while (queue.length > 0) {
    const { node, depth } = queue.shift()!;
    collected.push(node);

    if (depth >= maxDepth) {
      continue;
    }

    Object.entries(node).forEach(([key, value]) => {
      if (!isObjectLike(value)) {
        return;
      }

      if (seen.has(value as ObjectRecord)) {
        return;
      }

      seen.add(value as ObjectRecord);
      queue.push({
        node: value as ObjectRecord,
        depth: COLLECTABLE_KEYS.has(key) ? depth : depth + 1,
      });
    });
  }

  return collected;
};

const findFirstStringValue = (
  nodes: ObjectRecord[],
  keys: string[],
): string | null => {
  for (const node of nodes) {
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) {
        continue;
      }

      const value = node[key];
      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return null;
};

const ACCESS_TOKEN_KEYS = [
  'accessToken',
  'access_token',
  'access-token',
  'jwt',
  'jwtToken',
];
const REFRESH_TOKEN_KEYS = [
  'refreshToken',
  'refresh_token',
  'refresh-token',
  'refreshJwt',
  'refreshJwtToken',
];
const FALLBACK_TOKEN_KEYS = ['token', ...ACCESS_TOKEN_KEYS];

const getStorage = (): Storage | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
};

const stripLeadingNoise = (value: string): string => {
  let result = value.trim();

  if (!result) {
    return '';
  }

  if (result.toLowerCase().startsWith('bearer')) {
    result = result.slice('bearer'.length).trimStart();
  }

  // Remove leading noise including quotes
  result = result.replace(/^(?:undefined|null|["'])+/gi, '').trim();

  // Remove trailing quotes
  result = result.replace(/["']+$/g, '').trim();

  return result;
};

export const sanitizeToken = (token?: string | null): string | null => {
  if (typeof token !== 'string') {
    return null;
  }

  const stripped = stripLeadingNoise(token);

  if (
    !stripped ||
    stripped.toLowerCase() === 'undefined' ||
    stripped.toLowerCase() === 'null'
  ) {
    return null;
  }

  return stripped;
};

const pickValidToken = (
  ...candidates: Array<string | null | undefined>
): string | null => {
  for (const candidate of candidates) {
    const sanitized = sanitizeToken(candidate);
    if (sanitized) {
      return sanitized;
    }
  }

  return null;
};

export const resolveAuthTokenCandidates = (
  payload: unknown,
): {
  accessToken: string | null;
  fallbackToken: string | null;
  refreshToken: string | null;
} => {
  if (typeof payload === 'string') {
    return {
      accessToken: payload,
      fallbackToken: payload,
      refreshToken: null,
    };
  }

  const nodes = collectCandidateObjects(payload);

  if (nodes.length === 0) {
    return {
      accessToken: null,
      fallbackToken: null,
      refreshToken: null,
    };
  }

  const accessToken = findFirstStringValue(nodes, ACCESS_TOKEN_KEYS);
  const refreshToken = findFirstStringValue(nodes, REFRESH_TOKEN_KEYS);
  const fallbackToken =
    findFirstStringValue(nodes, FALLBACK_TOKEN_KEYS) ?? accessToken;

  return {
    accessToken: accessToken ?? null,
    fallbackToken: fallbackToken ?? null,
    refreshToken: refreshToken ?? null,
  };
};

export const previewToken = (token?: string | null): string => {
  const sanitized = sanitizeToken(token);
  if (!sanitized) {
    return 'null';
  }

  const visibleLength = 20;
  return sanitized.length > visibleLength
    ? `${sanitized.substring(0, visibleLength)}...`
    : sanitized;
};

export const clearTokens = (): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(AUTH_TOKEN_KEY);
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
};

export const cleanInvalidTokens = (): void => {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  const entries: Array<[key: string, value: string | null]> = [
    [AUTH_TOKEN_KEY, storage.getItem(AUTH_TOKEN_KEY)],
    [ACCESS_TOKEN_KEY, storage.getItem(ACCESS_TOKEN_KEY)],
    [REFRESH_TOKEN_KEY, storage.getItem(REFRESH_TOKEN_KEY)],
  ];

  entries.forEach(([key, value]) => {
    if (!sanitizeToken(value)) {
      storage.removeItem(key);
    }
  });
};

export const persistTokens = ({
  accessToken,
  refreshToken,
  fallbackToken,
}: {
  accessToken?: string | null;
  refreshToken?: string | null;
  fallbackToken?: string | null;
}): { accessToken: string | null; refreshToken: string | null } => {
  const storage = getStorage();
  if (!storage) {
    return { accessToken: null, refreshToken: null };
  }

  const primaryToken = pickValidToken(accessToken, fallbackToken);
  const sanitizedRefreshToken = pickValidToken(refreshToken);

  if (!primaryToken) {
    clearTokens();
    return { accessToken: null, refreshToken: null };
  }

  storage.setItem(AUTH_TOKEN_KEY, primaryToken);
  storage.setItem(ACCESS_TOKEN_KEY, primaryToken);

  if (sanitizedRefreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, sanitizedRefreshToken);
  } else {
    storage.removeItem(REFRESH_TOKEN_KEY);
  }

  return {
    accessToken: primaryToken,
    refreshToken: sanitizedRefreshToken,
  };
};

export const getStoredAccessToken = (): string | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return pickValidToken(
    storage.getItem(AUTH_TOKEN_KEY),
    storage.getItem(ACCESS_TOKEN_KEY),
  );
};

export const getStoredRefreshToken = (): string | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return pickValidToken(storage.getItem(REFRESH_TOKEN_KEY));
};

export const getTokenSnapshot = (): {
  keys: string[];
  authToken: string | null;
  accessToken: string | null;
  refreshToken: string | null;
} => {
  const storage = getStorage();
  if (!storage) {
    return {
      keys: [],
      authToken: null,
      accessToken: null,
      refreshToken: null,
    };
  }

  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) {
      keys.push(key);
    }
  }

  return {
    keys,
    authToken: storage.getItem(AUTH_TOKEN_KEY),
    accessToken: storage.getItem(ACCESS_TOKEN_KEY),
    refreshToken: storage.getItem(REFRESH_TOKEN_KEY),
  };
};

export { AUTH_TOKEN_KEY, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY };
