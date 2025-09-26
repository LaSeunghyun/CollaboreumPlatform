const { Prisma } = require('@prisma/client');

const mapEnum = enumObject => ({ ...enumObject });

// 시스템 전체에서 사용되는 enum 값들을 중앙 집중식으로 관리
const ENUMS = {
  // 사용자 역할
  USER_ROLES: mapEnum(Prisma.UserRole),

  // 아티스트 카테고리
  ARTIST_CATEGORIES: mapEnum(Prisma.ArtistCategory),

  // 아티스트 장르 (음악)
  ARTIST_GENRES: mapEnum(Prisma.ArtistGenre),

  // 프로젝트 카테고리
  PROJECT_CATEGORIES: mapEnum(Prisma.ProjectCategory),

  // 프로젝트 상태
  PROJECT_STATUSES: mapEnum(Prisma.ProjectStatus),

  // 태스크 상태
  TASK_STATUSES: mapEnum(Prisma.ProjectTaskStatus),

  // 이벤트 카테고리
  EVENT_CATEGORIES: mapEnum(Prisma.EventCategory),

  // 이벤트 상태
  EVENT_STATUSES: mapEnum(Prisma.EventStatus),

  // 라이브스트림 카테고리
  LIVESTREAM_CATEGORIES: mapEnum(Prisma.LiveStreamCategory),

  // 라이브스트림 상태
  LIVESTREAM_STATUSES: mapEnum(Prisma.LiveStreamStatus),

  // 펀딩 프로젝트 상태
  FUNDING_PROJECT_STATUSES: mapEnum(Prisma.FundingProjectStatus),

  // 수익 분배 상태 (펀딩 프로젝트 내부 분배용)
  DISTRIBUTION_STATUSES: mapEnum(Prisma.FundingDistributionStatus),

  // 수익 분배 엔티티 상태
  REVENUE_DISTRIBUTION_STATUSES: mapEnum(Prisma.DistributionStatus),

  // 비용 카테고리
  EXPENSE_CATEGORIES: mapEnum(Prisma.FundingExpenseCategory),

  // 트랙 장르
  TRACK_GENRES: mapEnum(Prisma.TrackGenre),

  // 음악 키
  MUSIC_KEYS: Object.values(Prisma.MusicKey),

  // 음악 분위기
  MUSIC_MOODS: mapEnum(Prisma.MusicMood),

  // 라이센스
  LICENSES: mapEnum(Prisma.LicenseType),

  // 아트워크 타입
  ARTWORK_TYPES: mapEnum(Prisma.ArtworkType),

  // 아트워크 상태
  ARTWORK_STATUSES: mapEnum(Prisma.ArtworkStatus),

  // 이벤트 티켓 타입
  EVENT_TICKET_TYPES: mapEnum(Prisma.EventTicketType),

  // 마일스톤 상태
  MILESTONE_STATUSES: mapEnum(Prisma.ProjectMilestoneStatus),

  // 우선순위
  PRIORITIES: mapEnum(Prisma.PriorityLevel),

  // 펀딩 프로젝트 타입
  FUNDING_PROJECT_TYPES: mapEnum(Prisma.FundingProjectType),
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
