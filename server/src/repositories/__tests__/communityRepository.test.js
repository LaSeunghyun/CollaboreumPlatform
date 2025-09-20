const path = require('path');
const communityPostPath = path.join(__dirname, '../../../models/CommunityPost');

jest.mock(communityPostPath, () => {
  const mockModel = jest.fn();
  mockModel.find = jest.fn();
  mockModel.countDocuments = jest.fn();
  mockModel.findById = jest.fn();
  return mockModel;
});

const CommunityPost = require(communityPostPath);
const communityRepository = require('../communityRepository');

const createQueryMock = () => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis()
});

describe('communityRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should query posts with population and pagination', async () => {
    const queryMock = createQueryMock();
    CommunityPost.find.mockReturnValue(queryMock);

    const result = await communityRepository.findPosts({
      query: { isActive: true },
      sort: { createdAt: -1 },
      skip: 20,
      limit: 10
    });

    expect(CommunityPost.find).toHaveBeenCalledWith({ isActive: true });
    expect(queryMock.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(queryMock.skip).toHaveBeenCalledWith(20);
    expect(queryMock.limit).toHaveBeenCalledWith(10);
    expect(queryMock.populate).toHaveBeenCalledWith('author', 'name role avatar');
    expect(result).toBe(queryMock);
  });

  it('should populate post and comments when finding by id with comments', async () => {
    const findByIdMock = createQueryMock();
    CommunityPost.findById.mockReturnValue(findByIdMock);

    const result = await communityRepository.findPostById('id', { includeComments: true });

    expect(CommunityPost.findById).toHaveBeenCalledWith('id');
    expect(findByIdMock.populate).toHaveBeenNthCalledWith(1, 'author', 'name role avatar');
    expect(findByIdMock.populate).toHaveBeenNthCalledWith(2, 'comments.author', 'name role avatar');
    expect(findByIdMock.populate).toHaveBeenNthCalledWith(3, 'comments.replies.author', 'name role avatar');
    expect(result).toBe(findByIdMock);
  });

  it('should create a post using the model constructor', async () => {
    const saveMock = jest.fn().mockResolvedValue({ _id: '1' });
    CommunityPost.mockImplementation(() => ({ save: saveMock }));

    const payload = { title: 'test' };
    const result = await communityRepository.createPost(payload);

    expect(CommunityPost).toHaveBeenCalledWith(payload);
    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ _id: '1' });
  });

  it('should select comments when fetching comments by post id', async () => {
    const findByIdMock = createQueryMock();
    CommunityPost.findById.mockReturnValue(findByIdMock);

    await communityRepository.findCommentsByPostId('id');

    expect(CommunityPost.findById).toHaveBeenCalledWith('id');
    expect(findByIdMock.select).toHaveBeenCalledWith('comments');
    expect(findByIdMock.populate).toHaveBeenNthCalledWith(1, 'author', 'name role avatar');
    expect(findByIdMock.populate).toHaveBeenNthCalledWith(2, 'comments.author', 'name role avatar');
    expect(findByIdMock.populate).toHaveBeenNthCalledWith(3, 'comments.replies.author', 'name role avatar');
    expect(findByIdMock.lean).toHaveBeenCalled();
  });
});
