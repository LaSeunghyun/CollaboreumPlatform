const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const updateUserRole = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum',
    );
    console.log('MongoDB에 연결되었습니다.');

    // 이메일로 사용자 찾기
    const email = 'rmwl2356@gmail.com';
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`이메일 ${email}을 가진 사용자를 찾을 수 없습니다.`);
      return;
    }

    console.log(`사용자 정보:`);
    console.log(`- 이름: ${user.name}`);
    console.log(`- 이메일: ${user.email}`);
    console.log(`- 현재 역할: ${user.role}`);

    // 역할을 admin으로 변경
    user.role = 'admin';
    await user.save();

    console.log(`✅ 사용자 역할이 성공적으로 'admin'으로 변경되었습니다.`);
    console.log(`- 새로운 역할: ${user.role}`);
  } catch (error) {
    console.error('오류가 발생했습니다:', error);
  } finally {
    // MongoDB 연결 종료
    await mongoose.connection.close();
    console.log('MongoDB 연결이 종료되었습니다.');
  }
};

// 스크립트 실행
updateUserRole();
