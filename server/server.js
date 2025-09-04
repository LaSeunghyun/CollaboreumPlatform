const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const artistRoutes = require('./routes/artists');
const trackRoutes = require('./routes/tracks');
const eventRoutes = require('./routes/events');
const projectRoutes = require('./routes/projects');
const communityRoutes = require('./routes/communities');
const communityPostRoutes = require('./routes/community');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const galleryRoutes = require('./routes/gallery');
const fundingRoutes = require('./routes/funding');
const liveStreamRoutes = require('./routes/live-streams');
const categoryRoutes = require('./routes/categories');
const statsRoutes = require('./routes/stats');
const constantsRoutes = require('./routes/constants');
const { router: notificationRoutes } = require('./routes/notifications');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const logger = require('./middleware/logger');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  if (process.env.NODE_ENV === 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    console.error('💥 Production environment requires all environment variables');
    process.exit(1);
  } else {
    console.warn('⚠️ Using default values for missing environment variables');
    // Railway 환경에서 기본값 설정
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI 환경변수가 설정되지 않았습니다.');
      console.error('❌ Railway에서 MongoDB 연결 정보를 확인해주세요.');
      process.exit(1);
    }
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'default-jwt-secret-for-railway';
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB().then(async () => {
  // 데이터베이스 연결 후 카테고리 초기화
  try {
    const Category = require('./models/Category');
    const categoryCount = await Category.countDocuments();
    
    if (categoryCount === 0) {
      console.log('📂 카테고리가 없습니다. 기본 카테고리를 생성합니다...');
      const { seedCategories } = require('./scripts/seed-categories');
      await seedCategories();
      console.log('✅ 기본 카테고리 생성 완료');
    } else {
      console.log(`📂 기존 카테고리 ${categoryCount}개 확인됨`);
    }
  } catch (error) {
    console.error('❌ 카테고리 초기화 실패:', error);
  }
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  // Railway 환경에서는 데이터베이스 연결 실패 시에도 서버를 계속 실행
  if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    process.exit(1);
  } else {
    console.log('🔄 Server will continue running without database connection');
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // 허용된 origin 목록
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://collaboreum-mvp-platform.vercel.app',
      'https://collaboreum-mvp-platform-git-main.vercel.app',
      'https://collaboreum-mvp-platform-git-develop.vercel.app',
      /^https:\/\/.*\.vercel\.app$/, // 모든 Vercel 도메인 허용
      /^https:\/\/.*\.railway\.app$/  // 모든 Railway 도메인 허용
    ];
    
    // origin이 없거나 허용된 목록에 있으면 허용
    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return allowed === origin;
      } else if (allowed instanceof RegExp) {
        return allowed.test(origin);
      }
      return false;
    })) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단됨'));
    }
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(logger); // 커스텀 로거 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/community', communityPostRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/live-streams', liveStreamRoutes);
app.use('/api/constants', constantsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
