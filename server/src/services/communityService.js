const {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} = require('../errors/AppError');
const communityRepository = require('../repositories/communityRepository');

const DEFAULT_CATEGORIES = [
  { value: '자유', label: '자유', color: 'bg-blue-100 text-blue-700' },
  { value: '질문', label: '질문', color: 'bg-yellow-100 text-yellow-700' },
  { value: '음악', label: '음악', color: 'bg-purple-100 text-purple-700' },
  { value: '미술', label: '미술', color: 'bg-pink-100 text-pink-700' },
  { value: '문학', label: '문학', color: 'bg-green-100 text-green-700' },
  { value: '공연', label: '공연', color: 'bg-orange-100 text-orange-700' },
  { value: '사진', label: '사진', color: 'bg-indigo-100 text-indigo-700' },
  { value: '기술', label: '기술', color: 'bg-cyan-100 text-cyan-700' },
  { value: '기타', label: '기타', color: 'bg-gray-100 text-gray-700' },
];

const CATEGORY_TO_ENUM = {
  자유: 'FREE',
  질문: 'QUESTION',
  음악: 'MUSIC',
  미술: 'ART',
  문학: 'LITERATURE',
  공연: 'PERFORMANCE',
  사진: 'PHOTOGRAPHY',
  기술: 'TECHNOLOGY',
  기타: 'OTHER',
};

const CATEGORY_FROM_ENUM = Object.entries(CATEGORY_TO_ENUM).reduce(
  (acc, [label, enumValue]) => {
    acc[enumValue] = label;
    return acc;
  },
  {},
);

const normalizeId = value => {
  if (value === null || value === undefined) {
    return null;
  }

  return typeof value === 'string' ? value : value.toString();
};

const parsePositiveInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }
  return parsed;
};

const ensureActivePost = (post, message = '포스트를 찾을 수 없습니다.') => {
  if (!post || !post.isActive) {
    throw new NotFoundError(message);
  }
};

const getCategories = () => DEFAULT_CATEGORIES;

