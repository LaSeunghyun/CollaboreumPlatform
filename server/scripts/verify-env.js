const dotenvSafe = require('dotenv-safe');
const path = require('path');

try {
  // .env.example 파일이 있는지 확인
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const fs = require('fs');

  if (!fs.existsSync(envExamplePath)) {
    console.log(
      '⚠️  .env.example 파일이 없습니다. 환경변수 검증을 건너뜁니다.',
    );
    process.exit(0);
  }

  // dotenv-safe로 환경변수 검증
  dotenvSafe.config({
    example: '.env.example',
    allowEmptyValues: true,
  });

  console.log('✅ 환경변수 검증 완료');
} catch (error) {
  console.error('❌ 환경변수 검증 실패:', error.message);
  process.exit(1);
}
