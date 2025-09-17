const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const auth = require('../middleware/auth');

// 디버그용 테스트 엔드포인트
router.get('/posts/test', async (req, res) => {
  res.json({
    success: true,
    message: '테스트 엔드포인트 작동 중',
    timestamp: new Date().toISOString()
  });
});

// 카테고리 목록 조회
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      { value: '자유', label: '자유', color: 'bg-blue-100 text-blue-700' },
      { value: '질문', label: '질문', color: 'bg-yellow-100 text-yellow-700' },
      { value: '음악', label: '음악', color: 'bg-purple-100 text-purple-700' },
      { value: '미술', label: '미술', color: 'bg-pink-100 text-pink-700' },
      { value: '문학', label: '문학', color: 'bg-green-100 text-green-700' },
      { value: '공연', label: '공연', color: 'bg-orange-100 text-orange-700' },
      { value: '사진', label: '사진', color: 'bg-indigo-100 text-indigo-700' },
      { value: '기술', label: '기술', color: 'bg-cyan-100 text-cyan-700' },
      { value: '기타', label: '기타', color: 'bg-gray-100 text-gray-700' }
    ];

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '카테고리를 불러올 수 없습니다.'
    });
  }
});

// 커뮤니티 포스트 목록 조회
router.get('/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category = '', sortBy = 'latest' } = req.query;
    
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (category && category !== 'all') query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let sortQuery = {};
    switch (sortBy) {
      case 'latest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popular':
        sortQuery = { likes: -1, viewCount: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }
    
    const posts = await CommunityPost.find(query)
      .populate('author', 'name role avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      success: true,
      posts: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('커뮤니티 포스트 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '커뮤니티 포스트를 불러올 수 없습니다.'
    });
  }
});

// 인기 게시글 조회 (구체적인 라우트를 먼저 정의)
router.get('/posts/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const posts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar')
      .sort({ likes: -1, viewCount: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('인기 게시글 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '인기 게시글을 불러올 수 없습니다.'
    });
  }
});

// 최신 게시글 조회 (구체적인 라우트를 먼저 정의)
router.get('/posts/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const posts = await CommunityPost.find({ isActive: true })
      .populate('author', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('최신 게시글 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '최신 게시글을 불러올 수 없습니다.'
    });
  }
});

