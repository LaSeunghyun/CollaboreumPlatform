const mongoose = require('mongoose');
const { logger } = require('../src/logger');

const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://rmwl2356_db_user:<db_password>@collaboreum-cluster.tdwqiwn.mongodb.net/?retryWrites=true&w=majority&appName=collaboreum-cluster';
      logger.info({ 
        attempt: retryCount + 1, 
        maxRetries,
        mongoURI: mongoURI.replace(/\/\/.*@/, '//***:***@')
      }, 'Connecting to MongoDB');
      
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // 5초 타임아웃
        socketTimeoutMS: 45000, // 45초 소켓 타임아웃
        bufferCommands: false, // 버퍼링 비활성화
        maxPoolSize: 10, // 최대 연결 풀 크기
        minPoolSize: 5, // 최소 연결 풀 크기
        maxIdleTimeMS: 30000, // 30초 후 유휴 연결 종료
        connectTimeoutMS: 10000 // 10초 연결 타임아웃
      });

      logger.info({ host: conn.connection.host }, 'MongoDB Connected');
      
      // 연결 이벤트 리스너
      mongoose.connection.on('error', (err) => {
        logger.error({ error: err }, 'MongoDB connection error');
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return conn;

    } catch (error) {
      retryCount++;
      logger.error({ 
        attempt: retryCount, 
        maxRetries, 
        error: error.message 
      }, 'MongoDB connection failed');
      
      if (retryCount < maxRetries) {
        logger.info('Retrying in 5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectWithRetry();
      } else {
        logger.error('MongoDB connection failed after all retries');
        throw error;
      }
    }
  };

  try {
    await connectWithRetry();
  } catch (error) {
    logger.error({ error }, 'Final MongoDB connection failed');
    // 프로덕션에서는 서버를 종료하지 않고 계속 시도
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running in production mode, will retry connection...');
      setTimeout(connectDB, 10000); // 10초 후 재시도
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
