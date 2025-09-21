const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const testPassword = async (email, password) => {
  try {
    console.log(`🔐 비밀번호 검증 테스트: ${email}`);

    // MongoDB 연결
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/collaboreum',
    );
    console.log('✅ MongoDB에 연결되었습니다.');

    // 사용자 조회
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없습니다.');
      return false;
    }

    console.log(`👤 사용자: ${user.name} (${user.email})`);
    console.log(`🔑 저장된 해시: ${user.password}`);

    // 비밀번호 검증
    console.log(`\n🔍 비밀번호 "${password}" 검증 중...`);
    const isValid = await bcrypt.compare(password, user.password);

    console.log(`✅ 검증 결과: ${isValid ? '성공' : '실패'}`);

    if (isValid) {
      console.log('🎉 비밀번호가 일치합니다!');
    } else {
      console.log('❌ 비밀번호가 일치하지 않습니다.');

      // 디버깅을 위한 추가 정보
      console.log('\n🔧 디버깅 정보:');
      console.log(`입력된 비밀번호: "${password}"`);
      console.log(`비밀번호 길이: ${password.length}`);
      console.log(`해시 시작: ${user.password.substring(0, 7)}...`);

      // User 모델의 comparePassword 메서드도 테스트
      try {
        const modelCompare = await user.comparePassword(password);
        console.log(`User 모델 comparePassword 결과: ${modelCompare}`);
      } catch (error) {
        console.log(`User 모델 comparePassword 오류: ${error.message}`);
      }
    }

    return isValid;
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
  const password = process.argv[3];

  if (!email || !password) {
    console.log('📝 사용법: node test-password.js <이메일> <비밀번호>');
    console.log(
      '📝 예시: node test-password.js rmwl2356@gmail.com "ra89092.."',
    );
    process.exit(1);
  }

  testPassword(email, password)
    .then(isValid => {
      if (isValid) {
        console.log('\n🎯 비밀번호 검증 성공!');
      } else {
        console.log('\n❌ 비밀번호 검증 실패!');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { testPassword };
