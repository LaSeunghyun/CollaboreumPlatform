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
import { authAPI } from '../services/api/auth';
import type { UserRole } from '@/shared/types';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
    const initializeAuth = async () => {
      try {
        cleanInvalidTokens();

        const storedToken = getStoredAccessToken();
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          const isValid = await validateToken(storedToken);

          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            logout();
          }
        } else if (!storedToken) {
          logout();
        }
      } catch (error) {
        console.error('토큰 복원 중 오류:', error);
        // 오류 발생 시 저장된 데이터 제거
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      // cleanup function
    };
  }, [logout]);

  // 토큰 유효성 검증 함수
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = (await authAPI.verify()) as any;
      return response.success;
    } catch (error) {
      return false;
    }
  };

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
            const isValid = await validateToken(token);
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
  }, [token, logout]);

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
