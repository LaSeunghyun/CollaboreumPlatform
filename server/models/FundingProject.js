const mongoose = require('mongoose');

const fundingProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 5000,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    artistName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['음악', '비디오', '공연', '도서', '게임', '기타'],
      default: '기타',
    },
    goalAmount: {
      type: Number,
      required: true,
      min: 100000,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    // 집행 계획 관련 필드 추가
    executionPlan: {
      stages: [
        {
          name: {
            type: String,
            required: true,
            maxlength: 100,
          },
          description: {
            type: String,
            required: true,
            maxlength: 500,
          },
          budget: {
            type: Number,
            required: true,
            min: 0,
          },
          startDate: {
            type: Date,
            required: true,
          },
          endDate: {
            type: Date,
            required: true,
          },
          status: {
            type: String,
            enum: ['계획', '진행중', '완료', '지연'],
            default: '계획',
          },
          progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
          },
        },
      ],
      totalBudget: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    // 비용 사용 내역
    expenseRecords: [
      {
        category: {
          type: String,
          required: true,
          enum: ['인건비', '재료비', '장비비', '마케팅비', '기타'],
          default: '기타',
        },
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        description: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        receipt: {
          type: String, // 영수증 이미지 URL
          default: null,
        },
        date: {
          type: Date,
          required: true,
        },
        stage: {
          type: mongoose.Schema.Types.ObjectId, // executionPlan.stages 참조
          default: null,
        },
        verified: {
          type: Boolean,
          default: false,
        },
      },
    ],
    // 수익 분배 관련
    revenueDistribution: {
      totalRevenue: {
        type: Number,
        default: 0,
      },
      platformFee: {
        type: Number,
        default: 0.05, // 5% 플랫폼 수수료
      },
      artistShare: {
        type: Number,
        default: 0.7, // 70% 아티스트 수익
      },
      backerShare: {
        type: Number,
        default: 0.25, // 25% 후원자 수익 분배
      },
      distributions: [
        {
          backer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          userName: String,
          originalAmount: {
            type: Number,
            required: true,
          },
          profitShare: {
            type: Number,
            default: 0,
          },
          totalReturn: {
            type: Number,
            default: 0,
          },
          distributedAt: {
            type: Date,
            default: null,
          },
          status: {
            type: String,
            enum: ['대기', '분배완료', '지급완료'],
            default: '대기',
          },
        },
      ],
    },
    backers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        userName: String,
        amount: {
          type: Number,
          required: true,
          min: 1000,
        },
        reward: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'ProjectReward',
        },
        backedAt: {
          type: Date,
          default: Date.now,
        },
        // 익명 후원 여부
        isAnonymous: {
          type: Boolean,
          default: false,
        },
        // 후원 메시지
        message: {
          type: String,
          maxlength: 500,
          default: '',
        },
      },
    ],
    rewards: [
      {
        title: {
          type: String,
          required: true,
          maxlength: 100,
        },
        description: {
          type: String,
          required: true,
          maxlength: 500,
        },
        amount: {
          type: Number,
          required: true,
          min: 1000,
        },
        claimed: {
          type: Number,
          default: 0,
        },
        maxClaim: {
          type: Number,
          default: null,
        },
        estimatedDelivery: {
          type: Date,
        },
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['준비중', '진행중', '성공', '실패', '취소', '집행중', '완료'],
      default: '준비중',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    daysLeft: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: null,
    },
    updates: [
      {
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        content: {
          type: String,
          required: true,
          maxlength: 2000,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ['일반', '집행진행', '비용공개', '수익분배'],
          default: '일반',
        },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// 인덱스 생성
fundingProjectSchema.index({ status: 1, endDate: 1 });
fundingProjectSchema.index({ category: 1, status: 1 });
fundingProjectSchema.index({ artist: 1, createdAt: -1 });
fundingProjectSchema.index({ title: 'text', description: 'text' });

// 가상 필드: 남은 일수 계산
fundingProjectSchema.virtual('remainingDays').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// 가상 필드: 달성률 계산
fundingProjectSchema.virtual('achievementRate').get(function () {
  if (this.goalAmount === 0) return 0;
  return Math.min(
    100,
    Math.round((this.currentAmount / this.goalAmount) * 100),
  );
});

// 가상 필드: 후원자 수 계산
fundingProjectSchema.virtual('backerCount').get(function () {
  return this.backers.length;
});

// 프로젝트 상태 자동 업데이트 미들웨어
fundingProjectSchema.pre('save', function (next) {
  const now = new Date();

  // 남은 일수 계산
  this.daysLeft = this.remainingDays;

  // 진행률 계산
  this.progress = this.achievementRate;

  // 상태 업데이트
  if (this.status === '준비중' && this.startDate <= now) {
    this.status = '진행중';
  }

  if (this.status === '진행중' && this.endDate <= now) {
    if (this.currentAmount >= this.goalAmount) {
      this.status = '성공';
    } else {
      this.status = '실패';
    }
  }

  next();
});

module.exports = mongoose.model('FundingProject', fundingProjectSchema);
