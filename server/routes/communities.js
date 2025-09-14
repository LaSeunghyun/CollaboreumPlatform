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
      author: {
        id: post.author?._id || post.author,
        name: post.author?.name || post.authorName,
        avatar: post.author?.avatar,
        role: post.author?.role || 'user'
      },
      category: post.category,
      tags: post.tags || [],
      likes: post.likes?.length || 0,
      dislikes: post.dislikes?.length || 0,
      replies: post.comments?.length || 0,
      views: post.viewCount || 0,
      viewCount: post.viewCount || 0,
      isHot: false,
      isPinned: false,
      status: post.isActive ? 'published' : 'archived',
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.createdAt
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
  console.log('=== 커뮤니티 포스트 작성 요청 시작 ===');
  console.log('요청 시간:', new Date().toISOString());
  console.log('요청 데이터:', JSON.stringify(req.body, null, 2));
  console.log('사용자 정보:', JSON.stringify(req.user, null, 2));
  
  try {
    const { title, content, category, tags } = req.body;
    const userId = req.user.id;
    
    console.log('파싱된 데이터:', { title, content, category, tags, userId });
    
    // 필수 필드 검증
    if (!title || !content || !category) {
      console.log('❌ 필수 필드 누락:', { title: !!title, content: !!content, category: !!category });
      return res.status(400).json({
        success: false,
        message: '제목, 내용, 카테고리를 모두 입력해주세요.'
      });
    }
    
    console.log('✅ 필수 필드 검증 통과');
    
    // 새 포스트 생성
    const postData = {
      title,
      content,
      category,
      tags: tags || [],
      author: userId,
      authorName: req.user.name
    };
    
    console.log('생성할 포스트 데이터:', JSON.stringify(postData, null, 2));
    
    const newPost = new CommunityPost(postData);
    console.log('CommunityPost 인스턴스 생성 완료');
    
    await newPost.save();
    console.log('✅ 포스트 DB 저장 완료, ID:', newPost._id);
    
    // 생성된 포스트 반환
    const savedPost = await CommunityPost.findById(newPost._id)
      .populate('author', 'name')
      .lean();
    
    console.log('저장된 포스트 조회 완료:', JSON.stringify(savedPost, null, 2));
    
    const responseData = {
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
    };
    
    console.log('응답 데이터:', JSON.stringify(responseData, null, 2));
    console.log('=== 커뮤니티 포스트 작성 요청 완료 ===');
    
    res.status(201).json(responseData);
    
  } catch (error) {
    console.error('❌ 포스트 작성 오류 발생:');
    console.error('오류 메시지:', error.message);
    console.error('오류 스택:', error.stack);
    console.error('요청 데이터:', JSON.stringify(req.body, null, 2));
    console.error('사용자 정보:', JSON.stringify(req.user, null, 2));
    console.error('=== 커뮤니티 포스트 작성 오류 종료 ===');
    
    res.status(500).json({
      success: false,
      message: '포스트 작성 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
        author: {
          id: post.author?._id || post.author,
          name: post.author?.name || post.authorName,
          avatar: post.author?.avatar,
          role: post.author?.role || 'user'
        },
        category: post.category,
        tags: post.tags || [],
        likes: post.likes?.length || 0,
        dislikes: post.dislikes?.length || 0,
        replies: post.comments?.length || 0,
        views: post.viewCount || 0,
        viewCount: post.viewCount || 0,
        isHot: false,
        isPinned: false,
        status: post.isActive ? 'published' : 'archived',
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishedAt: post.createdAt,
        comments: post.comments || []
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

// 포스트 반응 (좋아요/싫어요) - 프론트엔드 API와 호환
router.post('/posts/:id/reaction', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const { type } = req.body; // 'like' 또는 'dislike'
    
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    if (type === 'like') {
      const isLiked = post.likes.includes(userId);
      
      if (isLiked) {
        // 좋아요 취소
        post.likes = post.likes.filter(id => id.toString() !== userId);
      } else {
        // 좋아요 추가
        post.likes.push(userId);
        // 싫어요에서 제거
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      }
    } else if (type === 'dislike') {
      const isDisliked = post.dislikes.includes(userId);
      
      if (isDisliked) {
        // 싫어요 취소
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
      } else {
        // 싫어요 추가
        post.dislikes.push(userId);
        // 좋아요에서 제거
        post.likes = post.likes.filter(id => id.toString() !== userId);
      }
    }
    
    await post.save();
    
    res.json({
      success: true,
      message: '반응이 처리되었습니다.',
      data: {
        likes: post.likes.length,
        dislikes: post.dislikes.length
      }
    });
    
  } catch (error) {
    console.error('반응 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '반응 처리 중 오류가 발생했습니다.'
    });
  }
});

// 포스트 조회수 증가
router.post('/posts/:id/views', async (req, res) => {
  try {
    const postId = req.params.id;
    
    const post = await CommunityPost.findByIdAndUpdate(
      postId, 
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '조회수가 증가되었습니다.',
      data: {
        views: post.viewCount
      }
    });
    
  } catch (error) {
    console.error('조회수 증가 오류:', error);
    res.status(500).json({
      success: false,
      message: '조회수 증가 중 오류가 발생했습니다.'
    });
  }
});

// 포스트 삭제
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '포스트를 찾을 수 없습니다.'
      });
    }
    
    // 작성자 본인 또는 관리자만 삭제 가능
    if (post.author.toString() !== userId && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '삭제 권한이 없습니다.'
      });
    }
    
    // 소프트 삭제 (isActive를 false로 설정)
    post.isActive = false;
    post.deletedAt = new Date();
    await post.save();
    
    res.json({
      success: true,
      message: '포스트가 삭제되었습니다.'
    });
    
  } catch (error) {
    console.error('포스트 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '포스트 삭제 중 오류가 발생했습니다.'
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
