import { getEnvVar, isLocalEnvironment } from '@/lib/config/env';

// Feature Flags 시스템
// 환경 변수 기반으로 기능 활성화/비활성화 관리

interface FeatureFlags {
  // 커뮤니티 기능
  community: {
    board: boolean;
    posts: boolean;
    comments: boolean;
  };

  // 펀딩 기능
  funding: {
    projects: boolean;
    payments: boolean;
    rewards: boolean;
  };

  // 이벤트 기능
  events: {
    management: boolean;
    registration: boolean;
    liveStreaming: boolean;
  };

  // 아티스트 기능
  artists: {
    profiles: boolean;
    galleries: boolean;
    collaboration: boolean;
  };

  // 관리자 기능
  admin: {
    dashboard: boolean;
    userManagement: boolean;
    contentModeration: boolean;
  };

  // 실험적 기능
  experimental: {
    aiRecommendations: boolean;
    advancedAnalytics: boolean;
    betaFeatures: boolean;
  };
}

// 환경 변수에서 Feature Flag 값 읽기
const getEnvFlag = (key: string, defaultValue: boolean = false): boolean => {
  const normalizedKey = key.toUpperCase();
  const value =
    getEnvVar(`VITE_FEATURE_${normalizedKey}`) ??
    getEnvVar(`REACT_APP_FEATURE_${normalizedKey}`);
  if (value === undefined) return defaultValue;
  return value === 'true' || value === '1';
};

// Feature Flags 정의
export const featureFlags: FeatureFlags = {
  community: {
    board: getEnvFlag('COMMUNITY_BOARD', true),
    posts: getEnvFlag('COMMUNITY_POSTS', true),
    comments: getEnvFlag('COMMUNITY_COMMENTS', true),
  },

  funding: {
    projects: getEnvFlag('FUNDING_PROJECTS', true),
    payments: getEnvFlag('FUNDING_PAYMENTS', false), // 결제 기능은 개발 중
    rewards: getEnvFlag('FUNDING_REWARDS', true),
  },

  events: {
    management: getEnvFlag('EVENTS_MANAGEMENT', true),
    registration: getEnvFlag('EVENTS_REGISTRATION', true),
    liveStreaming: getEnvFlag('EVENTS_LIVE_STREAMING', false), // 라이브 스트리밍은 개발 중
  },

  artists: {
    profiles: getEnvFlag('ARTISTS_PROFILES', true),
    galleries: getEnvFlag('ARTISTS_GALLERIES', true),
    collaboration: getEnvFlag('ARTISTS_COLLABORATION', false), // 협업 기능은 개발 중
  },

  admin: {
    dashboard: getEnvFlag('ADMIN_DASHBOARD', true),
    userManagement: getEnvFlag('ADMIN_USER_MANAGEMENT', true),
    contentModeration: getEnvFlag('ADMIN_CONTENT_MODERATION', false), // 콘텐츠 관리자는 개발 중
  },

  experimental: {
    aiRecommendations: getEnvFlag('EXPERIMENTAL_AI_RECOMMENDATIONS', false),
    advancedAnalytics: getEnvFlag('EXPERIMENTAL_ADVANCED_ANALYTICS', false),
    betaFeatures: getEnvFlag('EXPERIMENTAL_BETA_FEATURES', false),
  },
};

// Feature Flag 체크 헬퍼 함수들
export const isFeatureEnabled = (path: string): boolean => {
  const keys = path.split('.');
  let current: unknown = featureFlags;

  for (const key of keys) {
    if (
      current &&
      typeof current === 'object' &&
      current !== null &&
      key in current
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return false;
    }
  }

  return Boolean(current);
};

// 특정 기능 체크 함수들
export const isCommunityBoardEnabled = () =>
  isFeatureEnabled('community.board');
export const isFundingPaymentsEnabled = () =>
  isFeatureEnabled('funding.payments');
export const isEventsLiveStreamingEnabled = () =>
  isFeatureEnabled('events.liveStreaming');
export const isArtistsCollaborationEnabled = () =>
  isFeatureEnabled('artists.collaboration');
export const isAdminContentModerationEnabled = () =>
  isFeatureEnabled('admin.contentModeration');
export const isExperimentalAIEnabled = () =>
  isFeatureEnabled('experimental.aiRecommendations');

// 개발 환경에서 모든 기능 활성화
if (isLocalEnvironment()) {
  // 개발 환경에서는 모든 기능을 활성화 (필요시 개별 비활성화 가능)
  Object.keys(featureFlags).forEach(category => {
    Object.keys(featureFlags[category as keyof FeatureFlags]).forEach(
      feature => {
        const path =
          `${category}.${feature}` as keyof FeatureFlags[keyof FeatureFlags];
        if (
          typeof featureFlags[category as keyof FeatureFlags][
            path as keyof (typeof featureFlags)[keyof FeatureFlags]
          ] === 'boolean'
        ) {
          (
            featureFlags[category as keyof FeatureFlags] as Record<
              string,
              boolean
            >
          )[path] = true;
        }
      },
    );
  });
}
