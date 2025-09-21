const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 후원(Pledge) 스키마
 */
const pledgeSchema = new Schema(
  {
    // 프로젝트 및 사용자 정보
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'FundingProject',
      required: [true, '프로젝트 ID는 필수입니다'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '사용자 ID는 필수입니다'],
      index: true,
    },
    rewardId: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
      index: true,
    },

    // 금액 정보 (원 단위 정수)
    amount: {
      type: Number,
      required: [true, '후원 금액은 필수입니다'],
      min: [1000, '후원 금액은 최소 1,000원 이상이어야 합니다'],
      validate: {
        validator: Number.isInteger,
        message: '후원 금액은 정수여야 합니다',
      },
    },

    // 상태
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'authorized',
          'captured',
          'refunded',
          'failed',
          'cancelled',
        ],
        message: '유효하지 않은 후원 상태입니다',
      },
      default: 'pending',
      index: true,
    },

    // 결제 정보
    paymentMethod: {
      type: String,
      required: [true, '결제 수단은 필수입니다'],
      enum: ['card', 'bank_transfer', 'kakao_pay', 'naver_pay', 'toss_pay'],
    },
    paymentId: {
      type: String,
      index: true,
    },

    // 멱등성 키 (중복 결제 방지)
    idempotencyKey: {
      type: String,
      required: [true, '멱등성 키는 필수입니다'],
      unique: true,
      index: true,
    },

    // 결제 일시
    authorizedAt: {
      type: Date,
    },
    capturedAt: {
      type: Date,
    },

    // 환불 정보
    refundedAt: {
      type: Date,
    },
    refundAmount: {
      type: Number,
      min: [0, '환불 금액은 0원 이상이어야 합니다'],
      validate: {
        validator: function (v) {
          return v === null || v === undefined || Number.isInteger(v);
        },
        message: '환불 금액은 정수여야 합니다',
      },
    },
    refundReason: {
      type: String,
      maxlength: [500, '환불 사유는 최대 500자까지 가능합니다'],
    },

    // 메타데이터
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // 변경 이력
    changeHistory: [
      {
        field: {
          type: String,
          required: true,
        },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 가상 필드
pledgeSchema.virtual('project', {
  ref: 'FundingProject',
  localField: 'projectId',
  foreignField: '_id',
  justOne: true,
});

pledgeSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

pledgeSchema.virtual('reward', {
  ref: 'Reward',
  localField: 'rewardId',
  foreignField: '_id',
  justOne: true,
});

// 복합 인덱스
pledgeSchema.index({ projectId: 1, userId: 1 });
pledgeSchema.index({ projectId: 1, status: 1 });
pledgeSchema.index({ userId: 1, status: 1 });
pledgeSchema.index({ status: 1, createdAt: 1 });
pledgeSchema.index({ paymentId: 1 });
pledgeSchema.index({ idempotencyKey: 1 }, { unique: true });

// 미들웨어
pledgeSchema.pre('save', function (next) {
  // 환불 금액 검증
  if (this.refundAmount !== null && this.refundAmount !== undefined) {
    if (this.refundAmount > this.amount) {
      return next(new Error('환불 금액은 후원 금액을 초과할 수 없습니다'));
    }
  }

  // 상태별 일시 설정
  if (this.isModified('status')) {
    const now = new Date();

    switch (this.status) {
      case 'authorized':
        if (!this.authorizedAt) {
          this.authorizedAt = now;
        }
        break;
      case 'captured':
        if (!this.capturedAt) {
          this.capturedAt = now;
        }
        break;
      case 'refunded':
        if (!this.refundedAt) {
          this.refundedAt = now;
        }
        break;
    }
  }

  next();
});

// 정적 메서드
pledgeSchema.statics.findByProject = function (projectId) {
  return this.find({ projectId }).populate('user reward');
};

pledgeSchema.statics.findByUser = function (userId) {
  return this.find({ userId }).populate('project reward');
};

pledgeSchema.statics.findByStatus = function (status) {
  return this.find({ status }).populate('project user reward');
};

pledgeSchema.statics.findPending = function () {
  return this.find({ status: 'pending' });
};

pledgeSchema.statics.findAuthorized = function () {
  return this.find({ status: 'authorized' });
};

pledgeSchema.statics.findCaptured = function () {
  return this.find({ status: 'captured' });
};

pledgeSchema.statics.findRefundable = function () {
  return this.find({
    status: { $in: ['authorized', 'captured'] },
    refundedAt: { $exists: false },
  });
};

pledgeSchema.statics.findByPaymentId = function (paymentId) {
  return this.findOne({ paymentId });
};

pledgeSchema.statics.findByProjectAndUser = function (projectId, userId) {
  return this.find({ projectId, userId });
};

pledgeSchema.statics.getTotalAmountByProject = function (projectId) {
  return this.aggregate([
    {
      $match: {
        projectId: mongoose.Types.ObjectId(projectId),
        status: 'captured',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
};

pledgeSchema.statics.getBackerCountByProject = function (projectId) {
  return this.countDocuments({
    projectId,
    status: 'captured',
    userId: { $exists: true },
  });
};

pledgeSchema.statics.getPledgeStats = function (projectId = null) {
  const matchStage = projectId ? { projectId } : {};

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
};

// 인스턴스 메서드
pledgeSchema.methods.canBeRefunded = function () {
  return ['authorized', 'captured'].includes(this.status) && !this.refundedAt;
};

pledgeSchema.methods.canBeCaptured = function () {
  return this.status === 'authorized';
};

pledgeSchema.methods.canBeCancelled = function () {
  return ['pending', 'authorized'].includes(this.status);
};

pledgeSchema.methods.isCompleted = function () {
  return this.status === 'captured';
};

pledgeSchema.methods.isRefunded = function () {
  return this.status === 'refunded';
};

pledgeSchema.methods.isFailed = function () {
  return ['failed', 'cancelled'].includes(this.status);
};

pledgeSchema.methods.getRefundAmount = function () {
  if (this.refundAmount !== null && this.refundAmount !== undefined) {
    return this.refundAmount;
  }
  return this.amount; // 기본적으로 전체 금액 환불
};

pledgeSchema.methods.addChangeHistory = function (
  field,
  oldValue,
  newValue,
  changedBy,
  reason = null,
) {
  this.changeHistory.push({
    field,
    oldValue,
    newValue,
    changedBy,
    reason,
  });

  // 최대 50개까지만 보관
  if (this.changeHistory.length > 50) {
    this.changeHistory = this.changeHistory.slice(-50);
  }

  return this.save();
};

pledgeSchema.methods.authorize = function (paymentId, authorizedBy) {
  if (this.status !== 'pending') {
    throw new Error('대기 중인 후원만 승인할 수 있습니다');
  }

  this.status = 'authorized';
  this.paymentId = paymentId;
  this.authorizedAt = new Date();

  this.addChangeHistory(
    'status',
    'pending',
    'authorized',
    authorizedBy,
    '결제 승인',
  );

  return this.save();
};

pledgeSchema.methods.capture = function (capturedBy) {
  if (this.status !== 'authorized') {
    throw new Error('승인된 후원만 결제 완료할 수 있습니다');
  }

  this.status = 'captured';
  this.capturedAt = new Date();

  this.addChangeHistory(
    'status',
    'authorized',
    'captured',
    capturedBy,
    '결제 완료',
  );

  return this.save();
};

pledgeSchema.methods.refund = function (refundAmount, reason, refundedBy) {
  if (!this.canBeRefunded()) {
    throw new Error('환불할 수 없는 후원입니다');
  }

  const actualRefundAmount = refundAmount || this.amount;

  if (actualRefundAmount > this.amount) {
    throw new Error('환불 금액이 후원 금액을 초과할 수 없습니다');
  }

  this.status = 'refunded';
  this.refundAmount = actualRefundAmount;
  this.refundReason = reason;
  this.refundedAt = new Date();

  this.addChangeHistory('status', this.status, 'refunded', refundedBy, reason);

  return this.save();
};

pledgeSchema.methods.cancel = function (reason, cancelledBy) {
  if (!this.canBeCancelled()) {
    throw new Error('취소할 수 없는 후원입니다');
  }

  const oldStatus = this.status;
  this.status = 'cancelled';

  this.addChangeHistory('status', oldStatus, 'cancelled', cancelledBy, reason);

  return this.save();
};

module.exports = mongoose.model('Pledge', pledgeSchema);
