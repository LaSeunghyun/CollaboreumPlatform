// MyPage 컴포넌트에서 사용하는 타입 정의

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  createdAt: string;
  points?: {
    available: number;
    total: number;
    pending: number;
  };
  notificationSettings?: {
    funding: boolean;
    artist: boolean;
    points: boolean;
  };
}

export interface Backing {
  id: string;
  amount: number;
  returnedAmount?: number;
  status: 'completed' | 'failed' | 'ongoing';
  createdAt: string;
  project?: {
    title: string;
    artist?: {
      name: string;
    };
  };
}

export interface BackingsResponse {
  data: {
    totalInvested: number;
    totalReturned: number;
    totalProjects: number;
    backings: Backing[];
  };
}

export interface Artist {
  id: string;
  name: string;
  avatar?: string;
  category?: string;
}

export interface FollowingResponse {
  data: Artist[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'funding' | 'revenue' | 'artist';
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

export interface EditData {
  name: string;
  username: string;
  email: string;
  bio: string;
}
