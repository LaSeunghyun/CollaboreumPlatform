const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const fs = require('fs');
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
const clientBuildPath = path.join(__dirname, '../build');
const clientAssetsPath = path.join(clientBuildPath, 'assets');
const clientIndexPath = path.join(clientBuildPath, 'index.html');
const clientManifestPath = path.join(clientBuildPath, 'manifest.json');

let cachedManifest = null;
let cachedManifestMtime = 0;
let manifestMissingLogged = false;
let manifestReadErrorLogged = false;
let cachedIndexHtml = null;
let cachedIndexHtmlMtime = 0;
let cachedHydratedIndexHtml = null;
let cachedHydratedIndexSignature = null;
let entrypointResolutionWarned = false;

const normalizeEntrypoint = (filePath) => {
  if (!filePath) {
    return null;
  }

  return filePath.startsWith('/') ? filePath.slice(1) : filePath;
};

const loadAssetManifest = () => {
  if (!fs.existsSync(clientManifestPath)) {
    if (!manifestMissingLogged) {
      logger.warn({ manifestPath: clientManifestPath }, 'Client manifest is missing.');
      manifestMissingLogged = true;
    }
    cachedManifest = null;
    cachedManifestMtime = 0;
    return null;
  }

  try {
    const manifestStats = fs.statSync(clientManifestPath);

    if (!cachedManifest || manifestStats.mtimeMs !== cachedManifestMtime) {
      const manifestRaw = fs.readFileSync(clientManifestPath, 'utf-8');
      cachedManifest = JSON.parse(manifestRaw);
      cachedManifestMtime = manifestStats.mtimeMs;
      manifestMissingLogged = false;
      manifestReadErrorLogged = false;
      logger.info({ manifestPath: clientManifestPath }, 'Client manifest loaded.');
    }
  } catch (error) {
    if (!manifestReadErrorLogged) {
      logger.error({ error, manifestPath: clientManifestPath }, 'Failed to read client manifest.');
      manifestReadErrorLogged = true;
    }
    cachedManifest = null;
    cachedManifestMtime = 0;
    return null;
  }

  return cachedManifest;
};

const resolveEntrypointFromManifest = () => {
  const manifest = loadAssetManifest();

  if (manifest && manifest['src/main.tsx'] && manifest['src/main.tsx'].file) {
    entrypointResolutionWarned = false;
    return normalizeEntrypoint(manifest['src/main.tsx'].file);
  }

  return null;
};

const resolveEntrypointFromAssets = () => {
  if (!fs.existsSync(clientAssetsPath)) {
    return null;
  }

  try {
    const assetFiles = fs.readdirSync(clientAssetsPath);
    const jsCandidates = assetFiles.filter((fileName) => fileName.endsWith('.js'));

    if (!jsCandidates.length) {
      return null;
    }

    const preferredCandidate =
      jsCandidates.find((fileName) => /^index(?:-[\w-]+)?\.js$/.test(fileName)) ||
      jsCandidates.find((fileName) => /^main(?:-[\w-]+)?\.js$/.test(fileName));

    const resolvedFile = preferredCandidate || jsCandidates[0];

    entrypointResolutionWarned = false;
    return path.posix.join('assets', resolvedFile);
  } catch (error) {
    logger.error({ error, clientAssetsPath }, 'Failed to inspect client assets directory.');
    return null;
  }
};

const resolveClientEntrypoint = () => {
  const manifestEntrypoint = resolveEntrypointFromManifest();
  if (manifestEntrypoint) {
    return manifestEntrypoint;
  }

  const assetEntrypoint = resolveEntrypointFromAssets();
  if (assetEntrypoint) {
    return assetEntrypoint;
  }

  if (!entrypointResolutionWarned) {
    logger.error(
      {
        manifestPathExists: fs.existsSync(clientManifestPath),
        assetsPathExists: fs.existsSync(clientAssetsPath),
      },
      'Unable to resolve client entrypoint. Falling back to development script path.'
    );
    entrypointResolutionWarned = true;
  }

  return null;
};

const readClientIndexHtml = () => {
  if (!fs.existsSync(clientIndexPath)) {
    logger.warn({ clientIndexPath }, 'Client index.html is missing.');
    cachedIndexHtml = null;
    cachedIndexHtmlMtime = 0;
    cachedHydratedIndexHtml = null;
    cachedHydratedIndexSignature = null;
    return null;
  }

  try {
    const indexStats = fs.statSync(clientIndexPath);

    if (!cachedIndexHtml || indexStats.mtimeMs !== cachedIndexHtmlMtime) {
      cachedIndexHtml = fs.readFileSync(clientIndexPath, 'utf-8');
      cachedIndexHtmlMtime = indexStats.mtimeMs;
      cachedHydratedIndexHtml = null;
      cachedHydratedIndexSignature = null;
      logger.info({ clientIndexPath }, 'Client index.html loaded.');
    }
  } catch (error) {
    logger.error({ error, clientIndexPath }, 'Failed to read client index.html.');
    return null;
  }

  return cachedIndexHtml;
};

const getClientIndexHtml = () => {
  const baseHtml = readClientIndexHtml();

  if (!baseHtml) {
    return null;
  }

  const entrypoint = resolveClientEntrypoint();
  const signature = `${cachedIndexHtmlMtime}:${entrypoint || 'missing'}`;

  if (cachedHydratedIndexHtml && cachedHydratedIndexSignature === signature) {
    return cachedHydratedIndexHtml;
  }

  let hydratedHtml = baseHtml;

  if (entrypoint && baseHtml.includes('/src/main.tsx')) {
    const normalized = entrypoint.startsWith('/') ? entrypoint : `/${entrypoint}`;
    hydratedHtml = baseHtml.replace(/src="\/src\/main\.tsx"/g, `src="${normalized}"`);
    logger.info({ entrypoint: normalized }, 'Replaced client entrypoint for production build.');
  }

  cachedHydratedIndexHtml = hydratedHtml;
  cachedHydratedIndexSignature = signature;

  return hydratedHtml;
};

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

if (!fs.existsSync(clientBuildPath)) {
  logger.warn({ clientBuildPath }, 'Client build directory is missing.');
}

if (fs.existsSync(clientAssetsPath)) {
  app.use(
    '/assets',
    express.static(clientAssetsPath, {
      immutable: true,
      maxAge: '1y'
    })
  );
}

if (fs.existsSync(clientBuildPath)) {
  app.use(
    express.static(clientBuildPath, {
      index: false,
      maxAge: '1h'
    })
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
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
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
    return res.status(404).type('text/plain').send('Not found');
  }

  const acceptsHtml = !req.headers.accept || req.headers.accept.includes('text/html');

  if (!acceptsHtml) {
    return res.status(404).type('text/plain').send('Not found');
  }

  const indexHtml = getClientIndexHtml();

  if (!indexHtml) {
    return res.status(500).type('text/plain').send('Client build is unavailable');
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.type('html').send(indexHtml);
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
