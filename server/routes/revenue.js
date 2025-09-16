const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const revenueService = require('../services/revenueService');
const RevenueDistribution = require('../models/RevenueDistribution');
const CreatorPayout = require('../models/CreatorPayout');

// 수익 분배 계산
router.post('/calculate/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 프로젝트 소유자 확인
    const FundingProject = require('../models/FundingProject');
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }

    if (project.creatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '수익 분배 권한이 없습니다.'
      });
    }

    const result = await revenueService.calculateRevenueDistribution(projectId);
    res.json(result);
  } catch (error) {
    console.error('수익 분배 계산 실패:', error);
    res.status(500).json({
      success: false,
      message: '수익 분배 계산에 실패했습니다.',
      error: error.message
    });
  }
});

// 수익 분배 실행
router.post('/distribute/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // 프로젝트 소유자 확인
    const FundingProject = require('../models/FundingProject');
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }

    if (project.creatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '수익 분배 권한이 없습니다.'
      });
    }

    const result = await revenueService.distributeRevenue(projectId);
    res.json(result);
  } catch (error) {
    console.error('수익 분배 실행 실패:', error);
    res.status(500).json({
      success: false,
      message: '수익 분배 실행에 실패했습니다.',
      error: error.message
    });
  }
});

// 크리에이터 지급 처리
router.post('/payouts/:payoutId/process', auth, async (req, res) => {
  try {
    const { payoutId } = req.params;
    const userId = req.user.id;

    const payout = await CreatorPayout.findOne({
      payoutId,
      creatorId: userId
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: '지급 정보를 찾을 수 없습니다.'
      });
    }

    const result = await revenueService.processCreatorPayout({
      creatorId: payout.creatorId,
      projectId: payout.projectId,
      amount: payout.amount,
      bankAccount: payout.bankAccount
    });

    res.json(result);
  } catch (error) {
    console.error('크리에이터 지급 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '크리에이터 지급 처리에 실패했습니다.',
      error: error.message
    });
  }
});

// 크리에이터 지급 내역 조회
router.get('/payouts/creator/:creatorId', auth, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // 본인 지급 내역만 조회 가능
    if (creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: '지급 내역 조회 권한이 없습니다.'
      });
    }

    const query = { creatorId };
    if (status) query.status = status;

    const payouts = await CreatorPayout.find(query)
      .populate('projectId', 'title')
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CreatorPayout.countDocuments(query);

    res.json({
      success: true,
      data: payouts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('크리에이터 지급 내역 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '크리에이터 지급 내역 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 수익 리포트 생성
router.post('/reports/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    // 프로젝트 소유자 확인
    const FundingProject = require('../models/FundingProject');
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }

    if (project.creatorId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: '수익 리포트 조회 권한이 없습니다.'
      });
    }

    const result = await revenueService.generateRevenueReport(projectId, startDate, endDate);
    res.json(result);
  } catch (error) {
    console.error('수익 리포트 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '수익 리포트 생성에 실패했습니다.',
      error: error.message
    });
  }
});

// 크리에이터 수익 대시보드
router.get('/dashboard/creator/:creatorId', auth, async (req, res) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user.id;

    // 본인 대시보드만 조회 가능
    if (creatorId !== userId) {
      return res.status(403).json({
        success: false,
        message: '수익 대시보드 조회 권한이 없습니다.'
      });
    }

    // 총 수익 조회
    const totalStats = await CreatorPayout.aggregate([
      { $match: { creatorId: creatorId, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$amount' },
          completedPayouts: { $sum: 1 }
        }
      }
    ]);

    // 대기 중인 지급 조회
    const pendingStats = await CreatorPayout.aggregate([
      { $match: { creatorId: creatorId, status: 'pending' } },
      {
        $group: {
          _id: null,
          pendingPayouts: { $sum: '$amount' }
        }
      }
    ]);

    // 월별 수익 조회 (최근 12개월)
    const monthlyStats = await CreatorPayout.getMonthlyPayoutStats(creatorId, new Date().getFullYear());

    // 상위 프로젝트 조회
    const topProjects = await CreatorPayout.aggregate([
      { $match: { creatorId: creatorId, status: 'completed' } },
      {
        $group: {
          _id: '$projectId',
          earnings: { $sum: '$amount' }
        }
      },
      { $sort: { earnings: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'fundingprojects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: '$project'
      },
      {
        $project: {
          projectId: '$_id',
          title: '$project.title',
          earnings: '$earnings'
        }
      }
    ]);

    // 프로젝트 수 조회
    const projectCount = await CreatorPayout.distinct('projectId', { creatorId: creatorId });

    res.json({
      success: true,
      data: {
        totalEarnings: totalStats[0]?.totalEarnings || 0,
        pendingPayouts: pendingStats[0]?.pendingPayouts || 0,
        completedPayouts: totalStats[0]?.completedPayouts || 0,
        projectCount: projectCount.length,
        monthlyEarnings: monthlyStats.map(stat => ({
          month: stat._id.month,
          earnings: stat.totalAmount
        })),
        topProjects: topProjects
      }
    });
  } catch (error) {
    console.error('크리에이터 수익 대시보드 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '크리에이터 수익 대시보드 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 플랫폼 수익 통계 (관리자만)
router.get('/stats/platform', admin, async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const result = await revenueService.getPlatformRevenueStats(
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate || new Date().toISOString(),
      groupBy || 'day'
    );

    res.json(result);
  } catch (error) {
    console.error('플랫폼 수익 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '플랫폼 수익 통계 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 수익 분배 실패 재시도
router.post('/distributions/:distributionId/retry', admin, async (req, res) => {
  try {
    const { distributionId } = req.params;

    const distribution = await RevenueDistribution.findById(distributionId);
    if (!distribution) {
      return res.status(404).json({
        success: false,
        message: '수익 분배 정보를 찾을 수 없습니다.'
      });
    }

    if (!distribution.canRetry) {
      return res.status(400).json({
        success: false,
        message: '재시도 횟수를 초과했습니다.'
      });
    }

    await distribution.retry();

    res.json({
      success: true,
      message: '수익 분배 재시도가 요청되었습니다.'
    });
  } catch (error) {
    console.error('수익 분배 재시도 실패:', error);
    res.status(500).json({
      success: false,
      message: '수익 분배 재시도에 실패했습니다.',
      error: error.message
    });
  }
});

// 수익 분배 내역 조회
router.get('/distributions', admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, projectId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;

    const distributions = await RevenueDistribution.find(query)
      .populate('projectId', 'title')
      .populate('creatorId', 'name email')
      .sort({ distributionDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await RevenueDistribution.countDocuments(query);

    res.json({
      success: true,
      data: distributions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('수익 분배 내역 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '수익 분배 내역 조회에 실패했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