// 특정 포스트 조회 (일반적인 라우트는 나중에 정의)
router.get('/posts/:id', async (req, res) => {
  console.log('=== 포스트 조회 라우트 진입 ===');
  console.log('요청 URL:', req.url);
  console.log('요청 파라미터:', req.params);
  console.log('요청 쿼리:', req.query);
  
  try {
    const { id } = req.params;
    console.log('포스트 조회 요청:', { id, timestamp: new Date().toISOString() });
    
    // ObjectId 유효성 검사
    if (!id || id.length !== 24) {
      console.log('유효하지 않은 ObjectId:', id);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 포스트 ID입니다.'
      });
    }

    console.log('데이터베이스 쿼리 시작...');
    const post = await CommunityPost.findById(id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar');

    console.log('데이터베이스 쿼리 완료');
    console.log('조회된 포스트:', post ? `존재함 (ID: ${post._id})` : '없음');

    if (!post) {
      console.log('포스트를 찾을 수 없음:', id);
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    if (!post.isActive) {
      console.log('비활성 포스트:', id);
      return res.status(404).json({
        success: false,
        message: '삭제된 포스트입니다.'
      });
    }

    // 조회수 증가
    post.viewCount += 1;
    await post.save();
    console.log('조회수 증가 완료:', post.viewCount);

    console.log('응답 전송 중...');
    res.json({
      success: true,
      data: post
    });
    console.log('응답 전송 완료');
  } catch (error) {
    console.error('포스트 조회 실패:', {
      error: error.message,
      stack: error.stack,
      id: req.params.id,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({
      success: false,
      message: '포스트를 불러올 수 없습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 포스트 조회수 증가 (별도 엔드포인트)
router.post('/posts/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('조회수 증가 요청:', { id });
    
    const post = await CommunityPost.findById(id);
    console.log('조회된 포스트:', post ? '존재함' : '없음');

    if (!post) {
      console.log('포스트를 찾을 수 없음:', id);
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    if (!post.isActive) {
      console.log('비활성 포스트:', id);
      return res.status(404).json({
        success: false,
        message: '삭제된 포스트입니다.'
      });
    }

    // 조회수 증가
    post.viewCount += 1;
    await post.save();
    console.log('조회수 증가 완료:', post.viewCount);

    res.json({
      success: true,
      message: '조회수가 증가되었습니다.',
      data: {
        views: post.viewCount
      }
    });
  } catch (error) {
    console.error('조회수 증가 실패:', error);
    res.status(500).json({
      success: false,
      message: '조회수 증가에 실패했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 포스트 사용자별 반응 상태 확인
router.get('/posts/:id/reactions', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    const isLiked = post.likes.includes(userId);
    const isDisliked = post.dislikes.includes(userId);
    
    res.json({
      success: true,
      data: {
        isLiked,
        isDisliked,
        likes: post.likes.length,
        dislikes: post.dislikes.length
      }
    });
  } catch (error) {
    console.error('반응 상태 확인 실패:', error);
    res.status(500).json({
      success: false,
      message: '반응 상태 확인에 실패했습니다.'
    });
  }
});

// 포스트 생성 (인증 필요)
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category, tags, images, authorName } = req.body;
    const author = req.user._id;

    console.log('포스트 생성 요청 데이터:', { title, content, category, tags, images, authorName, author });

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리는 필수입니다.'
      });
    }

    const post = new CommunityPost({
      title,
      content,
      category,
      tags: tags || [],
      images: images || [],
      author,
      authorName: authorName || '사용자'
    });

    await post.save();

    const populatedPost = await CommunityPost.findById(post._id)
      .populate('author', 'name role avatar');

    res.status(201).json({
      success: true,
      data: populatedPost,
      message: '포스트가 생성되었습니다.'
    });
  } catch (error) {
    console.error('포스트 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '포스트를 생성할 수 없습니다.',
      error: error.message
    });
  }
});

// 포스트 수정 (인증 필요)
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    if (post.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '포스트를 수정할 권한이 없습니다.'
      });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.updatedAt = new Date();

    await post.save();

    const updatedPost = await CommunityPost.findById(id)
      .populate('author', 'name role avatar');

    res.json({
      success: true,
      data: updatedPost,
      message: '포스트가 수정되었습니다.'
    });
  } catch (error) {
    console.error('포스트 수정 실패:', error);
    res.status(500).json({
      success: false,
      message: '포스트를 수정할 수 없습니다.'
    });
  }
});

// 포스트 삭제 (인증 필요)
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    if (post.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '포스트를 삭제할 권한이 없습니다.'
      });
    }

    // 실제 삭제 대신 비활성화
    post.isActive = false;
    post.deletedAt = new Date();
    await post.save();

    res.json({
      success: true,
      message: '포스트가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('포스트 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '포스트를 삭제할 수 없습니다.'
    });
  }
});

// 포스트 좋아요/싫어요 (인증 필요)
router.post('/posts/:id/reactions', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reaction } = req.body; // 'like', 'dislike', 또는 'unlike'
    const userId = req.user._id;

    if (!['like', 'dislike', 'unlike'].includes(reaction)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 반응 타입입니다.'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    // 기존 반응 제거
    if (reaction === 'like') {
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id.toString() !== userId);
      } else {
        post.likes.push(userId);
        // 싫어요에서 제거
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      }
    } else if (reaction === 'dislike') {
      if (post.dislikes.includes(userId)) {
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      } else {
        post.dislikes.push(userId);
        // 좋아요에서 제거
        post.likes = post.likes.filter(id => id.toString() !== userId);
      }
    } else if (reaction === 'unlike') {
      // unlike는 현재 좋아요 상태를 토글 (좋아요 취소)
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id.toString() !== userId);
      }
      // 싫어요도 함께 제거 (unlike는 모든 반응 제거)
      post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
    }

    await post.save();

    res.json({
      success: true,
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length
      },
      message: '반응이 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('포스트 반응 실패:', error);
    res.status(500).json({
      success: false,
      message: '반응을 처리할 수 없습니다.'
    });
  }
});

