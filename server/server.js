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

// Middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');
const logger = require('./middleware/logger');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

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
app.use('/api/categories', categoryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/constants', constantsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
