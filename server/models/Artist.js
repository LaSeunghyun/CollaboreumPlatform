const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // 기본 정보
  category: {
    type: String,
    required: [true, '카테고리는 필수입니다'],
    enum: Object.values(require('../constants/enums').ENUMS.ARTIST_CATEGORIES)
  },
  location: {
    type: String,
    required: [true, '위치는 필수입니다']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, '평점은 0 이상이어야 합니다'],
    max: [5, '평점은 5 이하여야 합니다']
  },
  tags: [{
    type: String,
    trim: true
  }],
  // 이미지
  coverImage: {
    type: String,
    default: null
  },
  profileImage: {
    type: String,
    default: null
  },
  // 통계
  followers: {
    type: Number,
    default: 0,
    min: [0, '팔로워 수는 음수일 수 없습니다']
  },
  completedProjects: {
    type: Number,
    default: 0,
    min: [0, '완료 프로젝트 수는 음수일 수 없습니다']
  },
  activeProjects: {
    type: Number,
    default: 0,
    min: [0, '진행 중 프로젝트 수는 음수일 수 없습니다']
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: [0, '총 수익은 음수일 수 없습니다']
  },
  // 기존 필드들
  genre: [{
    type: String,
    required: [true, '장르는 필수입니다'],
    enum: Object.values(require('../constants/enums').ENUMS.ARTIST_GENRES)
  }],
  totalStreams: {
    type: Number,
    default: 0,
    min: [0, '스트림 수는 음수일 수 없습니다']
  },
  monthlyListeners: {
    type: Number,
    default: 0,
    min: [0, '월간 청취자 수는 음수일 수 없습니다']
  },
  socialLinks: {
    instagram: String,
    twitter: String,
    youtube: String,
    spotify: String,
    soundcloud: String,
    tiktok: String
  },
  achievements: [{
    title: String,
    description: String,
    date: Date,
    image: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDate: Date,
  featured: {
    type: Boolean,
    default: false
  },
  featuredDate: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상 필드: 트랙 수
artistSchema.virtual('trackCount', {
  ref: 'Track',
  localField: '_id',
  foreignField: 'artistId',
  count: true
});

// 가상 필드: 이벤트 수
artistSchema.virtual('eventCount', {
  ref: 'Event',
  localField: '_id',
  foreignField: 'artistId',
  count: true
});

// 가상 필드: 프로젝트 수
artistSchema.virtual('projectCount', {
  ref: 'Project',
  localField: '_id',
  foreignField: 'artistId',
  count: true
 });

// 인덱스
artistSchema.index({ category: 1 });
artistSchema.index({ location: 1 });
artistSchema.index({ rating: -1 });
artistSchema.index({ followers: -1 });
artistSchema.index({ totalStreams: -1 });
artistSchema.index({ featured: 1, featuredDate: -1 });

// 팔로워 수 업데이트 메서드
artistSchema.methods.updateFollowers = function(change) {
  this.followers = Math.max(0, this.followers + change);
  return this.save();
};

// 스트림 수 업데이트 메서드
artistSchema.methods.updateStreams = function(streams) {
  this.totalStreams += streams;
  this.monthlyListeners = Math.floor(this.totalStreams / 12); // 간단한 계산
  return this.save();
};

// 프로젝트 완료 메서드
artistSchema.methods.completeProject = function() {
  this.completedProjects += 1;
  this.activeProjects = Math.max(0, this.activeProjects - 1);
  return this.save();
};

// 프로젝트 시작 메서드
artistSchema.methods.startProject = function() {
  this.activeProjects += 1;
  return this.save();
};

module.exports = mongoose.model('Artist', artistSchema);
