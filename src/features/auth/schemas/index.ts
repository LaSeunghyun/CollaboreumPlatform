import { z } from 'zod';
import { UserRole } from '../../../shared/types';
import { commonSchemas } from '../../../shared/utils/validation';

// 로그인 스키마
export const loginSchema = z.object({
  email: commonSchemas.email,
  password: z.string().min(1, '비밀번호는 필수입니다'),
});

// 회원가입 스키마
export const signupSchema = z
  .object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string().min(1, '비밀번호 확인은 필수입니다'),
    username: commonSchemas.username,
    displayName: commonSchemas.displayName,
    role: z.nativeEnum(UserRole).default(UserRole.FAN),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// 비밀번호 재설정 요청 스키마
export const passwordResetRequestSchema = z.object({
  email: commonSchemas.email,
});

// 비밀번호 재설정 스키마
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, '토큰은 필수입니다'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, '비밀번호 확인은 필수입니다'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  });

// 프로필 업데이트 스키마
export const profileUpdateSchema = z.object({
  displayName: commonSchemas.displayName.optional(),
  bio: z.string().max(500, '소개는 최대 500자까지 가능합니다').optional(),
  avatar: z.string().url('올바른 URL 형식이 아닙니다').optional(),
});

// 비밀번호 변경 스키마
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '현재 비밀번호는 필수입니다'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, '비밀번호 확인은 필수입니다'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: '새 비밀번호는 현재 비밀번호와 달라야 합니다',
    path: ['newPassword'],
  });

// 토큰 갱신 스키마
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '리프레시 토큰은 필수입니다'),
});

// 타입 추출
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
