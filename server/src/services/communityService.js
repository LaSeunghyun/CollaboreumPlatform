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

const parsePositiveInt = (value, defaultValue) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return defaultValue;
  }
  return parsed;
};

const ensureActivePost = (
  post,
  notFoundMessage = '포스트를 찾을 수 없습니다.',
) => {
  if (!post || !post.isActive) {
    throw new NotFoundError(notFoundMessage);
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

  const query = { isActive: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (category && category !== 'all') {
    query.category = category;
  }

  const skip = (parsedPage - 1) * parsedLimit;

  let sortQuery = { createdAt: -1 };
  switch (sortBy) {
    case 'popular':
      sortQuery = { likes: -1, viewCount: -1 };
      break;
    case 'oldest':
      sortQuery = { createdAt: 1 };
      break;
    case 'latest':
    default:
      sortQuery = { createdAt: -1 };
      break;
  }

  const [posts, total] = await Promise.all([
    communityRepository.findPosts({
      query,
      sort: sortQuery,
      skip,
      limit: parsedLimit,
    }),
    communityRepository.countPosts(query),
  ]);

  return {
    posts,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      pages: Math.ceil(total / parsedLimit),
    },
  };
};

const getPopularPosts = async ({ limit = 10 }) => {
  const parsedLimit = parsePositiveInt(limit, 10);
  return communityRepository.findPopularPosts(parsedLimit);
};

const getRecentPosts = async ({ limit = 10 }) => {
  const parsedLimit = parsePositiveInt(limit, 10);
  return communityRepository.findRecentPosts(parsedLimit);
};

const getPostById = async id => {
  const post = await communityRepository.findPostById(id, {
    includeComments: true,
  });
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  post.viewCount += 1;
  await communityRepository.savePost(post);

  return post;
};

const incrementPostView = async id => {
  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  post.viewCount += 1;
  await communityRepository.savePost(post);

  return post.viewCount;
};

const getPostReactions = async (id, userId) => {
  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const userIdString = userId.toString();
  const isLiked = post.likes.some(like => like.toString() === userIdString);
  const isDisliked = post.dislikes.some(
    dislike => dislike.toString() === userIdString,
  );

  return {
    isLiked,
    isDisliked,
    likes: post.likes.length,
    dislikes: post.dislikes.length,
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

  const createdPost = await communityRepository.createPost({
    title,
    content,
    category,
    tags,
    images,
    author,
    authorName: authorName || '사용자',
  });

  return communityRepository.findPostById(createdPost._id, {
    includeComments: false,
  });
};

const updatePost = async (id, user, { title, content, category, tags }) => {
  const post = await communityRepository.findPostDocumentById(id);
  if (!post) {
    throw new NotFoundError('포스트를 찾을 수 없습니다.');
  }

  if (post.author.toString() !== user._id && user.role !== 'admin') {
    throw new AuthorizationError('포스트를 수정할 권한이 없습니다.');
  }

  post.title = title || post.title;
  post.content = content || post.content;
  post.category = category || post.category;
  post.tags = tags || post.tags;
  post.updatedAt = new Date();

  await communityRepository.savePost(post);

  return communityRepository.findPostById(id, { includeComments: false });
};

const deletePost = async (id, user) => {
  const post = await communityRepository.findPostDocumentById(id);
  if (!post) {
    throw new NotFoundError('포스트를 찾을 수 없습니다.');
  }

  if (post.author.toString() !== user._id && user.role !== 'admin') {
    throw new AuthorizationError('포스트를 삭제할 권한이 없습니다.');
  }

  post.isActive = false;
  post.deletedAt = new Date();

  await communityRepository.savePost(post);
};

const updatePostReaction = async (id, userId, reaction) => {
  if (!['like', 'dislike', 'unlike', 'undislike'].includes(reaction)) {
    throw new ValidationError('유효하지 않은 반응 타입입니다.');
  }

  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const userIdString = userId.toString();
  const isLiked = post.likes.some(like => like.toString() === userIdString);
  const isDisliked = post.dislikes.some(
    dislike => dislike.toString() === userIdString,
  );

  if (reaction === 'like') {
    if (isLiked) {
      post.likes = post.likes.filter(like => like.toString() !== userIdString);
    } else {
      post.likes.push(userId);
      post.dislikes = post.dislikes.filter(
        dislike => dislike.toString() !== userIdString,
      );
    }
  } else if (reaction === 'dislike') {
    if (isDisliked) {
      post.dislikes = post.dislikes.filter(
        dislike => dislike.toString() !== userIdString,
      );
    } else {
      post.dislikes.push(userId);
      post.likes = post.likes.filter(like => like.toString() !== userIdString);
    }
  } else if (reaction === 'unlike') {
    post.likes = post.likes.filter(like => like.toString() !== userIdString);
  } else if (reaction === 'undislike') {
    post.dislikes = post.dislikes.filter(
      dislike => dislike.toString() !== userIdString,
    );
  }

  await communityRepository.savePost(post);

  return {
    likes: post.likes.length,
    dislikes: post.dislikes.length,
    isLiked: post.likes.some(like => like.toString() === userIdString),
    isDisliked: post.dislikes.some(
      dislike => dislike.toString() === userIdString,
    ),
  };
};

const reportPost = async (id, userId, reason) => {
  if (!reason) {
    throw new ValidationError('신고 사유를 입력해주세요.');
  }

  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const alreadyReported = post.reports.some(
    report => report.reporter.toString() === userId.toString(),
  );
  if (alreadyReported) {
    throw new ValidationError('이미 신고한 포스트입니다.');
  }

  post.reports.push({
    reporter: userId,
    reason,
    reportedAt: new Date(),
  });

  if (post.reports.length >= 5) {
    post.isActive = false;
    post.isReported = true;
  }

  await communityRepository.savePost(post);
};

const getComments = async (
  id,
  { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' },
) => {
  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = parsePositiveInt(limit, 20);

  const commentsDocument = await communityRepository.findCommentsByPostId(id);

  if (!commentsDocument) {
    return {
      comments: [],
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: 0,
        pages: 0,
      },
    };
  }

  const sortOrder = order === 'desc' ? -1 : 1;
  const sortedComments = [...commentsDocument.comments].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return sortOrder === -1
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt);
    }

    return 0;
  });

  const skip = (parsedPage - 1) * parsedLimit;
  const paginatedComments = sortedComments.slice(skip, skip + parsedLimit);

  return {
    comments: paginatedComments,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total: commentsDocument.comments.length,
      pages: Math.ceil(commentsDocument.comments.length / parsedLimit),
    },
  };
};