const getPosts = async ({
  page = 1,
  limit = 20,
  search = '',
  category = '',
  sortBy = 'latest',
}) => {
  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = parsePositiveInt(limit, 20);
  const skip = (parsedPage - 1) * parsedLimit;

  const [posts, total] = await Promise.all([
    communityRepository.findPosts({
      search,
      category: CATEGORY_TO_ENUM[category] || category,
      sortBy,
      skip,
      limit: parsedLimit,
      currentUserId: null,
    }),
    communityRepository.countPosts({ search, category }),
  ]);

  return {
    posts: posts.map(post => ({
      ...post,
      category: CATEGORY_FROM_ENUM[post.category] || post.category,
    })),
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

const getPopularPosts = async ({ limit = 10 } = {}) => {
  const parsedLimit = parsePositiveInt(limit, 10);
  const posts = await communityRepository.findPopularPosts({
    limit: parsedLimit,
    currentUserId: null,
  });
  return posts.map(post => ({
    ...post,
    category: CATEGORY_FROM_ENUM[post.category] || post.category,
  }));
};

const getRecentPosts = async ({ limit = 10 } = {}) => {
  const parsedLimit = parsePositiveInt(limit, 10);
  const posts = await communityRepository.findRecentPosts({
    limit: parsedLimit,
    currentUserId: null,
  });
  return posts.map(post => ({
    ...post,
    category: CATEGORY_FROM_ENUM[post.category] || post.category,
  }));
};

const getPostById = async (id, currentUserId = null) => {
  const post = await communityRepository.findPostById(id, {
    includeComments: true,
    currentUserId: normalizeId(currentUserId),
  });
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const nextViewCount = await communityRepository.incrementPostView(id);

  return {
    ...post,
    category: CATEGORY_FROM_ENUM[post.category] || post.category,
    viewCount: nextViewCount,
  };
};

const incrementPostView = async id => {
  ensureActivePost(await communityRepository.findPostById(id));
  return communityRepository.incrementPostView(id);
};

const getPostReactions = async (id, userId) => {
  const post = await communityRepository.findPostById(id, {
    includeComments: false,
    currentUserId: normalizeId(userId),
  });
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  return {
    isLiked: post.userReaction === 'LIKE',
    isDisliked: post.userReaction === 'DISLIKE',
    likes: post.likeCount,
    dislikes: post.dislikeCount,
  };
};

const createPost = async ({
  title,
  content,
  category,
  tags = [],
  images = [],
  author,
  authorName,
}) => {
  if (!title || !content || !category) {
    throw new ValidationError('제목, 내용, 카테고리는 필수입니다.');
  }

  const post = await communityRepository.createPost({
    title,
    content,
    category: CATEGORY_TO_ENUM[category] || category,
    tags,
    images,
    authorId: author,
    authorName: authorName || '사용자',
  });

  return {
    ...post,
    category: CATEGORY_FROM_ENUM[post.category] || post.category,
  };
};

const assertCanMutatePost = (post, user) => {
  const userId = normalizeId(user._id);
  if (post.authorId !== userId && user.role !== 'admin') {
    throw new AuthorizationError('포스트를 수정할 권한이 없습니다.');
  }
};

const updatePost = async (id, user, { title, content, category, tags, images }) => {
  const post = await communityRepository.findPostById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');
  assertCanMutatePost(post, user);

  const updated = await communityRepository.updatePost(id, {
    title: title ?? post.title,
    content: content ?? post.content,
    category: category
      ? CATEGORY_TO_ENUM[category] || category
      : post.category,
    tags: tags ?? post.tags,
    images: images ?? post.images,
  });

  return {
    ...updated,
    category: CATEGORY_FROM_ENUM[updated.category] || updated.category,
  };
};

const deletePost = async (id, user) => {
  const post = await communityRepository.findPostById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');
  assertCanMutatePost(post, user);

  await communityRepository.softDeletePost(id);
};

const updatePostReaction = async (id, userId, reaction) => {
  if (!['like', 'dislike', 'unlike', 'undislike'].includes(reaction)) {
    throw new ValidationError('유효하지 않은 반응 타입입니다.');
  }

  const normalizedUserId = normalizeId(userId);

  const post = await communityRepository.findPostById(id, {
    includeComments: false,
    currentUserId: normalizedUserId,
  });
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const currentReaction = post.userReaction;
  let stats;

  if (reaction === 'like') {
    stats =
      currentReaction === 'LIKE'
        ? await communityRepository.removePostReaction(id, normalizedUserId)
        : await communityRepository.upsertPostReaction(id, normalizedUserId, 'like');
  } else if (reaction === 'dislike') {
    stats =
      currentReaction === 'DISLIKE'
        ? await communityRepository.removePostReaction(id, normalizedUserId)
        : await communityRepository.upsertPostReaction(id, normalizedUserId, 'dislike');
  } else {
    stats = await communityRepository.removePostReaction(id, normalizedUserId);
  }

  return {
    likes: stats.likeCount,
    dislikes: stats.dislikeCount,
    isLiked: stats.userReaction === 'LIKE',
    isDisliked: stats.userReaction === 'DISLIKE',
  };
};

const reportPost = async (id, userId, reason) => {
  if (!reason) {
    throw new ValidationError('신고 사유를 입력해주세요.');
  }

  const normalizedUserId = normalizeId(userId);

  const post = await communityRepository.findPostById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const alreadyReported = await communityRepository.hasUserReportedPost(
    id,
    normalizedUserId,
  );
  if (alreadyReported) {
    throw new ValidationError('이미 신고한 포스트입니다.');
  }

  await communityRepository.createPostReport(id, normalizedUserId, reason);
};

const getComments = async (
  id,
  { page = 1, limit = 20, order = 'desc' },
  currentUserId = null,
) => {
  const post = await communityRepository.findPostById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = parsePositiveInt(limit, 20);

  const sortOrder = order === 'asc' ? 'asc' : 'desc';
  const skip = (parsedPage - 1) * parsedLimit;

  const { comments, total } = await communityRepository.findCommentsByPostId({
    postId: id,
    skip,
    take: parsedLimit,
    order: sortOrder,
    currentUserId: normalizeId(currentUserId),
  });

  return {
    comments,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

const addComment = async (id, user, { content, parentId }) => {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('댓글 내용을 입력해주세요.');
  }

  const trimmedContent = content.trim();
  const post = await communityRepository.findPostById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  if (parentId) {
    const parent = await communityRepository.findCommentRecordById(parentId);
    if (!parent || parent.postId !== id) {
      throw new NotFoundError('상위 댓글을 찾을 수 없습니다.');
    }

    return communityRepository.createReply({
      commentId: parentId,
      authorId: normalizeId(user._id),
      authorName: user.name || '사용자',
      content: trimmedContent,
    });
  }

  return communityRepository.createComment({
    postId: id,
    authorId: normalizeId(user._id),
    authorName: user.name || '사용자',
    content: trimmedContent,
  });
};

const updateComment = async (id, commentId, user, content) => {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('댓글 내용을 입력해주세요.');
  }

  const trimmedContent = content.trim();

  const commentRecord = await communityRepository.findCommentRecordById(commentId);
  const userId = normalizeId(user._id);

  if (commentRecord) {
    if (commentRecord.postId !== id) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }
    if (commentRecord.authorId !== userId && user.role !== 'admin') {
      throw new AuthorizationError('댓글을 수정할 권한이 없습니다.');
    }

    return communityRepository.updateCommentContent(commentId, trimmedContent);
  }

  const replyRecord = await communityRepository.findReplyRecordById(commentId);
  if (!replyRecord || replyRecord.comment.postId !== id) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (replyRecord.authorId !== userId && user.role !== 'admin') {
    throw new AuthorizationError('댓글을 수정할 권한이 없습니다.');
  }

  return communityRepository.updateReplyContent(commentId, trimmedContent);
};

const deleteComment = async (id, commentId, user) => {
  const userId = normalizeId(user._id);
  const commentRecord = await communityRepository.findCommentRecordById(commentId);
  if (commentRecord) {
    if (commentRecord.postId !== id) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }
    if (commentRecord.authorId !== userId && user.role !== 'admin') {
      throw new AuthorizationError('댓글을 삭제할 권한이 없습니다.');
    }

    await communityRepository.deleteComment(commentId);
    return;
  }

  const replyRecord = await communityRepository.findReplyRecordById(commentId);
  if (!replyRecord || replyRecord.comment.postId !== id) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (replyRecord.authorId !== userId && user.role !== 'admin') {
    throw new AuthorizationError('댓글을 삭제할 권한이 없습니다.');
  }

  await communityRepository.deleteReply(commentId);
};

