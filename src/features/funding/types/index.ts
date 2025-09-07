import { BaseEntity, User } from '../../../shared/types';

// 펀딩 프로젝트 상태
export enum FundingProjectStatus {
    DRAFT = 'draft',           // 초안
    COLLECTING = 'collecting', // 모금 중
    SUCCEEDED = 'succeeded',   // 성공
    FAILED = 'failed',         // 실패
    EXECUTING = 'executing',   // 집행 중
    DISTRIBUTING = 'distributing', // 분배 중
    CLOSED = 'closed',         // 종료
}

// 펀딩 프로젝트
export interface FundingProject extends BaseEntity {
    title: string;
    description: string;
    shortDescription: string;
    targetAmount: number; // 목표 금액 (원 단위)
    currentAmount: number; // 현재 모금액 (원 단위)
    status: FundingProjectStatus;
    startDate: Date;
    endDate: Date;
    ownerId: string;
    owner: User;
    categoryId: string;
    category: Category;
    images: string[];
    tags: string[];
    rewards: Reward[];
    pledges: Pledge[];
    executions: Execution[];
    distributions: Distribution[];
    progress: number; // 진행률 (0-100)
    backerCount: number; // 후원자 수
    isActive: boolean;
    isFeatured: boolean;
    metadata: Record<string, any>;
}

// 리워드
export interface Reward extends BaseEntity {
    projectId: string;
    title: string;
    description: string;
    amount: number; // 금액 (원 단위)
    deliveryDate: Date;
    stock: number; // 재고
    soldCount: number; // 판매 수량
    isLimited: boolean;
    isActive: boolean;
    images: string[];
    metadata: Record<string, any>;
}

// 후원 (Pledge)
export interface Pledge extends BaseEntity {
    projectId: string;
    userId: string;
    user: User;
    rewardId?: string;
    reward?: Reward;
    amount: number; // 후원 금액 (원 단위)
    status: PledgeStatus;
    paymentMethod: string;
    paymentId?: string;
    idempotencyKey: string; // 멱등성 키
    authorizedAt?: Date;
    capturedAt?: Date;
    refundedAt?: Date;
    refundAmount?: number;
    refundReason?: string;
    metadata: Record<string, any>;
}

// 후원 상태
export enum PledgeStatus {
    PENDING = 'pending',         // 대기 중
    AUTHORIZED = 'authorized',   // 승인됨
    CAPTURED = 'captured',       // 결제 완료
    REFUNDED = 'refunded',       // 환불됨
    FAILED = 'failed',           // 실패
    CANCELLED = 'cancelled',     // 취소됨
}

// 집행 (Execution)
export interface Execution extends BaseEntity {
    projectId: string;
    title: string;
    description: string;
    budgetAmount: number; // 예산 금액 (원 단위)
    actualAmount: number; // 실제 집행 금액 (원 단위)
    status: ExecutionStatus;
    approvedBy?: string;
    approvedAt?: Date;
    receipts: Receipt[];
    metadata: Record<string, any>;
}

// 집행 상태
export enum ExecutionStatus {
    PENDING = 'pending',     // 대기 중
    APPROVED = 'approved',   // 승인됨
    REJECTED = 'rejected',   // 거부됨
    COMPLETED = 'completed', // 완료됨
}

// 영수증
export interface Receipt extends BaseEntity {
    executionId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    amount: number; // 영수증 금액 (원 단위)
    date: Date; // 영수증 날짜
    description: string;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: Date;
    ocrData?: OCRData;
    metadata: Record<string, any>;
}

// OCR 데이터
export interface OCRData {
    extractedAmount?: number;
    extractedDate?: Date;
    extractedVendor?: string;
    confidence: number;
    rawText: string;
    processedAt: Date;
}

// 분배 (Distribution)
export interface Distribution extends BaseEntity {
    projectId: string;
    totalAmount: number; // 총 분배 금액 (원 단위)
    status: DistributionStatus;
    rules: DistributionRule[];
    items: DistributionItem[];
    executedAt?: Date;
    executedBy?: string;
    metadata: Record<string, any>;
}

// 분배 상태
export enum DistributionStatus {
    PENDING = 'pending',     // 대기 중
    CALCULATED = 'calculated', // 계산 완료
    EXECUTED = 'executed',   // 실행 완료
    FAILED = 'failed',       // 실패
}

// 분배 규칙
export interface DistributionRule {
    type: DistributionRuleType;
    percentage?: number; // 비율 (0-100)
    fixedAmount?: number; // 고정 금액 (원 단위)
    recipient: string; // 수령자 (사용자 ID 또는 역할)
    description: string;
    priority: number; // 우선순위
}