const addComment = async (id, user, { content, parentId }) => {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('댓글 내용을 입력해주세요.');
  }

  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  const newComment = {
    author: user._id,
    authorName: user.name || '사용자',
    content: content.trim(),
    parentId: parentId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    likes: [],
    dislikes: [],
    replies: [],
  };

  if (parentId) {
    const parentComment = post.comments.id(parentId);
    if (!parentComment) {
      throw new NotFoundError('상위 댓글을 찾을 수 없습니다.');
    }
    parentComment.replies.push(newComment);
  } else {
    post.comments.push(newComment);
  }

  await communityRepository.savePost(post);

  const populatedPost = await communityRepository.findPostById(id, {
    includeComments: true,
  });

  if (parentId) {
    const parent = populatedPost.comments.id(parentId);
    return parent.replies[parent.replies.length - 1];
  }

  return populatedPost.comments[populatedPost.comments.length - 1];
};

const updateComment = async (id, commentId, user, content) => {
  if (!content || content.trim().length === 0) {
    throw new ValidationError('댓글 내용을 입력해주세요.');
  }

  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  let comment = post.comments.id(commentId);
  let parentComment = null;

  if (!comment) {
    for (const current of post.comments) {
      const reply = current.replies.id(commentId);
      if (reply) {
        comment = reply;
        parentComment = current;
        break;
      }
    }
  }

  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (comment.author.toString() !== user._id && user.role !== 'admin') {
    throw new AuthorizationError('댓글을 수정할 권한이 없습니다.');
  }

  comment.content = content.trim();
  comment.updatedAt = new Date();

  await communityRepository.savePost(post);

  return parentComment
    ? parentComment.replies.id(commentId)
    : post.comments.id(commentId);
};

const deleteComment = async (id, commentId, user) => {
  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  let comment = post.comments.id(commentId);
  let parentComment = null;

  if (!comment) {
    for (const current of post.comments) {
      const reply = current.replies.id(commentId);
      if (reply) {
        comment = reply;
        parentComment = current;
        break;
      }
    }
  }

  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  if (comment.author.toString() !== user._id && user.role !== 'admin') {
    throw new AuthorizationError('댓글을 삭제할 권한이 없습니다.');
  }

  if (parentComment) {
    parentComment.replies.pull(commentId);
  } else {
    post.comments.pull(commentId);
  }

  await communityRepository.savePost(post);
};

const reactToComment = async (id, commentId, userId, reaction) => {
  if (!['like', 'dislike', 'unlike'].includes(reaction)) {
    throw new ValidationError('유효하지 않은 반응 타입입니다.');
  }

  const post = await communityRepository.findPostDocumentById(id);
  ensureActivePost(post, '포스트를 찾을 수 없습니다.');

  let comment = post.comments.id(commentId);
  if (!comment) {
    for (const current of post.comments) {
      const reply = current.replies.id(commentId);
      if (reply) {
        comment = reply;
        break;
      }
    }
  }

  if (!comment) {
    throw new NotFoundError('댓글을 찾을 수 없습니다.');
  }

  const userIdString = userId.toString();

  if (reaction === 'like') {
    if (comment.likes.some(like => like.toString() === userIdString)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
      comment.dislikes.pull(userId);
    }
  } else if (reaction === 'dislike') {
    if (comment.dislikes.some(dislike => dislike.toString() === userIdString)) {
      comment.dislikes.pull(userId);
    } else {
      comment.dislikes.push(userId);
      comment.likes.pull(userId);
    }
  } else if (reaction === 'unlike') {
    comment.likes.pull(userId);
    comment.dislikes.pull(userId);
  }

  await communityRepository.savePost(post);

  return {
    likes: comment.likes.length,
    dislikes: comment.dislikes.length,
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
