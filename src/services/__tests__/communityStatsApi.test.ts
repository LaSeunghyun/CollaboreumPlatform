import { communityPostAPI, statsAPI } from '../api';

describe('communityPostAPI.getStats', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('delegates to statsAPI.getCommunityStats to avoid missing endpoints', async () => {
        const mockStats = { totalPosts: 10 } as any;
        const spy = jest.spyOn(statsAPI, 'getCommunityStats').mockResolvedValue(mockStats);

        const result = await communityPostAPI.getStats();

        expect(spy).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockStats);
    });
});
