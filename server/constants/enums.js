// 시스템 전체에서 사용되는 enum 값들을 중앙 집중식으로 관리
const ENUMS = {
  // 사용자 역할
  USER_ROLES: {
    ARTIST: 'artist',
    ADMIN: 'admin',
    FAN: 'fan',
  },

  // 아티스트 카테고리
  ARTIST_CATEGORIES: {
    MUSIC: '음악',
    ART: '미술',
    VIDEO: '영상',
    LITERATURE: '문학',
    CRAFT: '공예',
    DESIGN: '디자인',
    OTHER: '기타',
  },

  // 아티스트 장르 (음악)
  ARTIST_GENRES: {
    POP: '팝',
    ROCK: '록',
    RNB: 'R&B',
    JAZZ: '재즈',
    CLASSICAL: '클래식',
    HIPHOP: '힙합',
    ELECTRONIC: '일렉트로닉',
    INDIE: '인디',
    ALTERNATIVE: '얼터너티브',
    COUNTRY: '컨트리',
    REGGAE: '레게',
    BLUES: '블루스',
    SOUL: '소울',
    PUNK: '펑크',
    METAL: '메탈',
    OTHER: '기타',
  },

  // 프로젝트 카테고리
  PROJECT_CATEGORIES: {
    MUSIC: '음악',
    VIDEO: '비디오',
    PERFORMANCE: '공연',
    BOOK: '도서',
    GAME: '게임',
    OTHER: '기타',
  },

  // 프로젝트 상태
  PROJECT_STATUSES: {
    PLANNING: '계획중',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    PENDING: '보류',
    CANCELLED: '취소',
  },

  // 태스크 상태
  TASK_STATUSES: {
    WAITING: '대기',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    PENDING: '보류',
  },

  // 이벤트 카테고리
  EVENT_CATEGORIES: {
    FESTIVAL: '축제',
    PERFORMANCE: '공연',
    COMPETITION: '경연',
    WORKSHOP: '워크샵',
    SEMINAR: '세미나',
    OTHER: '기타',
  },

  // 이벤트 상태
  EVENT_STATUSES: {
    SCHEDULED: '예정',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소',
  },

  // 라이브스트림 카테고리
  LIVESTREAM_CATEGORIES: {
    MUSIC: '음악',
    PERFORMANCE: '공연',
    TALK: '토크',
    WORKSHOP: '워크샵',
    OTHER: '기타',
  },

  // 라이브스트림 상태
  LIVESTREAM_STATUSES: {
    SCHEDULED: '예정',
    LIVE: '라이브',
    ENDED: '종료',
    CANCELLED: '취소',
  },

  // 펀딩 프로젝트 상태
  FUNDING_PROJECT_STATUSES: {
    PREPARING: '준비중',
    IN_PROGRESS: '진행중',
    SUCCESS: '성공',
    FAILED: '실패',
    CANCELLED: '취소',
    EXECUTING: '집행중',
    COMPLETED: '완료',
  },

  // 수익 분배 상태
  DISTRIBUTION_STATUSES: {
    WAITING: '대기',
    DISTRIBUTED: '분배완료',
    PAID: '지급완료',
  },

  // 비용 카테고리
  EXPENSE_CATEGORIES: {
    LABOR: '인건비',
    MATERIAL: '재료비',
    EQUIPMENT: '장비비',
    MARKETING: '마케팅비',
    OTHER: '기타',
  },

  // 트랙 장르
  TRACK_GENRES: {
    INDIE_POP: '인디팝',
    ROCK: '록',
    ACOUSTIC: '어쿠스틱',
    JAZZ: '재즈',
    CLASSICAL: '클래식',
    ELECTRONIC: '일렉트로닉',
    HIPHOP: '힙합',
    RNB: 'R&B',
    OTHER: '기타',
  },

  // 음악 키
  MUSIC_KEYS: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

  // 음악 분위기
  MUSIC_MOODS: {
    EXCITING: '신나는',
    EMOTIONAL: '감성적인',
    CALM: '잔잔한',
    INTENSE: '강렬한',
    MELANCHOLY: '우울한',
    HOPEFUL: '희망적인',
    ROMANTIC: '로맨틱한',
    MYSTERIOUS: '신비로운',
  },

  // 라이센스
  LICENSES: {
    ALL_RIGHTS_RESERVED: 'All Rights Reserved',
    CREATIVE_COMMONS: 'Creative Commons',
    PUBLIC_DOMAIN: 'Public Domain',
  },

  // 아트워크 타입
  ARTWORK_TYPES: {
    AUDIO: 'audio',
    IMAGE: 'image',
    VIDEO: 'video',
    TEXT: 'text',
  },

  // 아트워크 상태
  ARTWORK_STATUSES: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },

  // 이벤트 티켓 타입
  EVENT_TICKET_TYPES: {
    REGULAR: '일반',
    VIP: 'VIP',
    EARLY_BIRD: '얼리버드',
    STUDENT: '학생',
  },

  // 마일스톤 상태
  MILESTONE_STATUSES: {
    SCHEDULED: '예정',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    DELAYED: '지연',
  },

  // 우선순위
  PRIORITIES: {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    URGENT: '긴급',
  },

  // 펀딩 프로젝트 타입
  FUNDING_PROJECT_TYPES: {
    REGULAR: '일반',
    EXECUTION_IN_PROGRESS: '집행진행',
    EXPENSE_PUBLIC: '비용공개',
    REVENUE_DISTRIBUTION: '수익분배',
  },
};

