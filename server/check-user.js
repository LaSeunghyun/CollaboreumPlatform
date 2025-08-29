const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const checkUser = async (email) => {
  try {
    console.log(`🔍 사용자 확인: ${email}`);
    
    // MongoDB 연결
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum');
    console.log('✅ MongoDB에 연결되었습니다.');
    
    // 사용자 조회
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      return null;
    }
    
    console.log('✅ 사용자를 찾았습니다!');
    console.log(`👤 이름: ${user.name}`);
    console.log(`📧 이메일: ${user.email}`);
    console.log(`🎭 역할: ${user.role}`);
    console.log(`🆔 ID: ${user._id}`);
    console.log(`🔑 비밀번호 해시: ${user.password}`);
    console.log(`📅 생성일: ${user.createdAt}`);
    console.log(`🔄 수정일: ${user.updatedAt}`);
    
    // 비밀번호 해시 형식 확인
    if (user.password.startsWith('$2a$')) {
      console.log('✅ 비밀번호가 bcrypt로 해시화되어 있습니다.');
    } else {
      console.log('❌ 비밀번호가 해시화되지 않았습니다.');
    }
    
    return user;
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결을 종료했습니다.');
  }
};

// 스크립트 실행
if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.log('📝 사용법: node check-user.js <이메일>');
    console.log('📝 예시: node check-user.js rmwl2356@gmail.com');
    process.exit(1);
  }
  
  checkUser(email)
    .then((user) => {
      if (user) {
        console.log('\n🎯 사용자 확인 완료!');
      } else {
        console.log('\n❌ 사용자가 존재하지 않습니다.');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { checkUser };
