#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Collaboreum MVP Platform 서버를 시작합니다...\n');

// 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB 연결 확인
const checkMongoDB = () => {
  return new Promise(resolve => {
    const mongoCheck = spawn('mongosh', ['--eval', 'db.runCommand("ping")'], {
      stdio: 'pipe',
      shell: true,
    });

    mongoCheck.on('close', code => {
      if (code === 0) {
        console.log('✅ MongoDB 연결 확인됨');
        resolve(true);
      } else {
        console.log(
          '⚠️  MongoDB 연결 실패 - 로컬 MongoDB가 실행 중인지 확인하세요',
        );
        console.log('   MongoDB 설치 및 실행 방법:');
        console.log(
          '   1. https://www.mongodb.com/try/download/community 에서 다운로드',
        );
        console.log('   2. mongod 명령어로 서비스 시작');
        console.log(
          '   3. 또는 Docker 사용: docker run -d -p 27017:27017 --name mongodb mongo:latest\n',
        );
        resolve(false);
      }
    });
  });
};

// 서버 시작
const startServer = async () => {
  try {
    // MongoDB 연결 확인
    const mongoAvailable = await checkMongoDB();

    if (!mongoAvailable) {
      console.log('📝 .env 파일을 생성하고 MongoDB 연결 정보를 설정하세요:');
      console.log('   MONGODB_URI=mongodb://localhost:27017/collaboreum');
      console.log('   또는 MongoDB Atlas 클라우드 서비스 사용\n');
    }

    console.log('🌐 서버를 시작합니다...');
    console.log(`   환경: ${process.env.NODE_ENV}`);
    console.log(`   포트: ${process.env.PORT || 5000}`);
    console.log(`   API URL: http://localhost:${process.env.PORT || 5000}/api`);
    console.log(
      `   클라이언트: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`,
    );

    // 서버 실행
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname,
    });

    server.on('close', code => {
      console.log(`\n🛑 서버가 종료되었습니다 (코드: ${code})`);
      process.exit(code);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

// 시작
startServer();
