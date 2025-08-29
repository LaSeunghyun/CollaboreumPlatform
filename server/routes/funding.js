const express = require('express');
const router = express.Router();
const FundingProject = require('../models/FundingProject');
const authMiddleware = require('../middleware/auth');

// 펀딩 프로젝트 목록 조회
router.get('/projects', async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 20 } = req.query;
    
    // 쿼리 조건 구성
    const query = { isActive: true };
    if (category && category !== '전체') {
      query.category = category;
    }
    if (status && status !== '전체') {
      query.status = status;
    }
    if (search) {
      query.$text = { $search: search };
    }
    
    // 페이지네이션
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 프로젝트 조회
    const projects = await FundingProject.find(query)
      .populate('artist', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // 전체 개수 조회
    const total = await FundingProject.countDocuments(query);
    
    // 응답 데이터 가공
    const formattedProjects = projects.map(project => ({
      id: project._id,
      title: project.title,
      description: project.description,
      artist: project.artist?.name || project.artistName,
      category: project.category,
      goalAmount: project.goalAmount,
      currentAmount: project.currentAmount,
      backers: project.backers?.length || 0,
      daysLeft: project.daysLeft,
      progress: project.progress,
      status: project.status,
      image: project.image,
      tags: project.tags
    }));

    res.json({
      success: true,
      data: { projects: formattedProjects },
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalProjects: total
      }
    });
  } catch (error) {
    console.error('펀딩 프로젝트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 조회 중 오류가 발생했습니다.'
    });
  }
});

// 아티스트 펀딩 프로젝트 시작
router.post('/projects', authMiddleware, async (req, res) => {
  try {
    // 아티스트 권한 확인
    if (req.user.role !== 'artist') {
      return res.status(403).json({
        success: false,
        message: '아티스트만 펀딩 프로젝트를 시작할 수 있습니다.'
      });
    }
    
    const {
      title,
      description,
      category,
      goalAmount,
      startDate,
      endDate,
      rewards,
      tags,
      executionPlan
    } = req.body;
    
    // 필수 필드 검증
    if (!title || !description || !category || !goalAmount || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: '필수 필드를 모두 입력해주세요.'
      });
    }
    
    // 금액 유효성 검증
    if (goalAmount < 100000) {
      return res.status(400).json({
        success: false,
        message: '목표 금액은 10만원 이상이어야 합니다.'
      });
    }
    
    // 날짜 유효성 검증
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (start <= now) {
      return res.status(400).json({
        success: false,
        message: '시작일은 현재 날짜 이후여야 합니다.'
      });
    }
    
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: '종료일은 시작일 이후여야 합니다.'
      });
    }
    
    // 프로젝트 기간 검증 (최소 7일, 최대 90일)
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (durationDays < 7 || durationDays > 90) {
      return res.status(400).json({
        success: false,
        message: '프로젝트 기간은 7일에서 90일 사이여야 합니다.'
      });
    }
    
    // 집행 계획 검증
    if (executionPlan && executionPlan.stages) {
      const totalBudget = executionPlan.stages.reduce((sum, stage) => sum + stage.budget, 0);
      if (totalBudget !== goalAmount) {
        return res.status(400).json({
          success: false,
          message: '집행 계획의 총 예산이 목표 금액과 일치해야 합니다.'
        });
      }
    }
    
    // 새 펀딩 프로젝트 생성
    const newProject = new FundingProject({
      title,
      description,
      category,
      goalAmount: parseInt(goalAmount),
      startDate: start,
      endDate: end,
      rewards: rewards || [],
      tags: tags || [],
      executionPlan: executionPlan || { stages: [], totalBudget: goalAmount },
      artist: req.user.id,
      artistName: req.user.name,
      status: '준비중'
    });
    
    await newProject.save();
    
    // 생성된 프로젝트 반환
    const savedProject = await FundingProject.findById(newProject._id)
      .populate('artist', 'name')
      .lean();
    
    res.status(201).json({
      success: true,
      message: '펀딩 프로젝트가 성공적으로 시작되었습니다.',
      data: {
        id: savedProject._id,
        title: savedProject.title,
        description: savedProject.description,
        category: savedProject.category,
        goalAmount: savedProject.goalAmount,
        startDate: savedProject.startDate,
        endDate: savedProject.endDate,
        status: savedProject.status,
        daysLeft: savedProject.daysLeft
      }
    });
    
  } catch (error) {
    console.error('펀딩 프로젝트 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '펀딩 프로젝트 생성 중 오류가 발생했습니다.'
    });
  }
});

