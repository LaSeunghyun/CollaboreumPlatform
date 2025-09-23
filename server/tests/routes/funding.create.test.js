const express = require('express');
const request = require('supertest');

let authenticatedUser;
const savedProjects = [];

jest.mock('../../middleware/auth', () => {
  return (req, res, next) => {
    if (!authenticatedUser) {
      return res.status(401).json({
        message: '인증 토큰이 필요합니다',
      });
    }

    req.user = authenticatedUser;
    return next();
  };
});

jest.mock('../../models/FundingProject', () => {
  class FundingProjectMock {
    constructor(data) {
      Object.assign(this, data);
      this._id = `mock-project-${FundingProjectMock._counter++}`;
    }

    async save() {
      savedProjects.push({ ...this });
    }

    static findById(id) {
      const project = savedProjects.find(item => item._id === id) || {};
      return {
        populate: () => ({
          lean: () =>
            Promise.resolve({
              _id: id,
              ...project,
              daysLeft: project.daysLeft ?? 0,
            }),
        }),
      };
    }

    static __reset() {
      savedProjects.length = 0;
      FundingProjectMock._counter = 1;
    }

    static __getSavedProjects() {
      return savedProjects;
    }
  }

  FundingProjectMock._counter = 1;

  return FundingProjectMock;
});

const FundingProject = require('../../models/FundingProject');
const fundingRouter = require('../../routes/funding');

describe('POST /api/funding/projects - string budget handling', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/funding', fundingRouter);
  });

  beforeEach(() => {
    authenticatedUser = {
      id: 'artist-1',
      name: '테스트 아티스트',
      role: 'artist',
    };
    FundingProject.__reset();
  });

  afterEach(() => {
    authenticatedUser = null;
  });

  it('accepts string budgets when the total matches the goal amount', async () => {
    const now = Date.now();
    const startDate = new Date(now + 24 * 60 * 60 * 1000);
    const stageEndDate = new Date(now + 4 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now + 14 * 24 * 60 * 60 * 1000);

    const response = await request(app)
      .post('/api/funding/projects')
      .send({
        title: '문자열 예산 프로젝트',
        description: '집행 단계 예산이 문자열로 전달되는 경우를 검증합니다.',
        category: '음악',
        goalAmount: '300000',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        executionPlan: {
          stages: [
            {
              name: '준비 단계',
              description: '사전 준비를 위한 단계',
              budget: '100000',
              startDate: startDate.toISOString(),
              endDate: stageEndDate.toISOString(),
            },
            {
              name: '실행 단계',
              description: '본격적인 프로젝트 실행',
              budget: '200000',
              startDate: stageEndDate.toISOString(),
              endDate: endDate.toISOString(),
            },
          ],
          totalBudget: '300000',
        },
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain(
      '펀딩 프로젝트가 성공적으로 시작되었습니다',
    );
  });
});