const reactToComment = async (id, commentId, userId, reaction) => {
  if (!['like', 'dislike', 'unlike'].includes(reaction)) {
    throw new ValidationError('유효하지 않은 반응 타입입니다.');
  }

  const normalizedUserId = normalizeId(userId);

  const commentRecord = await communityRepository.findCommentRecordById(commentId);

  if (commentRecord) {
    if (commentRecord.postId !== id) {
      throw new NotFoundError('댓글을 찾을 수 없습니다.');
    }

    if (reaction === 'unlike') {
      const stats = await communityRepository.removeCommentReaction({
        commentId,
        userId: normalizedUserId,
      });
      return {
        likes: stats.likeCount,
        dislikes: stats.dislikeCount,
      };
    }

    const stats = await communityRepository.upsertCommentReaction({
      commentId,
      userId: normalizedUserId,
      reaction,
    });
    return {
      likes: stats.likeCount,
      dislikes: stats.dislikeCount,
    };
  }

  const replyRecord = await communityRepository.findReplyRecordById(commentId);
  if (!replyRecord || replyRecord.comment.postId !== id) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (reaction === 'unlike') {
    const stats = await communityRepository.removeCommentReaction({
      replyId: commentId,
      userId: normalizedUserId,
    });
    return {
      likes: stats.likeCount,
      dislikes: stats.dislikeCount,
    };
  }

  const stats = await communityRepository.upsertCommentReaction({
    replyId: commentId,
    userId: normalizedUserId,
    reaction,
  });
  return {
    likes: stats.likeCount,
    dislikes: stats.dislikeCount,
  };
};

module.exports = {
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
