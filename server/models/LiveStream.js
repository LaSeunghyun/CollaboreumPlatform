const mongoose = require('mongoose');

const liveStreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['음악', '공연', '토크', '워크샵', '기타'],
    default: '음악'
  },
  thumbnail: {
    type: String,
    default: null
  },
  streamUrl: {
    type: String,
    default: null
  },
  isLive: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['예정', '라이브', '종료', '취소'],
    default: '예정'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  startedAt: {
    type: Date,
    default: null
  },
  endedAt: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // 분 단위
    default: 0
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  maxViewers: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowedViewers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  chatEnabled: {
    type: Boolean,
    default: true
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// 인덱스 생성
liveStreamSchema.index({ status: 1, startedAt: -1 });
liveStreamSchema.index({ artist: 1, createdAt: -1 });
liveStreamSchema.index({ category: 1, status: 1 });
liveStreamSchema.index({ title: 'text', description: 'text' });

// 가상 필드: 현재 시청자 수
liveStreamSchema.virtual('currentViewers').get(function() {
  return this.isLive ? this.viewerCount : 0;
});

// 가상 필드: 스트림 진행 시간 (분)
liveStreamSchema.virtual('elapsedTime').get(function() {
  if (!this.startedAt || !this.isLive) return 0;
  const now = new Date();
  const elapsed = now - this.startedAt;
  return Math.floor(elapsed / (1000 * 60));
});

// 스트림 상태 자동 업데이트 미들웨어
liveStreamSchema.pre('save', function(next) {
  const now = new Date();
  
  // 스트림 시작 시간이 되면 자동으로 라이브 상태로 변경
  if (this.status === '예정' && this.scheduledAt && this.scheduledAt <= now) {
    this.status = '라이브';
    this.isLive = true;
    this.startedAt = now;
  }
  
  // 스트림이 종료되면 자동으로 상태 변경
  if (this.status === '라이브' && this.endedAt && this.endedAt <= now) {
    this.status = '종료';
    this.isLive = false;
  }
  
  next();
});

module.exports = mongoose.model('LiveStream', liveStreamSchema);
