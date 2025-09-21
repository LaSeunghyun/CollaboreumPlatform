const request = require('supertest');
const mongoose = require('mongoose');
const TestSetup = require('../setup/testSetup');
const app = require('../../server');

/**
 * 펀딩 E2E 테스트
 */
describe('Funding E2E Tests', () => {
  let testSetup;
  let testData;

  beforeAll(async () => {
    testSetup = new TestSetup();
    await testSetup.setupDatabase();
    testData = await testSetup.seedTestData();
  });

  afterAll(async () => {
    await testSetup.cleanupDatabase();
  });

  beforeEach(async () => {
    await testSetup.clearCollections();
    testData = await testSetup.seedTestData();
  });

  describe('POST /api/funding/projects', () => {
    it('should create a new funding project', async () => {
      const projectData = testSetup.createTestProject({
        ownerId: testData.users[1]._id, // 아티스트
        categoryId: testData.categories[0]._id,
      });

      const response = await request(app)
        .post('/api/funding/projects')
        .set(testSetup.createAuthHeaders(testData.users[1]._id))
        .send(projectData);

      testSetup.expectSuccessResponse(response, 201);
      expect(response.body.data.title).toBe(projectData.title);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.ownerId).toBe(testData.users[1]._id.toString());
    });

    it('should reject project creation with invalid data', async () => {
      const invalidProjectData = {
        title: '', // 빈 제목
        targetAmount: -1000, // 음수 금액
      };

      const response = await request(app)
        .post('/api/funding/projects')
        .set(testSetup.createAuthHeaders(testData.users[1]._id))
        .send(invalidProjectData);

      testSetup.expectErrorResponse(response, 400, 'VALIDATION_ERROR');
    });

    it('should reject project creation by non-artist user', async () => {
      const projectData = testSetup.createTestProject({
        ownerId: testData.users[2]._id, // 팬
        categoryId: testData.categories[0]._id,
      });

      const response = await request(app)
        .post('/api/funding/projects')
        .set(testSetup.createAuthHeaders(testData.users[2]._id))
        .send(projectData);

      testSetup.expectErrorResponse(response, 403, 'AUTHORIZATION_ERROR');
    });
  });

  describe('GET /api/funding/projects', () => {
    it('should return paginated list of projects', async () => {
      const response = await request(app)
        .get('/api/funding/projects')
        .query({ page: 1, limit: 10 });

      testSetup.expectPaginatedResponse(response);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/funding/projects')
        .query({ status: 'collecting' });

      testSetup.expectPaginatedResponse(response);
      response.body.data.forEach(project => {
        expect(project.status).toBe('collecting');
      });
    });

    it('should search projects by text', async () => {
      const response = await request(app)
        .get('/api/funding/projects')
        .query({ search: '테스트' });

      testSetup.expectPaginatedResponse(response);
      response.body.data.forEach(project => {
        expect(
          project.title.includes('테스트') ||
            project.description.includes('테스트'),
        ).toBe(true);
      });
    });
  });

  describe('POST /api/funding/projects/:id/publish', () => {
    it('should publish a draft project', async () => {
      const project = testData.projects[0];

      const response = await request(app)
        .post(`/api/funding/projects/${project._id}/publish`)
        .set(testSetup.createAuthHeaders(project.ownerId));

      testSetup.expectSuccessResponse(response);
      expect(response.body.data.status).toBe('collecting');
    });

    it('should reject publishing by non-owner', async () => {
      const project = testData.projects[0];

      const response = await request(app)
        .post(`/api/funding/projects/${project._id}/publish`)
        .set(testSetup.createAuthHeaders(testData.users[2]._id)); // 다른 사용자

      testSetup.expectErrorResponse(response, 403, 'AUTHORIZATION_ERROR');
    });
  });

  describe('POST /api/funding/pledges', () => {
    it('should create a new pledge', async () => {
      const project = testData.projects[0];
      const pledgeData = testSetup.createTestPledge({
        projectId: project._id,
        userId: testData.users[2]._id, // 팬
        amount: 50000,
      });

      const response = await request(app)
        .post('/api/funding/pledges')
        .set(testSetup.createAuthHeaders(testData.users[2]._id))
        .send(pledgeData);

      testSetup.expectSuccessResponse(response, 201);
      expect(response.body.data.amount).toBe(50000);
      expect(response.body.data.status).toBe('pending');
    });

    it('should reject pledge for inactive project', async () => {
      const { FundingProject } = require('../../src/models/FundingProject');

      // 프로젝트를 비활성화
      await FundingProject.findByIdAndUpdate(testData.projects[0]._id, {
        isActive: false,
      });

      const pledgeData = testSetup.createTestPledge({
        projectId: testData.projects[0]._id,
        userId: testData.users[2]._id,
      });

      const response = await request(app)
        .post('/api/funding/pledges')
        .set(testSetup.createAuthHeaders(testData.users[2]._id))
        .send(pledgeData);

      testSetup.expectErrorResponse(response, 400, 'BUSINESS_LOGIC_ERROR');
    });
  });

  describe('Funding Project Lifecycle', () => {
    it('should complete full funding lifecycle', async () => {
      const { FundingProject } = require('../../src/models/FundingProject');
      const { Pledge } = require('../../src/models/Pledge');

      // 1. 프로젝트 생성
      const project = testData.projects[0];

      // 2. 프로젝트 발행
      await request(app)
        .post(`/api/funding/projects/${project._id}/publish`)
        .set(testSetup.createAuthHeaders(project.ownerId));

      // 3. 후원 생성 (목표 금액 달성)
      const pledgeAmount = project.targetAmount;
      const pledgeData = testSetup.createTestPledge({
        projectId: project._id,
        userId: testData.users[2]._id,
        amount: pledgeAmount,
      });

      const pledgeResponse = await request(app)
        .post('/api/funding/pledges')
        .set(testSetup.createAuthHeaders(testData.users[2]._id))
        .send(pledgeData);

      expect(pledgeResponse.status).toBe(201);

      // 4. 후원 승인 및 결제 완료
      const pledge = pledgeResponse.body.data;
      await Pledge.findByIdAndUpdate(pledge.id, {
        status: 'captured',
        capturedAt: new Date(),
      });

      // 5. 프로젝트 상태 확인 (자동으로 succeeded로 변경되어야 함)
      const updatedProject = await FundingProject.findById(project._id);
      expect(updatedProject.status).toBe('succeeded');
      expect(updatedProject.currentAmount).toBe(pledgeAmount);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // 데이터베이스 연결 끊기
      await mongoose.connection.close();

      const response = await request(app).get('/api/funding/projects');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // 연결 복구
      await testSetup.setupDatabase();
    });

    it('should handle invalid project ID', async () => {
      const invalidId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/funding/projects/${invalidId}`)
        .set(testSetup.createAuthHeaders(testData.users[1]._id));

      testSetup.expectErrorResponse(response, 404, 'NOT_FOUND_ERROR');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/funding/projects')
        .set({
          ...testSetup.createAuthHeaders(testData.users[1]._id),
          'Content-Type': 'application/json',
        })
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app).get('/api/funding/projects').query({ page: 1, limit: 5 }),
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();

      const response = await request(app).get('/api/funding/projects');

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // 1초 이내
    });
  });
});
