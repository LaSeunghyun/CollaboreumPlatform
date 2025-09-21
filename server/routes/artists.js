const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Artist = require('../models/Artist');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');

// 월별 수익 계산 함수
async function calculateMonthlyEarnings(artistId) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // 이번 달에 완료된 프로젝트들의 수익 계산
    const completedProjects = await FundingProject.find({
      artist: artistId,
      status: { $in: ['성공', '완료'] },
      updatedAt: {
        $gte: startOfMonth,
        $lte: endOfMonth,
      },
    });

    let monthlyEarnings = 0;

    for (const project of completedProjects) {
      // 아티스트 수익 계산 (플랫폼 수수료 제외)
      const artistShare = project.revenueDistribution?.artistShare || 0.7;
      const totalRevenue =
        project.revenueDistribution?.totalRevenue || project.currentAmount;
      const artistEarnings = totalRevenue * artistShare;

      monthlyEarnings += artistEarnings;
    }

    return Math.round(monthlyEarnings);
  } catch (error) {
    console.error('월별 수익 계산 오류:', error);
    return 0;
  }
}

// 팔로잉 수 계산 함수
async function calculateFollowingCount(_artistId) {
  try {
    // 아티스트가 팔로우하는 다른 아티스트 수 계산
    // 현재는 간단히 0으로 반환 (실제 팔로잉 시스템이 구현되면 수정)
    // TODO: 실제 팔로잉 관계 테이블이 구현되면 이 함수를 수정
    return 0;
  } catch (error) {
    console.error('팔로잉 수 계산 오류:', error);
    return 0;
  }
}

