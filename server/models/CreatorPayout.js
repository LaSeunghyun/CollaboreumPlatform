const mongoose = require('mongoose');

const creatorPayoutSchema = new mongoose.Schema({
  // 크리에이터 정보
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  creatorName: {
    type: String,
    required: true
  },
  
  // 프로젝트 정보
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FundingProject',
    required: true,
    index: true
  },
  projectTitle: {
    type: String,
    required: true
  },
  
  // 수익 분배 정보
  revenueDistributionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RevenueDistribution',
    required: true,
    index: true
  },
  
  // 지급 정보
  payoutId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 계좌 정보
  bankAccount: {
    bankCode: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountHolder: {
      type: String,
      required: true
    }
  },
  
  // 지급 상태
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  // 지급 일시
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  
  // 은행 API 정보
  bankTransactionId: {
    type: String,
    default: ''
  },
  bankResponseCode: {
    type: String,
    default: ''
  },
  bankResponseMessage: {
    type: String,
    default: ''
  },
  
  // 실패 정보
  failureReason: {
    type: String,
    default: ''
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  lastRetryAt: {
    type: Date,
    default: null
  },
  
  // 수수료 정보
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 메타데이터
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 인덱스 설정
creatorPayoutSchema.index({ creatorId: 1, status: 1 });
creatorPayoutSchema.index({ projectId: 1, status: 1 });
creatorPayoutSchema.index({ payoutId: 1 });
creatorPayoutSchema.index({ requestedAt: -1 });
creatorPayoutSchema.index({ status: 1, requestedAt: -1 });

// 가상 필드
creatorPayoutSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

creatorPayoutSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

creatorPayoutSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.retryCount < 3;
});

creatorPayoutSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(this.amount);
});

creatorPayoutSchema.virtual('formattedNetAmount').get(function() {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(this.netAmount);
});

creatorPayoutSchema.virtual('formattedProcessingFee').get(function() {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(this.processingFee);
});

// 메서드
creatorPayoutSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  this.processedAt = new Date();
  return this.save();
};

creatorPayoutSchema.methods.markAsCompleted = function(bankTransactionId, bankResponseCode, bankResponseMessage) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.bankTransactionId = bankTransactionId;
  this.bankResponseCode = bankResponseCode;
  this.bankResponseMessage = bankResponseMessage;
  return this.save();
};

creatorPayoutSchema.methods.markAsFailed = function(reason, bankResponseCode, bankResponseMessage) {
  this.status = 'failed';
  this.failureReason = reason;
  this.bankResponseCode = bankResponseCode;
  this.bankResponseMessage = bankResponseMessage;
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  return this.save();
};

creatorPayoutSchema.methods.retry = function() {
  if (this.canRetry) {
    this.status = 'pending';
    this.failureReason = '';
    return this.save();
  }
  throw new Error('재시도 횟수를 초과했습니다.');
};

// 정적 메서드
creatorPayoutSchema.statics.getCreatorPayoutStats = function(creatorId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        creatorId: mongoose.Types.ObjectId(creatorId),
        status: 'completed',
        completedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalPayouts: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        totalProcessingFee: { $sum: '$processingFee' },
        averageAmount: { $avg: '$amount' }
      }
    }
  ]);
};

creatorPayoutSchema.statics.getMonthlyPayoutStats = function(creatorId, year) {
  return this.aggregate([
    {
      $match: {
        creatorId: mongoose.Types.ObjectId(creatorId),
        status: 'completed',
        completedAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$completedAt' }
        },
        totalAmount: { $sum: '$amount' },
        totalNetAmount: { $sum: '$netAmount' },
        payoutCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);
};

creatorPayoutSchema.statics.getFailedPayouts = function() {
  return this.find({
    status: 'failed',
    retryCount: { $lt: 3 }
  }).sort({ lastRetryAt: 1 });
};

module.exports = mongoose.model('CreatorPayout', creatorPayoutSchema);
