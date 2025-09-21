const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
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
      maxlength: 2000,
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
    status: {
      type: String,
      enum: ['계획중', '진행중', '완료', '보류', '취소'],
      default: '계획중',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: null,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvalReason: {
      type: String,
      maxlength: 1000,
    },
    approvedAt: {
      type: Date,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    tasks: [
      {
        id: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        description: {
          type: String,
          maxlength: 1000,
        },
        status: {
          type: String,
          enum: ['대기', '진행중', '완료', '보류'],
          default: '대기',
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        dueDate: Date,
        completedAt: Date,
      },
    ],
    milestones: [
      {
        id: {
          type: Number,
          required: true,
        },
        title: {
          type: String,
          required: true,
          maxlength: 200,
        },
        description: {
          type: String,
          maxlength: 500,
        },
        date: {
          type: Date,
          required: true,
        },
        status: {
          type: String,
          enum: ['예정', '진행중', '완료', '지연'],
          default: '예정',
        },
        completedAt: Date,
      },
    ],
    team: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          required: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
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
    isPublic: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: String,
      enum: ['낮음', '보통', '높음', '긴급'],
      default: '보통',
    },
    notes: [
      {
        content: {
          type: String,
          required: true,
          maxlength: 1000,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// 인덱스 생성
projectSchema.index({ status: 1, endDate: 1 });
projectSchema.index({ artist: 1, createdAt: -1 });
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ title: 'text', description: 'text' });

// 가상 필드: 남은 일수 계산
projectSchema.virtual('remainingDays').get(function () {
  const now = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// 가상 필드: 예산 사용률 계산
projectSchema.virtual('budgetUsage').get(function () {
  if (this.budget === 0) return 0;
  return Math.min(100, Math.round((this.spent / this.budget) * 100));
});

// 가상 필드: 완료된 태스크 수
projectSchema.virtual('completedTasks').get(function () {
  return this.tasks.filter(task => task.status === '완료').length;
});

// 가상 필드: 총 태스크 수
projectSchema.virtual('totalTasks').get(function () {
  return this.tasks.length;
});

// 프로젝트 진행률 자동 업데이트 미들웨어
projectSchema.pre('save', function (next) {
  // 태스크 기반 진행률 계산
  if (this.tasks && this.tasks.length > 0) {
    const completedTasks = this.tasks.filter(
      task => task.status === '완료',
    ).length;
    this.progress = Math.round((completedTasks / this.tasks.length) * 100);
  }

  // 마일스톤 기반 진행률 계산 (대안)
  if (this.milestones && this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(
      milestone => milestone.status === '완료',
    ).length;
    const milestoneProgress = Math.round(
      (completedMilestones / this.milestones.length) * 100,
    );

    // 태스크가 없거나 진행률이 0인 경우 마일스톤 기반으로 설정
    if (this.progress === 0 || !this.tasks || this.tasks.length === 0) {
      this.progress = milestoneProgress;
    }
  }

  next();
});

module.exports = mongoose.model('Project', projectSchema);
