const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 펀딩 프로젝트 스키마
 */
const fundingProjectSchema = new Schema(
  {
    // 기본 정보
    title: {
      type: String,
      required: [true, '제목은 필수입니다'],
      trim: true,
      maxlength: [100, '제목은 최대 100자까지 가능합니다'],
      index: true,
    },
    description: {
      type: String,
      required: [true, '설명은 필수입니다'],
      maxlength: [5000, '설명은 최대 5000자까지 가능합니다'],
    },
    shortDescription: {
      type: String,
      required: [true, '짧은 설명은 필수입니다'],
      maxlength: [200, '짧은 설명은 최대 200자까지 가능합니다'],
    },

    // 금액 정보 (원 단위 정수)
    targetAmount: {
      type: Number,
      required: [true, '목표 금액은 필수입니다'],
      min: [1000, '목표 금액은 최소 1,000원 이상이어야 합니다'],
      max: [1000000000, '목표 금액은 최대 10억원까지 가능합니다'],
      validate: {
        validator: Number.isInteger,
        message: '목표 금액은 정수여야 합니다',
      },
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, '현재 금액은 0원 이상이어야 합니다'],
      validate: {
        validator: Number.isInteger,
        message: '현재 금액은 정수여야 합니다',
      },
    },

    // 상태 및 날짜
    status: {
      type: String,
      enum: {
        values: [
          'draft',
          'collecting',
          'succeeded',
          'failed',
          'executing',
          'distributing',
          'closed',
        ],
        message: '유효하지 않은 상태입니다',
      },
      default: 'draft',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, '시작일은 필수입니다'],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: '시작일은 현재 날짜 이후여야 합니다',
      },
    },
    endDate: {
      type: Date,
      required: [true, '마감일은 필수입니다'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: '마감일은 시작일보다 이후여야 합니다',
      },
      index: true,
    },

    // 소유자 및 카테고리
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '소유자는 필수입니다'],
      index: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, '카테고리는 필수입니다'],
      index: true,
    },

    // 미디어 및 태그
    images: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: '올바른 이미지 URL이 아닙니다',
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, '태그는 최대 20자까지 가능합니다'],
      },
    ],

    // 리워드 (서브도큐먼트)
    rewards: [
      {
        title: {
          type: String,
          required: true,
          maxlength: [100, '리워드 제목은 최대 100자까지 가능합니다'],
        },
        description: {
          type: String,
          required: true,
          maxlength: [1000, '리워드 설명은 최대 1000자까지 가능합니다'],
        },
        amount: {
          type: Number,
          required: true,
          min: [1000, '리워드 금액은 최소 1,000원 이상이어야 합니다'],
          validate: {
            validator: Number.isInteger,
            message: '리워드 금액은 정수여야 합니다',
          },
        },
        deliveryDate: {
          type: Date,
          required: true,
          validate: {
            validator: function (value) {
              return value >= new Date();
            },
            message: '배송일은 현재 날짜 이후여야 합니다',
          },
        },
        stock: {
          type: Number,
          default: null,
          min: [0, '재고는 0 이상이어야 합니다'],
          validate: {
            validator: function (v) {
              return v === null || Number.isInteger(v);
            },
            message: '재고는 정수여야 합니다',
          },
        },
        soldCount: {
          type: Number,
          default: 0,
          min: [0, '판매 수량은 0 이상이어야 합니다'],
          validate: {
            validator: Number.isInteger,
            message: '판매 수량은 정수여야 합니다',
          },
        },
        isLimited: {
          type: Boolean,
          default: false,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        images: [
          {
            type: String,
            validate: {
              validator: function (v) {
                return /^https?:\/\/.+/.test(v);
              },
              message: '올바른 이미지 URL이 아닙니다',
            },
          },
        ],
        metadata: {
          type: Schema.Types.Mixed,
          default: {},
        },
      },
    ],

    // 통계
    progress: {
      type: Number,
      default: 0,
      min: [0, '진행률은 0% 이상이어야 합니다'],
      max: [100, '진행률은 100% 이하여야 합니다'],
    },
    backerCount: {
      type: Number,
      default: 0,
      min: [0, '후원자 수는 0명 이상이어야 합니다'],
      validate: {
        validator: Number.isInteger,
        message: '후원자 수는 정수여야 합니다',
      },
    },

    // 플래그
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
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
fundingProjectSchema.virtual('owner', {
  ref: 'User',
  localField: 'ownerId',
  foreignField: '_id',
  justOne: true,
});

fundingProjectSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

fundingProjectSchema.virtual('pledges', {
  ref: 'Pledge',
  localField: '_id',
  foreignField: 'projectId',
});

fundingProjectSchema.virtual('executions', {
  ref: 'Execution',
  localField: '_id',
  foreignField: 'projectId',
});

fundingProjectSchema.virtual('distributions', {
  ref: 'Distribution',
  localField: '_id',
  foreignField: 'projectId',
});

// 인덱스
fundingProjectSchema.index({ status: 1, endDate: 1 });
fundingProjectSchema.index({ ownerId: 1, status: 1 });
fundingProjectSchema.index({ categoryId: 1, status: 1 });
fundingProjectSchema.index({ tags: 1 });
fundingProjectSchema.index({ isActive: 1, isFeatured: 1 });
fundingProjectSchema.index({ createdAt: -1 });
fundingProjectSchema.index({ targetAmount: 1 });
fundingProjectSchema.index({ currentAmount: 1 });

// 텍스트 검색 인덱스
fundingProjectSchema.index({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
});

// 미들웨어
fundingProjectSchema.pre('save', function (next) {
  // 진행률 계산
  if (this.targetAmount > 0) {
    this.progress = Math.min(
      Math.round((this.currentAmount / this.targetAmount) * 100),
      100,
    );
  }

  // 펀딩 기간 검증
  if (this.startDate && this.endDate) {
    const daysDiff =
      (this.endDate.getTime() - this.startDate.getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysDiff < 1 || daysDiff > 90) {
      return next(new Error('펀딩 기간은 1일 이상 90일 이하여야 합니다'));
    }
  }

  next();
});

fundingProjectSchema.pre('findOneAndUpdate', function (next) {
  // 업데이트 시 진행률 재계산
  const update = this.getUpdate();
  if (update.currentAmount !== undefined || update.targetAmount !== undefined) {
    const currentAmount = update.currentAmount || this.getQuery().currentAmount;
    const targetAmount = update.targetAmount || this.getQuery().targetAmount;

    if (targetAmount > 0) {
      update.progress = Math.min(
        Math.round((currentAmount / targetAmount) * 100),
        100,
      );
    }
  }

  next();
});

// 정적 메서드
fundingProjectSchema.statics.findActive = function () {
  return this.find({
    isActive: true,
    status: { $in: ['collecting', 'succeeded'] },
  });
};

fundingProjectSchema.statics.findFeatured = function () {
  return this.find({ isActive: true, isFeatured: true, status: 'collecting' });
};

fundingProjectSchema.statics.findByCategory = function (categoryId) {
  return this.find({ categoryId, isActive: true });
};

fundingProjectSchema.statics.searchByText = function (searchTerm) {
  return this.find(
    {
      $text: { $search: searchTerm },
      isActive: true,
    },
    {
      score: { $meta: 'textScore' },
    },
  ).sort({ score: { $meta: 'textScore' } });
};

fundingProjectSchema.statics.findExpired = function () {
  return this.find({
    status: 'collecting',
    endDate: { $lte: new Date() },
  });
};

// 인스턴스 메서드
fundingProjectSchema.methods.addPledge = function (amount) {
  this.currentAmount += amount;
  this.backerCount += 1;
  return this.save();
};

fundingProjectSchema.methods.removePledge = function (amount) {
  this.currentAmount = Math.max(0, this.currentAmount - amount);
  this.backerCount = Math.max(0, this.backerCount - 1);
  return this.save();
};

fundingProjectSchema.methods.isExpired = function () {
  return this.endDate <= new Date();
};

fundingProjectSchema.methods.isGoalAchieved = function () {
  return this.currentAmount >= this.targetAmount;
};

fundingProjectSchema.methods.canBeEdited = function () {
  return this.status === 'draft';
};

fundingProjectSchema.methods.canReceivePledges = function () {
  return this.status === 'collecting' && !this.isExpired();
};

fundingProjectSchema.methods.addChangeHistory = function (
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

  // 최대 100개까지만 보관
  if (this.changeHistory.length > 100) {
    this.changeHistory = this.changeHistory.slice(-100);
  }

  return this.save();
};

module.exports = mongoose.model('FundingProject', fundingProjectSchema);
