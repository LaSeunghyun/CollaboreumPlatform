import { rest } from 'msw';

// API 기본 URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 공통 응답 헬퍼
const createSuccessResponse = (data: any) => ({
  success: true,
  data,
  message: 'Success',
});

const createErrorResponse = (message: string, status = 400) => ({
  success: false,
  error: message,
  status,
});

// 사용자 관련 핸들러
export const userHandlers = [
  // 사용자 프로필 조회
  rest.get(`${API_BASE_URL}/users/profile`, (req, res, ctx) => {
    const mockUser = {
      id: 'user-1',
      username: '테스트 사용자',
      email: 'test@example.com',
      role: 'fan',
      avatar: 'https://via.placeholder.com/40',
      bio: '테스트 사용자입니다.',
      joinDate: '2024-01-01',
      location: '서울',
    };

    return res(ctx.json(createSuccessResponse(mockUser)));
  }),

  // 사용자 프로필 업데이트
  rest.put(`${API_BASE_URL}/users/profile`, (req, res, ctx) => {
    const body = req.body as any;
    
    if (!body.username) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('사용자명은 필수입니다.'))
      );
    }

    const updatedUser = {
      id: 'user-1',
      username: body.username,
      email: body.email || 'test@example.com',
      role: 'fan',
      avatar: body.avatar || 'https://via.placeholder.com/40',
      bio: body.bio || '',
      joinDate: '2024-01-01',
      location: body.location || '서울',
    };

    return res(ctx.json(createSuccessResponse(updatedUser)));
  }),

  // 사용자 목록 조회
  rest.get(`${API_BASE_URL}/users`, (req, res, ctx) => {
    const mockUsers = [
      {
        id: 'user-1',
        username: '테스트 사용자 1',
        email: 'user1@example.com',
        role: 'fan',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'user-2',
        username: '테스트 사용자 2',
        email: 'user2@example.com',
        role: 'artist',
        status: 'active',
        createdAt: '2024-01-02T00:00:00Z',
      },
    ];

    return res(ctx.json(createSuccessResponse(mockUsers)));
  }),
];