// 최근 활동 데이터 조회 함수
async function getRecentActivity(artistId) {
  try {
    const activities = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 최근 30일 내 프로젝트 활동
    const recentProjects = await FundingProject.find({
      artist: artistId,
      updatedAt: { $gte: thirtyDaysAgo },
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    for (const project of recentProjects) {
      activities.push({
        type: 'project',
        title: `프로젝트 "${project.title}" 업데이트`,
        description: `상태: ${project.status}, 진행률: ${project.progress}%`,
        date: project.updatedAt,
        link: `/projects/${project._id}`,
      });
    }

    // 최근 30일 내 완료된 프로젝트
    const completedProjects = await FundingProject.find({
      artist: artistId,
      status: { $in: ['성공', '완료'] },
      updatedAt: { $gte: thirtyDaysAgo },
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    for (const project of completedProjects) {
      activities.push({
        type: 'completion',
        title: `프로젝트 "${project.title}" 완료`,
        description: `목표 달성률: ${project.progress}%`,
        date: project.updatedAt,
        link: `/projects/${project._id}`,
      });
    }

    // 날짜순으로 정렬하고 최대 10개까지만 반환
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  } catch (error) {
    console.error('최근 활동 조회 오류:', error);
    return [];
  }
}

// MongoDB ObjectId 검증 함수
const isValidObjectId = id => {
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
      order = 'desc',
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
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    const [artists, total] = await Promise.all([
      User.find(userFilter)
        .select('name email avatar bio role createdAt lastActivityAt')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(userFilter),
    ]);

    // 응답 데이터 포맷팅
    // 아티스트 프로필 정보와 함께 조회
    const artistsWithProfiles = await Promise.all(
      artists.map(async user => {
        const artistProfile = await Artist.findOne({ userId: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          bio: user.bio || '',
          role: user.role,
          category: artistProfile?.category || '기타',
          location: artistProfile?.location || '미설정',
          rating: artistProfile?.rating || 0,
          followers: artistProfile?.followers || 0,
          completedProjects: artistProfile?.completedProjects || 0,
          activeProjects: artistProfile?.activeProjects || 0,
          totalEarned: artistProfile?.totalEarned || 0,
          isVerified: artistProfile?.isVerified || false,
          featured: artistProfile?.featured || false,
          createdAt: user.createdAt,
          lastActivityAt: user.lastActivityAt,
        };
      }),
    );

    res.json({
      success: true,
      data: artistsWithProfiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('아티스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 인기 아티스트 조회
router.get('/featured/popular', async (req, res) => {
  try {
    const artists = await User.find({
      role: 'artist',
      isActive: true,
    })
      .select('name email avatar bio role createdAt')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // 아티스트 프로필 정보와 함께 조회
    const artistsWithProfiles = await Promise.all(
      artists.map(async user => {
        const artistProfile = await Artist.findOne({ userId: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          bio: user.bio || '',
          role: user.role,
          category: artistProfile?.category || '기타',
          location: artistProfile?.location || '미설정',
          rating: artistProfile?.rating || 0,
          followers: artistProfile?.followers || 0,
          completedProjects: artistProfile?.completedProjects || 0,
          activeProjects: artistProfile?.activeProjects || 0,
          totalEarned: artistProfile?.totalEarned || 0,
          isVerified: artistProfile?.isVerified || false,
          featured: artistProfile?.featured || false,
          createdAt: user.createdAt,
        };
      }),
    );

    res.json({
      success: true,
      data: artistsWithProfiles,
    });
  } catch (error) {
    console.error('인기 아티스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '인기 아티스트 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 새로 가입한 아티스트 조회
router.get('/new', async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    // 최근 30일 내에 가입한 아티스트들 조회
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 7);

    const newArtists = await User.find({
      role: 'artist',
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo },
    })
      .select('name email avatar bio role createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    // 아티스트 프로필 정보와 함께 조회
    const newArtistsWithProfiles = await Promise.all(
      newArtists.map(async user => {
        const artistProfile = await Artist.findOne({ userId: user._id });
        return {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || null,
          bio: user.bio || '',
          role: user.role,
          category: artistProfile?.category || '기타',
          location: artistProfile?.location || '미설정',
          rating: artistProfile?.rating || 0,
          followers: artistProfile?.followers || 0,
          completedProjects: artistProfile?.completedProjects || 0,
          activeProjects: artistProfile?.activeProjects || 0,
          totalEarned: artistProfile?.totalEarned || 0,
          isVerified: artistProfile?.isVerified || false,
          featured: artistProfile?.featured || false,
          isNew: true, // 새로 가입한 아티스트 표시
          createdAt: user.createdAt,
        };
      }),
    );

    res.json({
      success: true,
      data: {
        artists: newArtistsWithProfiles,
        count: newArtistsWithProfiles.length,
      },
    });
  } catch (error) {
    console.error('새 아티스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '새 아티스트 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 특정 아티스트 조회
router.get('/:id', async (req, res) => {
  try {
    const artist = await User.findOne({
      _id: req.params.id,
      role: 'artist',
      isActive: true,
    }).select('-password');

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트를 찾을 수 없습니다.',
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
      lastActivityAt: artist.lastActivityAt,
    };

    res.json({
      success: true,
      data: formattedArtist,
    });
  } catch (error) {
    console.error('아티스트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 상세 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      console.log(
        `❌ 아티스트 대시보드 조회 실패: 유효하지 않은 ID 형식 - ${id}`,
      );
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 아티스트 ID입니다.',
      });
    }

    const artist = await User.findOne({
      _id: id,
      role: 'artist',
      isActive: true,
    }).select('-password');

    if (!artist) {
      console.log(
        `❌ 아티스트 대시보드 조회 실패: 아티스트를 찾을 수 없음 - ID ${id}`,
      );
      return res.status(404).json({
        success: false,
        message: '아티스트를 찾을 수 없습니다.',
      });
    }

    // 실제 프로젝트 통계 조회
    const totalProjects = await Project.countDocuments({ artist: id });
    const completedProjects = await Project.countDocuments({
      artist: id,
      status: '완료',
    });
    const activeProjects = await Project.countDocuments({
      artist: id,
      status: { $in: ['진행중', '계획중'] },
    });

    // 실제 아티스트 프로필 정보 조회
    const artistProfile = await Artist.findOne({ userId: id });

    // 대시보드 데이터 구성
    const dashboardData = {
      artist: {
        id: artist._id,
        name: artist.name,
        email: artist.email,
        avatar: artist.avatar || null,
        bio: artist.bio || '',
        role: artist.role,
        category: artistProfile?.category || '기타',
        location: artistProfile?.location || '미설정',
        rating: artistProfile?.rating || 0,
        followers: artistProfile?.followers || 0,
        completedProjects: completedProjects,
        activeProjects: activeProjects,
        totalEarned: artistProfile?.totalEarned || 0,
        isVerified: artistProfile?.isVerified || false,
        featured: artistProfile?.featured || false,
        createdAt: artist.createdAt,
        lastActivityAt: artist.lastActivityAt,
      },
      stats: {
        totalProjects: totalProjects,
        completedProjects: completedProjects,
        activeProjects: activeProjects,
        totalEarnings: artistProfile?.totalEarned || 0,
        monthlyEarnings: await calculateMonthlyEarnings(artist._id),
        followers: artistProfile?.followers || 0,
        following: await calculateFollowingCount(artist._id),
        rating: artistProfile?.rating || 0,
      },
      recentActivity: await getRecentActivity(artist._id),
    };

    console.log(
      `✅ 아티스트 대시보드 조회 성공: ${artist.name} (${artist.email})`,
    );

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error(`💥 아티스트 대시보드 조회 오류: ${error.message}`);
    res.status(500).json({
      success: false,
      message: '아티스트 대시보드 조회 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
        message: '아티스트만 접근할 수 있습니다.',
      });
    }

    const artist = await Artist.findOne({ userId }).populate(
      'userId',
      'name email avatar bio',
    );
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트 프로필을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: {
        ...artist.toObject(),
        user: artist.userId,
      },
    });
  } catch (error) {
    console.error('아티스트 프로필 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '아티스트 프로필을 불러올 수 없습니다.',
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
        message: '아티스트만 접근할 수 있습니다.',
      });
    }

    const projects = await Project.find({ artist: userId }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('아티스트 프로젝트 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 목록을 불러올 수 없습니다.',
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
        message: '아티스트만 접근할 수 있습니다.',
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
        projectStatus: project.status,
      }));
      return acc.concat(projectTasks);
    }, []);

    // 태스크를 상태별로 정렬 (진행중 > 대기 > 완료)
    const sortedTasks = allTasks.sort((a, b) => {
      const statusOrder = { 진행중: 0, 대기: 1, 완료: 2, 보류: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

    res.json({
      success: true,
      data: sortedTasks,
    });
  } catch (error) {
    console.error('아티스트 WBS 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: 'WBS 항목을 불러올 수 없습니다.',
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
        message: '아티스트만 접근할 수 있습니다.',
      });
    }

    const artist = await Artist.findOne({ userId });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트 프로필을 찾을 수 없습니다.',
      });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'category',
      'location',
      'rating',
      'tags',
      'coverImage',
      'profileImage',
      'genre',
      'socialLinks',
      'bio',
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        artist[field] = updateData[field];
      }
    });

    await artist.save();

    const updatedArtist = await Artist.findOne({ userId }).populate(
      'userId',
      'name email avatar bio',
    );

    res.json({
      success: true,
      data: {
        ...updatedArtist.toObject(),
        user: updatedArtist.userId,
      },
      message: '프로필이 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('아티스트 프로필 업데이트 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로필을 업데이트할 수 없습니다.',
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
        message: '아티스트만 접근할 수 있습니다.',
      });
    }

    const artist = await Artist.findOne({ userId });
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트 프로필을 찾을 수 없습니다.',
      });
    }

    // 프로젝트 통계
    const totalProjects = await Project.countDocuments({ artist: userId });
    const activeProjects = await Project.countDocuments({
      artist: userId,
      status: { $in: ['진행중', '계획중'] },
    });
    const completedProjects = await Project.countDocuments({
      artist: userId,
      status: '완료',
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
          activeProjects: artist.activeProjects,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
          recent: recentProjects,
        },
      },
    });
  } catch (error) {
    console.error('아티스트 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '통계를 불러올 수 없습니다.',
    });
  }
});

