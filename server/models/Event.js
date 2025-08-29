const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['축제', '공연', '경연', '워크샵', '세미나', '기타'],
    default: '기타'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    maxlength: 200
  },
  address: {
    type: String,
    maxlength: 300
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  currentAttendees: {
    type: Number,
    default: 0
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  tickets: [{
    type: {
      type: String,
      required: true,
      enum: ['일반', 'VIP', '얼리버드', '학생']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    available: {
      type: Number,
      required: true,
      min: 0
    },
    sold: {
      type: Number,
      default: 0
    }
  }],
  performers: [{
    name: {
      type: String,
      required: true
    },
    genre: String,
    description: String
  }],
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['예정', '진행중', '완료', '취소'],
    default: '예정'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// 인덱스 생성
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ category: 1, startDate: 1 });
eventSchema.index({ location: 1, startDate: 1 });
eventSchema.index({ title: 'text', description: 'text' });

// 이벤트 상태 자동 업데이트 미들웨어
eventSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.startDate <= now && this.endDate >= now) {
    this.status = '진행중';
  } else if (this.endDate < now) {
    this.status = '완료';
  } else if (this.startDate > now) {
    this.status = '예정';
  }
  
  next();
});

module.exports = mongoose.model('Event', eventSchema);
