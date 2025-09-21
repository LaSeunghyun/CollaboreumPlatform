import { z } from 'zod';

// 공통 검증 스키마
export const commonSchemas = {
  // ID 검증
  id: z.string().min(1, 'ID는 필수입니다'),

  // 이메일 검증
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .min(1, '이메일은 필수입니다'),

  // 비밀번호 검증
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다',
    ),

  // 사용자명 검증
  username: z
    .string()
    .min(2, '사용자명은 최소 2자 이상이어야 합니다')
    .max(20, '사용자명은 최대 20자까지 가능합니다')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      '사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다',
    ),

  // 표시명 검증
  displayName: z
    .string()
    .min(1, '표시명은 필수입니다')
    .max(50, '표시명은 최대 50자까지 가능합니다'),

  // 금액 검증 (원 단위 정수)
  amount: z
    .number()
    .int('금액은 정수여야 합니다')
    .min(0, '금액은 0원 이상이어야 합니다')
    .max(1000000000, '금액은 10억원을 초과할 수 없습니다'),

  // 페이지네이션
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  }),

  // 정렬
  sort: z.object({
    field: z.string().min(1),
    order: z.enum(['asc', 'desc']).default('desc'),
  }),

  // 검색
  search: z.string().max(100, '검색어는 최대 100자까지 가능합니다').optional(),

  // 날짜 범위
  dateRange: z
    .object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })
    .refine(
      data =>
        !data.startDate || !data.endDate || data.startDate <= data.endDate,
      { message: '시작일은 종료일보다 이전이어야 합니다' },
    ),
};

// 에러 메시지 포맷터
export function formatValidationError(
  error: z.ZodError,
): Record<string, string> {
  const formatted: Record<string, string> = {};

  error.errors.forEach(err => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}

// API 에러 응답 검증
export const apiErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
  details: z.record(z.any()).optional(),
});

// API 성공 응답 검증
export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    message: z.string().optional(),
  });

// API 응답 검증 (성공/실패)
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.union([
    apiSuccessSchema(dataSchema),
    z.object({
      success: z.literal(false),
      error: z.string(),
      message: z.string().optional(),
    }),
  ]);
