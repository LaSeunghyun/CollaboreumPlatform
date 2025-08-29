const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const auth = require('../middleware/auth');

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
        sortQuery = { likes: -1, views: -1 };
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
      data: posts,
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

// 특정 포스트 조회
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await CommunityPost.findById(id)
      .populate('author', 'name role avatar')
      .populate('comments.author', 'name role avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }

    if (!post.isActive) {
      return res.status(404).json({
        success: false,
        message: '삭제된 포스트입니다.'
      });
    }

    // 조회수 증가
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('포스트 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '포스트를 불러올 수 없습니다.'
    });
  }
});

// 포스트 생성 (인증 필요)
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const author = req.user.id;

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
      author
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
      message: '포스트를 생성할 수 없습니다.'
    });
  }
});

// 포스트 수정 (인증 필요)
router.put('/posts/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user.id;

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
    const userId = req.user.id;

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
router.post('/posts/:id/reaction', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.body; // 'like' 또는 'dislike'
    const userId = req.user.id;

    if (!['like', 'dislike'].includes(type)) {
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
    if (type === 'like') {
      if (post.likes.includes(userId)) {
        post.likes = post.likes.filter(id => id.toString() !== userId);
      } else {
        post.likes.push(userId);
        // 싫어요에서 제거
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      }
    } else {
      if (post.dislikes.includes(userId)) {
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      } else {
        post.dislikes.push(userId);
        // 좋아요에서 제거
        post.likes = post.likes.filter(id => id.toString() !== userId);
      }
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
    const userId = req.user.id;

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

module.exports = router;
