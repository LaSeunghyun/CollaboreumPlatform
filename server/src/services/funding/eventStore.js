const { EventLog } = require('../../models/EventLog');
const { businessLogger } = require('../../middleware/logger');
const { BusinessLogicError } = require('../../errors/AppError');

/**
 * 이벤트 저장소 (Outbox 패턴)
 */
class EventStore {
  constructor() {
    this.maxRetries = 3;
    this.retryDelays = [1000, 5000, 15000]; // 1초, 5초, 15초
  }

  /**
   * 이벤트 저장
   */
  async storeEvent(eventType, aggregateId, aggregateType, eventData, metadata = {}) {
    try {
      const event = new EventLog({
        eventType,
        aggregateId,
        aggregateType,
        eventData,
        status: 'pending',
        retryCount: 0,
        maxRetries: this.maxRetries,
        nextAttemptAt: new Date(),
        metadata,
      });

      await event.save();

      businessLogger.funding.projectCreated(aggregateId, eventData.userId, {
        eventType,
        eventId: event._id,
      });

      return event;
    } catch (error) {
      throw new BusinessLogicError(
        `이벤트 저장 실패: ${error.message}`,
        { eventType, aggregateId, aggregateType, error: error.message }
      );
    }
  }

  /**
   * 펀딩 프로젝트 이벤트들
   */
  async storeProjectCreated(projectId, userId, projectData) {
    return this.storeEvent(
      'PROJECT_CREATED',
      projectId,
      'funding_project',
      {
        userId,
        projectData: {
          title: projectData.title,
          targetAmount: projectData.targetAmount,
          endDate: projectData.endDate,
        },
      },
      { source: 'funding_service' }
    );
  }

  async storeProjectStatusChanged(projectId, oldStatus, newStatus, userId, reason = null) {
    return this.storeEvent(
      'PROJECT_STATUS_CHANGED',
      projectId,
      'funding_project',
      {
        userId,
        oldStatus,
        newStatus,
        reason,
        timestamp: new Date(),
      },
      { source: 'state_machine' }
    );
  }

  async storeProjectUpdated(projectId, userId, changes) {
    return this.storeEvent(
      'PROJECT_UPDATED',
      projectId,
      'funding_project',
      {
        userId,
        changes,
        timestamp: new Date(),
      },
      { source: 'funding_service' }
    );
  }

  /**
   * 후원 이벤트들
   */
  async storePledgeCreated(pledgeId, projectId, userId, amount, rewardId = null) {
    return this.storeEvent(
      'PLEDGE_CREATED',
      pledgeId,
      'pledge',
      {
        projectId,
        userId,
        amount,
        rewardId,
        timestamp: new Date(),
      },
      { source: 'payment_service' }
    );
  }

  async storePledgeCaptured(pledgeId, projectId, userId, amount, paymentId) {
    return this.storeEvent(
      'PLEDGE_CAPTURED',
      pledgeId,
      'pledge',
      {
        projectId,
        userId,
        amount,
        paymentId,
        timestamp: new Date(),
      },
      { source: 'payment_service' }
    );
  }

  async storePledgeRefunded(pledgeId, projectId, userId, amount, reason) {
    return this.storeEvent(
      'PLEDGE_REFUNDED',
      pledgeId,
      'pledge',
      {
        projectId,
        userId,
        amount,
        reason,
        timestamp: new Date(),
      },
      { source: 'payment_service' }
    );
  }

  /**
   * 집행 이벤트들
   */
  async storeExecutionCreated(executionId, projectId, userId, budgetAmount) {
    return this.storeEvent(
      'EXECUTION_CREATED',
      executionId,
      'execution',
      {
        projectId,
        userId,
        budgetAmount,
        timestamp: new Date(),
      },
      { source: 'execution_service' }
    );
  }

  async storeExecutionApproved(executionId, projectId, approvedBy, actualAmount) {
    return this.storeEvent(
      'EXECUTION_APPROVED',
      executionId,
      'execution',
      {
        projectId,
        approvedBy,
        actualAmount,
        timestamp: new Date(),
      },
      { source: 'execution_service' }
    );
  }

