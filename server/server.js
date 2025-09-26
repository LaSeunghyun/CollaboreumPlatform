const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

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
const searchRoutes = require('./routes/search');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const loggerMiddleware = require('./middleware/logger');

// Load environment variables
dotenv.config();

// Pino 로거 초기화
const { logger } = require('./src/logger');

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error({ missingEnvVars }, 'Missing required environment variables');
  if (
    process.env.NODE_ENV === 'production' &&
    !process.env.RAILWAY_ENVIRONMENT
  ) {
    logger.error('Production environment requires all environment variables');
    process.exit(1);
  } else {
    logger.warn('Using default values for missing environment variables');
    // Railway 환경에서 기본값 설정
    if (!process.env.DATABASE_URL) {
      logger.error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
      logger.error('Railway에서 PostgreSQL 연결 정보를 확인해주세요.');
      process.exit(1);
    }
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'default-jwt-secret-for-railway';
    }
  }
}

const app = express();
const PORT = process.env.PORT || 5000;
const clientBuildPath = path.join(__dirname, '../build');
const clientAssetsPath = path.join(clientBuildPath, 'assets');
const clientIndexPath = path.join(clientBuildPath, 'index.html');

// Database connection
const { connectDatabase, disconnectDatabase, prisma } = require('./config/database');

connectDatabase()
  .then(() => {
    logger.info('Prisma connection established');
  })
  .catch(error => {
    logger.error({ error }, 'Failed to connect to PostgreSQL database');
    if (
      process.env.NODE_ENV !== 'production' &&
      !process.env.RAILWAY_ENVIRONMENT
    ) {
      process.exit(1);
    } else {
      logger.info('Server will continue running without database connection');
    }
  });

// Middleware
app.use(helmet());
app.use(
  cors({
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
        /^https:\/\/.*\.railway\.app$/, // 모든 Railway 도메인 허용
      ];

      // origin이 없거나 허용된 목록에 있으면 허용
      if (
        !origin ||
        allowedOrigins.some(allowed => {
          if (typeof allowed === 'string') {
            return allowed === origin;
          } else if (allowed instanceof RegExp) {
            return allowed.test(origin);
          }
          return false;
        })
      ) {
        callback(null, true);
      } else {
        callback(new Error('CORS 정책에 의해 차단됨'));
      }
    },
    credentials: true,
  }),
);
app.use(loggerMiddleware); // Pino 기반 로거 미들웨어
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync(clientBuildPath)) {
  logger.warn({ clientBuildPath }, 'Client build directory is missing.');
}

if (fs.existsSync(clientAssetsPath)) {
  app.use(
    '/assets',
    express.static(clientAssetsPath, {
      immutable: true,
      maxAge: '1y',
    }),
  );
}

if (fs.existsSync(clientBuildPath)) {
  app.use(
    express.static(clientBuildPath, {
      index: false,
      maxAge: '1h',
    }),
  );
}

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
app.use('/api/search', searchRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  let databaseStatus = 'unknown';

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch (error) {
    databaseStatus = 'unavailable';
    logger.error({ error }, 'Database health check failed');
  }

  const statusCode = databaseStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    status: statusCode === 200 ? 'OK' : 'DEGRADED',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: databaseStatus,
  });
});

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  if (!fs.existsSync(clientIndexPath)) {
    logger.warn({ clientIndexPath }, 'Client index.html is missing.');
    return res.status(404).send('Client build not found');
  }

  if (req.path.includes('.') && !req.path.endsWith('.html')) {
    return res.status(404).end();
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res.sendFile(clientIndexPath, error => {
    if (error) {
      next(error);
    }
  });
});

// Graceful shutdown handling
const shutdown = signal => {
  logger.info({ signal }, 'Shutdown signal received, closing server gracefully');

  server.close(async error => {
    if (error) {
      logger.error({ error }, 'Error while closing HTTP server');
    }

    try {
      await disconnectDatabase();
    } catch (disconnectError) {
      logger.error({ error: disconnectError }, 'Error disconnecting Prisma during shutdown');
    } finally {
      process.exit(error ? 1 : 0);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('SIGINT', () => shutdown('SIGINT'));

// 프로젝트 상태 업데이트 크론 작업 설정
const { updateProjectStatuses } = require('./scripts/updateProjectStatuses');

// 매 시간마다 프로젝트 상태 업데이트 (0분에 실행)
cron.schedule('0 * * * *', async () => {
  logger.info('프로젝트 상태 업데이트 크론 작업 시작');
  try {
    await updateProjectStatuses();
    logger.info('프로젝트 상태 업데이트 크론 작업 완료');
  } catch (error) {
    logger.error({ error }, '프로젝트 상태 업데이트 크론 작업 실패');
  }
});

// 서버 시작 시 한 번 실행
setTimeout(async () => {
  logger.info('서버 시작 시 프로젝트 상태 업데이트 실행');
  try {
    await updateProjectStatuses();
    logger.info('서버 시작 시 프로젝트 상태 업데이트 완료');
  } catch (error) {
    logger.error({ error }, '서버 시작 시 프로젝트 상태 업데이트 실패');
  }
}, 5000); // 5초 후 실행

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(
    {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      healthCheck: `http://localhost:${PORT}/api/health`,
    },
    'Server started successfully',
  );
});

// Handle server errors
server.on('error', error => {
  logger.error({ error, port: PORT }, 'Server error');
  if (error.code === 'EADDRINUSE') {
    logger.error({ port: PORT }, 'Port is already in use');
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', async error => {
  logger.error({ error }, 'Uncaught Exception');
  try {
    await disconnectDatabase();
  } catch (disconnectError) {
    logger.error({ error: disconnectError }, 'Error disconnecting Prisma after uncaught exception');
  } finally {
    process.exit(1);
  }
});

process.on('unhandledRejection', async (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled Rejection');
  try {
    await disconnectDatabase();
  } catch (disconnectError) {
    logger.error({ error: disconnectError }, 'Error disconnecting Prisma after unhandled rejection');
  } finally {
    process.exit(1);
  }
});
