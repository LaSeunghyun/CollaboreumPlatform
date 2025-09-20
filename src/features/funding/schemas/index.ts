import { z } from 'zod';
import { commonSchemas } from '../../../shared/utils/validation';
import {
    FundingProjectStatus,
    PledgeStatus,
    ExecutionStatus,
    DistributionRuleType,
    EventType,
    EventStatus
} from '../types';

const REQUIRED_TITLE_MESSAGE = '제목은 필수입니다';
const REQUIRED_REWARD_TITLE_MESSAGE = '리워드 제목은 필수입니다';

// 펀딩 프로젝트 생성 스키마
export const createFundingProjectSchema = z.object({
    title: z.string()
        .min(1, REQUIRED_TITLE_MESSAGE)
        .max(100, '제목은 최대 100자까지 가능합니다'),
    description: z.string()
        .min(1, '설명은 필수입니다')
        .max(5000, '설명은 최대 5000자까지 가능합니다'),
    shortDescription: z.string()
        .min(1, '짧은 설명은 필수입니다')
        .max(200, '짧은 설명은 최대 200자까지 가능합니다'),
    targetAmount: commonSchemas.amount,
    startDate: z.date().min(new Date(), '시작일은 현재 날짜 이후여야 합니다'),
    endDate: z.date(),
    categoryId: commonSchemas.id,
    images: z.array(z.string().url('올바른 이미지 URL이 아닙니다'))
        .min(1, '최소 1개의 이미지가 필요합니다')
        .max(10, '최대 10개의 이미지만 가능합니다'),
    tags: z.array(z.string().min(1).max(20))
        .min(1, '최소 1개의 태그가 필요합니다')
        .max(10, '최대 10개의 태그만 가능합니다'),
    rewards: z.array(z.object({
        title: z.string().min(1, REQUIRED_REWARD_TITLE_MESSAGE).max(100),
        description: z.string().min(1, '리워드 설명은 필수입니다').max(1000),
        amount: commonSchemas.amount,
        deliveryDate: z.date().min(new Date(), '배송일은 현재 날짜 이후여야 합니다'),
        stock: z.number().int().min(0).optional(),
        isLimited: z.boolean().default(false),
        images: z.array(z.string().url()).max(5).optional(),
    })).min(1, '최소 1개의 리워드가 필요합니다').max(20, '최대 20개의 리워드만 가능합니다'),
    metadata: z.record(z.any()).optional(),
}).refine(
    (data) => data.endDate > data.startDate,
    {
        message: '종료일은 시작일보다 이후여야 합니다',
        path: ['endDate'],
    }
).refine(
    (data) => {
        const daysDiff = (data.endDate.getTime() - data.startDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff >= 1 && daysDiff <= 90;
    },
    {
        message: '펀딩 기간은 1일 이상 90일 이하여야 합니다',
        path: ['endDate'],
    }
);

// 펀딩 프로젝트 업데이트 스키마
export const updateFundingProjectSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(5000).optional(),
    shortDescription: z.string().min(1).max(200).optional(),
    targetAmount: commonSchemas.amount.optional(),
    endDate: z.date().optional(),
    categoryId: commonSchemas.id.optional(),
    images: z.array(z.string().url()).min(1).max(10).optional(),
    tags: z.array(z.string().min(1).max(20)).min(1).max(10).optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
});

// 리워드 생성 스키마
export const createRewardSchema = z.object({
    projectId: commonSchemas.id,
    title: z.string().min(1, REQUIRED_REWARD_TITLE_MESSAGE).max(100),
    description: z.string().min(1, '리워드 설명은 필수입니다').max(1000),
    amount: commonSchemas.amount,
    deliveryDate: z.date().min(new Date(), '배송일은 현재 날짜 이후여야 합니다'),
    stock: z.number().int().min(0).optional(),
    isLimited: z.boolean().default(false),
    images: z.array(z.string().url()).max(5).optional(),
    metadata: z.record(z.any()).optional(),
});

// 리워드 업데이트 스키마
export const updateRewardSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().min(1).max(1000).optional(),
    amount: commonSchemas.amount.optional(),
    deliveryDate: z.date().optional(),
    stock: z.number().int().min(0).optional(),
    isLimited: z.boolean().optional(),
    images: z.array(z.string().url()).max(5).optional(),
    isActive: z.boolean().optional(),
    metadata: z.record(z.any()).optional(),
});

// 후원 생성 스키마
export const createPledgeSchema = z.object({
    projectId: commonSchemas.id,
    rewardId: commonSchemas.id.optional(),
    amount: commonSchemas.amount,
    paymentMethod: z.string().min(1, '결제 수단은 필수입니다'),
    idempotencyKey: z.string().min(1, '멱등성 키는 필수입니다'),
    metadata: z.record(z.any()).optional(),
});

// 후원 상태 업데이트 스키마
export const updatePledgeStatusSchema = z.object({
    status: z.nativeEnum(PledgeStatus),
    refundAmount: z.number().int().min(0).optional(),
    refundReason: z.string().max(500).optional(),
    metadata: z.record(z.any()).optional(),
});

