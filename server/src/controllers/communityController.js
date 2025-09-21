const communityService = require('../services/communityService');

const handleController = handler => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

const getTestStatus = handleController(async (_req, res) => {
  res.json({
    success: true,
    message: '테스트 엔드포인트 작동 중',
    timestamp: new Date().toISOString(),
  });
});

const getCategories = handleController(async (_req, res) => {
  const categories = communityService.getCategories();
  res.json({
    success: true,
    data: categories,
  });
});

const getPosts = handleController(async (req, res) => {
  const { posts, pagination } = await communityService.getPosts(req.query);
  res.json({
    success: true,
    posts,
    pagination,
  });
});

const getPopularPosts = handleController(async (req, res) => {
  const posts = await communityService.getPopularPosts(req.query);
  res.json({
    success: true,
    data: posts,
  });
});

const getRecentPosts = handleController(async (req, res) => {
  const posts = await communityService.getRecentPosts(req.query);
  res.json({
    success: true,
    data: posts,
  });
});

const getPostById = handleController(async (req, res) => {
  const post = await communityService.getPostById(req.params.id);
  res.json({
    success: true,
    data: post,
  });
});

const incrementPostView = handleController(async (req, res) => {
  const views = await communityService.incrementPostView(req.params.id);
  res.json({
    success: true,
    message: '조회수가 증가되었습니다.',
    data: { views },
  });
});

const getPostReactions = handleController(async (req, res) => {
  const data = await communityService.getPostReactions(
    req.params.id,
    req.user._id,
  );
  res.json({
    success: true,
    data,
  });
});

const createPost = handleController(async (req, res) => {
  const post = await communityService.createPost({
    ...req.body,
    author: req.user._id,
    authorName: req.body.authorName,
  });

  res.status(201).json({
    success: true,
    data: post,
    message: '포스트가 생성되었습니다.',
  });
});

const updatePost = handleController(async (req, res) => {
  const post = await communityService.updatePost(
    req.params.id,
    req.user,
    req.body,
  );
  res.json({
    success: true,
    data: post,
    message: '포스트가 수정되었습니다.',
  });
});

const deletePost = handleController(async (req, res) => {
  await communityService.deletePost(req.params.id, req.user);
  res.json({
    success: true,
    message: '포스트가 삭제되었습니다.',
  });
});

const updatePostReaction = handleController(async (req, res) => {
  const data = await communityService.updatePostReaction(
    req.params.id,
    req.user._id,
    req.body.reaction,
  );
  res.json({
    success: true,
    data,
    message: '반응이 업데이트되었습니다.',
  });
});

const reportPost = handleController(async (req, res) => {
  await communityService.reportPost(
    req.params.id,
    req.user._id,
    req.body.reason,
  );
  res.json({
    success: true,
    message: '포스트가 신고되었습니다.',
  });
});

const getComments = handleController(async (req, res) => {
  const { comments, pagination } = await communityService.getComments(
    req.params.id,
    req.query,
  );
  res.json({
    success: true,
    data: comments,
    pagination,
  });
});

const addComment = handleController(async (req, res) => {
  const comment = await communityService.addComment(
    req.params.id,
    req.user,
    req.body,
  );
  res.status(201).json({
    success: true,
    message: '댓글이 작성되었습니다.',
    data: comment,
  });
});

const updateComment = handleController(async (req, res) => {
  const comment = await communityService.updateComment(
    req.params.id,
    req.params.commentId,
    req.user,
    req.body.content,
  );
  res.json({
    success: true,
    message: '댓글이 수정되었습니다.',
    data: comment,
  });
});

const deleteComment = handleController(async (req, res) => {
  await communityService.deleteComment(
    req.params.id,
    req.params.commentId,
    req.user,
  );
  res.json({
    success: true,
    message: '댓글이 삭제되었습니다.',
  });
});

const reactToComment = handleController(async (req, res) => {
  const data = await communityService.reactToComment(
    req.params.id,
    req.params.commentId,
    req.user._id,
    req.body.reaction,
  );
  res.json({
    success: true,
    message: '반응이 업데이트되었습니다.',
    data,
  });
});

module.exports = {
  getTestStatus,
  getCategories,
  getPosts,
  getPopularPosts,
  getRecentPosts,
  getPostById,
  incrementPostView,
  getPostReactions,
  createPost,
  updatePost,
  deletePost,
  updatePostReaction,
  reportPost,
  getComments,
  addComment,
  updateComment,
  deleteComment,
  reactToComment,
};