// 펀딩 관련 핸들러
export const fundingHandlers = [
  // 펀딩 프로젝트 목록 조회
  rest.get(`${API_BASE_URL}/funding/projects`, (req, res, ctx) => {
    const mockProjects = [
      {
        id: 1,
        title: '테스트 펀딩 프로젝트 1',
        description: '테스트 펀딩 프로젝트 설명 1',
        artist: '테스트 아티스트 1',
        category: '음악',
        thumbnail: 'https://via.placeholder.com/400x300',
        currentAmount: 2500000,
        targetAmount: 5000000,
        backers: 25,
        daysLeft: 30,
        endDate: '2024-12-31',
        status: 'active',
        rewards: [
          {
            id: 1,
            title: '기본 리워드',
            description: '기본 리워드 설명',
            amount: 10000,
            estimatedDelivery: '2024-12-31',
          },
        ],
      },
      {
        id: 2,
        title: '테스트 펀딩 프로젝트 2',
        description: '테스트 펀딩 프로젝트 설명 2',
        artist: '테스트 아티스트 2',
        category: '미술',
        thumbnail: 'https://via.placeholder.com/400x300',
        currentAmount: 1500000,
        targetAmount: 3000000,
        backers: 15,
        daysLeft: 45,
        endDate: '2025-01-15',
        status: 'active',
        rewards: [
          {
            id: 2,
            title: '프리미엄 리워드',
            description: '프리미엄 리워드 설명',
            amount: 50000,
            estimatedDelivery: '2025-01-15',
          },
        ],
      },
    ];

    return res(ctx.json(createSuccessResponse(mockProjects)));
  }),

  // 펀딩 프로젝트 상세 조회
  rest.get(`${API_BASE_URL}/funding/projects/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    const mockProject = {
      id: parseInt(id as string),
      title: `테스트 펀딩 프로젝트 ${id}`,
      description: `테스트 펀딩 프로젝트 설명 ${id}`,
      artist: `테스트 아티스트 ${id}`,
      category: '음악',
      thumbnail: 'https://via.placeholder.com/400x300',
      currentAmount: 2500000,
      targetAmount: 5000000,
      backers: 25,
      daysLeft: 30,
      endDate: '2024-12-31',
      status: 'active',
      rewards: [
        {
          id: 1,
          title: '기본 리워드',
          description: '기본 리워드 설명',
          amount: 10000,
          estimatedDelivery: '2024-12-31',
        },
      ],
      budgetBreakdown: [
        {
          category: '제작비',
          amount: 3000000,
          percentage: 60,
        },
        {
          category: '마케팅',
          amount: 1500000,
          percentage: 30,
        },
        {
          category: '기타',
          amount: 500000,
          percentage: 10,
        },
      ],
    };

    return res(ctx.json(createSuccessResponse(mockProject)));
  }),

  // 펀딩 프로젝트 생성
  rest.post(`${API_BASE_URL}/funding/projects`, (req, res, ctx) => {
    const body = req.body as any;
    
    if (!body.title || !body.description) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('제목과 설명은 필수입니다.'))
      );
    }

    const newProject = {
      id: Math.floor(Math.random() * 1000),
      title: body.title,
      description: body.description,
      artist: '테스트 아티스트',
      category: body.category || '음악',
      thumbnail: body.thumbnail || 'https://via.placeholder.com/400x300',
      currentAmount: 0,
      targetAmount: body.targetAmount || 1000000,
      backers: 0,
      daysLeft: 30,
      endDate: body.endDate || '2024-12-31',
      status: 'pending',
      rewards: body.rewards || [],
    };

    return res(ctx.json(createSuccessResponse(newProject)));
  }),

  // 펀딩 프로젝트 후원
  rest.post(`${API_BASE_URL}/funding/projects/:id/back`, (req, res, ctx) => {
    const { id } = req.params;
    const body = req.body as any;
    
    if (!body.amount || body.amount < 1000) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('최소 후원 금액은 1,000원입니다.'))
      );
    }

    const backResult = {
      id: Math.floor(Math.random() * 10000),
      projectId: parseInt(id as string),
      amount: body.amount,
      rewardId: body.rewardId,
      message: body.message || '',
      isAnonymous: body.isAnonymous || false,
      createdAt: new Date().toISOString(),
    };

    return res(ctx.json(createSuccessResponse(backResult)));
  }),
];

// 커뮤니티 관련 핸들러
export const communityHandlers = [
  // 커뮤니티 포스트 목록 조회
  rest.get(`${API_BASE_URL}/community/posts`, (req, res, ctx) => {
    const mockPosts = [
      {
        id: 1,
        title: '테스트 포스트 1',
        content: '테스트 포스트 내용 1',
        author: {
          id: 'user-1',
          username: '테스트 사용자 1',
          avatar: 'https://via.placeholder.com/40',
        },
        category: '일반',
        likes: 10,
        comments: 5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        title: '테스트 포스트 2',
        content: '테스트 포스트 내용 2',
        author: {
          id: 'user-2',
          username: '테스트 사용자 2',
          avatar: 'https://via.placeholder.com/40',
        },
        category: '질문',
        likes: 15,
        comments: 8,
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    return res(ctx.json(createSuccessResponse(mockPosts)));
  }),

  // 커뮤니티 포스트 상세 조회
  rest.get(`${API_BASE_URL}/community/posts/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    const mockPost = {
      id: parseInt(id as string),
      title: `테스트 포스트 ${id}`,
      content: `테스트 포스트 내용 ${id}`,
      author: {
        id: 'user-1',
        username: '테스트 사용자 1',
        avatar: 'https://via.placeholder.com/40',
      },
      category: '일반',
      likes: 10,
      comments: [
        {
          id: 1,
          content: '테스트 댓글 1',
          author: {
            id: 'user-2',
            username: '테스트 사용자 2',
            avatar: 'https://via.placeholder.com/40',
          },
          createdAt: '2024-01-01T01:00:00Z',
        },
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    return res(ctx.json(createSuccessResponse(mockPost)));
  }),

  // 커뮤니티 포스트 생성
  rest.post(`${API_BASE_URL}/community/posts`, (req, res, ctx) => {
    const body = req.body as any;
    
    if (!body.title || !body.content) {
      return res(
        ctx.status(400),
        ctx.json(createErrorResponse('제목과 내용은 필수입니다.'))
      );
    }

    const newPost = {
      id: Math.floor(Math.random() * 1000),
      title: body.title,
      content: body.content,
      author: {
        id: 'user-1',
        username: '테스트 사용자 1',
        avatar: 'https://via.placeholder.com/40',
      },
      category: body.category || '일반',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return res(ctx.json(createSuccessResponse(newPost)));
  }),
];

// 아티스트 관련 핸들러
export const artistHandlers = [
  // 아티스트 목록 조회
  rest.get(`${API_BASE_URL}/artists`, (req, res, ctx) => {
    const mockArtists = [
      {
        id: 'artist-1',
        username: '테스트 아티스트 1',
        email: 'artist1@example.com',
        role: 'artist',
        avatar: 'https://via.placeholder.com/40',
        category: '음악',
        bio: '테스트 아티스트 1입니다.',
        followers: 100,
        totalProjects: 5,
        completedProjects: 3,
        totalRevenue: 10000000,
      },
      {
        id: 'artist-2',
        username: '테스트 아티스트 2',
        email: 'artist2@example.com',
        role: 'artist',
        avatar: 'https://via.placeholder.com/40',
        category: '미술',
        bio: '테스트 아티스트 2입니다.',
        followers: 150,
        totalProjects: 8,
        completedProjects: 6,
        totalRevenue: 15000000,
      },
    ];

    return res(ctx.json(createSuccessResponse(mockArtists)));
  }),

  // 아티스트 상세 조회
  rest.get(`${API_BASE_URL}/artists/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    const mockArtist = {
      id: id as string,
      username: `테스트 아티스트 ${id}`,
      email: `artist${id}@example.com`,
      role: 'artist',
      avatar: 'https://via.placeholder.com/40',
      category: '음악',
      bio: `테스트 아티스트 ${id}입니다.`,
      followers: 100,
      totalProjects: 5,
      completedProjects: 3,
      totalRevenue: 10000000,
      projects: [
        {
          id: 1,
          title: '테스트 프로젝트 1',
          description: '테스트 프로젝트 설명 1',
          status: 'active',
          currentAmount: 2500000,
          targetAmount: 5000000,
          backers: 25,
        },
      ],
    };

    return res(ctx.json(createSuccessResponse(mockArtist)));
  }),
];

// 모든 핸들러 통합
export const handlers = [
  ...userHandlers,
  ...fundingHandlers,
  ...communityHandlers,
  ...artistHandlers,
];

// 에러 핸들러
export const errorHandlers = [
  // 네트워크 에러 시뮬레이션
  rest.get(`${API_BASE_URL}/error/network`, (req, res, ctx) => {
    return res.networkError('네트워크 에러가 발생했습니다.');
  }),

  // 서버 에러 시뮬레이션
  rest.get(`${API_BASE_URL}/error/server`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json(createErrorResponse('서버 내부 오류가 발생했습니다.', 500))
    );
  }),

  // 인증 에러 시뮬레이션
  rest.get(`${API_BASE_URL}/error/auth`, (req, res, ctx) => {
    return res(
      ctx.status(401),
      ctx.json(createErrorResponse('인증이 필요합니다.', 401))
    );
  }),

  // 권한 에러 시뮬레이션
  rest.get(`${API_BASE_URL}/error/forbidden`, (req, res, ctx) => {
    return res(
      ctx.status(403),
      ctx.json(createErrorResponse('접근 권한이 없습니다.', 403))
    );
  }),
];
