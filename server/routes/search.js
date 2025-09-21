const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');
const CommunityPost = require('../models/CommunityPost');
const Event = require('../models/Event');

// 통합 검색 API
router.get('/', async (req, res) => {
  try {
    const {
      query,
      type = 'all', // 'all', 'artists', 'projects', 'events', 'posts'
      page = 1,
      limit = 10,
    } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '검색어를 입력해주세요.',
      });
    }

    const searchQuery = query.trim();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const results = {
      artists: [],
      projects: [],
      events: [],
      posts: [],
      total: 0,
    };

    // 아티스트 검색
    if (type === 'all' || type === 'artists') {
      const artistQuery = {
        role: 'artist',
        isActive: true,
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { genre: { $regex: searchQuery, $options: 'i' } },
        ],
      };

      const [artists, artistCount] = await Promise.all([
        User.find(artistQuery)
          .select('name email avatar bio role category genre createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        User.countDocuments(artistQuery),
      ]);

      results.artists = artists.map(artist => ({
        id: artist._id,
        name: artist.name,
        email: artist.email,
        avatar: artist.avatar || null,
        bio: artist.bio || '',
        category: artist.category || '기타',
        genre: artist.genre || '',
        createdAt: artist.createdAt,
        type: 'artist',
      }));

      results.total += artistCount;
    }

    // 프로젝트 검색
    if (type === 'all' || type === 'projects') {
      const projectQuery = {
        status: { $in: ['진행중', '성공', '완료'] },
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
          { tags: { $in: [new RegExp(searchQuery, 'i')] } },
        ],
      };

      const [projects, projectCount] = await Promise.all([
        FundingProject.find(projectQuery)
          .populate('creatorId', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        FundingProject.countDocuments(projectQuery),
      ]);

      results.projects = projects.map(project => ({
        id: project._id,
        title: project.title,
        description: project.description,
        category: project.category,
        targetAmount: project.targetAmount,
        currentAmount: project.currentAmount,
        progress: project.progress,
        status: project.status,
        creator: {
          id: project.creatorId._id,
          name: project.creatorId.name,
          avatar: project.creatorId.avatar,
        },
        createdAt: project.createdAt,
        type: 'project',
      }));

      results.total += projectCount;
    }

    // 이벤트 검색
    if (type === 'all' || type === 'events') {
      const eventQuery = {
        status: { $in: ['예정', '진행중'] },
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { location: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
        ],
      };

      const [events, eventCount] = await Promise.all([
        Event.find(eventQuery)
          .populate('organizerId', 'name avatar')
          .sort({ startDate: 1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Event.countDocuments(eventQuery),
      ]);

      results.events = events.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        status: event.status,
        organizer: {
          id: event.organizerId._id,
          name: event.organizerId.name,
          avatar: event.organizerId.avatar,
        },
        createdAt: event.createdAt,
        type: 'event',
      }));

      results.total += eventCount;
    }

    // 커뮤니티 게시글 검색
    if (type === 'all' || type === 'posts') {
      const postQuery = {
        status: 'published',
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { content: { $regex: searchQuery, $options: 'i' } },
          { category: { $regex: searchQuery, $options: 'i' } },
        ],
      };

      const [posts, postCount] = await Promise.all([
        CommunityPost.find(postQuery)
          .populate('author', 'name avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        CommunityPost.countDocuments(postQuery),
      ]);

      results.posts = posts.map(post => ({
        id: post._id,
        title: post.title,
        content: post.content,
        category: post.category,
        likes: post.likes.length,
        dislikes: post.dislikes.length,
        comments: post.comments.length,
        views: post.viewCount,
        author: {
          id: post.author._id,
          name: post.author.name,
          avatar: post.author.avatar,
        },
        createdAt: post.createdAt,
        type: 'post',
      }));

      results.total += postCount;
    }

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.total,
        pages: Math.ceil(results.total / parseInt(limit)),
      },
      query: searchQuery,
      type: type,
    });
  } catch (error) {
    console.error('검색 오류:', error);
    res.status(500).json({
      success: false,
      message: '검색 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 인기 검색어 조회
router.get('/popular', async (req, res) => {
  try {
    // 최근 7일간의 인기 검색어 (실제 구현에서는 검색 로그를 저장해야 함)
    const popularKeywords = [
      '음악',
      '아트',
      '디자인',
      '영화',
      '게임',
      '책',
      '공연',
      '전시',
      '크라우드펀딩',
      '펀딩',
      '후원',
      '아티스트',
      '창작자',
      '프로젝트',
    ];

    res.json({
      success: true,
      data: popularKeywords.slice(0, 10),
    });
  } catch (error) {
    console.error('인기 검색어 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '인기 검색어 조회 중 오류가 발생했습니다.',
    });
  }
});

// 검색 제안 (자동완성)
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const searchQuery = query.trim();
    const suggestions = [];

    // 아티스트 이름에서 제안
    const artistSuggestions = await User.find({
      role: 'artist',
      isActive: true,
      name: { $regex: searchQuery, $options: 'i' },
    })
      .select('name')
      .limit(5)
      .lean();

    suggestions.push(
      ...artistSuggestions.map(artist => ({
        text: artist.name,
        type: 'artist',
      })),
    );

    // 프로젝트 제목에서 제안
    const projectSuggestions = await FundingProject.find({
      status: { $in: ['진행중', '성공', '완료'] },
      title: { $regex: searchQuery, $options: 'i' },
    })
      .select('title')
      .limit(5)
      .lean();

    suggestions.push(
      ...projectSuggestions.map(project => ({
        text: project.title,
        type: 'project',
      })),
    );

    // 이벤트 제목에서 제안
    const eventSuggestions = await Event.find({
      status: { $in: ['예정', '진행중'] },
      title: { $regex: searchQuery, $options: 'i' },
    })
      .select('title')
      .limit(5)
      .lean();

    suggestions.push(
      ...eventSuggestions.map(event => ({
        text: event.title,
        type: 'event',
      })),
    );

    res.json({
      success: true,
      data: suggestions.slice(0, 10),
    });
  } catch (error) {
    console.error('검색 제안 오류:', error);
    res.status(500).json({
      success: false,
      message: '검색 제안 조회 중 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