  /**
   * 분배 이벤트들
   */
  async storeDistributionCreated(distributionId, projectId, totalAmount, rules) {
    return this.storeEvent(
      'DISTRIBUTION_CREATED',
      distributionId,
      'distribution',
      {
        projectId,
        totalAmount,
        rules,
        timestamp: new Date(),
      },
      { source: 'distribution_service' }
    );
  }

  async storeDistributionExecuted(distributionId, projectId, executedBy, totalAmount) {
    return this.storeEvent(
      'DISTRIBUTION_EXECUTED',
      distributionId,
      'distribution',
      {
        projectId,
        executedBy,
        totalAmount,
        timestamp: new Date(),
      },
      { source: 'distribution_service' }
    );
  }

  /**
   * 결제 이벤트들
   */
  async storePaymentProcessed(paymentId, pledgeId, amount, userId, success) {
    return this.storeEvent(
      'PAYMENT_PROCESSED',
      paymentId,
      'payment',
      {
        pledgeId,
        amount,
        userId,
        success,
        timestamp: new Date(),
      },
      { source: 'payment_service' }
    );
  }

  async storePaymentRefunded(refundId, pledgeId, amount, userId, reason) {
    return this.storeEvent(
      'PAYMENT_REFUNDED',
      refundId,
      'payment',
      {
        pledgeId,
        amount,
        userId,
        reason,
        timestamp: new Date(),
      },
      { source: 'payment_service' }
    );
  }

  /**
   * 처리 대기 중인 이벤트 조회
   */
  async getPendingEvents(limit = 100) {
    return EventLog.find({
      status: 'pending',
      nextAttemptAt: { $lte: new Date() },
      retryCount: { $lt: this.maxRetries },
    })
    .sort({ createdAt: 1 })
    .limit(limit);
  }

  /**
   * 이벤트 처리 상태 업데이트
   */
  async updateEventStatus(eventId, status, error = null) {
    const updateData = {
      status,
      lastAttemptAt: new Date(),
    };

    if (error) {
      updateData.lastError = error.message;
    }

    if (status === 'completed') {
      updateData.processedAt = new Date();
    } else if (status === 'failed') {
      updateData.retryCount = { $inc: 1 };
      updateData.nextAttemptAt = this.calculateNextAttemptTime(updateData.retryCount);
    }

    return EventLog.findByIdAndUpdate(eventId, updateData, { new: true });
  }

  /**
   * 다음 시도 시간 계산
   */
  calculateNextAttemptTime(retryCount) {
    const delayIndex = Math.min(retryCount, this.retryDelays.length - 1);
    const delay = this.retryDelays[delayIndex];
    return new Date(Date.now() + delay);
  }

  /**
   * 이벤트 재시도
   */
  async retryEvent(eventId) {
    const event = await EventLog.findById(eventId);
    
    if (!event) {
      throw new BusinessLogicError('이벤트를 찾을 수 없습니다');
    }

    if (event.retryCount >= event.maxRetries) {
      throw new BusinessLogicError('최대 재시도 횟수를 초과했습니다');
    }

    event.retryCount += 1;
    event.nextAttemptAt = this.calculateNextAttemptTime(event.retryCount);
    event.status = 'pending';
    event.lastAttemptAt = new Date();

    return event.save();
  }

  /**
   * 이벤트 히스토리 조회
   */
  async getEventHistory(aggregateId, aggregateType = null, limit = 50) {
    const query = { aggregateId };
    
    if (aggregateType) {
      query.aggregateType = aggregateType;
    }

    return EventLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * 이벤트 통계
   */
  async getEventStats() {
    return await EventLog.aggregate([
      {
        $group: {
          _id: {
            eventType: '$eventType',
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.eventType',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count',
            },
          },
          total: { $sum: '$count' },
        },
      },
    ]);
  }

  /**
   * 실패한 이벤트 정리
   */
  async cleanupFailedEvents(olderThanDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await EventLog.deleteMany({
      status: 'failed',
      retryCount: { $gte: this.maxRetries },
      lastAttemptAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}

module.exports = new EventStore();
