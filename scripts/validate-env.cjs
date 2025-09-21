#!/usr/bin/env node
/* 환경 변수 스키마 검증(Zod) */
const { z } = require('zod');

const EnvSchema = z.object({
  // 필수 환경 변수들
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .optional()
    .default('development'),

  // API 관련
  REACT_APP_API_BASE_URL: z.string().url().optional(),
  VITE_API_BASE_URL: z.string().url().optional(),

  // 인증 관련
  REACT_APP_JWT_SECRET: z.string().min(32).optional(),
  VITE_JWT_SECRET: z.string().min(32).optional(),

  // 데이터베이스 관련
  MONGODB_URI: z.string().url().optional(),
  DATABASE_URL: z.string().url().optional(),

  // 외부 서비스
  REACT_APP_CLOUDINARY_CLOUD_NAME: z.string().optional(),
  VITE_CLOUDINARY_CLOUD_NAME: z.string().optional(),

  // 개발/디버깅
  REACT_APP_DEBUG: z.string().optional(),
  VITE_DEBUG: z.string().optional(),
});

console.log('🔍 환경변수 스키마 검증 중...');

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ 환경변수 검증 실패:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

console.log('✅ 환경변수 검증 통과');
console.log('📋 검증된 환경변수:', Object.keys(parsed.data).join(', '));
