import React from 'react';
import { render, screen } from '@testing-library/react';
import ProjectGrid from '../ProjectGrid';
import { fundingService } from '../../../services/fundingService';
import { api } from '@/lib/api/api';
import { fundingProjectsApiResponse } from '../../../__fixtures__/fundingProjects';

jest.mock('@/lib/api/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

describe('ProjectGrid', () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
  });

  it('renders projects mapped from the funding API payload', async () => {
    mockedApi.get.mockResolvedValue(fundingProjectsApiResponse);

    const projects = await fundingService.getProjects();

    render(<ProjectGrid projects={projects} />);

    expect(screen.getByText('테스트 프로젝트 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 프로젝트 2')).toBeInTheDocument();
    expect(screen.getByText('추천')).toBeInTheDocument();
    expect(
      screen.getByText(/첫 번째 테스트 프로젝트에 대한/),
    ).toBeInTheDocument();
  });
});
