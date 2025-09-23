import { render, screen } from '@/test-utils/testUtils';
import { HomePage } from '../HomePage';

type PopularArtistResponse = {
  data: Array<{
    id: string;
    name: string;
    avatar: string;
    category: string;
    tags: string[];
    followers: number;
  }>;
};

type PopularProjectsResponse = {
  data: {
    projects: Array<{
      id: string;
      title: string;
      artist: string;
      category: string;
      thumbnail: string;
      currentAmount: number;
      targetAmount: number;
      backers: number;
      daysLeft: number;
    }>;
  };
};

jest.mock('@/hooks/useAuthRedirect', () => ({
  useAuthRedirect: () => ({
    requireAuth: (callback: () => void) => callback(),
  }),
}));

jest.mock('@/lib/api/useArtists', () => ({
  usePopularArtists: (): {
    data: PopularArtistResponse;
    isLoading: boolean;
    error: null;
  } => ({
    data: {
      data: [
        {
          id: 'artist-1',
          name: '루나',
          avatar: '/images/luna.png',
          category: '일러스트',
          tags: ['디지털'],
          followers: 2048,
        },
      ],
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/lib/api/useProjects', () => ({
  useProjects: (): {
    data: PopularProjectsResponse;
    isLoading: boolean;
    error: null;
  } => ({
    data: {
      data: {
        projects: [
          {
            id: 'project-1',
            title: '빛의 서사',
            artist: '루나',
            category: '일러스트',
            thumbnail: '/images/project.png',
            currentAmount: 750000,
            targetAmount: 1000000,
            backers: 320,
            daysLeft: 12,
          },
        ],
      },
    },
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/lib/api/useNotices', () => ({
  useNotices: () => ({ data: [], isLoading: false, error: null }),
}));

jest.mock('@/lib/api/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}));

jest.mock('@/features/community/hooks/useCommunityPosts', () => ({
  useCommunityPosts: () => ({ data: [], isLoading: false, error: null }),
}));

jest.mock('@/api', () => ({
  statsAPI: {
    getPlatformStats: jest.fn().mockResolvedValue({
      data: {
        totalArtists: 1200,
        totalProjects: 340,
        totalFunding: 480000000,
        totalUsers: 56000,
      },
    }),
  },
}));

describe('HomePage integration', () => {
  it('renders popular artists and projects from API responses', async () => {
    render(<HomePage />);

    const artistNames = await screen.findAllByText('루나');
    expect(artistNames.length).toBeGreaterThan(0);

    expect(await screen.findByText('빛의 서사')).toBeInTheDocument();
    expect(
      screen.queryByText('아직 등록된 아티스트가 없습니다'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('아직 진행 중인 프로젝트가 없습니다'),
    ).not.toBeInTheDocument();
  });
});
