const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// 빠른 사용자 추가 함수
const addQuickUser = async userData => {
  try {
    console.log('🚀 빠른 사용자 추가를 시작합니다...');

    // MongoDB 연결
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum',
    );
    console.log('✅ MongoDB에 연결되었습니다.');

    // 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // 해시화된 비밀번호로 사용자 데이터 생성
    const userDataWithHash = {
      ...userData,
      password: hashedPassword,
    };

    // 사용자 생성
    const user = new User(userDataWithHash);
    await user.save();

    console.log('✅ 사용자가 성공적으로 생성되었습니다!');
    console.log(`👤 이름: ${user.name}`);
    console.log(`📧 이메일: ${user.email}`);
    console.log(`🎭 역할: ${user.role}`);
    console.log(`🆔 ID: ${user._id}`);

    return user;
  } catch (error) {
    console.error('❌ 사용자 생성 실패:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결을 종료했습니다.');
  }
};

// 명령행 인수로 사용자 정보 받기
const createUserFromArgs = () => {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.log(
      '📝 사용법: node quick-user.js <이름> <이메일> <비밀번호> [역할] [자기소개]',
    );
    console.log(
      '📝 예시: node quick-user.js "홍길동" "hong@example.com" "password123" "artist" "음악가입니다"',
    );
    console.log('📝 역할은 artist, fan, admin 중 선택 (기본값: fan)');
    process.exit(1);
  }

  const [name, email, password, role = 'fan', bio = ''] = args;

  // 역할 유효성 검사
  const validRoles = ['artist', 'fan', 'admin'];
  if (!validRoles.includes(role)) {
    console.log('❌ 잘못된 역할입니다. artist, fan, admin 중 선택해주세요.');
    process.exit(1);
  }

  return {
    name,
    email,
    password,
    role,
    bio,
    isVerified: role === 'admin', // 관리자는 자동 인증
  };
};

// 스크립트 실행
if (require.main === module) {
  try {
    const userData = createUserFromArgs();
    addQuickUser(userData)
      .then(() => {
        console.log('\n🎉 사용자 추가가 완료되었습니다!');
        process.exit(0);
      })
      .catch(() => {
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

module.exports = { addQuickUser };
