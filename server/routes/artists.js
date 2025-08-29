const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Project = require('../models/Project');

// MongoDB ObjectId 검증 함수
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// 모든 아티스트 조회 (User 모델에서 role이 'artist'인 사용자들)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // 정렬 조건 구성
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // User 모델에서 role이 'artist'인 사용자들만 조회
    const userFilter = { role: 'artist', isActive: true };
    
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const [artists, total] = await Promise.all([
      User.find(userFilter)
        .select('name email avatar bio role createdAt lastActivityAt')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(userFilter)
    ]);

    // 응답 데이터 포맷팅
    const formattedArtists = artists.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      bio: user.bio || '',
      role: user.role,
      category: '기타', // 기본값
      location: '미설정', // 기본값
      rating: 0, // 기본값
      followers: 0, // 기본값
      completedProjects: 0, // 기본값
      activeProjects: 0, // 기본값
      totalEarned: 0, // 기본값
      isVerified: false, // 기본값
      featured: false, // 기본값
      createdAt: user.createdAt,
      lastActivityAt: user.lastActivityAt
    }));

    res.json({
      success: true,
      data: formattedArtists,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('아티스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 인기 아티스트 조회
router.get('/featured/popular', async (req, res) => {
  try {
    const artists = await User.find({ 
      role: 'artist', 
      isActive: true 
    })
    .select('name email avatar bio role createdAt')
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

    const formattedArtists = artists.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
      bio: user.bio || '',
      role: user.role,
      category: '기타',
      location: '미설정',
      rating: 0,
      followers: 0,
      completedProjects: 0,
      activeProjects: 0,
      totalEarned: 0,
      isVerified: false,
      featured: false,
      createdAt: user.createdAt
    }));

    res.json({
      success: true,
      data: formattedArtists
    });
  } catch (error) {
    console.error('인기 아티스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '인기 아티스트 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 특정 아티스트 조회
router.get('/:id', async (req, res) => {
  try {
    const artist = await User.findOne({ 
      _id: req.params.id, 
      role: 'artist', 
      isActive: true 
    }).select('-password');

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트를 찾을 수 없습니다.'
      });
    }

    const formattedArtist = {
      id: artist._id,
      name: artist.name,
      email: artist.email,
      avatar: artist.avatar || null,
      bio: artist.bio || '',
      role: artist.role,
      category: '기타',
      location: '미설정',
      rating: 0,
      followers: 0,
      completedProjects: 0,
      activeProjects: 0,
      totalEarned: 0,
      isVerified: false,
      featured: false,
      createdAt: artist.createdAt,
      lastActivityAt: artist.lastActivityAt
    };

    res.json({
      success: true,
      data: formattedArtist
    });
  } catch (error) {
    console.error('아티스트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 상세 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 아티스트 대시보드 데이터 조회
router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`📊 아티스트 대시보드 조회 요청: ID ${id}`);
    
    // ObjectId 검증
    if (!isValidObjectId(id)) {
      console.log(`❌ 아티스트 대시보드 조회 실패: 유효하지 않은 ID 형식 - ${id}`);
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 아티스트 ID입니다.'
      });
    }

    const artist = await User.findOne({ 
      _id: id, 
      role: 'artist', 
      isActive: true 
    }).select('-password');

    if (!artist) {
      console.log(`❌ 아티스트 대시보드 조회 실패: 아티스트를 찾을 수 없음 - ID ${id}`);
      return res.status(404).json({
        success: false,
        message: '아티스트를 찾을 수 없습니다.'
      });
    }

    // 대시보드 데이터 구성
    const dashboardData = {
      artist: {
        id: artist._id,
        name: artist.name,
        email: artist.email,
        avatar: artist.avatar || null,
        bio: artist.bio || '',
        role: artist.role,
        category: '기타',
        location: '미설정',
        rating: 4.5,
        followers: 128,
        completedProjects: 12,
        activeProjects: 3,
        totalEarned: 2500000,
        isVerified: true,
        featured: false,
        createdAt: artist.createdAt,
        lastActivityAt: artist.lastActivityAt
      },
      stats: {
        totalProjects: 15,
        completedProjects: 12,
        activeProjects: 3,
        totalEarnings: 2500000,
        monthlyEarnings: 180000,
        followers: 128,
        following: 45,
        rating: 4.5
      },
      recentActivity: [
        {
          id: 1,
          type: 'project_completed',
          title: '프로젝트 완료',
          description: '바다의 노래 프로젝트가 완료되었습니다.',
          date: new Date().toISOString(),
          amount: 500000
        },
        {
          id: 2,
          type: 'new_follower',
          title: '새 팔로워',
          description: '김팬닉님이 팔로우했습니다.',
          date: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    };

    console.log(`✅ 아티스트 대시보드 조회 성공: ${artist.name} (${artist.email})`);

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error(`💥 아티스트 대시보드 조회 오류: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '아티스트 대시보드 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 아티스트 프로필 조회
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 접근할 수 있습니다.'
      });
    }

    const artist = await Artist.findOne({ userId }).populate('userId', 'name email avatar bio');
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트 프로필을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: {
        ...artist.toObject(),
        user: artist.userId
      }
    });
  } catch (error) {
    console.error('아티스트 프로필 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 프로필을 불러올 수 없습니다.'
    });
  }
});

// 아티스트 프로젝트 목록 조회
router.get('/projects', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 접근할 수 있습니다.'
      });
    }

    const projects = await Project.find({ artist: userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('아티스트 프로젝트 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 목록을 불러올 수 없습니다.'
    });
  }
});

// 아티스트 WBS 항목 조회
router.get('/wbs', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 접근할 수 있습니다.'
      });
    }

    // 사용자의 프로젝트에서 WBS 항목들을 가져옴
    const projects = await Project.find({ artist: userId });
    
    // 모든 프로젝트의 태스크를 하나의 배열로 합침
    const allTasks = projects.reduce((acc, project) => {
      const projectTasks = project.tasks.map(task => ({
        ...task.toObject(),
        projectId: project._id,
        projectTitle: project.title,
        projectStatus: project.status
      }));
      return acc.concat(projectTasks);
    }, []);

    // 태스크를 상태별로 정렬 (진행중 > 대기 > 완료)
    const sortedTasks = allTasks.sort((a, b) => {
      const statusOrder = { '진행중': 0, '대기': 1, '완료': 2, '보류': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    res.json({
      success: true,
      data: sortedTasks
    });
  } catch (error) {
    console.error('아티스트 WBS 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: 'WBS 항목을 불러올 수 없습니다.'
    });
  }
});

// 아티스트 프로필 업데이트
router.put('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;

    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 접근할 수 있습니다.'
      });
    }

    const artist = await Artist.findOne({ userId });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트 프로필을 찾을 수 없습니다.'
      });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'category', 'location', 'rating', 'tags', 'coverImage', 'profileImage',
      'genre', 'socialLinks', 'bio'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        artist[field] = updateData[field];
      }
    });

    await artist.save();

    const updatedArtist = await Artist.findOne({ userId }).populate('userId', 'name email avatar bio');

    res.json({
      success: true,
      data: {
        ...updatedArtist.toObject(),
        user: updatedArtist.userId
      },
      message: '프로필이 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('아티스트 프로필 업데이트 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로필을 업데이트할 수 없습니다.'
    });
  }
});

// 아티스트 통계 조회
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 접근할 수 있습니다.'
      });
    }

    const artist = await Artist.findOne({ userId });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트 프로필을 찾을 수 없습니다.'
      });
    }

    // 프로젝트 통계
    const totalProjects = await Project.countDocuments({ artist: userId });
    const activeProjects = await Project.countDocuments({ 
      artist: userId, 
      status: { $in: ['진행중', '계획중'] } 
    });
    const completedProjects = await Project.countDocuments({ 
      artist: userId, 
      status: '완료' 
    });

    // 최근 프로젝트
    const recentProjects = await Project.find({ artist: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status progress startDate endDate');

    res.json({
      success: true,
      data: {
        profile: {
          followers: artist.followers,
          rating: artist.rating,
          totalEarned: artist.totalEarned,
          completedProjects: artist.completedProjects,
          activeProjects: artist.activeProjects
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          recent: recentProjects
        }
      }
    });
  } catch (error) {
    console.error('아티스트 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '통계를 불러올 수 없습니다.'
    });
  }
});

module.exports = router;