// 포스트 신고 (인증 필요)
router.post('/posts/:id/report', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: '신고 사유를 입력해주세요.'
      });
    }

    const post = await CommunityPost.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    // 이미 신고된 경우
    if (post.reports.some(report => report.reporter.toString() === userId)) {
      return res.status(400).json({
        success: false,
        message: '이미 신고한 포스트입니다.'
      });
    }

    post.reports.push({
      reporter: userId,
      reason,
      reportedAt: new Date()
    });

    // 신고 횟수가 임계값을 넘으면 자동으로 비활성화
    if (post.reports.length >= 5) {
      post.isActive = false;
      post.isReported = true;
    }

    await post.save();

    res.json({
      success: true,
      message: '포스트가 신고되었습니다.'
    });
  } catch (error) {
    console.error('포스트 신고 실패:', error);
    res.status(500).json({
      success: false,
      message: '포스트를 신고할 수 없습니다.'
    });
  }
});

// 댓글 목록 조회
router.get('/posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = req.query;

    // 포스트 존재 확인
    const post = await CommunityPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    // 정렬 옵션
    const sortOption = {};
    sortOption[sortBy] = order === 'desc' ? -1 : 1;

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 댓글 조회 (대댓글 포함)
    const comments = await CommunityPost.findById(id)
      .select('comments')
      .populate('comments.author', 'name role avatar')
      .populate('comments.replies.author', 'name role avatar')
      .lean();

    if (!comments) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }

    // 댓글 정렬 및 페이지네이션
    const sortedComments = comments.comments
      .sort((a, b) => {
        if (sortBy === 'createdAt') {
          return order === 'desc' ? new Date(b.createdAt) - new Date(a.createdAt) : new Date(a.createdAt) - new Date(b.createdAt);
        }
        return 0;
      })
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: sortedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: comments.comments.length,
        pages: Math.ceil(comments.comments.length / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('댓글 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '댓글을 불러올 수 없습니다.'
    });
  }
});

// 댓글 작성
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }

    // 포스트 존재 확인
    const post = await CommunityPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    const newComment = {
      author: userId,
      content: content.trim(),
      parentId: parentId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: [],
      dislikes: [],
      replies: []
    };

    if (parentId) {
      // 대댓글인 경우
      const parentComment = post.comments.id(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: '상위 댓글을 찾을 수 없습니다.'
        });
      }
      parentComment.replies.push(newComment);
    } else {
      // 일반 댓글인 경우
      post.comments.push(newComment);
    }

    await post.save();

    // 작성된 댓글 정보와 함께 반환
    const populatedPost = await CommunityPost.findById(id)
      .populate('comments.author', 'name role avatar')
      .populate('comments.replies.author', 'name role avatar');

    const savedComment = parentId 
      ? populatedPost.comments.id(parentId).replies[populatedPost.comments.id(parentId).replies.length - 1]
      : populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      message: '댓글이 작성되었습니다.',
      data: savedComment
    });

  } catch (error) {
    console.error('댓글 작성 실패:', error);
    res.status(500).json({
      success: false,
      message: '댓글 작성에 실패했습니다.'
    });
  }
});

