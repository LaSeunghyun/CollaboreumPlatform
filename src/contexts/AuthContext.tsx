import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  clearTokens,
  cleanInvalidTokens,
  getStoredAccessToken,
  persistTokens,
} from '@/features/auth/services/tokenStorage';
import { authAPI } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'fan' | 'artist' | 'admin';
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const parseRole = (value: unknown): User['role'] => {
  if (value === 'artist' || value === 'admin' || value === 'fan') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'artist' || normalized === 'admin') {
      return normalized as User['role'];
    }
  }

  return 'fan';
};

const pickFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const normalizeUserCandidate = (
  candidate: Record<string, unknown>,
): User | null => {
  const idSource =
    candidate.id ??
    candidate._id ??
    candidate.userId ??
    candidate.user_id ??
    candidate.uuid ??
    candidate.sub;
  const emailSource =
    candidate.email ??
    candidate.mail ??
    candidate.userEmail ??
    candidate.user_email ??
    candidate.username;

  if (
    (typeof idSource !== 'string' && typeof idSource !== 'number') ||
    typeof emailSource !== 'string'
  ) {
    return null;
  }

  const nameSource = pickFirstString(
    candidate.name,
    candidate.displayName,
    candidate.nickname,
    candidate.username,
    candidate.fullName,
    candidate.handle,
  );
  const avatarSource = pickFirstString(
    candidate.avatar,
    candidate.profileImage,
    candidate.profile_image,
    candidate.photoURL,
    candidate.photoUrl,
    candidate.picture,
  );
  const bioSource = pickFirstString(
    candidate.bio,
    candidate.introduction,
    candidate.about,
    candidate.description,
  );
  const createdAtSource = pickFirstString(
    candidate.createdAt,
    candidate.created_at,
  );
  const updatedAtSource = pickFirstString(
    candidate.updatedAt,
    candidate.updated_at,
  );
  const verificationSource =
    candidate.isVerified ?? candidate.emailVerified ?? candidate.verified;

  return {
    id: String(idSource),
    email: String(emailSource),
    name: nameSource ?? '',
    role: parseRole(
      candidate.role ?? candidate.userRole ?? candidate.type ?? candidate.roleType,
    ),
    avatar: avatarSource,
    bio: bioSource,
    isVerified:
      typeof verificationSource === 'boolean'
        ? verificationSource
        : undefined,
    createdAt: createdAtSource,
    updatedAt: updatedAtSource,
  };
};

const resolveUserFromVerificationPayload = (payload: unknown): User | null => {
  if (!payload) {
    return null;
  }

  const visited = new Set<unknown>();
  const queue: unknown[] = Array.isArray(payload) ? [...payload] : [payload];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') {
      continue;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    const candidate = normalizeUserCandidate(current as Record<string, unknown>);
    if (candidate) {
      return candidate;
    }

    Object.values(current as Record<string, unknown>).forEach(value => {
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (!visited.has(item)) {
              queue.push(item);
            }
          });
        } else if (!visited.has(value)) {
          queue.push(value);
        }
      }
    });
  }

  return null;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);

    clearTokens();
    localStorage.removeItem('authUser');
  }, []);

  // 컴포넌트 마운트 시 로컬 스토리지에서 토큰과 사용자 정보 복원
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        cleanInvalidTokens();

        const storedToken = getStoredAccessToken();
        const storedUserRaw = localStorage.getItem('authUser');

        if (!storedToken) {
          logout();
          return;
        }

        if (!isMounted) {
          return;
        }

        setToken(storedToken);

        if (storedUserRaw) {
          try {
            const parsedUser = JSON.parse(storedUserRaw) as User;
            if (isMounted) {
              setUser(parsedUser);
            }
          } catch (parseError) {
            console.warn(
              '저장된 사용자 정보를 복원하지 못했습니다. 검증 응답을 통해 다시 불러옵니다.',
              parseError,
            );
            localStorage.removeItem('authUser');
          }
        }

        try {
          const verification = (await authAPI.verify()) as any;

          if (!isMounted) {
            return;
          }

          const verificationFailed =
            typeof verification === 'object' &&
            verification !== null &&
            'success' in verification &&
            verification.success === false;

          if (verificationFailed) {
            logout();
            return;
          }

          const resolvedUser = resolveUserFromVerificationPayload(verification);
          if (resolvedUser) {
            setUser(resolvedUser);
            localStorage.setItem('authUser', JSON.stringify(resolvedUser));
          } else if (!storedUserRaw) {
            console.warn(
              '토큰은 확인되었지만 검증 응답에서 사용자 정보를 찾을 수 없습니다.',
            );
          }
        } catch (verificationError) {
          if (!isMounted) {
            return;
          }

          const status =
            (verificationError as { status?: number }).status ??
            (verificationError as { response?: { status?: number } }).response
              ?.status;

          if (status === 401) {
            logout();
            return;
          }

          console.warn(
            '토큰 검증 중 일시적인 문제가 발생했습니다. 기존 세션을 유지합니다.',
            verificationError,
          );
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error('토큰 복원 중 오류:', error);
        logout();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  // 토큰 유효성 검증 함수
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const response = (await authAPI.verify()) as any;

      const verificationFailed =
        typeof response === 'object' &&
        response !== null &&
        'success' in response &&
        response.success === false;

      if (verificationFailed) {
        return false;
      }

      const resolvedUser = resolveUserFromVerificationPayload(response);
      if (resolvedUser) {
        setUser(resolvedUser);
        localStorage.setItem('authUser', JSON.stringify(resolvedUser));
      }

      return true;
    } catch (error) {
      const status =
        (error as { status?: number }).status ??
        (error as { response?: { status?: number } }).response?.status;

      if (status === 401) {
        return false;
      }

      console.warn('토큰 검증 실패 - 기존 세션을 유지합니다.', error);
      return true;
    }
  }, []);

  // 로그인 함수
  const login = (newToken: string, newUser: User) => {
    const storedTokens = persistTokens({
      accessToken: newToken,
      fallbackToken: newToken,
    });

    if (storedTokens.accessToken) {
      setToken(storedTokens.accessToken);
      setUser(newUser);
      localStorage.setItem('authUser', JSON.stringify(newUser));
    } else {
      console.error(
        '로그인 토큰 저장에 실패했습니다. 전달받은 토큰이 유효하지 않습니다.',
      );
      setToken(null);
      setUser(null);
      localStorage.removeItem('authUser');
    }

    // 리다이렉트는 호출하는 쪽에서 처리하도록 변경
  };

  // 로그아웃 함수
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleForcedLogout = () => {
      logout();
    };

    window.addEventListener('auth:logout', handleForcedLogout);

    return () => {
      window.removeEventListener('auth:logout', handleForcedLogout);
    };
  }, [logout]);

  // 사용자 정보 업데이트 함수
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);

      // 로컬 스토리지 업데이트
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    }
  };

  // 토큰 자동 갱신 (24시간마다)
  useEffect(() => {
    if (token) {
      const tokenRefreshInterval = setInterval(
        async () => {
          try {
            const isValid = await validateToken();
            if (!isValid) {
              logout();
            }
          } catch (error) {
            // 토큰 자동 검증 오류
          }
        },
        60 * 60 * 1000,
      ); // 1시간마다 검증

      return () => clearInterval(tokenRefreshInterval);
    }
    return undefined;
  }, [token, logout, validateToken]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    updateUser,
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-background'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
          <p className='text-muted-foreground'>인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
