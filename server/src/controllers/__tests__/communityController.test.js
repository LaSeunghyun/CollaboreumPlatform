jest.mock('../../services/communityService', () => ({
  getCategories: jest.fn(),
  getPosts: jest.fn(),
  getPopularPosts: jest.fn(),
  getRecentPosts: jest.fn(),
  getPostById: jest.fn(),
  incrementPostView: jest.fn(),
  getPostReactions: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  updatePostReaction: jest.fn(),
  reportPost: jest.fn(),
  getComments: jest.fn(),
  addComment: jest.fn(),
  updateComment: jest.fn(),
  deleteComment: jest.fn(),
  reactToComment: jest.fn()
}));

const communityService = require('../../services/communityService');
const communityController = require('../communityController');

const createResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('communityController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns categories from the service', async () => {
    communityService.getCategories.mockReturnValue([{ value: '자유' }]);
    const req = {};
    const res = createResponse();
    const next = jest.fn();

    await communityController.getCategories(req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ value: '자유' }]
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('delegates post retrieval to the service', async () => {
    const post = { id: '1' };
    communityService.getPostById.mockResolvedValue(post);
    const req = { params: { id: '1' } };
    const res = createResponse();
    const next = jest.fn();

    await communityController.getPostById(req, res, next);

    expect(communityService.getPostById).toHaveBeenCalledWith('1');
    expect(res.json).toHaveBeenCalledWith({ success: true, data: post });
  });

  it('creates post and responds with status 201', async () => {
    const created = { id: 'post-id' };
    communityService.createPost.mockResolvedValue(created);
    const req = { body: { title: 't' }, user: { _id: 'user' } };
    const res = createResponse();
    const next = jest.fn();

    await communityController.createPost(req, res, next);

    expect(communityService.createPost).toHaveBeenCalledWith({
      title: 't',
      author: 'user',
      authorName: undefined
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: created,
      message: '포스트가 생성되었습니다.'
    });
  });

  it('passes errors to next middleware', async () => {
    const error = new Error('boom');
    communityService.getPosts.mockRejectedValue(error);
    const req = { query: {} };
    const res = createResponse();
    const next = jest.fn();

    await communityController.getPosts(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
