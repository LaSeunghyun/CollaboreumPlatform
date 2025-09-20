import React from 'react';
import { render, screen } from '@testing-library/react';

import { ProjectTabs } from '../ProjectTabs';
import { mapFundingProjectDetail } from '@/services/api';

describe('ProjectTabs detail view', () => {
    it('renders safely with mapped project response and missing arrays', () => {
        const rawResponse = {
            id: 'mapped-project-1',
            title: '매핑된 프로젝트',
            description: '매퍼를 통해 변환된 프로젝트입니다.',
            artist: '테스트 아티스트',
            category: '음악',
            goalAmount: 1000000,
            currentAmount: 500000,
            backers: 12,
            daysLeft: 20,
            image: 'https://example.com/image.jpg',
            status: '진행중',
            progressPercentage: 50,
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-02-01T00:00:00.000Z',
            rewards: null,
            updates: undefined,
            backersList: undefined,
            executionPlan: {
                stages: null,
                totalBudget: 1000000,
            },
            expenseRecords: null,
            revenueDistribution: {
                totalRevenue: 0,
                platformFee: 0.05,
                artistShare: 0.7,
                backerShare: 0.25,
                distributions: undefined,
            },
        };

        const mappedProject = mapFundingProjectDetail(rawResponse);

        expect(mappedProject).not.toBeNull();

        render(<ProjectTabs project={mappedProject!} />);

        expect(screen.getByText('프로젝트 소개')).toBeInTheDocument();
        expect(screen.getByText('등록된 리워드가 없습니다.')).toBeInTheDocument();
        expect(screen.getByText('아직 등록된 업데이트가 없습니다.')).toBeInTheDocument();
        expect(screen.getByText('아직 후원자가 없습니다.')).toBeInTheDocument();
    });
});
