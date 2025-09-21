const CommunityPost = require('../../models/CommunityPost');

const AUTHOR_FIELDS = 'name role avatar';

const applyAuthorPopulation = (query, { includeComments = false } = {}) => {
  let populatedQuery = query.populate('author', AUTHOR_FIELDS);

  if (includeComments) {
    populatedQuery = populatedQuery
      .populate('comments.author', AUTHOR_FIELDS)
      .populate('comments.replies.author', AUTHOR_FIELDS);
  }

  return populatedQuery;
};

const findPosts = async ({ query, sort, skip, limit }) => {
  return applyAuthorPopulation(
    CommunityPost.find(query).sort(sort).skip(skip).limit(limit),
    { includeComments: false },
  );
};

const countPosts = async query => {
  return CommunityPost.countDocuments(query);
};

const findPopularPosts = async limit => {
  return applyAuthorPopulation(
    CommunityPost.find({ isActive: true })
      .sort({ likes: -1, viewCount: -1 })
      .limit(limit),
    { includeComments: false },
  );
};

const findRecentPosts = async limit => {
  return applyAuthorPopulation(
    CommunityPost.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit),
    { includeComments: false },
  );
};

const findPostById = async (id, { includeComments = false } = {}) => {
  return applyAuthorPopulation(CommunityPost.findById(id), { includeComments });
};

const findPostDocumentById = async id => {
  return CommunityPost.findById(id);
};

const createPost = async data => {
  const post = new CommunityPost(data);
  return post.save();
};

const savePost = async post => {
  return post.save();
};

const findCommentsByPostId = async id => {
  return applyAuthorPopulation(CommunityPost.findById(id).select('comments'), {
    includeComments: true,
  }).lean();
};

module.exports = {
  findPosts,
  countPosts,
  findPopularPosts,
  findRecentPosts,
  findPostById,
  findPostDocumentById,
  createPost,
  savePost,
  findCommentsByPostId,
};
