const request = require('supertest');
const TestSetup = require('../setup/testSetup');
const User = require('../../models/User');
const FundingProject = require('../../models/FundingProject');
const Project = require('../../models/Project');
const CommunityPost = require('../../models/CommunityPost');

describe('Home content integration', () => {
  let testSetup;
  let artistUser;
  let fanUser;
  let shouldSkip = false;
  let app;

  beforeAll(async () => {
    testSetup = new TestSetup();
    try {
      const uri = await testSetup.setupDatabase();
      if (!uri) {
        shouldSkip = true;
        return;
      }
    } catch (error) {
      console.warn('홈 컨텐츠 통합 테스트를 건너뜁니다: 데이터베이스를 초기화할 수 없습니다.', error);
      shouldSkip = true;
      return;
    }

    if (!shouldSkip) {
      app = require('../../server/server');
    }
  });

  afterAll(async () => {
    await testSetup.cleanupDatabase();
  });

  beforeEach(async () => {
    if (shouldSkip) {
      return;
    }

    await testSetup.clearCollections();

    const now = new Date();

    artistUser = await User.create({
      name: '홈 아티스트',
      username: 'home-artist',
      email: 'artist-home@example.com',
      password: 'password123',
      role: 'artist',
      isActive: true,
      lastActivityAt: now,
    });

    fanUser = await User.create({
      name: '홈 팬',
      username: 'home-fan',
      email: 'fan-home@example.com',
      password: 'password123',
      role: 'fan',
      isActive: true,
      lastActivityAt: now,
    });

    await FundingProject.create({
      title: '홈 테스트 프로젝트',
      description: '홈 화면에 노출될 테스트 프로젝트',
      artist: artistUser._id,
      artistName: artistUser.name,
      category: '음악',
      goalAmount: 1_000_000,
      currentAmount: 500_000,
      executionPlan: {
        totalBudget: 1_000_000,
        stages: [
          {
            name: '준비',
            description: '프로젝트 준비 단계',
            budget: 1_000_000,
            startDate: now,
            endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            status: '계획',
            progress: 0,
          },
        ],
      },
      rewards: [
        {
          title: '감사의 편지',
          description: '감사 인사를 전하는 리워드',
          amount: 10_000,
          estimatedDelivery: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        },
      ],
      startDate: now,
      endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      status: '진행중',
      progress: 50,
      daysLeft: 30,
    });

    const project = await Project.create({
      title: '완료된 내부 프로젝트',
      description: '통계 검증용 프로젝트',
      artist: artistUser._id,
      artistName: artistUser.name,
      category: '음악',
      status: '완료',
      progress: 100,
      startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      endDate: now,
      budget: 800_000,
      spent: 500_000,
      tasks: [],
      milestones: [],
      team: [],
      tags: ['음악'],
    });

    await Project.updateOne(
      { _id: project._id },
      { $set: { currentAmount: 600_000 } },
    );

    await CommunityPost.create([
      {
        title: '홈 공지',
        content: '홈 화면 공지 내용입니다.',
        author: artistUser._id,
        authorName: artistUser.name,
        category: '자유',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: '인기 커뮤니티 글',
        content: '좋아요가 많이 달린 커뮤니티 글입니다.',
        author: fanUser._id,
        authorName: fanUser.name,
        category: '음악',
        likes: [artistUser._id, fanUser._id],
        viewCount: 25,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  });

  const maybeSkip = () => {
    if (shouldSkip) {
      console.warn('Skipping home content integration test due to unavailable database environment.');
      return true;
    }
    return false;
  };

  test('returns platform stats for home experience', async () => {
    if (maybeSkip()) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app).get('/api/stats/platform');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      totalArtists: expect.any(Number),
      totalProjects: expect.any(Number),
      totalFunding: expect.any(Number),
      totalUsers: expect.any(Number),
    });
  });

  test('lists popular artists for the home section', async () => {
    if (maybeSkip()) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app)
      .get('/api/artists/featured/popular')
      .query({ limit: 3 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('id');
  });

  test('lists funding projects shown on home', async () => {
    if (maybeSkip()) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app)
      .get('/api/funding/projects')
      .query({ limit: 3 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data?.projects)).toBe(true);
    expect(response.body.data.projects.length).toBeGreaterThan(0);
  });

  test('lists community posts sorted by popularity for home', async () => {
    if (maybeSkip()) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app)
      .get('/api/community/posts')
      .query({ sortBy: 'popular', limit: 4 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.posts)).toBe(true);
    expect(response.body.posts.length).toBeGreaterThan(0);
  });

  test('exposes community categories used for home filters', async () => {
    if (maybeSkip()) {
      expect(true).toBe(true);
      return;
    }

    const response = await request(app).get('/api/community/categories');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toHaveProperty('value');
  });
});
