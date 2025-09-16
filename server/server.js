const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const artistRoutes = require('./routes/artists');
const trackRoutes = require('./routes/tracks');
const eventRoutes = require('./routes/events');
const projectRoutes = require('./routes/projects');
const communityRoutes = require('./routes/community');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const galleryRoutes = require('./routes/gallery');
const fundingRoutes = require('./routes/funding');
const liveStreamRoutes = require('./routes/live-streams');
const categoryRoutes = require('./routes/categories');
const statsRoutes = require('./routes/stats');
const constantsRoutes = require('./routes/constants');
const { router: notificationRoutes } = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const revenueRoutes = require('./routes/revenue');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const loggerMiddleware = require('./middleware/logger');

// Load environment variables
dotenv.config();

// Pino 로거 초기화
const { logger } = require('./src/logger');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error({ missingEnvVars }, 'Missing required environment variables');
  if (process.env.NODE_ENV === 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    logger.error('Production environment requires all environment variables');
    process.exit(1);
  } else {
    logger.warn('Using default values for missing environment variables');
    // Railway 환경에서 기본값 설정
    if (!process.env.MONGODB_URI) {
      logger.error('MONGODB_URI 환경변수가 설정되지 않았습니다.');
      logger.error('Railway에서 MongoDB 연결 정보를 확인해주세요.');
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
      logger.info('카테고리가 없습니다. 기본 카테고리를 생성합니다...');
      const { seedCategories } = require('./scripts/seed-categories');
      await seedCategories();
      logger.info('기본 카테고리 생성 완료');
    } else {
      logger.info({ categoryCount }, '기존 카테고리 확인됨');
    }
  } catch (error) {
    logger.error({ error }, '카테고리 초기화 실패');
  }
}).catch((error) => {
  logger.error({ error }, 'Failed to connect to database');
  // Railway 환경에서는 데이터베이스 연결 실패 시에도 서버를 계속 실행
  if (process.env.NODE_ENV !== 'production' && !process.env.RAILWAY_ENVIRONMENT) {
    process.exit(1);
  } else {
    logger.info('Server will continue running without database connection');
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
app.use(loggerMiddleware); // Pino 기반 로거 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../build')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/tracks', trackRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/funding', fundingRoutes);
app.use('/api/live-streams', liveStreamRoutes);
app.use('/api/constants', constantsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/revenue', revenueRoutes);

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

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info({ 
    port: PORT, 
    environment: process.env.NODE_ENV || 'development',
    healthCheck: `http://localhost:${PORT}/api/health`
  }, 'Server started successfully');
});

// Handle server errors
server.on('error', (error) => {
  logger.error({ error, port: PORT }, 'Server error');
  if (error.code === 'EADDRINUSE') {
    logger.error({ port: PORT }, 'Port is already in use');
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ error }, 'Uncaught Exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
  process.exit(1);
});
