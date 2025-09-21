const express = require('express');
const User = require('../models/User');
const Project = require('../models/Project');
const FundingProject = require('../models/FundingProject');
const router = express.Router();

// 현재 사용자 프로필 조회
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      data: { user },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다',
    });
  }
});

// 현재 사용자 프로필 조회 (current-user 엔드포인트)
router.get('/current-user/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.json({
      success: true,
      data: { user },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 프로필 업데이트
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findById(req.user.id);

    await user.updateProfile(updates);

    res.json({
      success: true,
      message: '프로필이 업데이트되었습니다',
      data: { user },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다',
    });
  }
});

// 특정 사용자 프로필 조회
router.get('/:userId/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다',
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다',
    });
  }
});

// 현재 사용자 프로젝트 목록 조회 (current-user 엔드포인트)
router.get('/current-user/projects', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    // 일반 프로젝트 조회
    const projectQuery = { userId };
    if (status) projectQuery.status = status;
    if (category) projectQuery.category = category;

    const projects = await Project.find(projectQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // 펀딩 프로젝트 조회
    const fundingQuery = { creatorId: userId };
    if (status) fundingQuery.status = status;
    if (category) fundingQuery.category = category;

    const fundingProjects = await FundingProject.find(fundingQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const allProjects = [...projects, ...fundingProjects];

    res.json({
      success: true,
      data: {
        projects: allProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allProjects.length,
        },
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '프로젝트 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 프로젝트 목록 조회
router.get('/:userId/projects', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;

    // 일반 프로젝트 조회
    const projectQuery = { userId };
    if (status) projectQuery.status = status;
    if (category) projectQuery.category = category;

    const projects = await Project.find(projectQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // 펀딩 프로젝트 조회
    const fundingQuery = { creatorId: userId };
    if (status) fundingQuery.status = status;
    if (category) fundingQuery.category = category;

    const fundingProjects = await FundingProject.find(fundingQuery)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const allProjects = [...projects, ...fundingProjects];

    res.json({
      success: true,
      data: {
        projects: allProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allProjects.length,
        },
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '프로젝트 조회 중 오류가 발생했습니다',
    });
  }
});

// 현재 사용자 백킹 내역 조회 (current-user 엔드포인트)
router.get('/current-user/backings', async (req, res) => {
  try {
    const {
      status: _status,
      projectId: _projectId,
      page = 1,
      limit = 10,
    } = req.query;
    const _userId = req.user.id;

    // 백킹 내역 조회 (실제 구현에서는 백킹 모델이 필요)
    // 임시로 빈 배열 반환
    const backings = [];

    res.json({
      success: true,
      data: {
        backings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: backings.length,
        },
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '백킹 내역 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 백킹 내역 조회
router.get('/:userId/backings', async (req, res) => {
  try {
    const { status, projectId, page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;

    // Payment 모델을 사용하여 백킹 내역 조회
    const Payment = require('../models/Payment');
    const _FundingProject = require('../models/FundingProject');

    // 쿼리 조건 구성
    const query = { backerId: userId };
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;

    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 백킹 내역 조회 (프로젝트 정보 포함)
    const backings = await Payment.find(query)
      .populate(
        'projectId',
        'title description category status currentAmount targetAmount endDate',
      )
      .populate(
        'projectId',
        'title description category status currentAmount targetAmount endDate',
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // 총 개수 조회
    const total = await Payment.countDocuments(query);

    // 통계 계산
    const stats = await Payment.aggregate([
      { $match: { backerId: require('mongoose').Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$amount' },
          totalReturned: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] },
          },
          totalProjects: { $addToSet: '$projectId' },
        },
      },
      {
        $project: {
          totalInvested: 1,
          totalReturned: 1,
          totalProjects: { $size: '$totalProjects' },
        },
      },
    ]);

    const statsData = stats[0] || {
      totalInvested: 0,
      totalReturned: 0,
      totalProjects: 0,
    };

    // 백킹 데이터 변환
    const transformedBackings = backings.map(backing => ({
      id: backing._id.toString(),
      amount: backing.amount,
      returnedAmount: backing.status === 'completed' ? backing.amount : 0,
      status:
        backing.status === 'completed'
          ? 'completed'
          : backing.status === 'failed'
            ? 'failed'
            : 'ongoing',
      createdAt: backing.createdAt.toISOString(),
      project: backing.projectId
        ? {
            title: backing.projectId.title,
            artist: {
              name: '아티스트', // 실제로는 프로젝트에서 아티스트 정보를 가져와야 함
            },
          }
        : null,
    }));

    res.json({
      success: true,
      data: {
        backings: transformedBackings,
        totalInvested: statsData.totalInvested,
        totalReturned: statsData.totalReturned,
        totalProjects: statsData.totalProjects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
        },
      },
    });
  } catch (error) {
    console.error('백킹 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '백킹 내역 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 수익 내역 조회
router.get('/:userId/revenues', async (req, res) => {
  try {
    const {
      status: _status,
      startDate: _startDate,
      endDate: _endDate,
      page = 1,
      limit = 10,
    } = req.query;
    const _userId = req.params.userId;

    // 수익 내역 조회 (실제 구현에서는 수익 모델이 필요)
    // 임시로 빈 배열 반환
    const revenues = [];

    res.json({
      success: true,
      data: {
        revenues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: revenues.length,
        },
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      message: '수익 내역 조회 중 오류가 발생했습니다',
    });
  }
});

// 팔로잉 아티스트 목록 조회
router.get('/:userId/following', async (req, res) => {
  try {
    const _userId = req.params.userId;

    // User 모델에서 팔로잉 관계 조회
    const User = require('../models/User');

    // 팔로잉 아티스트 조회 (실제로는 팔로우 관계 테이블이 필요)
    // 임시로 아티스트 역할을 가진 사용자들을 반환
    const followingArtists = await User.find({
      role: 'artist',
      isActive: true,
    })
      .select('_id name email avatar bio')
      .limit(20);

    const transformedArtists = followingArtists.map(artist => ({
      id: artist._id.toString(),
      name: artist.name,
      avatar: artist.avatar,
      category: '아티스트',
    }));

    res.json({
      success: true,
      data: transformedArtists,
    });
  } catch (error) {
    console.error('팔로잉 아티스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '팔로잉 아티스트 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 포인트 조회
router.get('/:userId/points', async (req, res) => {
  try {
    const userId = req.params.userId;

    // 사용자 포인트 정보 조회
    const user = await User.findById(userId).select('points');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.',
      });
    }

    // 포인트 정보 반환 (기본값 설정)
    const pointsData = {
      available: user.points?.available || 0,
      total: user.points?.total || 0,
      pending: user.points?.pending || 0,
      history: user.points?.history || [],
    };

    res.json({
      success: true,
      data: pointsData,
    });
  } catch (error) {
    console.error('포인트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '포인트 조회 중 오류가 발생했습니다',
    });
  }
});

// 사용자 포인트 사용 내역 조회
router.get('/:userId/points/history', async (req, res) => {
  try {
    const { page = 1, limit = 20, type: _type } = req.query;
    const _userId = req.params.userId;

    // 포인트 사용 내역 조회 (실제로는 포인트 거래 모델이 필요)
    // 임시로 빈 배열 반환
    const history = [];

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
        },
      },
    });
  } catch (error) {
    console.error('포인트 사용 내역 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '포인트 사용 내역 조회 중 오류가 발생했습니다',
    });
  }
});

// 포인트로 투자하기
router.post('/:userId/points/invest', async (req, res) => {
  try {
    const { projectId, amount } = req.body;
    const _userId = req.params.userId;

    // 포인트 투자 로직 구현 (실제로는 포인트 차감 및 투자 처리 필요)
    // 임시로 성공 응답 반환

    res.json({
      success: true,
      message: '포인트 투자가 완료되었습니다.',
      data: {
        projectId,
        amount,
        remainingPoints: 0,
      },
    });
  } catch (error) {
    console.error('포인트 투자 오류:', error);
    res.status(500).json({
      success: false,
      message: '포인트 투자 중 오류가 발생했습니다',
    });
  }
});

module.exports = router;
