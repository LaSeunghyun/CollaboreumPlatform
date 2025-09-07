const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * 테스트 환경 설정
 */
class TestSetup {
  constructor() {
    this.mongoServer = null;
    this.connection = null;
  }

  /**
   * 테스트 데이터베이스 설정
   */
  async setupDatabase() {
    try {
      // MongoDB Memory Server 시작
      this.mongoServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'collaboreum_test',
        },
        binary: {
          version: '6.0.0',
        },
      });

      const mongoUri = this.mongoServer.getUri();
      
      // MongoDB 연결
      this.connection = await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      console.log('✅ 테스트 데이터베이스 연결 성공');
      return mongoUri;
    } catch (error) {
      console.error('❌ 테스트 데이터베이스 설정 실패:', error);
      throw error;
    }
  }

  /**
   * 테스트 데이터베이스 정리
   */
  async cleanupDatabase() {
    try {
      if (this.connection) {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
      }

      if (this.mongoServer) {
        await this.mongoServer.stop();
      }

      console.log('✅ 테스트 데이터베이스 정리 완료');
    } catch (error) {
      console.error('❌ 테스트 데이터베이스 정리 실패:', error);
      throw error;
    }
  }

  /**
   * 컬렉션 정리
   */
  async clearCollections() {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }

  /**
   * 시드 데이터 생성
   */
  async seedTestData() {
    const { User } = require('../../src/models/User');
    const { Category } = require('../../src/models/Category');
    const { FundingProject } = require('../../src/models/FundingProject');

    // 테스트 사용자 생성
    const testUsers = [
      {
        email: 'admin@test.com',
        username: 'admin',
        displayName: '관리자',
        role: 'admin',
        isActive: true,
      },
      {
        email: 'artist@test.com',
        username: 'artist',
        displayName: '아티스트',
        role: 'artist',
        isActive: true,
      },
      {
        email: 'fan@test.com',
        username: 'fan',
        displayName: '팬',
        role: 'fan',
        isActive: true,
      },
    ];

    const users = await User.insertMany(testUsers);

    // 테스트 카테고리 생성
    const testCategories = [
      {
        name: '음악',
        slug: 'music',
        description: '음악 관련 프로젝트',
        isActive: true,
      },
      {
        name: '예술',
        slug: 'art',
        description: '예술 관련 프로젝트',
        isActive: true,
      },
    ];

    const categories = await Category.insertMany(testCategories);

    // 테스트 펀딩 프로젝트 생성
    const testProjects = [
      {
        title: '테스트 프로젝트 1',
        description: '테스트용 프로젝트입니다.',
        shortDescription: '테스트 프로젝트',
        targetAmount: 1000000,
        currentAmount: 500000,
        status: 'collecting',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
        ownerId: users[1]._id, // 아티스트
        categoryId: categories[0]._id,
        images: ['https://example.com/image1.jpg'],
        tags: ['음악', '테스트'],
        rewards: [
          {
            title: '기본 리워드',
            description: '기본 리워드입니다.',
            amount: 10000,
            deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            isLimited: false,
          },
        ],
        progress: 50,
        backerCount: 5,
        isActive: true,
        isFeatured: false,
      },
    ];

    const projects = await FundingProject.insertMany(testProjects);

    return {
      users,
      categories,
      projects,
    };
  }

  /**
   * 모킹 설정
   */
  setupMocks() {
    // JWT 서비스 모킹
    jest.mock('../../src/services/auth/jwtService', () => ({
      generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
      verifyAccessToken: jest.fn().mockReturnValue({
        userId: 'mock-user-id',
        email: 'test@test.com',
        role: 'user',
      }),
      verifyRefreshToken: jest.fn().mockReturnValue({
        userId: 'mock-user-id',
        email: 'test@test.com',
        role: 'user',
      }),
    }));

    // 파일 업로드 서비스 모킹
    jest.mock('../../src/services/file/uploadService', () => ({
      saveFile: jest.fn().mockResolvedValue({
        id: 'mock-file-id',
        filename: 'mock-file.jpg',
        url: 'https://example.com/mock-file.jpg',
      }),
      deleteFile: jest.fn().mockResolvedValue(true),
    }));

    // 이벤트 스토어 모킹
    jest.mock('../../src/services/funding/eventStore', () => ({
      storeEvent: jest.fn().mockResolvedValue({ _id: 'mock-event-id' }),
      storeProjectCreated: jest.fn().mockResolvedValue({ _id: 'mock-event-id' }),
      storePledgeCreated: jest.fn().mockResolvedValue({ _id: 'mock-event-id' }),
    }));
  }

  /**
   * 테스트 헬퍼 함수들
   */
  createTestUser(overrides = {}) {
    return {
      email: 'test@test.com',
      username: 'testuser',
      displayName: '테스트 사용자',
      role: 'fan',
      isActive: true,
      ...overrides,
    };
  }

  createTestProject(overrides = {}) {
    return {
      title: '테스트 프로젝트',
      description: '테스트용 프로젝트입니다.',
      shortDescription: '테스트 프로젝트',
      targetAmount: 1000000,
      currentAmount: 0,
      status: 'draft',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      ownerId: new mongoose.Types.ObjectId(),
      categoryId: new mongoose.Types.ObjectId(),
      images: ['https://example.com/image.jpg'],
      tags: ['테스트'],
      rewards: [
        {
          title: '기본 리워드',
          description: '기본 리워드입니다.',
          amount: 10000,
          deliveryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          isLimited: false,
        },
      ],
      progress: 0,
      backerCount: 0,
      isActive: true,
      isFeatured: false,
      ...overrides,
    };
  }

  createTestPledge(overrides = {}) {
    return {
      projectId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      amount: 10000,
      status: 'pending',
      paymentMethod: 'card',
      idempotencyKey: 'test-key-' + Date.now(),
      ...overrides,
    };
  }

  /**
   * API 테스트 헬퍼
   */
  createAuthHeaders(userId = 'mock-user-id') {
    return {
      'Authorization': 'Bearer mock-access-token',
      'Content-Type': 'application/json',
    };
  }

  /**
   * 에러 응답 검증
   */
  expectErrorResponse(response, statusCode, errorCode) {
    expect(response.status).toBe(statusCode);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBeDefined();
    if (errorCode) {
      expect(response.body.code).toBe(errorCode);
    }
  }

  /**
   * 성공 응답 검증
   */
  expectSuccessResponse(response, statusCode = 200) {
    expect(response.status).toBe(statusCode);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  }

  /**
   * 페이징 응답 검증
   */
  expectPaginatedResponse(response, expectedCount = null) {
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBeDefined();
    expect(response.body.pagination.limit).toBeDefined();
    expect(response.body.pagination.total).toBeDefined();
    expect(response.body.pagination.totalPages).toBeDefined();
    
    if (expectedCount !== null) {
      expect(response.body.data.length).toBe(expectedCount);
    }
  }
}

module.exports = TestSetup;