// 집행 생성 스키마
export const createExecutionSchema = z.object({
    projectId: commonSchemas.id,
    title: z.string().min(1, REQUIRED_TITLE_MESSAGE).max(100),
    description: z.string().min(1, '설명은 필수입니다').max(1000),
    budgetAmount: commonSchemas.amount,
    receipts: z.array(z.object({
        filename: z.string().min(1),
        originalName: z.string().min(1),
        mimeType: z.string().min(1),
        size: z.number().int().min(0),
        url: z.string().url(),
        amount: commonSchemas.amount,
        date: z.date(),
        description: z.string().max(500).optional(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
});

// 집행 승인 스키마
export const approveExecutionSchema = z.object({
    status: z.nativeEnum(ExecutionStatus),
    actualAmount: z.number().int().min(0).optional(),
    metadata: z.record(z.any()).optional(),
});

// 영수증 업로드 스키마
export const uploadReceiptSchema = z.object({
    executionId: commonSchemas.id,
    filename: z.string().min(1),
    originalName: z.string().min(1),
    mimeType: z.string().min(1),
    size: z.number().int().min(0),
    url: z.string().url(),
    amount: commonSchemas.amount,
    date: z.date(),
    description: z.string().max(500).optional(),
    metadata: z.record(z.any()).optional(),
});

// 분배 규칙 스키마
export const distributionRuleSchema = z.object({
    type: z.nativeEnum(DistributionRuleType),
    percentage: z.number().min(0).max(100).optional(),
    fixedAmount: z.number().int().min(0).optional(),
    recipient: z.string().min(1, '수령자는 필수입니다'),
    description: z.string().min(1, '설명은 필수입니다').max(200),
    priority: z.number().int().min(0).default(0),
}).refine(
    (data) => data.percentage !== undefined || data.fixedAmount !== undefined,
    {
        message: '비율 또는 고정 금액 중 하나는 필수입니다',
    }
);

// 분배 생성 스키마
export const createDistributionSchema = z.object({
    projectId: commonSchemas.id,
    rules: z.array(distributionRuleSchema).min(1, '최소 1개의 분배 규칙이 필요합니다'),
    metadata: z.record(z.any()).optional(),
});

// 분배 실행 스키마
export const executeDistributionSchema = z.object({
    distributionId: commonSchemas.id,
    metadata: z.record(z.any()).optional(),
});

// 펀딩 프로젝트 필터 스키마
export const fundingProjectFilterSchema = z.object({
    status: z.array(z.nativeEnum(FundingProjectStatus)).optional(),
    categoryId: commonSchemas.id.optional(),
    ownerId: commonSchemas.id.optional(),
    search: commonSchemas.search,
    tags: z.array(z.string()).optional(),
    minAmount: z.number().int().min(0).optional(),
    maxAmount: z.number().int().min(0).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
});

// 펀딩 프로젝트 정렬 스키마
export const fundingProjectSortSchema = z.object({
    field: z.enum(['createdAt', 'updatedAt', 'targetAmount', 'currentAmount', 'progress', 'backerCount', 'endDate']),
    order: z.enum(['asc', 'desc']).default('desc'),
});

// 펀딩 프로젝트 상태 변경 스키마
export const changeProjectStatusSchema = z.object({
    status: z.nativeEnum(FundingProjectStatus),
    reason: z.string().max(500).optional(),
    metadata: z.record(z.any()).optional(),
});

// 이벤트 로그 스키마
export const eventLogSchema = z.object({
    eventType: z.nativeEnum(EventType),
    aggregateId: z.string().min(1),
    aggregateType: z.string().min(1),
    eventData: z.record(z.any()),
    status: z.nativeEnum(EventStatus).default(EventStatus.PENDING),
    retryCount: z.number().int().min(0).default(0),
    maxRetries: z.number().int().min(0).default(3),
    nextAttemptAt: z.date(),
    metadata: z.record(z.any()).optional(),
});

// 타입 추출
export type CreateFundingProjectInput = z.infer<typeof createFundingProjectSchema>;
export type UpdateFundingProjectInput = z.infer<typeof updateFundingProjectSchema>;
export type CreateRewardInput = z.infer<typeof createRewardSchema>;
export type UpdateRewardInput = z.infer<typeof updateRewardSchema>;
export type CreatePledgeInput = z.infer<typeof createPledgeSchema>;
export type UpdatePledgeStatusInput = z.infer<typeof updatePledgeStatusSchema>;
export type CreateExecutionInput = z.infer<typeof createExecutionSchema>;
export type ApproveExecutionInput = z.infer<typeof approveExecutionSchema>;
export type UploadReceiptInput = z.infer<typeof uploadReceiptSchema>;
export type DistributionRuleInput = z.infer<typeof distributionRuleSchema>;
export type CreateDistributionInput = z.infer<typeof createDistributionSchema>;
export type ExecuteDistributionInput = z.infer<typeof executeDistributionSchema>;
export type FundingProjectFilterInput = z.infer<typeof fundingProjectFilterSchema>;
export type FundingProjectSortInput = z.infer<typeof fundingProjectSortSchema>;
export type ChangeProjectStatusInput = z.infer<typeof changeProjectStatusSchema>;
export type EventLogInput = z.infer<typeof eventLogSchema>;
