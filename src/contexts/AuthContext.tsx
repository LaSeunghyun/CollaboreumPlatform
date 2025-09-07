import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 로컬 스토리지에서 토큰과 사용자 정보 복원
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');

        if (storedToken && storedUser) {
          // 토큰 유효성 검증
          const isValid = await validateToken(storedToken);

          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // 유효하지 않은 토큰 제거
            localStorage.removeItem('authToken');
            localStorage.removeItem('authUser');
          }
        }
      } catch (error) {
        console.error('토큰 복원 중 오류:', error);
        // 오류 발생 시 저장된 데이터 제거
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // 토큰 유효성 검증 함수
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL ||
        (window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://collaboreumplatform-production.up.railway.app/api');
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // 로그인 함수
  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);

    // 로컬 스토리지에 저장
    localStorage.setItem('authToken', newToken);
    localStorage.setItem('authUser', JSON.stringify(newUser));


  };

  // 로그아웃 함수
  const logout = () => {
    setToken(null);
    setUser(null);

    // 로컬 스토리지에서 제거
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');


  };

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
      const tokenRefreshInterval = setInterval(async () => {
        try {
          const isValid = await validateToken(token);
          if (!isValid) {
            logout();
          }
        } catch (error) {
          // 토큰 자동 검증 오류
        }
      }, 60 * 60 * 1000); // 1시간마다 검증

      return () => clearInterval(tokenRefreshInterval);
    }
  }, [token]);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 상태 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
