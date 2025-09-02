const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum';
    console.log('Connecting to MongoDB:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // 비밀번호 숨김
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // 연결 이벤트 리스너
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // 애플리케이션 종료 시 연결 종료
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
