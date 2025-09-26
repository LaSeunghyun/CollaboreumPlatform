#!/usr/bin/env node

const { spawn } = require('child_process');
const { PrismaClient } = require('@prisma/client');

console.log('🚀 Collaboreum MVP Platform 서버를 시작합니다...\n');

// 환경 변수 설정
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const checkPostgreSQL = async () => {
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ PostgreSQL 연결 확인됨');
    return true;
  } catch (error) {
    console.log('⚠️  PostgreSQL 연결 실패 - DATABASE_URL 환경변수를 확인하세요');
    console.log(`   세부정보: ${error.message}`);
    console.log('   예시: postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public');
    return false;
  } finally {
    await prisma.$disconnect().catch(disconnectError => {
      console.log('⚠️  Prisma 연결 종료 중 문제가 발생했습니다:', disconnectError.message);
    });
  }
};

// 서버 시작
const startServer = async () => {
  try {
    // PostgreSQL 연결 확인
    const databaseAvailable = await checkPostgreSQL();

    if (!databaseAvailable) {
      console.log('📝 .env 파일을 생성하고 PostgreSQL 연결 정보를 설정하세요:');
      console.log('   DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/collaboreum?schema=public');
      console.log('   Prisma 스키마는 prisma/schema.prisma 에 정의되어 있습니다.\n');
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