// 댓글 수정
router.put('/posts/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }

    // 포스트 존재 확인
    const post = await CommunityPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    // 댓글 찾기 (일반 댓글 또는 대댓글)
    let comment = post.comments.id(commentId);
    let _isReply = false;

    if (!comment) {
      // 대댓글인지 확인
      for (const parentComment of post.comments) {
        comment = parentComment.replies.id(commentId);
        if (comment) {
          _isReply = true;
          break;
        }
      }
    }

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    // 권한 확인 (작성자 또는 관리자)
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '댓글을 수정할 권한이 없습니다.'
      });
    }

    // 댓글 수정
    comment.content = content.trim();
    comment.updatedAt = new Date();

    await post.save();

    res.json({
      success: true,
      message: '댓글이 수정되었습니다.',
      data: comment
    });

  } catch (error) {
    console.error('댓글 수정 실패:', error);
    res.status(500).json({
      success: false,
      message: '댓글 수정에 실패했습니다.'
    });
  }
});

// 댓글 삭제
router.delete('/posts/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id;

    // 포스트 존재 확인
    const post = await CommunityPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    // 댓글 찾기 (일반 댓글 또는 대댓글)
    let comment = post.comments.id(commentId);
    let _isReply = false;
    let parentComment = null;

    if (!comment) {
      // 대댓글인지 확인
      for (const pc of post.comments) {
        comment = pc.replies.id(commentId);
        if (comment) {
          _isReply = true;
          parentComment = pc;
          break;
        }
      }
    }

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    // 권한 확인 (작성자 또는 관리자)
    if (comment.author.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '댓글을 삭제할 권한이 없습니다.'
      });
    }

    // 댓글 삭제
    if (_isReply && parentComment) {
      parentComment.replies.pull(commentId);
    } else {
      post.comments.pull(commentId);
    }

    await post.save();

    res.json({
      success: true,
      message: '댓글이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    res.status(500).json({
      success: false,
      message: '댓글 삭제에 실패했습니다.'
    });
  }
});

// 댓글 반응 (좋아요/싫어요)
router.post('/posts/:id/comments/:commentId/reactions', auth, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { reaction } = req.body; // 'like', 'dislike', 또는 'unlike'
    const userId = req.user._id;

    if (!['like', 'dislike', 'unlike'].includes(reaction)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 반응 타입입니다.'
      });
    }

    // 포스트 존재 확인
    const post = await CommunityPost.findById(id);
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    // 댓글 찾기 (일반 댓글 또는 대댓글)
    let comment = post.comments.id(commentId);
    let _isReply = false;

    if (!comment) {
      // 대댓글인지 확인
      for (const parentComment of post.comments) {
        comment = parentComment.replies.id(commentId);
        if (comment) {
          _isReply = true;
          break;
        }
      }
    }

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '댓글을 찾을 수 없습니다.'
      });
    }

    // 반응 처리
    if (reaction === 'like') {
      // 좋아요 처리
      if (comment.likes.includes(userId)) {
        comment.likes.pull(userId);
      } else {
        comment.likes.push(userId);
        comment.dislikes.pull(userId); // 싫어요에서 제거
      }
    } else if (reaction === 'dislike') {
      // 싫어요 처리
      if (comment.dislikes.includes(userId)) {
        comment.dislikes.pull(userId);
      } else {
        comment.dislikes.push(userId);
        comment.likes.pull(userId); // 좋아요에서 제거
      }
    } else if (reaction === 'unlike') {
      // unlike는 현재 좋아요 상태를 토글 (좋아요 취소)
      if (comment.likes.includes(userId)) {
        comment.likes.pull(userId);
      }
      // 싫어요도 함께 제거 (unlike는 모든 반응 제거)
      comment.dislikes.pull(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: '반응이 업데이트되었습니다.',
      data: {
        likes: comment.likes.length,
        dislikes: comment.dislikes.length
      }
    });

  } catch (error) {
    console.error('댓글 반응 실패:', error);
    res.status(500).json({
      success: false,
      message: '반응 처리에 실패했습니다.'
    });
  }
});


module.exports = router;
