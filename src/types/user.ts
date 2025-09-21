// 사용자 관련 타입 정의

export interface User {
  id: string; // number에서 string으로 변경
  name: string;
  username: string;
  email: string;
  userType: 'artist' | 'fan' | 'admin';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artist extends User {
  userType: 'artist';
  category: string;
  genre?: string;
  followers: number;
  following: number;
  projects: number;
  artworks: number;
  tags?: string[];
  coverImage?: string;
  featured?: boolean;
  // 추가 필드들
  profileImage?: string;
  location?: string;
  rating?: number;
  completedProjects?: number;
  activeProjects?: number;
  totalEarned?: number;
  totalStreams?: number;
  monthlyListeners?: number;
  achievements?: Array<{
    title: string;
    description: string;
    date: Date;
    image?: string;
  }>;
  verificationDate?: Date;
  featuredDate?: Date;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
    spotify?: string;
  };
  isVerified: boolean;
  isFeatured: boolean;
}

export interface Fan extends User {
  userType: 'fan';
  followingArtists: number;
  totalInvestments: number;
  points: number;
  preferences?: {
    categories: string[];
    genres: string[];
    notifications: boolean;
  };
}

export interface Admin extends User {
  userType: 'admin';
  permissions: string[];
  role: 'super_admin' | 'admin' | 'moderator';
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// 회원가입 요청 타입
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  userType: 'artist' | 'fan';
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing?: boolean;
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

// 로그인 응답 타입
export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// 프로필 업데이트 타입
export interface ProfileUpdateRequest {
  name?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: Record<string, string>;
  preferences?: Record<string, any>;
}

// 이메일 중복 검사 응답 타입
export interface EmailCheckResponse {
  success: boolean;
  isDuplicate: boolean;
  message?: string;
}

// 커뮤니티 포스트 응답 타입
export interface CommunityPostResponse {
  id: string;
  title: string;
  content: string;
  author: string;
  authorName: string;
  category: string;
  tags: string[];
  likes: string[];
  dislikes: string[];
  views: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  pagination?: {
    totalPosts: number;
    currentPage: number;
    totalPages: number;
  };
}
