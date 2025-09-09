const express = require('express');
const router = express.Router();
const CommunityPost = require('../models/CommunityPost');
const auth = require('../middleware/auth');

// 커뮤니티 포스트 조회
router.get('/posts', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;
    
    // 쿼리 조건 구성
    const query = { isActive: true };
    if (category && category !== '전체') {
      query.category = category;
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 포스트 조회
    const posts = await CommunityPost.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await CommunityPost.countDocuments(query);
    
    // 응답 데이터 가공
    const formattedPosts = posts.map(post => ({
      id: post._id,
      title: post.title,
      content: post.content,
      author: post.author?.name || post.authorName,
      category: post.category,
      likes: post.likes?.length || 0,
      comments: post.comments?.length || 0,
      createdAt: post.createdAt,
      tags: post.tags,
      viewCount: post.viewCount
    }));

    res.json({
      success: true,
      data: formattedPosts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalPosts: total
      }
    });
  } catch (error) {
    console.error('커뮤니티 포스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '포스트 조회 중 오류가 발생했습니다.'
    });
  }
});

// 커뮤니티 포스트 작성
router.post('/posts', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user.id;
    
    // 필수 필드 검증
    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리를 모두 입력해주세요.'
      });
    }
    
    // 새 포스트 생성
    const newPost = new CommunityPost({
      title,
      content,
      category,
      tags: tags || [],
      author: userId,
      authorName: req.user.name
    });
    
    await newPost.save();
    
    // 생성된 포스트 반환
    const savedPost = await CommunityPost.findById(newPost._id)
      .populate('author', 'name')
      .lean();
    
    res.status(201).json({
      success: true,
      message: '포스트가 성공적으로 작성되었습니다.',
      data: {
        id: savedPost._id,
        title: savedPost.title,
        content: savedPost.content,
        author: savedPost.author?.name || savedPost.authorName,
        category: savedPost.category,
        tags: savedPost.tags,
        createdAt: savedPost.createdAt
      }
    });
    
  } catch (error) {
    console.error('포스트 작성 오류:', error);
    res.status(500).json({
      success: false,
      message: '포스트 작성 중 오류가 발생했습니다.'
    });
  }
});

// 포스트 상세 조회
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    
    // 조회수 증가
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { viewCount: 1 } });
    
    // 포스트 조회
    const post = await CommunityPost.findById(postId)
      .populate('author', 'name')
      .populate('comments.author', 'name')
      .lean();
    
    if (!post || !post.isActive) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: post._id,
        title: post.title,
        content: post.content,
        author: post.author?.name || post.authorName,
        category: post.category,
        likes: post.likes?.length || 0,
        comments: post.comments || [],
        createdAt: post.createdAt,
        tags: post.tags,
        viewCount: post.viewCount
      }
    });
    
  } catch (error) {
    console.error('포스트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '포스트 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 포스트 좋아요/취소
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    const isLiked = post.likes.includes(userId);
    
    if (isLiked) {
      // 좋아요 취소
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      // 좋아요 추가
      post.likes.push(userId);
    }
    
    await post.save();
    
    res.json({
      success: true,
      message: isLiked ? '좋아요가 취소되었습니다.' : '좋아요가 추가되었습니다.',
      data: {
        likes: post.likes.length,
        isLiked: !isLiked
      }
    });
    
  } catch (error) {
    console.error('좋아요 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '좋아요 처리 중 오류가 발생했습니다.'
    });
  }
});

// 댓글 작성
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user.id;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: '댓글 내용을 입력해주세요.'
      });
    }
    
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    const newComment = {
      author: userId,
      authorName: req.user.name,
      content
    };
    
    post.comments.push(newComment);
    await post.save();
    
    res.status(201).json({
      success: true,
      message: '댓글이 작성되었습니다.',
      data: newComment
    });
    
  } catch (error) {
    console.error('댓글 작성 오류:', error);
    res.status(500).json({
      success: false,
      message: '댓글 작성 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;
