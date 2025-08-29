const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '이름은 필수입니다'],
    trim: true,
    maxlength: [50, '이름은 50자를 초과할 수 없습니다']
  },
  username: {
    type: String,
    required: false, // 선택적으로 변경
    unique: true,
    sparse: true, // null 값은 unique 제약에서 제외
    trim: true,
    maxlength: [30, '사용자명은 30자를 초과할 수 없습니다']
  },
  email: {
    type: String,
    required: [true, '이메일은 필수입니다'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일을 입력해주세요']
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다']
  },
  role: {
    type: String,
    enum: ['artist', 'admin', 'fan'],
    default: 'fan'
  },
  avatar: {
    type: String,
    default: '/avatars/default.jpg'
  },
  bio: {
    type: String,
    maxlength: [500, '자기소개는 500자를 초과할 수 없습니다']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  lastLoginAt: {
    type: Date
  },
  agreeTerms: {
    type: Boolean,
    default: false
  },
  agreePrivacy: {
    type: Boolean,
    default: false
  },
  agreeMarketing: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 가상 필드: 아티스트 정보
userSchema.virtual('artistProfile', {
  ref: 'Artist',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

// 비밀번호 확인 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 사용자 정보 업데이트 메서드
userSchema.methods.updateProfile = function(updates) {
  Object.keys(updates).forEach(key => {
    if (key !== 'password' && key !== 'email' && key !== 'role') {
      this[key] = updates[key];
    }
  });
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
