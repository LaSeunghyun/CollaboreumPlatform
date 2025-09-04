export type UserRole = 'fan' | 'artist' | 'admin';

export interface SignupData {
  email: string;
  password: string;
  name: string;
  userType: 'artist' | 'fan';
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
  };
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('로그인에 실패했습니다');
  }

  return response.json();
};

export const signup = async (data: SignupData): Promise<LoginResponse> => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('회원가입에 실패했습니다');
  }

  return response.json();
};

export const logout = async (): Promise<void> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('로그아웃에 실패했습니다');
  }
};

// 현재 로그인한 사용자 ID 가져오기
export const getCurrentUserId = (): string | null => {
  try {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || null;
    }
    return null;
  } catch (error) {
    console.error('사용자 ID 파싱 실패:', error);
    return null;
  }
};

// 현재 로그인한 사용자 정보 가져오기
export const getCurrentUser = (): any | null => {
  try {
    const userStr = localStorage.getItem('authUser');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('사용자 정보 파싱 실패:', error);
    return null;
  }
};

// 사용자 인증 상태 확인
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken');
  const user = getCurrentUser();
  return !!(token && user);
};

// 사용자 역할 확인
export const getUserRole = (): string | null => {
  const user = getCurrentUser();
  return user?.role || null;
};

