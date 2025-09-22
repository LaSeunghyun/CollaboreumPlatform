import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FanMyPage from '../FanMyPage';
import { userProfileAPI } from '../../services/api/user';
import { useAuth } from '../../contexts/AuthContext';

type UserProfileAPI = typeof userProfileAPI;

jest.mock('../../services/api', () => ({
  userProfileAPI: {
    getUserProfile: jest.fn(),
    getUserBackings: jest.fn(),
  },
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGetUserProfile = userProfileAPI.getUserProfile as jest.MockedFunction<
  UserProfileAPI['getUserProfile']
>;
const mockGetUserBackings =
  userProfileAPI.getUserBackings as jest.MockedFunction<
    UserProfileAPI['getUserBackings']
  >;

const renderComponent = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <FanMyPage />
    </QueryClientProvider>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({
    user: {
      id: 'user-1',
      name: '테스트 팬',
      email: 'fan@example.com',
      role: 'fan',
    },
    token: 'token',
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    updateUser: jest.fn(),
  } as any);
});

describe('FanMyPage', () => {
  it('renders profile and backings from the API', async () => {
    mockGetUserProfile.mockResolvedValue({
      data: {
        id: 'user-1',
        name: '테스트 팬',
        email: 'fan@example.com',
        bio: '팬 소개입니다.',
        totalPledges: 3,
        totalAmount: 150000,
        followingCount: 2,
        following: [{ id: 'artist-1', name: '아티스트 A', followers: 1234 }],
      },
    } as any);

    mockGetUserBackings.mockResolvedValue({
      data: [
        {
          id: 'pledge-1',
          projectId: 'project-1',
          projectTitle: '새로운 앨범 프로젝트',
          artistName: '김아티스트',
          amount: 50000,
          status: 'completed',
          pledgeDate: new Date().toISOString(),
          rewardTitle: '디지털 앨범',
        },
      ],
    } as any);

    renderComponent();

    await waitFor(() => {
      expect(mockGetUserProfile).toHaveBeenCalledWith('user-1');
      expect(mockGetUserBackings).toHaveBeenCalledWith('user-1', { limit: 20 });
    });

    expect(await screen.findByText('테스트 팬')).toBeInTheDocument();
    expect(screen.getByText('fan@example.com')).toBeInTheDocument();
    expect(screen.getByText('₩150,000')).toBeInTheDocument();
    expect(
      screen.getByText(
        (content, element) =>
          element?.textContent === '3' && element.tagName === 'DIV',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('팔로잉')).toBeInTheDocument();
    expect(await screen.findByText('새로운 앨범 프로젝트')).toBeInTheDocument();
    expect(screen.getByText(/디지털 앨범/)).toBeInTheDocument();
  });
});
