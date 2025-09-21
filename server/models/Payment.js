const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    // 기본 정보
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // 프로젝트 정보
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundingProject',
      required: true,
      index: true,
    },

    // 후원자 정보
    backerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    backerName: {
      type: String,
      required: true,
    },
    backerEmail: {
      type: String,
      required: true,
      index: true,
    },
    backerPhone: {
      type: String,
      required: true,
    },
    backerAddress: {
      type: String,
      default: '',
    },

    // 리워드 정보
    rewardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reward',
      default: null,
    },
    rewardName: {
      type: String,
      default: '',
    },

    // 결제 정보
    amount: {
      type: Number,
      required: true,
      min: 1000,
      max: 10000000,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank', 'kakao', 'naver'],
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['toss', 'iamport'],
      default: 'toss',
    },

    // 결제 상태
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },

    // 외부 결제 시스템 정보
    transactionId: {
      type: String,
      default: '',
    },
    paymentKey: {
      type: String,
      default: '',
    },

    // 메시지
    message: {
      type: String,
      default: '',
      maxlength: 500,
    },

    // 타임스탬프
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    refundedAt: {
      type: Date,
      default: null,
    },

    // 환불 정보
    refundId: {
      type: String,
      default: '',
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundReason: {
      type: String,
      default: '',
    },

    // 메타데이터
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 인덱스 설정
paymentSchema.index({ projectId: 1, status: 1 });
paymentSchema.index({ backerEmail: 1, projectId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// 가상 필드
paymentSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});

paymentSchema.virtual('isRefundable').get(function () {
  return this.status === 'completed' && this.refundAmount === 0;
});

paymentSchema.virtual('formattedAmount').get(function () {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(this.amount);
});

// 메서드
paymentSchema.methods.cancel = function (reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.refundReason = reason;
  return this.save();
};

paymentSchema.methods.refund = function (amount, reason) {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.refundAmount = amount || this.amount;
  this.refundReason = reason;
  return this.save();
};

// 정적 메서드
paymentSchema.statics.getProjectStats = function (projectId) {
  return this.aggregate([
    {
      $match: {
        projectId: mongoose.Types.ObjectId(projectId),
        status: 'completed',
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalBackers: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
      },
    },
  ]);
};

paymentSchema.statics.getDailyStats = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
