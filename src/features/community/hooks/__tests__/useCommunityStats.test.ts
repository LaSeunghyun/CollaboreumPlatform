import { normalizeCommunityStatsResponse } from '../useCommunity';

const baseResponse = {
    totalPosts: 12,
    activeUsers: 7,
    totalComments: 32,
    avgLikes: 4,
    postsGrowthRate: 15,
    usersGrowthRate: -3,
};

describe('normalizeCommunityStatsResponse', () => {
    it('returns numeric stats from a direct response object', () => {
        const result = normalizeCommunityStatsResponse(baseResponse);

        expect(result).toEqual({
            totalPosts: 12,
            activeUsers: 7,
            totalComments: 32,
            avgLikes: 4,
            postsGrowthRate: 15,
            usersGrowthRate: -3,
        });
    });

    it('unwraps nested data payloads', () => {
        const result = normalizeCommunityStatsResponse({ success: true, data: baseResponse });

        expect(result).toEqual({
            totalPosts: 12,
            activeUsers: 7,
            totalComments: 32,
            avgLikes: 4,
            postsGrowthRate: 15,
            usersGrowthRate: -3,
        });
    });

    it('coerces non-numeric values and fills missing fields with zero', () => {
        const result = normalizeCommunityStatsResponse({
            data: {
                totalPosts: '25',
                activeUsers: 'not-a-number',
                avgLikes: undefined,
            },
        });

        expect(result).toEqual({
            totalPosts: 25,
            activeUsers: 0,
            totalComments: 0,
            avgLikes: 0,
            postsGrowthRate: 0,
            usersGrowthRate: 0,
        });
    });
});
