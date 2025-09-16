const mongoose = require('mongoose');

const revenueDistributionSchema = new mongoose.Schema({
  // 프로젝트 정보
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FundingProject',
    required: true,
    index: true
  },
  
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
  
  // 수익 정보
  totalRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  platformFee: {
    type: Number,
    required: true,
    min: 0
  },
  creatorRevenue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // 수수료 비율
  platformFeeRate: {
    type: Number,
    default: 0.05, // 5%
    min: 0,
    max: 1
  },
  creatorRevenueRate: {
    type: Number,
    default: 0.95, // 95%
    min: 0,
    max: 1
  },
  
  // 분배 상태
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  
  // 분배 일시
  distributionDate: {
    type: Date,
    required: true,
    index: true
  },
  processedAt: {
    type: Date,
    default: null
  },
  
  // 지급 정보
  payoutId: {
    type: String,
    default: ''
  },
  payoutStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  payoutProcessedAt: {
    type: Date,
    default: null
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
  
  // 통계 정보
  backerCount: {
    type: Number,
    required: true,
    min: 0
  },
  averageBackAmount: {
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
revenueDistributionSchema.index({ projectId: 1, status: 1 });
revenueDistributionSchema.index({ creatorId: 1, status: 1 });
revenueDistributionSchema.index({ distributionDate: -1 });
revenueDistributionSchema.index({ status: 1, distributionDate: -1 });

// 가상 필드
revenueDistributionSchema.virtual('isCompleted').get(function() {
  return this.status === 'completed';
});

revenueDistributionSchema.virtual('isFailed').get(function() {
  return this.status === 'failed';
});

revenueDistributionSchema.virtual('canRetry').get(function() {
  return this.status === 'failed' && this.retryCount < 3;
});

revenueDistributionSchema.virtual('formattedTotalRevenue').get(function() {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(this.totalRevenue);
});

revenueDistributionSchema.virtual('formattedCreatorRevenue').get(function() {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(this.creatorRevenue);
});

revenueDistributionSchema.virtual('formattedPlatformFee').get(function() {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(this.platformFee);
});

// 메서드
revenueDistributionSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this.save();
};

revenueDistributionSchema.methods.markAsCompleted = function(payoutId) {
  this.status = 'completed';
  this.processedAt = new Date();
  this.payoutId = payoutId;
  this.payoutStatus = 'completed';
  this.payoutProcessedAt = new Date();
  return this.save();
};

revenueDistributionSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.failureReason = reason;
  this.retryCount += 1;
  this.lastRetryAt = new Date();
  return this.save();
};

revenueDistributionSchema.methods.retry = function() {
  if (this.canRetry) {
    this.status = 'pending';
    this.failureReason = '';
    return this.save();
  }
  throw new Error('재시도 횟수를 초과했습니다.');
};

// 정적 메서드
revenueDistributionSchema.statics.getCreatorStats = function(creatorId, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        creatorId: mongoose.Types.ObjectId(creatorId),
        status: 'completed',
        distributionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: '$creatorRevenue' },
        totalProjects: { $sum: 1 },
        totalBackers: { $sum: '$backerCount' },
        averageProjectRevenue: { $avg: '$creatorRevenue' }
      }
    }
  ]);
};

revenueDistributionSchema.statics.getPlatformStats = function(startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        distributionDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalPlatformFee: { $sum: '$platformFee' },
        totalCreatorRevenue: { $sum: '$creatorRevenue' },
        totalRevenue: { $sum: '$totalRevenue' },
        totalProjects: { $sum: 1 },
        totalBackers: { $sum: '$backerCount' }
      }
    }
  ]);
};

revenueDistributionSchema.statics.getMonthlyStats = function(year) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        distributionDate: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$distributionDate' }
        },
        totalPlatformFee: { $sum: '$platformFee' },
        totalCreatorRevenue: { $sum: '$creatorRevenue' },
        totalRevenue: { $sum: '$totalRevenue' },
        projectCount: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);
};

module.exports = mongoose.model('RevenueDistribution', revenueDistributionSchema);
