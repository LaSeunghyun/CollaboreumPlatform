import {
  mapBackers,
  mapExecutionPlan,
  mapExpenseRecords,
  mapFundingProjectDetail,
  mapRevenueDistribution,
  mapRewards,
  mapUpdates,
} from '@/services/fundingProjectMapper';
import type { FundingProjectPayload } from '@/types/fundingProject';

describe('fundingProjectMapper', () => {
  it('normalizes a fully populated funding project payload', () => {
    const payload: FundingProjectPayload = {
      id: 'project-1',
      _id: 'mongo-project-1',
      title: 'Amazing Project',
      description: 'A project with detailed information.',
      artist: { _id: 'artist-42', name: 'Collaboreum Artist' },
      category: 'music',
      goalAmount: '100000',
      targetAmount: 120000,
      currentAmount: '50000',
      backers: [
        {
          id: 'backer-1',
          userId: 'user-1',
          userName: 'First Backer',
          amount: '10000',
          date: '2024-01-02T00:00:00.000Z',
          status: '완료',
        },
      ],
      daysLeft: '10',
      image: 'https://example.com/project.jpg',
      status: '진행중',
      progressPercentage: '45',
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-02-01T00:00:00.000Z',
      story: 'Project story',
      artistAvatar: 'https://example.com/avatar.jpg',
      artistRating: 4.8,
      featured: true,
      rewards: [
        {
          id: 'reward-1',
          title: 'Signed Album',
          description: 'Limited signed edition.',
          amount: '30000',
          estimatedDelivery: '2024-04-01T00:00:00.000Z',
          claimed: '5',
          maxClaim: '50',
        },
      ],
      updates: [
        {
          id: 'update-1',
          title: 'Kickoff',
          content: 'We have launched!',
          date: '2024-01-03T00:00:00.000Z',
          type: 'announcement',
        },
      ],
      executionPlan: {
        stages: [
          {
            id: 'stage-1',
            name: 'Production',
            description: 'Produce the album.',
            budget: '60000',
            startDate: '2024-01-05T00:00:00.000Z',
            endDate: '2024-03-01T00:00:00.000Z',
            status: '진행중',
            progress: '50',
          },
        ],
        totalBudget: '150000',
      },
      expenseRecords: [
        {
          id: 'expense-1',
          category: '장비',
          title: 'Studio Rental',
          description: 'Two weeks in a studio.',
          amount: '20000',
          date: '2024-01-10T00:00:00.000Z',
          receipt: 'https://example.com/receipt.jpg',
          stage: 'stage-1',
          verified: true,
        },
      ],
      revenueDistribution: {
        totalRevenue: '90000',
        platformFee: { percentage: 5 },
        artistShare: { amount: '60000' },
        backerShare: 0.3,
        distributions: [
          {
            id: 'distribution-1',
            userName: 'First Backer',
            originalAmount: '10000',
            profitShare: '2000',
            amount: '12000',
            date: '2024-02-10T00:00:00.000Z',
            status: '완료',
          },
        ],
      },
    };

    const mapped = mapFundingProjectDetail(payload);

    expect(mapped).not.toBeNull();
    expect(mapped?.id).toBe('project-1');
    expect(mapped?.artist).toBe('Collaboreum Artist');
    expect(mapped?.goalAmount).toBe(100000);
    expect(mapped?.targetAmount).toBe(120000);
    expect(mapped?.currentAmount).toBe(50000);
    expect(mapped?.backers).toBe(1);
    expect(mapped?.rewards[0]).toEqual(
      expect.objectContaining({
        amount: 30000,
        claimed: 5,
        maxClaim: 50,
      }),
    );
    expect(mapped?.updates[0]).toEqual(
      expect.objectContaining({
        title: 'Kickoff',
        date: '2024-01-03T00:00:00.000Z',
      }),
    );
    expect(mapped?.executionPlan.totalBudget).toBe(150000);
    expect(mapped?.revenueDistribution.platformFee).toEqual(
      expect.objectContaining({ amount: 4500, percentage: 5 }),
    );
    expect(mapped?.revenueDistribution.artistShare.percentage).toBeCloseTo(
      66.67,
      2,
    );
    expect(mapped?.revenueDistribution.backerShare).toEqual(
      expect.objectContaining({ amount: 27000, percentage: 30 }),
    );
  });

  it('handles partial payloads across dedicated helpers', () => {
    const rewards = mapRewards([
      {
        title: 'Digital Download',
        amount: '10000',
      },
    ]);
    expect(rewards[0]).toMatchObject({
      title: 'Digital Download',
      amount: 10000,
      claimed: undefined,
    });

    const updates = mapUpdates([
      {
        title: 'Coming soon',
        content: 'Update pending',
      },
    ]);
    expect(updates[0]).toMatchObject({
      title: 'Coming soon',
      date: '',
    });

    const backers = mapBackers({
      backers: 5,
      backersList: [
        {
          isAnonymous: true,
          amount: '12000',
        },
        null,
      ],
    });
    expect(backers).toHaveLength(1);
    expect(backers[0]).toMatchObject({
      userName: '익명 후원자',
      amount: 12000,
      status: '완료',
    });

    const executionPlan = mapExecutionPlan(
      {
        stages: [
          {
            name: 'Planning',
            budget: '5000',
            progress: '10',
          },
        ],
      },
      4200,
    );
    expect(executionPlan.totalBudget).toBe(4200);
    expect(executionPlan.stages[0]).toMatchObject({
      progress: 10,
      status: '계획',
    });

    const revenueDistribution = mapRevenueDistribution(
      {
        platformFee: { percentage: '10' },
        artistShare: { amount: '2000' },
        backerShare: '0.25',
        distributions: [
          {
            backer: { _id: 'backer-42' },
            amount: '500',
          },
        ],
      },
      4000,
    );
    expect(revenueDistribution.platformFee.amount).toBe(400);
    expect(revenueDistribution.backerShare).toMatchObject({
      amount: 1000,
      percentage: 25,
    });
    expect(revenueDistribution.distributions[0]).toMatchObject({
      backer: 'backer-42',
      amount: 500,
      status: '대기',
    });

    const expenseRecords = mapExpenseRecords([
      {
        title: 'Travel',
        amount: '800',
      },
    ]);
    expect(expenseRecords[0]).toMatchObject({
      title: 'Travel',
      amount: 800,
      verified: false,
    });
  });
});
