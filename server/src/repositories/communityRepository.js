const { prisma } = require('../lib/prisma');
const { Prisma } = require('@prisma/client');

const AUTHOR_SELECT = {
  id: true,
  name: true,
  role: true,
  avatar: true,
};

const REACTION_TYPE = {
  like: 'LIKE',
  dislike: 'DISLIKE',
};

const buildPostWhere = ({ search, category }) => {
  const where = {
    isActive: true,
  };

  if (category && category !== 'all') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } },
    ];
  }

  return where;
};

const buildPostOrderBy = sortBy => {
  switch (sortBy) {
    case 'popular':
      return [
        { reactions: { _count: 'desc' } },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ];
    case 'oldest':
      return [{ createdAt: 'asc' }];
    case 'latest':
    default:
      return [{ createdAt: 'desc' }];
  }
};

const mapReactions = (reactions = [], currentUserId = null) => {
  const likes = [];
  const dislikes = [];

  reactions.forEach(reaction => {
    if (reaction.type === 'LIKE') {
      likes.push(reaction.userId);
    } else if (reaction.type === 'DISLIKE') {
      dislikes.push(reaction.userId);
    }
  });

  const userReaction = currentUserId
    ? likes.includes(currentUserId)
      ? 'LIKE'
      : dislikes.includes(currentUserId)
        ? 'DISLIKE'
        : null
    : null;

  return {
    likes,
    dislikes,
    likeCount: likes.length,
    dislikeCount: dislikes.length,
    userReaction,
    isLiked: userReaction === 'LIKE',
    isDisliked: userReaction === 'DISLIKE',
  };
};

const mapReply = (reply, currentUserId) => ({
  id: reply.id,
  authorId: reply.authorId,
  authorName: reply.authorName,
  author: reply.author,
  content: reply.content,
  createdAt: reply.createdAt,
  updatedAt: reply.updatedAt,
  ...mapReactions(reply.reactions ?? [], currentUserId),
});

const mapComment = (comment, currentUserId) => ({
  id: comment.id,
  postId: comment.postId,
  authorId: comment.authorId,
  authorName: comment.authorName,
  author: comment.author,
  content: comment.content,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
  ...mapReactions(comment.reactions ?? [], currentUserId),
  replies: (comment.replies ?? [])
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(reply => mapReply(reply, currentUserId)),
});

const mapPost = (post, { includeComments = false, currentUserId = null } = {}) => ({
  id: post.id,
  title: post.title,
  content: post.content,
  authorId: post.authorId,
  authorName: post.authorName,
  author: post.author,
  category: post.category,
  tags: post.tags,
  images: post.images,
  isReported: post.isReported,
  isActive: post.isActive,
  deletedAt: post.deletedAt,
  viewCount: post.viewCount,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  ...mapReactions(post.reactions ?? [], currentUserId),
  comments: includeComments
    ? post.comments
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(comment => mapComment(comment, currentUserId))
    : undefined,
});

const findPosts = async ({ search, category, sortBy, skip, limit, currentUserId }) => {
  const posts = await prisma.communityPost.findMany({
    where: buildPostWhere({ search, category }),
    orderBy: buildPostOrderBy(sortBy),
    skip,
    take: limit,
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return posts.map(post => mapPost(post, { includeComments: false, currentUserId }));
};

const countPosts = async ({ search, category }) => {
  return prisma.communityPost.count({
    where: buildPostWhere({ search, category }),
  });
};

const findPopularPosts = async ({ limit, currentUserId }) => {
  const posts = await prisma.communityPost.findMany({
    where: { isActive: true },
    orderBy: [
      { reactions: { _count: 'desc' } },
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return posts.map(post => mapPost(post, { includeComments: false, currentUserId }));
};

const findRecentPosts = async ({ limit, currentUserId }) => {
  const posts = await prisma.communityPost.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: 'desc' }],
    take: limit,
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return posts.map(post => mapPost(post, { includeComments: false, currentUserId }));
};

const findPostById = async (id, { includeComments = false, currentUserId = null } = {}) => {
  const post = await prisma.communityPost.findUnique({
    where: { id },
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
      comments: includeComments
        ? {
            orderBy: { createdAt: 'asc' },
            include: {
              author: { select: AUTHOR_SELECT },
              reactions: { select: { userId: true, type: true } },
              replies: {
                orderBy: { createdAt: 'asc' },
                include: {
                  author: { select: AUTHOR_SELECT },
                  reactions: { select: { userId: true, type: true } },
                },
              },
            },
          }
        : false,
    },
  });

  if (!post) {
    return null;
  }

  return mapPost(post, { includeComments, currentUserId });
};

const incrementPostView = async id => {
  const result = await prisma.communityPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });

  return result.viewCount;
};

