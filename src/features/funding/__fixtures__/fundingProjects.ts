import { ApiResponse } from '@/shared/types';

type FundingProjectApiFixture = {
  id: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  status: string;
  startDate: string;
  endDate: string;
  daysLeft: number;
  progress: number;
  image: string;
  tags: string[];
  backers: number;
  featured: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
};

const now = Date.now();
const sevenDays = 7 * 24 * 60 * 60 * 1000;
const fourteenDays = 14 * 24 * 60 * 60 * 1000;

export const fundingProjectsApiResponse: ApiResponse<{
  projects: FundingProjectApiFixture[];
}> = {
  success: true,
  data: {
    projects: [
      {
        id: 'project-1',
        title: '테스트 프로젝트 1',
        description:
          '이것은 첫 번째 테스트 프로젝트에 대한 상세 설명입니다. 다양한 콘텐츠 제작과 이벤트를 포함하고 있습니다.',
        goalAmount: 1000000,
        currentAmount: 450000,
        status: '진행중',
        startDate: new Date(now - sevenDays).toISOString(),
        endDate: new Date(now + fourteenDays).toISOString(),
        daysLeft: 14,
        progress: 45,
        image: 'https://example.com/project-1.jpg',
        tags: ['음악', '라이브'],
        backers: 125,
        featured: true,
        category: 'music',
        createdAt: new Date(now - sevenDays).toISOString(),
        updatedAt: new Date(now).toISOString(),
      },
      {
        id: 'project-2',
        title: '테스트 프로젝트 2',
        description:
          '두 번째 테스트 프로젝트입니다. 짧은 설명만 제공되어 요약 처리 로직을 검증합니다.',
        goalAmount: 2000000,
        currentAmount: 2000000,
        status: '성공',
        startDate: new Date(now - fourteenDays).toISOString(),
        endDate: new Date(now + sevenDays).toISOString(),
        daysLeft: 7,
        progress: 100,
        image: 'https://example.com/project-2.jpg',
        tags: ['아트', '전시'],
        backers: 320,
        featured: false,
        category: 'art',
        createdAt: new Date(now - fourteenDays).toISOString(),
        updatedAt: new Date(now).toISOString(),
      },
    ],
  },
};
