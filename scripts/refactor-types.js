#!/usr/bin/env node

/**
 * 타입 안정성 개선 자동화 스크립트
 * any 타입 제거 및 DTO 타입 정의
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function log(message) {
  console.log(`[TYPE-REFACTOR] ${message}`);
}

function findAnyTypes() {
  log('any 타입 사용 현황 분석...');

  const anyTypes = [];
  const srcDir = 'src';

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (
            line.includes(': any') ||
            line.includes('<any>') ||
            line.includes('any[]')
          ) {
            anyTypes.push({
              file: filePath,
              line: index + 1,
              content: line.trim(),
            });
          }
        });
      }
    });
  }

  scanDirectory(srcDir);
  return anyTypes;
}

function generateTypeDefinitions() {
  log('공통 타입 정의 생성...');

  const commonTypes = `// src/shared/types/common.ts
// 공통 타입 정의

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: 'admin' | 'artist' | 'fan';
  avatar?: string;
  isActive: boolean;
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  targetAmount: number;
  currentAmount: number;
  creatorId: string;
  category: string;
  tags: string[];
  images: string[];
  deadline: string;
}

export interface CommunityPost extends BaseEntity {
  title: string;
  content: string;
  authorId: string;
  category: string;
  tags: string[];
  likes: number;
  views: number;
  comments: number;
  isPinned: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}
`;

  fs.writeFileSync('src/shared/types/common.ts', commonTypes);
  log('✅ 공통 타입 정의 생성 완료');
}

function generateApiTypes() {
  log('API 타입 정의 생성...');

  const apiTypes = `// src/shared/types/api.ts
// API 관련 타입 정의

import { User, Project, CommunityPost, ApiResponse, PaginatedResponse } from './common';

// Auth API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  userType: 'artist' | 'fan';
}

// Project API
export interface CreateProjectRequest {
  title: string;
  description: string;
  targetAmount: number;
  category: string;
  tags: string[];
  deadline: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: string;
}

export interface ProjectListRequest {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}

// Community API
export interface CreatePostRequest {
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: string;
}

export interface PostListRequest {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

// API Response Types
export type UserResponse = ApiResponse<User>;
export type ProjectResponse = ApiResponse<Project>;
export type ProjectListResponse = PaginatedResponse<Project>;
export type PostResponse = ApiResponse<CommunityPost>;
export type PostListResponse = PaginatedResponse<CommunityPost>;
`;

  fs.writeFileSync('src/shared/types/api.ts', apiTypes);
  log('✅ API 타입 정의 생성 완료');
}

function generateValidationSchemas() {
  log('Zod 검증 스키마 생성...');

  const validationSchemas = `// src/shared/validators/schemas.ts
import { z } from 'zod';

// 공통 검증 스키마
export const emailSchema = z.string().email('올바른 이메일 형식이 아닙니다');
export const passwordSchema = z.string().min(8, '비밀번호는 8자 이상이어야 합니다');
export const nameSchema = z.string().min(2, '이름은 2자 이상이어야 합니다');

// 사용자 검증 스키마
export const userSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: z.enum(['admin', 'artist', 'fan']),
  avatar: z.string().url().optional(),
  isActive: z.boolean().default(true)
});

// 프로젝트 검증 스키마
export const projectSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().min(10, '설명은 10자 이상이어야 합니다'),
  targetAmount: z.number().min(1000, '목표 금액은 1,000원 이상이어야 합니다'),
  category: z.string().min(1, '카테고리는 필수입니다'),
  tags: z.array(z.string()).max(10, '태그는 10개 이하여야 합니다'),
  deadline: z.string().refine((date) => new Date(date) > new Date(), '마감일은 미래여야 합니다')
});

// 커뮤니티 포스트 검증 스키마
export const postSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  content: z.string().min(10, '내용은 10자 이상이어야 합니다'),
  category: z.string().min(1, '카테고리는 필수입니다'),
  tags: z.array(z.string()).max(5, '태그는 5개 이하여야 합니다')
});

// 폼 검증 스키마
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword']
});
`;

  fs.writeFileSync('src/shared/validators/schemas.ts', validationSchemas);
  log('✅ 검증 스키마 생성 완료');
}

function main() {
  log('🚀 타입 안정성 개선 자동화 시작');

  // 1. any 타입 사용 현황 분석
  const anyTypes = findAnyTypes();
  log(`📊 any 타입 사용: ${anyTypes.length}건`);

  if (anyTypes.length > 0) {
    log('⚠️  any 타입 사용 현황:');
    anyTypes.slice(0, 10).forEach((item, index) => {
      log(`${index + 1}. ${item.file}:${item.line} - ${item.content}`);
    });

    if (anyTypes.length > 10) {
      log(`... 외 ${anyTypes.length - 10}건 더`);
    }
  }

  // 2. 공통 타입 정의 생성
  generateTypeDefinitions();

  // 3. API 타입 정의 생성
  generateApiTypes();

  // 4. 검증 스키마 생성
  generateValidationSchemas();

  log('✅ 타입 안정성 개선 자동화 완료');
  log('다음 단계: any 타입을 구체적인 타입으로 교체하세요');
}

if (require.main === module) {
  main();
}

module.exports = {
  findAnyTypes,
  generateTypeDefinitions,
  generateApiTypes,
  generateValidationSchemas,
};