// 특정 프로젝트 상세 조회
router.get('/projects/:id', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // 데이터베이스에서 프로젝트 조회
    const project = await FundingProject.findById(projectId)
      .populate('artist', 'name email')
      .lean();
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }
    
    // 남은 일수 계산
    const now = new Date();
    const endDate = new Date(project.endDate);
    const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    // 달성률 계산
    const progressPercentage = Math.min((project.currentAmount / project.goalAmount) * 100, 100);
    
    // 응답 데이터 가공
    const formattedProject = {
      id: project._id,
      title: project.title,
      description: project.description,
      artist: project.artist?.name || project.artistName,
      category: project.category,
      goalAmount: project.goalAmount,
      currentAmount: project.currentAmount,
      backers: project.backers?.length || 0,
      daysLeft: Math.max(0, daysLeft),
      image: project.image,
      status: project.status,
      progressPercentage: Math.round(progressPercentage),
      startDate: project.startDate,
      endDate: project.endDate,
      rewards: project.rewards || [],
      updates: project.updates || [],
      tags: project.tags || [],
      executionPlan: project.executionPlan || { stages: [], totalBudget: project.goalAmount },
      expenseRecords: project.expenseRecords || [],
      revenueDistribution: project.revenueDistribution || {
        totalRevenue: 0,
        platformFee: 0.05,
        artistShare: 0.70,
        backerShare: 0.25,
        distributions: []
      }
    };

    res.json({
      success: true,
      data: formattedProject
    });
  } catch (error) {
    console.error('프로젝트 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

// 후원 참여 (결제 처리)
router.post('/projects/:id/back', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { amount, rewardId, isAnonymous, message } = req.body;
    
    // 프로젝트 조회
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }
    
    // 프로젝트 상태 확인
    if (project.status !== '진행중') {
      return res.status(400).json({
        success: false,
        message: '현재 후원을 받을 수 없는 상태입니다.'
      });
    }
    
    // 후원 금액 검증
    if (amount < 1000) {
      return res.status(400).json({
        success: false,
        message: '최소 후원 금액은 1,000원입니다.'
      });
    }
    
    // 이미 후원한 사용자인지 확인
    const existingBacker = project.backers.find(backer => 
      backer.user.toString() === req.user.id
    );
    
    if (existingBacker) {
      return res.status(400).json({
        success: false,
        message: '이미 후원한 프로젝트입니다.'
      });
    }
    
    // 모의 결제 처리 (실제로는 결제 게이트웨이 연동)
    const paymentResult = await mockPaymentProcess(req.user.id, amount);
    
    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: '결제 처리에 실패했습니다.'
      });
    }
    
    // 후원자 정보 추가
    const newBacker = {
      user: req.user.id,
      userName: isAnonymous ? '익명' : req.user.name,
      amount: amount,
      reward: rewardId || null,
      backedAt: new Date(),
      isAnonymous: isAnonymous || false,
      message: message || ''
    };
    
    project.backers.push(newBacker);
    project.currentAmount += amount;
    
    // 프로젝트 상태 업데이트
    if (project.currentAmount >= project.goalAmount) {
      project.status = '성공';
    }
    
    await project.save();
    
    res.json({
      success: true,
      message: '후원이 성공적으로 완료되었습니다.',
      data: {
        backerId: newBacker._id,
        amount: amount,
        currentAmount: project.currentAmount,
        progress: Math.min((project.currentAmount / project.goalAmount) * 100, 100)
      }
    });
    
  } catch (error) {
    console.error('후원 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '후원 처리 중 오류가 발생했습니다.'
    });
  }
});

// 펀딩 실패 시 환불 처리
router.post('/projects/:id/refund', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // 프로젝트 조회
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }
    
    // 프로젝트 상태 확인
    if (project.status !== '실패') {
      return res.status(400).json({
        success: false,
        message: '환불이 필요한 상태가 아닙니다.'
      });
    }
    
    // 아티스트 권한 확인
    if (project.artist.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '환불 처리를 할 권한이 없습니다.'
      });
    }
    
    // 모든 후원자에게 환불 처리
    const refundResults = [];
    
    for (const backer of project.backers) {
      try {
        const refundResult = await mockRefundProcess(backer.user.toString(), backer.amount);
        refundResults.push({
          backerId: backer.user,
          amount: backer.amount,
          success: refundResult.success,
          message: refundResult.message
        });
      } catch (error) {
        refundResults.push({
          backerId: backer.user,
          amount: backer.amount,
          success: false,
          message: '환불 처리 실패'
        });
      }
    }
    
    // 프로젝트 상태 업데이트
    project.status = '취소';
    await project.save();
    
    res.json({
      success: true,
      message: '환불 처리가 완료되었습니다.',
      data: {
        refundResults,
        totalRefunded: project.currentAmount
      }
    });
    
  } catch (error) {
    console.error('환불 처리 오류:', error);
    res.status(500).json({
      success: false,
      message: '환불 처리 중 오류가 발생했습니다.'
    });
  }
});