const createPost = async data => {
  const post = await prisma.communityPost.create({
    data,
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return mapPost(post);
};

const updatePost = async (id, data) => {
  const post = await prisma.communityPost.update({
    where: { id },
    data,
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return mapPost(post);
};

const softDeletePost = async id => {
  await prisma.communityPost.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};

const upsertPostReaction = async (postId, userId, reaction) => {
  const reactionType = REACTION_TYPE[reaction];

  if (!reactionType) {
    throw new Prisma.PrismaClientValidationError('Invalid reaction type');
  }

  return prisma.$transaction(async tx => {
    await tx.communityPostReaction.deleteMany({
      where: { postId, userId },
    });

    if (reactionType) {
      await tx.communityPostReaction.create({
        data: {
          postId,
          userId,
          type: reactionType,
        },
      });
    }

    const reactions = await tx.communityPostReaction.findMany({
      where: { postId },
      select: { userId: true, type: true },
    });

    return mapReactions(reactions, userId);
  });
};

const removePostReaction = async (postId, userId) => {
  await prisma.communityPostReaction.deleteMany({
    where: { postId, userId },
  });

  const reactions = await prisma.communityPostReaction.findMany({
    where: { postId },
    select: { userId: true, type: true },
  });

  return mapReactions(reactions, userId);
};

const createPostReport = async (postId, reporterId, reason) => {
  await prisma.communityPostReport.create({
    data: {
      postId,
      reporterId,
      reason,
    },
  });

  const reportCount = await prisma.communityPostReport.count({
    where: { postId },
  });

  if (reportCount >= 5) {
    await prisma.communityPost.update({
      where: { id: postId },
      data: {
        isActive: false,
        isReported: true,
      },
    });
  }
};

const hasUserReportedPost = async (postId, reporterId) => {
  const existing = await prisma.communityPostReport.findFirst({
    where: { postId, reporterId },
    select: { id: true },
  });

  return Boolean(existing);
};

const createComment = async ({
  postId,
  authorId,
  authorName,
  content,
}) => {
  const comment = await prisma.communityPostComment.create({
    data: {
      postId,
      authorId,
      authorName,
      content,
    },
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
      replies: {
        include: {
          author: { select: AUTHOR_SELECT },
          reactions: { select: { userId: true, type: true } },
        },
      },
    },
  });

  return mapComment(comment, null);
};

const createReply = async ({
  commentId,
  authorId,
  authorName,
  content,
}) => {
  const reply = await prisma.communityPostReply.create({
    data: {
      commentId,
      authorId,
      authorName,
      content,
    },
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return mapReply(reply, null);
};

const updateCommentContent = async (id, content) => {
  const comment = await prisma.communityPostComment.update({
    where: { id },
    data: { content },
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
      replies: {
        include: {
          author: { select: AUTHOR_SELECT },
          reactions: { select: { userId: true, type: true } },
        },
      },
    },
  });

  return mapComment(comment, null);
};

const updateReplyContent = async (id, content) => {
  const reply = await prisma.communityPostReply.update({
    where: { id },
    data: { content },
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
    },
  });

  return mapReply(reply, null);
};

const deleteComment = async id => {
  await prisma.communityPostReply.deleteMany({ where: { commentId: id } });
  await prisma.communityCommentReaction.deleteMany({ where: { commentId: id } });
  await prisma.communityPostComment.delete({ where: { id } });
};

const deleteReply = async id => {
  await prisma.communityCommentReaction.deleteMany({ where: { replyId: id } });
  await prisma.communityPostReply.delete({ where: { id } });
};

const findCommentsByPostId = async ({
  postId,
  skip,
  take,
  order = 'desc',
  currentUserId,
}) => {
  const comments = await prisma.communityPostComment.findMany({
    where: { postId },
    orderBy: { createdAt: order === 'desc' ? 'desc' : 'asc' },
    skip,
    take,
    include: {
      author: { select: AUTHOR_SELECT },
      reactions: { select: { userId: true, type: true } },
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          author: { select: AUTHOR_SELECT },
          reactions: { select: { userId: true, type: true } },
        },
      },
    },
  });

  const total = await prisma.communityPostComment.count({ where: { postId } });

  return {
    comments: comments.map(comment => mapComment(comment, currentUserId)),
    total,
  };
};

const upsertCommentReaction = async ({
  commentId,
  replyId = null,
  userId,
  reaction,
}) => {
  const reactionType = REACTION_TYPE[reaction];

  if (!reactionType) {
    throw new Prisma.PrismaClientValidationError('Invalid reaction type');
  }

  return prisma.$transaction(async tx => {
    if (commentId) {
      await tx.communityCommentReaction.deleteMany({
        where: { commentId, userId },
      });

      await tx.communityCommentReaction.create({
        data: {
          commentId,
          userId,
          type: reactionType,
        },
      });

      const reactions = await tx.communityCommentReaction.findMany({
        where: { commentId },
      });

      return mapReactions(reactions, userId);
    }

    await tx.communityCommentReaction.deleteMany({
      where: { replyId, userId },
    });

    await tx.communityCommentReaction.create({
      data: {
        replyId,
        userId,
        type: reactionType,
      },
    });

    const reactions = await tx.communityCommentReaction.findMany({
      where: { replyId },
    });

    return mapReactions(reactions, userId);
  });
};

const removeCommentReaction = async ({ commentId = null, replyId = null, userId }) => {
  await prisma.communityCommentReaction.deleteMany({
    where: {
      commentId,
      replyId,
      userId,
    },
  });

  const reactions = await prisma.communityCommentReaction.findMany({
    where: commentId ? { commentId } : { replyId },
  });

  return mapReactions(reactions, userId);
};

const findCommentRecordById = async id => {
  return prisma.communityPostComment.findUnique({
    where: { id },
    select: {
      id: true,
      postId: true,
      authorId: true,
    },
  });
};

const findReplyRecordById = async id => {
  return prisma.communityPostReply.findUnique({
    where: { id },
    select: {
      id: true,
      commentId: true,
      authorId: true,
      comment: { select: { postId: true } },
    },
  });
};

module.exports = {
  findPosts,
  countPosts,
  findPopularPosts,
  findRecentPosts,
  findPostById,
  incrementPostView,
  createPost,
  updatePost,
  softDeletePost,
  upsertPostReaction,
  removePostReaction,
  createPostReport,
  createComment,
  createReply,
  updateCommentContent,
  updateReplyContent,
  deleteComment,
  deleteReply,
  findCommentsByPostId,
  upsertCommentReaction,
  removeCommentReaction,
  findCommentRecordById,
  findReplyRecordById,
  hasUserReportedPost,
};
