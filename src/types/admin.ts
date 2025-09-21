export interface Inquiry {
  id: string;
  subject: string;
  artist: string;
  artistAvatar?: string;
  category: string;
  priority: '높음' | '중간' | '낮음';
  status: '대기' | '진행중' | '완료';
  assignedTo?: string;
  date: string;
}

export interface MatchingRequest {
  id: string;
  requestType: string;
  requester: string;
  requesterCategory: string;
  description: string;
  preferredCategory: string;
  budget: string;
  timeline: string;
  status: '대기' | '진행중' | '완료';
  applications: number;
  date: string;
}

export interface FinancialData {
  month: string;
  totalRevenue: number;
  platformFee: number;
  artistPayouts: number;
  investorReturns: number;
  pendingPayments: number;
}

export interface ArtworkCategory {
  id: string;
  label: string;
  icon: string;
}

export interface Artwork {
  id: number;
  title: string;
  artist: string;
  artistAvatar?: string;
  category: string;
  medium: string;
  dimensions: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  uploadDate: string;
  description: string;
  imageUrl?: string;
  tags: string[];
  views: number;
  likes: number;
}

export interface AdminDashboardProps {
  onBack?: () => void;
}

export interface NewArtwork {
  title: string;
  artist: string;
  category: string;
  medium: string;
  dimensions: string;
  price: number;
  description: string;
  tags: string;
  imageUrl: string;
}

export interface RealTimeAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  autoClose?: number;
}
