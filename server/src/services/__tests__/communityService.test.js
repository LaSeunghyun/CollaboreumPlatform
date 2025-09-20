jest.mock('../../repositories/communityRepository', () => ({
  findPosts: jest.fn(),
  countPosts: jest.fn(),
  findPopularPosts: jest.fn(),
  findRecentPosts: jest.fn(),
  findPostById: jest.fn(),
  findPostDocumentById: jest.fn(),
  createPost: jest.fn(),
  savePost: jest.fn(),
  findCommentsByPostId: jest.fn()
}));

const communityRepository = require('../../repositories/communityRepository');
const communityService = require('../communityService');
const { ValidationError } = require('../../errors/AppError');

describe('communityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('builds query options and returns posts with pagination', async () => {
      const posts = [{ id: 1 }];
      communityRepository.findPosts.mockResolvedValue(posts);
      communityRepository.countPosts.mockResolvedValue(25);

      const result = await communityService.getPosts({
        page: 2,
        limit: 5,
        search: '테스트',
        category: '자유',
        sortBy: 'popular'
      });

      expect(communityRepository.findPosts).toHaveBeenCalledTimes(1);
      const callArgs = communityRepository.findPosts.mock.calls[0][0];
      expect(callArgs.query.isActive).toBe(true);
      expect(callArgs.query.category).toBe('자유');
      expect(callArgs.query.$or).toHaveLength(3);
      expect(callArgs.sort).toEqual({ likes: -1, viewCount: -1 });
      expect(callArgs.skip).toBe(5);
      expect(callArgs.limit).toBe(5);

      expect(result).toEqual({
        posts,
        pagination: {
          page: 2,
          limit: 5,
          total: 25,
          pages: 5
        }
      });
    });
  });

  describe('getPostById', () => {
    it('increments view count and returns post', async () => {
      const post = { isActive: true, viewCount: 3 };
      communityRepository.findPostById.mockResolvedValue(post);
      communityRepository.savePost.mockResolvedValue();

      const result = await communityService.getPostById('abc');

      expect(post.viewCount).toBe(4);
      expect(communityRepository.savePost).toHaveBeenCalledWith(post);
      expect(result).toBe(post);
    });
  });

  describe('createPost', () => {
    it('creates post with default author name when missing', async () => {
      communityRepository.createPost.mockResolvedValue({ _id: 'new-id' });
      communityRepository.findPostById.mockResolvedValue({ _id: 'new-id', title: 'post' });

      await communityService.createPost({
        title: 'title',
        content: 'content',
        category: '자유',
        author: 'user-id'
      });

      expect(communityRepository.createPost).toHaveBeenCalledWith({
        title: 'title',
        content: 'content',
        category: '자유',
        tags: [],
        images: [],
        author: 'user-id',
        authorName: '사용자'
      });
    });
  });

  describe('updatePostReaction', () => {
    it('toggles like reaction and updates counts', async () => {
      const post = {
        isActive: true,
        likes: [],
        dislikes: []
      };
      communityRepository.findPostDocumentById.mockResolvedValue(post);
      communityRepository.savePost.mockResolvedValue();

      const result = await communityService.updatePostReaction('post-id', 'user-id', 'like');

      expect(post.likes).toContain('user-id');
      expect(post.dislikes).toHaveLength(0);
      expect(communityRepository.savePost).toHaveBeenCalledWith(post);
      expect(result).toEqual({
        likes: 1,
        dislikes: 0,
        isLiked: true,
        isDisliked: false
      });
    });

    it('throws validation error when reaction is invalid', async () => {
      await expect(
        communityService.updatePostReaction('post', 'user', 'invalid')
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });
});