// 분배 규칙 타입
export enum DistributionRuleType {
    OWNER = 'owner',           // 프로젝트 소유자
    PLATFORM = 'platform',     // 플랫폼 수수료
    ARTIST = 'artist',         // 아티스트
    CONTRIBUTOR = 'contributor', // 기여자
    CUSTOM = 'custom',         // 사용자 정의
}

// 분배 항목
export interface DistributionItem {
    ruleId: string;
    recipientId: string;
    recipient: User;
    amount: number; // 분배 금액 (원 단위)
    status: DistributionItemStatus;
    executedAt?: Date;
    transactionId?: string;
    metadata: Record<string, any>;
}

// 분배 항목 상태
export enum DistributionItemStatus {
    PENDING = 'pending',     // 대기 중
    PROCESSING = 'processing', // 처리 중
    COMPLETED = 'completed', // 완료됨
    FAILED = 'failed',       // 실패
}

// 카테고리
export interface Category extends BaseEntity {
    name: string;
    slug: string;
    description: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    sortOrder: number;
}

// 이벤트 로그 (Outbox 패턴)
export interface EventLog extends BaseEntity {
    eventType: EventType;
    aggregateId: string; // 프로젝트 ID 또는 후원 ID
    aggregateType: string; // 'funding_project' | 'pledge' | 'execution' | 'distribution'
    eventData: Record<string, any>;
    status: EventStatus;
    retryCount: number;
    maxRetries: number;
    nextAttemptAt: Date;
    lastAttemptAt?: Date;
    lastError?: string;
    processedAt?: Date;
}

// 이벤트 타입
export enum EventType {
    PROJECT_CREATED = 'project_created',
    PROJECT_UPDATED = 'project_updated',
    PROJECT_STATUS_CHANGED = 'project_status_changed',
    PLEDGE_CREATED = 'pledge_created',
    PLEDGE_CAPTURED = 'pledge_captured',
    PLEDGE_REFUNDED = 'pledge_refunded',
    EXECUTION_CREATED = 'execution_created',
    EXECUTION_APPROVED = 'execution_approved',
    DISTRIBUTION_CREATED = 'distribution_created',
    DISTRIBUTION_EXECUTED = 'distribution_executed',
    PAYMENT_PROCESSED = 'payment_processed',
    PAYMENT_REFUNDED = 'payment_refunded',
}

// 이벤트 상태
export enum EventStatus {
    PENDING = 'pending',     // 대기 중
    PROCESSING = 'processing', // 처리 중
    COMPLETED = 'completed', // 완료됨
    FAILED = 'failed',       // 실패
    CANCELLED = 'cancelled', // 취소됨
}

// 펀딩 프로젝트 생성 데이터
export interface CreateFundingProjectData {
    title: string;
    description: string;
    shortDescription: string;
    targetAmount: number;
    startDate: Date;
    endDate: Date;
    categoryId: string;
    images: string[];
    tags: string[];
    rewards: CreateRewardData[];
    metadata?: Record<string, any>;
}

// 리워드 생성 데이터
export interface CreateRewardData {
    title: string;
    description: string;
    amount: number;
    deliveryDate: Date;
    stock?: number;
    isLimited?: boolean;
    images?: string[];
    metadata?: Record<string, any>;
}

// 후원 생성 데이터
export interface CreatePledgeData {
    projectId: string;
    rewardId?: string;
    amount: number;
    paymentMethod: string;
    idempotencyKey: string;
    metadata?: Record<string, any>;
}

// 집행 생성 데이터
export interface CreateExecutionData {
    projectId: string;
    title: string;
    description: string;
    budgetAmount: number;
    receipts?: CreateReceiptData[];
    metadata?: Record<string, any>;
}

// 영수증 생성 데이터
export interface CreateReceiptData {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    amount: number;
    date: Date;
    description: string;
    metadata?: Record<string, any>;
}

// 분배 생성 데이터
export interface CreateDistributionData {
    projectId: string;
    rules: DistributionRule[];
    metadata?: Record<string, any>;
}

// 펀딩 프로젝트 필터
export interface FundingProjectFilter {
    status?: FundingProjectStatus[];
    categoryId?: string;
    ownerId?: string;
    search?: string;
    tags?: string[];
    minAmount?: number;
    maxAmount?: number;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
    isFeatured?: boolean;
}

// 펀딩 프로젝트 정렬
export interface FundingProjectSort {
    field: 'createdAt' | 'updatedAt' | 'targetAmount' | 'currentAmount' | 'progress' | 'backerCount' | 'endDate';
    order: 'asc' | 'desc';
}
