jest.mock('../models/FundingProject', () => ({
  find: jest.fn(),
}));

const FundingProject = require('../models/FundingProject');
const artistsModule = require('../routes/artists');

describe('calculateMonthlyEarnings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps artistShare at 0 when provided', async () => {
    const { calculateMonthlyEarnings } = artistsModule;

    FundingProject.find.mockResolvedValue([
      {
        revenueDistribution: { artistShare: 0, totalRevenue: 1000 },
        currentAmount: 500,
      },
    ]);

    const result = await calculateMonthlyEarnings('artist-id');

    expect(FundingProject.find).toHaveBeenCalled();
    expect(result).toBe(0);
  });
});
