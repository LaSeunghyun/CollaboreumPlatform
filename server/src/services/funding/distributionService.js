const { BusinessLogicError, ValidationError } = require('../../errors/AppError');
const { FundingProject } = require('../../models/FundingProject');
const { Distribution } = require('../../models/Distribution');
const { eventStore } = require('./eventStore');
const { businessLogger } = require('../../middleware/logger');

/**
 * 분배 서비스
 */
class DistributionService {
  constructor() {
    this.platformFeePercentage = 5; // 플랫폼 수수료 5%
    this.minimumDistributionAmount = 1000; // 최소 분배 금액 1,000원
  }

  /**
   * 분배 계산
   */
  async calculateDistribution(projectId, rules) {
    const project = await FundingProject.findById(projectId)
      .populate('owner')
      .populate('pledges.user');

    if (!project) {
      throw new BusinessLogicError('프로젝트를 찾을 수 없습니다');
    }

    if (project.status !== 'succeeded') {
      throw new BusinessLogicError('성공한 프로젝트만 분배할 수 있습니다');
    }

    const totalAmount = project.currentAmount;
    const distributionItems = [];

    // 규칙별 분배 금액 계산
    for (const rule of rules) {
      let amount = 0;

      if (rule.type === 'percentage') {
        amount = Math.floor((totalAmount * rule.percentage) / 100);
      } else if (rule.type === 'fixed') {
        amount = rule.fixedAmount;
      }

      // 최소 분배 금액 체크
      if (amount < this.minimumDistributionAmount) {
        throw new BusinessLogicError(
          `분배 금액이 최소 금액(${this.minimumDistributionAmount}원)보다 작습니다: ${amount}원`
        );
      }

      distributionItems.push({
        ruleId: rule.id,
        recipientId: rule.recipient,
        amount,
        status: 'pending',
        metadata: {
          ruleType: rule.type,
          rulePercentage: rule.percentage,
          ruleFixedAmount: rule.fixedAmount,
        },
      });
    }

    // 총 분배 금액 검증
    const totalDistributed = distributionItems.reduce((sum, item) => sum + item.amount, 0);
    
    if (totalDistributed > totalAmount) {
      throw new BusinessLogicError(
        `분배 금액이 총 모금액을 초과합니다: ${totalDistributed}원 > ${totalAmount}원`
      );
    }

    // 잔액 보정 (Banker's Rounding)
    const remainder = totalAmount - totalDistributed;
    if (remainder > 0) {
      // 가장 큰 금액을 받는 항목에 잔액 추가
      const maxAmountIndex = distributionItems.reduce(
        (maxIndex, item, index) => 
          item.amount > distributionItems[maxIndex].amount ? index : maxIndex,
        0
      );
      distributionItems[maxAmountIndex].amount += remainder;
    }

    return {
      totalAmount,
      totalDistributed: totalAmount,
      items: distributionItems,
      remainder: 0,
    };
  }

  /**
   * 분배 생성
   */
  async createDistribution(projectId, rules, userId) {
    const project = await FundingProject.findById(projectId);

    if (!project) {
      throw new BusinessLogicError('프로젝트를 찾을 수 없습니다');
    }

    if (project.status !== 'succeeded') {
      throw new BusinessLogicError('성공한 프로젝트만 분배할 수 있습니다');
    }

    // 분배 계산
    const calculation = await this.calculateDistribution(projectId, rules);

    // 분배 생성
    const distribution = new Distribution({
      projectId,
      totalAmount: calculation.totalAmount,
      status: 'calculated',
      rules,
      items: calculation.items,
      metadata: {
        calculatedBy: userId,
        calculatedAt: new Date(),
        platformFeePercentage: this.platformFeePercentage,
      },
    });

    await distribution.save();

    // 이벤트 저장
    await eventStore.storeDistributionCreated(
      distribution._id,
      projectId,
      calculation.totalAmount,
      rules
    );

    businessLogger.funding.projectCreated(projectId, userId, {
      distributionId: distribution._id,
      totalAmount: calculation.totalAmount,
      itemCount: calculation.items.length,
    });

    return distribution;
  }

