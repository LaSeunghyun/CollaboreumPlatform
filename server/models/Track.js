const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
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
  album: {
    type: String,
    required: true,
    maxlength: 200
  },
  duration: {
    type: String,
    required: true,
    pattern: /^\d{1,2}:\d{2}$/ // MM:SS 형식
  },
  genre: {
    type: String,
    required: true,
    enum: ['인디팝', '록', '어쿠스틱', '재즈', '클래식', '일렉트로닉', '힙합', 'R&B', '기타'],
    default: '기타'
  },
  releaseDate: {
    type: Date,
    required: true
  },
  plays: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  image: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
  },
  lyrics: {
    type: String,
    maxlength: 5000
  },
  credits: {
    lyrics: {
      type: String,
      default: null
    },
    music: {
      type: String,
      default: null
    },
    arrangement: {
      type: String,
      default: null
    },
    producer: {
      type: String,
      default: null
    },
    mixing: {
      type: String,
      default: null
    },
    mastering: {
      type: String,
      default: null
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isExplicit: {
    type: Boolean,
    default: false
  },
  bpm: {
    type: Number,
    min: 60,
    max: 200
  },
  key: {
    type: String,
    enum: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  },
  mood: [{
    type: String,
    enum: ['신나는', '감성적인', '잔잔한', '강렬한', '우울한', '희망적인', '로맨틱한', '신비로운']
  }],
  instruments: [{
    type: String,
    trim: true
  }],
  language: {
    type: String,
    default: '한국어'
  },
  copyright: {
    type: String,
    maxlength: 500
  },
  license: {
    type: String,
    enum: ['All Rights Reserved', 'Creative Commons', 'Public Domain'],
    default: 'All Rights Reserved'
  }
}, {
  timestamps: true
});

// 인덱스 생성
trackSchema.index({ title: 'text', lyrics: 'text' });
trackSchema.index({ artist: 1, releaseDate: -1 });
trackSchema.index({ genre: 1, releaseDate: -1 });
trackSchema.index({ album: 1, releaseDate: -1 });

// 가상 필드: 좋아요 수
trackSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// 가상 필드: 재생 시간 (초)
trackSchema.virtual('durationSeconds').get(function() {
  if (!this.duration) return 0;
  const [minutes, seconds] = this.duration.split(':').map(Number);
  return minutes * 60 + seconds;
});

// 가상 필드: 인기도 점수 (재생수 + 좋아요수 * 10)
trackSchema.virtual('popularityScore').get(function() {
  return this.plays + (this.likes?.length || 0) * 10;
});

// 트랙 재생 시 재생수 증가
trackSchema.methods.incrementPlays = function() {
  this.plays += 1;
  return this.save();
};

// 트랙 좋아요/취소
trackSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    // 좋아요 추가
    this.likes.push(userId);
  } else {
    // 좋아요 제거
    this.likes.splice(likeIndex, 1);
  }
  
  return this.save();
};

module.exports = mongoose.model('Track', trackSchema);
