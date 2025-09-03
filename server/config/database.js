const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum';
      console.log(`🔄 Connecting to MongoDB (attempt ${retryCount + 1}/${maxRetries}):`, mongoURI.replace(/\/\/.*@/, '//***:***@'));
      
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // 5초 타임아웃
        socketTimeoutMS: 45000, // 45초 소켓 타임아웃
        bufferCommands: false, // 버퍼링 비활성화
        bufferMaxEntries: 0 // 버퍼 최대 엔트리 0
      });

      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      
      // 연결 이벤트 리스너
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      return conn;

    } catch (error) {
      retryCount++;
      console.error(`❌ MongoDB connection failed (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount < maxRetries) {
        console.log(`⏳ Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectWithRetry();
      } else {
        console.error('💥 MongoDB connection failed after all retries');
        throw error;
      }
    }
  };

  try {
    await connectWithRetry();
  } catch (error) {
    console.error('💥 Final MongoDB connection failed:', error);
    // 프로덕션에서는 서버를 종료하지 않고 계속 시도
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Running in production mode, will retry connection...');
      setTimeout(connectDB, 10000); // 10초 후 재시도
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