  /**
   * 분배 실행
   */
  async executeDistribution(distributionId, userId) {
    const distribution = await Distribution.findById(distributionId)
      .populate('items.recipientId');

    if (!distribution) {
      throw new BusinessLogicError('분배를 찾을 수 없습니다');
    }

    if (distribution.status !== 'calculated') {
      throw new BusinessLogicError('계산된 분배만 실행할 수 있습니다');
    }

    const session = await Distribution.startSession();
    
    try {
      await session.withTransaction(async () => {
        // 각 분배 항목 처리
        for (const item of distribution.items) {
          try {
            // 실제 결제/이체 로직 (여기서는 시뮬레이션)
            await this.processDistributionItem(item, userId);
            
            item.status = 'completed';
            item.executedAt = new Date();
            item.transactionId = this.generateTransactionId();
          } catch (error) {
            item.status = 'failed';
            item.metadata = {
              ...item.metadata,
              error: error.message,
              failedAt: new Date(),
            };
          }
        }

        // 분배 상태 업데이트
        const completedItems = distribution.items.filter(item => item.status === 'completed');
        const failedItems = distribution.items.filter(item => item.status === 'failed');

        if (failedItems.length === 0) {
          distribution.status = 'executed';
        } else if (completedItems.length === 0) {
          distribution.status = 'failed';
        } else {
          distribution.status = 'partially_executed';
        }

        distribution.executedAt = new Date();
        distribution.executedBy = userId;

        await distribution.save({ session });

        // 이벤트 저장
        await eventStore.storeDistributionExecuted(
          distributionId,
          distribution.projectId,
          userId,
          distribution.totalAmount
        );
      });

      businessLogger.funding.projectCreated(distribution.projectId, userId, {
        distributionId,
        totalAmount: distribution.totalAmount,
        completedItems: distribution.items.filter(item => item.status === 'completed').length,
        failedItems: distribution.items.filter(item => item.status === 'failed').length,
      });

      return distribution;
    } catch (error) {
      throw new BusinessLogicError(`분배 실행 실패: ${error.message}`);
    } finally {
      await session.endSession();
    }
  }

  /**
   * 분배 항목 처리
   */
  async processDistributionItem(item, executedBy) {
    // 실제 구현에서는 여기서 결제 게이트웨이 API 호출
    // 예: 토스페이먼츠, 카카오페이, 네이버페이 등
    
    // 시뮬레이션: 90% 성공률
    const success = Math.random() > 0.1;
    
    if (!success) {
      throw new Error('결제 처리 실패 (시뮬레이션)');
    }

    // 실제로는 여기서:
    // 1. 수령자 계좌 정보 조회
    // 2. 결제 게이트웨이 API 호출
    // 3. 거래 ID 저장
    // 4. 알림 발송

    return {
      transactionId: this.generateTransactionId(),
      processedAt: new Date(),
    };
  }

  /**
   * 거래 ID 생성
   */
  generateTransactionId() {
    return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 기본 분배 규칙 생성
   */
  generateDefaultRules(project) {
    const rules = [];

    // 프로젝트 소유자 (85%)
    rules.push({
      type: 'percentage',
      percentage: 85,
      recipient: project.ownerId,
      description: '프로젝트 소유자',
      priority: 1,
    });

    // 플랫폼 수수료 (5%)
    rules.push({
      type: 'percentage',
      percentage: 5,
      recipient: 'platform',
      description: '플랫폼 수수료',
      priority: 2,
    });

    // 기타 (10%)
    rules.push({
      type: 'percentage',
      percentage: 10,
      recipient: 'reserve',
      description: '예비금',
      priority: 3,
    });

    return rules;
  }

  /**
   * 분배 통계
   */
  async getDistributionStats(projectId = null) {
    const matchStage = projectId ? { projectId } : {};

    const stats = await Distribution.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);

    return stats;
  }

  /**
   * 분배 이력 조회
   */
  async getDistributionHistory(projectId, limit = 20) {
    return Distribution.find({ projectId })
      .populate('items.recipientId')
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * 분배 재시도
   */
  async retryFailedDistribution(distributionId, userId) {
    const distribution = await Distribution.findById(distributionId);

    if (!distribution) {
      throw new BusinessLogicError('분배를 찾을 수 없습니다');
    }

    if (distribution.status !== 'failed' && distribution.status !== 'partially_executed') {
      throw new BusinessLogicError('실패한 분배만 재시도할 수 있습니다');
    }

    // 실패한 항목들만 재시도
    const failedItems = distribution.items.filter(item => item.status === 'failed');
    
    for (const item of failedItems) {
      try {
        await this.processDistributionItem(item, userId);
        item.status = 'completed';
        item.executedAt = new Date();
        item.transactionId = this.generateTransactionId();
      } catch (error) {
        // 재시도 실패 시 에러 정보 업데이트
        item.metadata = {
          ...item.metadata,
          retryError: error.message,
          retryFailedAt: new Date(),
        };
      }
    }

    // 분배 상태 재계산
    const completedItems = distribution.items.filter(item => item.status === 'completed');
    const stillFailedItems = distribution.items.filter(item => item.status === 'failed');

    if (stillFailedItems.length === 0) {
      distribution.status = 'executed';
    } else if (completedItems.length > 0) {
      distribution.status = 'partially_executed';
    }

    await distribution.save();

    return distribution;
  }
}

module.exports = new DistributionService();
