const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const auth = require('../middleware/auth');
const communityController = require('../src/controllers/communityController');

const validateObjectIdParam = (param, message) => (req, res, next) => {
  const value = req.params[param];

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  next();
};

const validateCreatePost = (req, res, next) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({
      success: false,
      message: '제목, 내용, 카테고리는 필수입니다.',
    });
  }

  next();
};

const validateReactionBody = (req, res, next) => {
  const { reaction } = req.body;

  if (!reaction) {
    return res.status(400).json({
      success: false,
      message: '반응 타입을 지정해주세요.',
    });
  }

  next();
};

const validateReportBody = (req, res, next) => {
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({
      success: false,
      message: '신고 사유를 입력해주세요.',
    });
  }

  next();
};

const validateCommentBody = (req, res, next) => {
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: '댓글 내용을 입력해주세요.',
    });
  }

  next();
};

const validatePostId = validateObjectIdParam(
  'id',
  '유효하지 않은 포스트 ID입니다.',
);
const validateCommentId = validateObjectIdParam(
  'commentId',
  '유효하지 않은 댓글 ID입니다.',
);

router.get('/posts/test', communityController.getTestStatus);
router.get('/categories', communityController.getCategories);
router.get('/posts', communityController.getPosts);
router.get('/posts/popular', communityController.getPopularPosts);
router.get('/posts/recent', communityController.getRecentPosts);
router.get('/posts/:id', validatePostId, communityController.getPostById);
router.post(
  '/posts/:id/views',
  validatePostId,
  communityController.incrementPostView,
);
router.get(
  '/posts/:id/reactions',
  auth,
  validatePostId,
  communityController.getPostReactions,
);
router.post('/posts', auth, validateCreatePost, communityController.createPost);
router.put('/posts/:id', auth, validatePostId, communityController.updatePost);
router.delete(
  '/posts/:id',
  auth,
  validatePostId,
  communityController.deletePost,
);
router.post(
  '/posts/:id/reactions',
  auth,
  validatePostId,
  validateReactionBody,
  communityController.updatePostReaction,
);
router.post(
  '/posts/:id/report',
  auth,
  validatePostId,
  validateReportBody,
  communityController.reportPost,
);
router.get(
  '/posts/:id/comments',
  validatePostId,
  communityController.getComments,
);
router.post(
  '/posts/:id/comments',
  auth,
  validatePostId,
  validateCommentBody,
  communityController.addComment,
);
router.put(
  '/posts/:id/comments/:commentId',
  auth,
  validatePostId,
  validateCommentId,
  validateCommentBody,
  communityController.updateComment,
);
router.delete(
  '/posts/:id/comments/:commentId',
  auth,
  validatePostId,
  validateCommentId,
  communityController.deleteComment,
);
router.post(
  '/posts/:id/comments/:commentId/reactions',
  auth,
  validatePostId,
  validateCommentId,
  validateReactionBody,
  communityController.reactToComment,
);

module.exports = router;