// 아티스트 팔로우/언팔로우
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'follow' 또는 'unfollow'
    const userId = req.user.id;

    // 아티스트 존재 확인
    const artist = await User.findOne({
      _id: id,
      role: 'artist',
      isActive: true,
    });

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: '아티스트를 찾을 수 없습니다.',
      });
    }

    // 본인 팔로우 방지
    if (id === userId) {
      return res.status(400).json({
        success: false,
        message: '본인을 팔로우할 수 없습니다.',
      });
    }

    // 사용자 팔로우 목록 조회/업데이트
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    if (action === 'follow') {
      // 이미 팔로우 중인지 확인
      if (user.following && user.following.includes(id)) {
        return res.status(400).json({
          success: false,
          message: '이미 팔로우 중인 아티스트입니다.',
        });
      }

      // 팔로우 추가
      if (!user.following) user.following = [];
      user.following.push(id);
      await user.save();

      // 아티스트 팔로워 수 증가
      await User.findByIdAndUpdate(id, { $inc: { followers: 1 } });

      res.json({
        success: true,
        message: '아티스트를 팔로우했습니다.',
        data: { isFollowing: true },
      });
    } else if (action === 'unfollow') {
      // 팔로우 중인지 확인
      if (!user.following || !user.following.includes(id)) {
        return res.status(400).json({
          success: false,
          message: '팔로우하지 않은 아티스트입니다.',
        });
      }

      // 팔로우 제거
      user.following = user.following.filter(
        followId => followId.toString() !== id,
      );
      await user.save();

      // 아티스트 팔로워 수 감소
      await User.findByIdAndUpdate(id, { $inc: { followers: -1 } });

      res.json({
        success: true,
        message: '아티스트 팔로우를 취소했습니다.',
        data: { isFollowing: false },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 액션입니다. (follow 또는 unfollow)',
      });
    }
  } catch (error) {
    console.error('아티스트 팔로우/언팔로우 오류:', error);
    res.status(500).json({
      success: false,
      message: '팔로우 처리 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// 아티스트 프로필 업데이트
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    // 본인 프로필만 수정 가능
    if (id !== userId) {
      return res.status(403).json({
        success: false,
        message: '본인의 프로필만 수정할 수 있습니다.',
      });
    }

    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 프로필을 수정할 수 있습니다.',
      });
    }

    // 업데이트 가능한 필드들
    const allowedFields = [
      'name',
      'bio',
      'avatar',
      'location',
      'category',
      'genre',
      'socialLinks',
      'portfolio',
      'skills',
      'experience',
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // 사용자 정보 업데이트
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { ...filteredData, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        role: updatedUser.role,
        category: updatedUser.category,
        location: updatedUser.location,
        genre: updatedUser.genre,
        socialLinks: updatedUser.socialLinks,
        portfolio: updatedUser.portfolio,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('아티스트 프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

module.exports = router;