// 집행 계획 업데이트
router.put('/projects/:id/execution', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { stages } = req.body;
    
    // 프로젝트 조회
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }
    
    // 아티스트 권한 확인
    if (project.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '집행 계획을 수정할 권한이 없습니다.'
      });
    }
    
    // 프로젝트 상태 확인
    if (project.status !== '성공') {
      return res.status(400).json({
        success: false,
        message: '펀딩이 성공한 프로젝트만 집행 계획을 수정할 수 있습니다.'
      });
    }
    
    // 집행 계획 업데이트
    project.executionPlan.stages = stages;
    project.executionPlan.totalBudget = stages.reduce((sum, stage) => sum + stage.budget, 0);
    project.status = '집행중';
    
    await project.save();
    
    res.json({
      success: true,
      message: '집행 계획이 업데이트되었습니다.',
      data: {
        executionPlan: project.executionPlan,
        status: project.status
      }
    });
    
  } catch (error) {
    console.error('집행 계획 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '집행 계획 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 비용 사용 내역 추가
router.post('/projects/:id/expenses', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    const { category, title, description, amount, receipt, date, stageId } = req.body;
    
    // 프로젝트 조회
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }
    
    // 아티스트 권한 확인
    if (project.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '비용 내역을 추가할 권한이 없습니다.'
      });
    }
    
    // 프로젝트 상태 확인
    if (project.status !== '집행중') {
      return res.status(400).json({
        success: false,
        message: '집행 중인 프로젝트만 비용 내역을 추가할 수 있습니다.'
      });
    }
    
    // 비용 내역 추가
    const newExpense = {
      category,
      title,
      description,
      amount: parseInt(amount),
      receipt,
      date: new Date(date),
      stage: stageId || null,
      verified: false
    };
    
    project.expenseRecords.push(newExpense);
    await project.save();
    
    res.json({
      success: true,
      message: '비용 내역이 추가되었습니다.',
      data: {
        expenseId: newExpense._id,
        totalExpenses: project.expenseRecords.reduce((sum, exp) => sum + exp.amount, 0)
      }
    });
    
  } catch (error) {
    console.error('비용 내역 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '비용 내역 추가 중 오류가 발생했습니다.'
    });
  }
});

// 수익 분배 계산 및 실행
router.post('/projects/:id/distribute-revenue', authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // 프로젝트 조회
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }
    
    // 아티스트 권한 확인
    if (project.artist.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '수익 분배를 실행할 권한이 없습니다.'
      });
    }
    
    // 프로젝트 상태 확인
    if (project.status !== '집행중') {
      return res.status(400).json({
        success: false,
        message: '집행 중인 프로젝트만 수익 분배를 할 수 있습니다.'
      });
    }
    
    // 수익 분배 계산
    const totalRevenue = project.currentAmount;
    const platformFee = totalRevenue * project.revenueDistribution.platformFee;
    const artistAmount = totalRevenue * project.revenueDistribution.artistShare;
    const backerAmount = totalRevenue * project.revenueDistribution.backerShare;
    
    // 후원자별 수익 분배 계산
    const distributions = project.backers.map(backer => {
      const backerShare = (backer.amount / totalRevenue) * backerAmount;
      return {
        backer: backer.user,
        userName: backer.isAnonymous ? '익명' : backer.userName,
        originalAmount: backer.amount,
        profitShare: backerShare,
        totalReturn: backer.amount + backerShare,
        distributedAt: new Date(),
        status: '분배완료'
      };
    });
    
    // 수익 분배 정보 업데이트
    project.revenueDistribution.totalRevenue = totalRevenue;
    project.revenueDistribution.distributions = distributions;
    project.status = '완료';
    
    await project.save();
    
    res.json({
      success: true,
      message: '수익 분배가 완료되었습니다.',
      data: {
        totalRevenue,
        platformFee,
        artistAmount,
        backerAmount,
        distributions: distributions.length,
        status: project.status
      }
    });
    
  } catch (error) {
    console.error('수익 분배 오류:', error);
    res.status(500).json({
      success: false,
      message: '수익 분배 중 오류가 발생했습니다.'
    });
  }
});

// 모의 결제 처리 함수
async function mockPaymentProcess(userId, amount) {
  // 실제로는 결제 게이트웨이 연동
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transactionId: `txn_${Date.now()}_${userId}`,
        amount: amount,
        status: 'completed'
      });
    }, 1000);
  });
}

// 모의 환불 처리 함수
async function mockRefundProcess(userId, amount) {
  // 실제로는 환불 게이트웨이 연동
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        refundId: `refund_${Date.now()}_${userId}`,
        amount: amount,
        status: 'completed'
      });
    }, 1000);
  });
}

module.exports = router;
