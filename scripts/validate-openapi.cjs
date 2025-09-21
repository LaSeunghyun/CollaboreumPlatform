#!/usr/bin/env node
/* OpenAPI 스키마 검증 (선택사항) */
const fs = require('fs');
const path = require('path');

const openapiFiles = [
  'openapi.json',
  'openapi.yaml',
  'openapi.yml',
  'api-spec.json',
  'api-spec.yaml',
  'api-spec.yml',
];

let foundFile = null;
for (const file of openapiFiles) {
  if (fs.existsSync(file)) {
    foundFile = file;
    break;
  }
}

if (!foundFile) {
  console.log('ℹ️  OpenAPI 스키마 파일이 없습니다 (스킵)');
  process.exit(0);
}

console.log(`🔍 OpenAPI 스키마 검증 중: ${foundFile}`);

try {
  const content = fs.readFileSync(foundFile, 'utf-8');
  let doc;

  if (foundFile.endsWith('.json')) {
    doc = JSON.parse(content);
  } else {
    // YAML 파싱은 간단한 체크만
    if (!content.includes('openapi:') && !content.includes('swagger:')) {
      throw new Error('유효하지 않은 OpenAPI 형식');
    }
    console.log('✅ OpenAPI YAML 형식 확인됨');
    process.exit(0);
  }

  if (!doc.openapi && !doc.swagger) {
    throw new Error('openapi 또는 swagger 필드가 없습니다');
  }

  if (!doc.paths || Object.keys(doc.paths).length === 0) {
    throw new Error('paths 필드가 비어있습니다');
  }

  console.log('✅ OpenAPI 스키마 검증 통과');
  console.log(`📋 API 버전: ${doc.openapi || doc.swagger}`);
  console.log(`📋 엔드포인트 수: ${Object.keys(doc.paths).length}`);
} catch (error) {
  console.error('❌ OpenAPI 스키마 검증 실패:', error.message);
  process.exit(1);
}