// CSV 헤더 상수
const CSV_HEADERS = {
  REVENUE_DISTRIBUTION: [
    '후원자',
    '원금',
    '수익 배분',
    '총 반환금',
    '상태',
    '분배일',
  ],
  EXPENSE_RECORDS: [
    '카테고리',
    '제목',
    '설명',
    '금액',
    '날짜',
    '단계',
    '검증상태',
  ],
  PROJECT_PROGRESS: ['단계', '제목', '설명', '진행률', '상태', '완료일'],
};

// 상태별 색상 매핑
const STATUS_COLORS = {
  [ENUMS.DISTRIBUTION_STATUSES.WAITING]: 'bg-gray-100 text-gray-800',
  [ENUMS.DISTRIBUTION_STATUSES.DISTRIBUTED]: 'bg-blue-100 text-blue-800',
  [ENUMS.DISTRIBUTION_STATUSES.PAID]: 'bg-green-100 text-green-800',

  [ENUMS.PROJECT_STATUSES.PLANNING]: 'bg-yellow-100 text-yellow-800',
  [ENUMS.PROJECT_STATUSES.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ENUMS.PROJECT_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [ENUMS.PROJECT_STATUSES.PENDING]: 'bg-orange-100 text-orange-800',
  [ENUMS.PROJECT_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',

  [ENUMS.EVENT_STATUSES.SCHEDULED]: 'bg-blue-100 text-blue-800',
  [ENUMS.EVENT_STATUSES.IN_PROGRESS]: 'bg-green-100 text-green-800',
  [ENUMS.EVENT_STATUSES.COMPLETED]: 'bg-gray-100 text-gray-800',
  [ENUMS.EVENT_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
};

// 상태별 아이콘 매핑 (Lucide 아이콘명)
const STATUS_ICONS = {
  [ENUMS.DISTRIBUTION_STATUSES.WAITING]: 'Clock',
  [ENUMS.DISTRIBUTION_STATUSES.DISTRIBUTED]: 'CheckCircle',
  [ENUMS.DISTRIBUTION_STATUSES.PAID]: 'CheckCircle',

  [ENUMS.PROJECT_STATUSES.PLANNING]: 'Calendar',
  [ENUMS.PROJECT_STATUSES.IN_PROGRESS]: 'PlayCircle',
  [ENUMS.PROJECT_STATUSES.COMPLETED]: 'CheckCircle',
  [ENUMS.PROJECT_STATUSES.PENDING]: 'Clock',
  [ENUMS.PROJECT_STATUSES.CANCELLED]: 'XCircle',

  [ENUMS.EVENT_STATUSES.SCHEDULED]: 'Calendar',
  [ENUMS.EVENT_STATUSES.IN_PROGRESS]: 'PlayCircle',
  [ENUMS.EVENT_STATUSES.COMPLETED]: 'CheckCircle',
  [ENUMS.EVENT_STATUSES.CANCELLED]: 'XCircle',
};

module.exports = {
  ENUMS,
  CSV_HEADERS,
  STATUS_COLORS,
  STATUS_ICONS,
};
