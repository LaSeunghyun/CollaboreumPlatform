const axios = require('axios');

// 수익 분배 서비스 클래스
class RevenueService {
  constructor() {
    this.platformFeeRate = 0.05; // 플랫폼 수수료 5%
    this.creatorRevenueRate = 0.95; // 크리에이터 수익 95%
  }

  // 프로젝트 완료 후 수익 분배 계산
  async calculateRevenueDistribution(projectId) {
    try {
      const Project = require('../models/FundingProject');
      const Payment = require('../models/Payment');
      const User = require('../models/User');

      // 프로젝트 정보 조회
      const project = await Project.findById(projectId);
      if (!project) {
        return { success: false, message: '프로젝트를 찾을 수 없습니다.' };
      }

      // 프로젝트 상태 확인
      if (project.status !== 'completed') {
        return { success: false, message: '완료되지 않은 프로젝트입니다.' };
      }

      // 성공한 결제 내역 조회
      const payments = await Payment.find({
        projectId,
        status: 'completed',
      });

      const totalRevenue = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const platformFee = Math.floor(totalRevenue * this.platformFeeRate);
      const creatorRevenue = totalRevenue - platformFee;

      // 크리에이터 정보 조회
      const creator = await User.findById(project.creatorId);
      if (!creator) {
        return {
          success: false,
          message: '크리에이터 정보를 찾을 수 없습니다.',
        };
      }

      const distribution = {
        projectId,
        totalRevenue,
        platformFee,
        creatorRevenue,
        distributionDate: new Date().toISOString(),
        status: 'pending',
        creatorId: creator._id,
        creatorName: creator.name,
        backerCount: payments.length,
      };

      return {
        success: true,
        data: distribution,
      };
    } catch (error) {
      console.error('수익 분배 계산 실패:', error);
      return {
        success: false,
        message: '수익 분배 계산에 실패했습니다.',
        error: error.message,
      };
    }
  }

  // 수익 분배 실행
  async distributeRevenue(projectId) {
    try {
      const Project = require('../models/FundingProject');
      const Payment = require('../models/Payment');
      const User = require('../models/User');
      const RevenueDistribution = require('../models/RevenueDistribution');

      // 수익 분배 계산
      const calculation = await this.calculateRevenueDistribution(projectId);
      if (!calculation.success) {
        return calculation;
      }

      const distributionData = calculation.data;

      // 수익 분배 레코드 생성
      const distribution = new RevenueDistribution({
        projectId: distributionData.projectId,
        totalRevenue: distributionData.totalRevenue,
        platformFee: distributionData.platformFee,
        creatorRevenue: distributionData.creatorRevenue,
        creatorId: distributionData.creatorId,
        status: 'processing',
        distributionDate: new Date(),
        backerCount: distributionData.backerCount,
      });

      await distribution.save();

      // 크리에이터 지급 처리
      const creator = await User.findById(distributionData.creatorId);
      if (!creator.bankAccount) {
        return {
          success: false,
          message: '크리에이터의 계좌 정보가 등록되지 않았습니다.',
        };
      }

      // 실제 지급 처리 (은행 API 연동 필요)
      const payoutResult = await this.processCreatorPayout({
        creatorId: creator._id,
        projectId: projectId,
        amount: distributionData.creatorRevenue,
        bankAccount: creator.bankAccount,
      });

      if (payoutResult.success) {
        // 수익 분배 상태 업데이트
        distribution.status = 'completed';
        distribution.processedAt = new Date();
        await distribution.save();

        // 프로젝트 상태 업데이트
        project.revenueDistributed = true;
        project.revenueDistributionDate = new Date();
        await project.save();

        return {
          success: true,
          data: {
            ...distributionData,
            status: 'completed',
            processedAt: distribution.processedAt,
            payoutId: payoutResult.data.payoutId,
          },
        };
      } else {
        // 지급 실패 시 상태 업데이트
        distribution.status = 'failed';
        distribution.failureReason = payoutResult.message;
        await distribution.save();

        return {
          success: false,
          message: '크리에이터 지급 처리에 실패했습니다.',
          error: payoutResult.message,
        };
      }
    } catch (error) {
      console.error('수익 분배 실행 실패:', error);
      return {
        success: false,
        message: '수익 분배 실행에 실패했습니다.',
        error: error.message,
      };
    }
  }

