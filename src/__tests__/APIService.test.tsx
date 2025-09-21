import { userAPI, fundingAPI, communityAPI } from '../services/api';

// Mock fetch
global.fetch = jest.fn();

describe('API 서비스 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('1. 사용자 API 테스트', () => {
    test('getProfile이 올바르게 작동해야 한다', async () => {
      const mockUser = {
        id: 'user-1',
        name: '테스트 사용자',
        email: 'test@example.com',
        role: 'fan',
        avatar: '/avatar.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockUser }),
      });

      const result = (await userAPI.getUserProfile('user-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/profile'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    test('getInvestmentHistory가 올바르게 작동해야 한다', async () => {
      const mockInvestments = [
        {
          id: 'inv-1',
          projectId: 'proj-1',
          amount: 100000,
          date: '2024-01-01',
          status: 'active',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockInvestments }),
      });

      const result = (await userAPI.getInvestments('user-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/investments'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInvestments);
    });

    test('getFollowingArtists가 올바르게 작동해야 한다', async () => {
      const mockArtists = [
        {
          id: 'artist-1',
          name: '아티스트 1',
          category: '음악',
          avatar: '/artist1.jpg',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockArtists }),
      });

      const result = (await userAPI.getFollowingArtists('user-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/following'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockArtists);
    });

    test('getPoints가 올바르게 작동해야 한다', async () => {
      const mockPoints = {
        totalPoints: 1000,
        availablePoints: 800,
        pendingPoints: 200,
        monthlyEarnings: 50000,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockPoints }),
      });

      const result = (await userAPI.getPoints('user-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/points'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPoints);
    });

    test('getArtists가 올바르게 작동해야 한다', async () => {
      const mockArtists = [
        {
          id: 'artist-1',
          name: '아티스트 1',
          category: '음악',
          followers: 100,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockArtists }),
      });

      const result = (await userAPI.getFollowingArtists('user-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/users/artists'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockArtists);
    });
  });

  describe('2. 프로젝트 API 테스트', () => {
    test('getArtistProjects가 올바르게 작동해야 한다', async () => {
      const mockProjects = [
        {
          id: 1,
          title: '테스트 프로젝트',
          status: '진행중',
          currentAmount: 2500000,
          targetAmount: 5000000,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockProjects }),
      });

      const result = (await fundingAPI.getProjects({
        artistId: 'artist-1',
      })) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/projects/artist'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProjects);
    });

    test('getProjectDetail이 올바르게 작동해야 한다', async () => {
      const mockProject = {
        id: 1,
        title: '테스트 프로젝트',
        description: '프로젝트 설명',
        status: '진행중',
        currentAmount: 2500000,
        targetAmount: 5000000,
        backers: 50,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockProject }),
      });

      const result = await fundingAPI.getProject('1');

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          title: mockProject.title,
          description: mockProject.description,
          currentAmount: mockProject.currentAmount,
          targetAmount: mockProject.targetAmount,
          backers: mockProject.backers,
        }),
      );
    });
  });

  describe('3. 커뮤니티 API 테스트', () => {
    test('getCategories가 올바르게 작동해야 한다', async () => {
      const mockCategories = [
        { id: 1, label: '음악' },
        { id: 2, label: '미술' },
        { id: 3, label: '문학' },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockCategories }),
      });

      const result = (await communityAPI.getCategories()) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/categories'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCategories);
    });

    test('getPosts가 올바르게 작동해야 한다', async () => {
      const mockPosts = [
        {
          id: 1,
          title: '테스트 게시물',
          content: '게시물 내용',
          author: '아티스트 1',
          category: '음악',
          likes: 10,
          comments: 5,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockPosts }),
      });

      const result = (await communityAPI.getForumPosts()) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/community/posts'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPosts);
    });

    test('getArtistStats가 올바르게 작동해야 한다', async () => {
      const mockStats = {
        totalPosts: 25,
        totalLikes: 150,
        totalComments: 75,
        monthlyGrowth: 12,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockStats }),
      });

      const result = (await communityAPI.getForumPosts('artist-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/community/stats'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
    });

    test('getRecentActivities가 올바르게 작동해야 한다', async () => {
      const mockActivities = [
        {
          type: 'post',
          message: '새로운 게시물을 작성했습니다',
          time: '2시간 전',
        },
        {
          type: 'comment',
          message: '댓글을 남겼습니다',
          time: '5시간 전',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockActivities }),
      });

      const result = (await communityAPI.getForumPosts('artist-1')) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/community/activities'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockActivities);
    });

    test('getEvents가 올바르게 작동해야 한다', async () => {
      const mockEvents = {
        events: [
          {
            id: 1,
            title: '테스트 이벤트',
            description: '이벤트 설명',
            date: '2024-02-01',
            time: '19:00',
            location: '서울',
            category: '음악',
            price: '무료',
            attendees: 50,
            organizer: '아티스트 1',
            image: '/event-image.jpg',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockEvents }),
      });

      const result = (await communityAPI.getEvents()) as any;

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events'),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockEvents);
    });
  });

  describe('4. API 에러 처리 테스트', () => {
    test('네트워크 에러 시 적절한 에러 처리가 되어야 한다', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network Error'),
      );

      const result = (await userAPI.getUserProfile('user-1')) as any;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network Error');
    });

    test('HTTP 에러 시 적절한 에러 처리가 되어야 한다', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'User not found' }),
      });

      const result = (await userAPI.getUserProfile('user-1')) as any;

      expect(result.success).toBe(false);
      expect(result.error).toContain('User not found');
    });

    test('JSON 파싱 에러 시 적절한 에러 처리가 되어야 한다', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      const result = (await userAPI.getUserProfile('user-1')) as any;

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid JSON');
    });
  });

  describe('5. API 인증 테스트', () => {
    test('인증 토큰이 올바르게 포함되어야 한다', async () => {
      // Mock localStorage
      const mockToken = 'mock-auth-token';
      localStorage.setItem('authToken', mockToken);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await userAPI.getUserProfile('user-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockToken}`,
          }),
        }),
      );
    });

    test('토큰이 없을 때 기본 헤더만 포함되어야 한다', async () => {
      localStorage.removeItem('authToken');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      });

      await userAPI.getUserProfile('user-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        }),
      );
    });
  });

  describe('6. API 요청 파라미터 테스트', () => {
    test('쿼리 파라미터가 올바르게 포함되어야 한다', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      });

      await communityAPI.getForumPosts('음악', { page: 1, limit: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&limit=10&category=음악'),
        expect.any(Object),
      );
    });

    test('POST 요청 시 body가 올바르게 포함되어야 한다', async () => {
      const postData = {
        title: '새 게시물',
        content: '게시물 내용',
        category: '음악',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1, ...postData } }),
      });

      await communityAPI.createPost(postData);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/community/posts'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        }),
      );
    });
  });

  describe('7. API 응답 캐싱 테스트', () => {
    test('동일한 요청에 대해 캐시가 작동해야 한다', async () => {
      const mockData = { id: 1, name: '테스트' };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: mockData }),
      });

      // 첫 번째 요청
      const result1 = (await userAPI.getUserProfile('user-1')) as any;

      // 두 번째 요청 (캐시에서 가져와야 함)
      const result2 = (await userAPI.getUserProfile('user-1')) as any;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.data).toEqual(result2.data);

      // fetch는 한 번만 호출되어야 함 (캐시 사용)
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('8. API 타임아웃 테스트', () => {
    test('요청 타임아웃이 올바르게 처리되어야 한다', async () => {
      // Mock slow response
      (global.fetch as jest.Mock).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true, data: {} }),
            });
          }, 10000); // 10초 지연
        });
      });

      const result = (await userAPI.getUserProfile('user-1')) as any;

      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });
  });
});
