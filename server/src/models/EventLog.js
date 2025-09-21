const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 이벤트 로그 스키마 (Outbox 패턴)
 */
const eventLogSchema = new Schema(
  {
    // 이벤트 정보
    eventType: {
      type: String,
      required: [true, '이벤트 타입은 필수입니다'],
      enum: {
        values: [
          'PROJECT_CREATED',
          'PROJECT_UPDATED',
          'PROJECT_STATUS_CHANGED',
          'PLEDGE_CREATED',
          'PLEDGE_CAPTURED',
          'PLEDGE_REFUNDED',
          'EXECUTION_CREATED',
          'EXECUTION_APPROVED',
          'DISTRIBUTION_CREATED',
          'DISTRIBUTION_EXECUTED',
          'PAYMENT_PROCESSED',
          'PAYMENT_REFUNDED',
        ],
        message: '유효하지 않은 이벤트 타입입니다',
      },
      index: true,
    },

    // 집계 정보
    aggregateId: {
      type: String,
      required: [true, '집계 ID는 필수입니다'],
      index: true,
    },
    aggregateType: {
      type: String,
      required: [true, '집계 타입은 필수입니다'],
      enum: {
        values: [
          'funding_project',
          'pledge',
          'execution',
          'distribution',
          'payment',
        ],
        message: '유효하지 않은 집계 타입입니다',
      },
      index: true,
    },

    // 이벤트 데이터
    eventData: {
      type: Schema.Types.Mixed,
      required: [true, '이벤트 데이터는 필수입니다'],
    },

    // 처리 상태
    status: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        message: '유효하지 않은 이벤트 상태입니다',
      },
      default: 'pending',
      index: true,
    },

    // 재시도 정보
    retryCount: {
      type: Number,
      default: 0,
      min: [0, '재시도 횟수는 0 이상이어야 합니다'],
      max: [10, '재시도 횟수는 10 이하여야 합니다'],
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: [0, '최대 재시도 횟수는 0 이상이어야 합니다'],
      max: [10, '최대 재시도 횟수는 10 이하여야 합니다'],
    },
    nextAttemptAt: {
      type: Date,
      required: [true, '다음 시도 시간은 필수입니다'],
      index: true,
    },
    lastAttemptAt: {
      type: Date,
    },
    lastError: {
      type: String,
      maxlength: [1000, '에러 메시지는 최대 1000자까지 가능합니다'],
    },

    // 처리 완료 정보
    processedAt: {
      type: Date,
    },

    // 메타데이터
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 복합 인덱스
eventLogSchema.index({ status: 1, nextAttemptAt: 1 });
eventLogSchema.index({ aggregateId: 1, aggregateType: 1 });
eventLogSchema.index({ eventType: 1, status: 1 });
eventLogSchema.index({ createdAt: 1 });
eventLogSchema.index({ processedAt: 1 });

// 미들웨어
eventLogSchema.pre('save', function (next) {
  // 재시도 횟수 검증
  if (this.retryCount > this.maxRetries) {
    this.status = 'failed';
  }

  // 다음 시도 시간 설정 (재시도 시)
  if (this.isModified('retryCount') && this.retryCount > 0) {
    const delays = [1000, 5000, 15000, 60000, 300000]; // 1초, 5초, 15초, 1분, 5분
    const delayIndex = Math.min(this.retryCount - 1, delays.length - 1);
    const delay = delays[delayIndex];

    this.nextAttemptAt = new Date(Date.now() + delay);
  }

  next();
});

// 정적 메서드
eventLogSchema.statics.findPending = function (limit = 100) {
  return this.find({
    status: 'pending',
    nextAttemptAt: { $lte: new Date() },
    retryCount: { $lt: this.maxRetries },
  })
    .sort({ createdAt: 1 })
    .limit(limit);
};

eventLogSchema.statics.findByAggregate = function (
  aggregateId,
  aggregateType = null,
) {
  const query = { aggregateId };
  if (aggregateType) {
    query.aggregateType = aggregateType;
  }

  return this.find(query).sort({ createdAt: -1 });
};

eventLogSchema.statics.findByEventType = function (eventType) {
  return this.find({ eventType }).sort({ createdAt: -1 });
};

eventLogSchema.statics.findFailed = function () {
  return this.find({ status: 'failed' }).sort({ lastAttemptAt: -1 });
};

eventLogSchema.statics.findCompleted = function (
  startDate = null,
  endDate = null,
) {
  const query = { status: 'completed' };

  if (startDate || endDate) {
    query.processedAt = {};
    if (startDate) query.processedAt.$gte = startDate;
    if (endDate) query.processedAt.$lte = endDate;
  }

  return this.find(query).sort({ processedAt: -1 });
};

eventLogSchema.statics.getEventStats = function () {
  return this.aggregate([
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
};

eventLogSchema.statics.getProcessingStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgRetryCount: { $avg: '$retryCount' },
        maxRetryCount: { $max: '$retryCount' },
      },
    },
  ]);
};

eventLogSchema.statics.cleanupOldEvents = function (olderThanDays = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  return this.deleteMany({
    status: { $in: ['completed', 'failed', 'cancelled'] },
    createdAt: { $lt: cutoffDate },
  });
};

// 인스턴스 메서드
eventLogSchema.methods.canBeRetried = function () {
  return this.status === 'failed' && this.retryCount < this.maxRetries;
};

eventLogSchema.methods.isExpired = function () {
  return this.retryCount >= this.maxRetries;
};

eventLogSchema.methods.markAsProcessing = function () {
  this.status = 'processing';
  this.lastAttemptAt = new Date();
  return this.save();
};

eventLogSchema.methods.markAsCompleted = function () {
  this.status = 'completed';
  this.processedAt = new Date();
  this.lastAttemptAt = new Date();
  return this.save();
};

eventLogSchema.methods.markAsFailed = function (error) {
  this.status = 'failed';
  this.retryCount += 1;
  this.lastAttemptAt = new Date();
  this.lastError = error?.message || error || 'Unknown error';

  // 다음 시도 시간 설정
  const delays = [1000, 5000, 15000, 60000, 300000];
  const delayIndex = Math.min(this.retryCount - 1, delays.length - 1);
  const delay = delays[delayIndex];
  this.nextAttemptAt = new Date(Date.now() + delay);

  return this.save();
};

eventLogSchema.methods.retry = function () {
  if (!this.canBeRetried()) {
    throw new Error('재시도할 수 없는 이벤트입니다');
  }

  this.status = 'pending';
  this.lastAttemptAt = new Date();

  return this.save();
};

eventLogSchema.methods.cancel = function (reason = null) {
  this.status = 'cancelled';
  this.lastAttemptAt = new Date();
  this.lastError = reason || 'Cancelled by user';

  return this.save();
};

// 가상 필드
eventLogSchema.virtual('isOverdue').get(function () {
  return this.status === 'pending' && this.nextAttemptAt < new Date();
});

eventLogSchema.virtual('timeUntilNextAttempt').get(function () {
  if (this.status !== 'pending') return null;

  const now = new Date();
  const diff = this.nextAttemptAt.getTime() - now.getTime();

  return diff > 0 ? diff : 0;
});

module.exports = mongoose.model('EventLog', eventLogSchema);