  // 크리에이터 지급 처리
  async processCreatorPayout(payoutData) {
    try {
      const { creatorId, projectId, amount, bankAccount } = payoutData;

      // 실제 은행 API 연동 (예: 토스뱅크, 카카오뱅크 등)
      // 여기서는 모의 처리
      const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 지급 내역 저장
      const CreatorPayout = require('../models/CreatorPayout');
      const payout = new CreatorPayout({
        creatorId,
        projectId,
        amount,
        bankAccount,
        status: 'processing',
        payoutId,
      });

      await payout.save();

      // 실제 지급 처리 (은행 API 호출)
      // const bankResult = await this.callBankAPI(bankAccount, amount);

      // 모의 성공 처리
      payout.status = 'completed';
      payout.processedAt = new Date();
      await payout.save();

      return {
        success: true,
        data: {
          payoutId: payoutId,
          amount: amount,
          status: 'completed',
          processedAt: payout.processedAt,
        },
      };
    } catch (error) {
      console.error('크리에이터 지급 처리 실패:', error);
      return {
        success: false,
        message: '크리에이터 지급 처리에 실패했습니다.',
        error: error.message,
      };
    }
  }

  // 수익 리포트 생성
  async generateRevenueReport(projectId, startDate, endDate) {
    try {
      const Project = require('../models/FundingProject');
      const Payment = require('../models/Payment');
      const Reward = require('../models/Reward');

      const project = await Project.findById(projectId);
      if (!project) {
        return { success: false, message: '프로젝트를 찾을 수 없습니다.' };
      }

      // 기간 내 결제 내역 조회
      const payments = await Payment.find({
        projectId,
        status: 'completed',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });

      const totalRevenue = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      );
      const platformFee = Math.floor(totalRevenue * this.platformFeeRate);
      const creatorRevenue = totalRevenue - platformFee;

      // 리워드별 통계
      const rewardStats = await Payment.aggregate([
        {
          $match: {
            projectId: projectId,
            status: 'completed',
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: '$rewardId',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
          },
        },
        {
          $lookup: {
            from: 'rewards',
            localField: '_id',
            foreignField: '_id',
            as: 'reward',
          },
        },
        {
          $unwind: { path: '$reward', preserveNullAndEmptyArrays: true },
        },
        {
          $sort: { totalAmount: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      const report = {
        projectId,
        period: { startDate, endDate },
        totalRevenue,
        platformFee,
        creatorRevenue,
        backerCount: payments.length,
        averageBackAmount:
          payments.length > 0 ? Math.floor(totalRevenue / payments.length) : 0,
        topRewards: rewardStats.map(stat => ({
          rewardId: stat._id,
          name: stat.reward?.name || '기본 후원',
          amount: stat.totalAmount,
          backerCount: stat.count,
        })),
      };

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      console.error('수익 리포트 생성 실패:', error);
      return {
        success: false,
        message: '수익 리포트 생성에 실패했습니다.',
        error: error.message,
      };
    }
  }

  // 플랫폼 수익 통계
  async getPlatformRevenueStats(startDate, endDate, groupBy = 'day') {
    try {
      const Payment = require('../models/Payment');
      const Project = require('../models/FundingProject');

      const matchStage = {
        status: 'completed',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const groupFormat =
        groupBy === 'day' ? '%Y-%m-%d' : groupBy === 'week' ? '%Y-%U' : '%Y-%m';

      const stats = await Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: '$createdAt',
              },
            },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const totalRevenue = stats.reduce((sum, stat) => sum + stat.revenue, 0);
      const totalPlatformFee = Math.floor(totalRevenue * this.platformFeeRate);
      const totalCreatorRevenue = totalRevenue - totalPlatformFee;

      const projectCount = await Project.countDocuments({
        status: 'completed',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      });

      return {
        success: true,
        data: {
          totalRevenue,
          totalPlatformFee,
          totalCreatorRevenue,
          projectCount,
          dailyStats: stats.map(stat => ({
            date: stat._id,
            revenue: stat.revenue,
            platformFee: Math.floor(stat.revenue * this.platformFeeRate),
            creatorRevenue:
              stat.revenue - Math.floor(stat.revenue * this.platformFeeRate),
          })),
        },
      };
    } catch (error) {
      console.error('플랫폼 수익 통계 조회 실패:', error);
      return {
        success: false,
        message: '플랫폼 수익 통계 조회에 실패했습니다.',
        error: error.message,
      };
    }
  }
}

module.exports = new RevenueService();
