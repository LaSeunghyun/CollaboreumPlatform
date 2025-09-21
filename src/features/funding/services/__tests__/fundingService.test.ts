import { fundingService } from '../fundingService';
import { api } from '@/lib/api/api';
import { fundingProjectsApiResponse } from '../../__fixtures__/fundingProjects';
import { FundingProjectStatus } from '../../types';

jest.mock('@/lib/api/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('fundingService.getProjects', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
  });

  it('maps API responses to FundingProject entities', async () => {
    mockedApi.get.mockResolvedValue(fundingProjectsApiResponse);

    const projects = await fundingService.getProjects();

    expect(mockedApi.get).toHaveBeenCalled();
    expect(projects).toHaveLength(2);
    expect(projects[0]).toMatchObject({
      id: 'project-1',
      title: '테스트 프로젝트 1',
      shortDescription: expect.any(String),
      targetAmount: 1000000,
      currentAmount: 450000,
      status: FundingProjectStatus.COLLECTING,
      images: ['https://example.com/project-1.jpg'],
      isFeatured: true,
      backerCount: 125,
    });
    expect(projects[0].shortDescription.length).toBeGreaterThan(0);
    expect(projects[1]).toMatchObject({
      id: 'project-2',
      status: FundingProjectStatus.SUCCEEDED,
      isFeatured: false,
    });
  });

  it('filters projects without identifiers', async () => {
    mockedApi.get.mockResolvedValue({
      success: true,
      data: {
        projects: [
          {
            title: '식별자 없는 프로젝트',
            goalAmount: 100000,
            currentAmount: 50000,
          },
        ],
      },
    });

    const projects = await fundingService.getProjects();

    expect(projects).toHaveLength(0);
  });

  it('throws when the API responds with an error', async () => {
    mockedApi.get.mockResolvedValue({
      success: false,
      message: '프로젝트를 불러오지 못했습니다.',
    });

    await expect(fundingService.getProjects()).rejects.toThrow(
      '프로젝트를 불러오지 못했습니다.',
    );
  });
});
