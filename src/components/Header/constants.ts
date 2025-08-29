export const USER_AVATARS = {
  fan: "https://images.unsplash.com/photo-1494790108755-2616b612b898?w=32&h=32&fit=crop&crop=face",
  artist: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
  admin: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
} as const;

export const NAVIGATION_ITEMS = [
  { id: 'artists', label: '아티스트' },
  { id: 'community', label: '커뮤니티' },
  { id: 'live', label: '라이브' },
  { id: 'projects', label: '펀딩 프로젝트' },
  { id: 'events', label: '이벤트' },
  { id: 'gallery', label: '갤러리' }
] as const;

export const SPECIAL_PAGES = [
  'home', 'dashboard', 'mypage', 'community-full', 
  'artist-profile', 'gallery', 'admin', 'login', 'signup'
] as const;