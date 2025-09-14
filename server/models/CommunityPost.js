const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['자유', '질문', '음악', '미술', '문학', '공연', '사진', '기술', '기타'],
    default: '자유'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      maxlength: 500
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isReported: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    // 대댓글 필드 추가
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      authorName: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true,
        maxlength: 500
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }
    }]
  }],
  tags: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 인덱스 생성
communityPostSchema.index({ title: 'text', content: 'text' });
communityPostSchema.index({ category: 1, createdAt: -1 });
communityPostSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
