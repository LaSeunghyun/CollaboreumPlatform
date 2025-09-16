const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const FundingProject = require('../models/FundingProject');
const User = require('../models/User');

// 결제 요청 생성
router.post('/', auth, async (req, res) => {
  try {
    const { projectId, amount, paymentMethod, backerInfo, rewardId, message } = req.body;
    const userId = req.user.id;

    // 결제 데이터 검증
    const paymentData = {
      projectId,
      amount,
      paymentMethod,
      backerInfo,
      rewardId,
      message
    };

    // 결제 검증
    const validation = await paymentService.validatePayment(paymentData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      });
    }

    // 프로젝트 정보 조회
    const project = await FundingProject.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '프로젝트를 찾을 수 없습니다.'
      });
    }

    // 토스페이먼츠 결제 요청 생성
    const paymentResult = await paymentService.createTossPayment(paymentData);
    if (!paymentResult.success) {
      return res.status(400).json(paymentResult);
    }

    // 결제 레코드 생성
    const payment = new Payment({
      paymentId: paymentResult.data.paymentId,
      orderId: paymentResult.data.orderId,
      projectId,
      backerId: userId,
      backerName: backerInfo.name,
      backerEmail: backerInfo.email,
      backerPhone: backerInfo.phone,
      backerAddress: backerInfo.address || '',
      rewardId: rewardId || null,
      rewardName: '', // 리워드 이름은 별도 조회 필요
      amount,
      paymentMethod,
      paymentProvider: 'toss',
      status: 'pending',
      message: message || '',
      metadata: {
        projectTitle: project.title,
        creatorName: project.creatorName
      }
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        ...paymentResult.data,
        paymentId: payment._id
      }
    });
  } catch (error) {
    console.error('결제 요청 생성 실패:', error);
    res.status(500).json({
      success: false,
      message: '결제 요청 생성에 실패했습니다.',
      error: error.message
    });
  }
});

// 결제 승인 처리 (웹훅)
router.post('/:paymentId/confirm', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionId } = req.body;

    // 결제 레코드 조회
    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.'
      });
    }

    // 이미 처리된 결제인지 확인
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        message: '이미 처리된 결제입니다.',
        data: payment
      });
    }

    // 토스페이먼츠 결제 승인
    const confirmResult = await paymentService.confirmTossPayment(
      paymentId,
      payment.orderId,
      payment.amount
    );

    if (!confirmResult.success) {
      // 결제 승인 실패 시 상태 업데이트
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json(confirmResult);
    }

    // 결제 상태 업데이트
    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.transactionId = confirmResult.data.transactionId;
    payment.metadata.set('method', confirmResult.data.method);
    payment.metadata.set('card', confirmResult.data.card);
    payment.metadata.set('approvedAt', confirmResult.data.approvedAt);

    await payment.save();

    // 프로젝트 현재 금액 업데이트
    await FundingProject.findByIdAndUpdate(
      payment.projectId,
      { $inc: { currentAmount: payment.amount } }
    );

    // 프로젝트 목표 달성 확인
    const project = await FundingProject.findById(payment.projectId);
    if (project.currentAmount >= project.targetAmount) {
      project.status = 'completed';
      project.completedAt = new Date();
      await project.save();

      // 수익 분배 스케줄링 (실제로는 큐 시스템 사용)
      // await scheduleRevenueDistribution(payment.projectId);
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('결제 승인 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '결제 승인 처리에 실패했습니다.',
      error: error.message
    });
  }
});

// 결제 상태 조회
router.get('/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      paymentId,
      backerId: userId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('결제 상태 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '결제 상태 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 결제 취소
router.post('/:paymentId/cancel', auth, async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const payment = await Payment.findOne({
      paymentId,
      backerId: userId
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: '결제 정보를 찾을 수 없습니다.'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: '취소할 수 없는 결제입니다.'
      });
    }

    // 토스페이먼츠 결제 취소
    const cancelResult = await paymentService.cancelTossPayment(
      paymentId,
      reason,
      payment.amount
    );

    if (!cancelResult.success) {
      return res.status(400).json(cancelResult);
    }

    // 결제 상태 업데이트
    await payment.cancel(reason);

    // 프로젝트 현재 금액 차감
    await FundingProject.findByIdAndUpdate(
      payment.projectId,
      { $inc: { currentAmount: -payment.amount } }
    );

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('결제 취소 실패:', error);
    res.status(500).json({
      success: false,
      message: '결제 취소에 실패했습니다.',
      error: error.message
    });
  }
});

// 결제 내역 조회
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, projectId } = req.query;

    const query = { backerId: userId };
    if (status) query.status = status;
    if (projectId) query.projectId = projectId;

    const payments = await Payment.find(query)
      .populate('projectId', 'title creatorName')
      .populate('rewardId', 'name amount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('결제 내역 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '결제 내역 조회에 실패했습니다.',
      error: error.message
    });
  }
});

// 프로젝트별 결제 통계
router.get('/stats/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const stats = await Payment.getProjectStats(projectId);
    const dailyStats = await Payment.getDailyStats(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30일 전
      new Date()
    );

    const paymentMethodStats = await Payment.aggregate([
      { $match: { projectId: projectId, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalAmount: stats[0]?.totalAmount || 0,
        totalBackers: stats[0]?.totalBackers || 0,
        dailyAmount: dailyStats.map(stat => stat.totalAmount),
        paymentMethodStats: paymentMethodStats.reduce((acc, stat) => {
          acc[stat._id] = stat.totalAmount;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('프로젝트 결제 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '프로젝트 결제 통계 조회에 실패했습니다.',
      error: error.message
    });
  }
});

module.exports = router;
