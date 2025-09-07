import { logger } from './index';
import { getRequestContext } from './request-context';

type EventBase = {
    event: string;        // 예: 'funding.closed'
    projectId?: string;
    userId?: string;
    [key: string]: any;
};

export function logEvent(e: EventBase, msg?: string) {
    const ctx = getRequestContext();
    logger.info(
        { ...e, reqId: ctx?.reqId, userId: e.userId || ctx?.userId },
        msg || e.event
    );
}

// 도메인별 이벤트 로거 헬퍼 함수들
export const fundingEvents = {
    created: (projectId: string, userId: string, amount: number) =>
        logEvent({
            event: 'funding.created',
            projectId,
            userId,
            amount,
        }, 'Funding project created'),

    closed: (projectId: string, success: boolean, totalPledged: number) =>
        logEvent({
            event: 'funding.closed',
            projectId,
            success,
            totalPledged,
        }, 'Funding project closed'),

    pledged: (projectId: string, userId: string, amount: number) =>
        logEvent({
            event: 'funding.pledged',
            projectId,
            userId,
            amount,
        }, 'User pledged to funding project'),

    refunded: (projectId: string, userId: string, amount: number) =>
        logEvent({
            event: 'funding.refunded',
            projectId,
            userId,
            amount,
        }, 'Funding refunded'),
};

export const paymentEvents = {
    initiated: (projectId: string, userId: string, amount: number, method: string) =>
        logEvent({
            event: 'payment.initiated',
            projectId,
            userId,
            amount,
            method,
        }, 'Payment initiated'),

    completed: (projectId: string, userId: string, amount: number, transactionId: string) =>
        logEvent({
            event: 'payment.completed',
            projectId,
            userId,
            amount,
            transactionId,
        }, 'Payment completed'),

    failed: (projectId: string, userId: string, amount: number, reason: string) =>
        logEvent({
            event: 'payment.failed',
            projectId,
            userId,
            amount,
            reason,
        }, 'Payment failed'),
};

export const distributionEvents = {
    started: (projectId: string, totalAmount: number, recipientCount: number) =>
        logEvent({
            event: 'distribution.started',
            projectId,
            totalAmount,
            recipientCount,
        }, 'Revenue distribution started'),

    completed: (projectId: string, totalDistributed: number, recipientCount: number) =>
        logEvent({
            event: 'distribution.completed',
            projectId,
            totalDistributed,
            recipientCount,
        }, 'Revenue distribution completed'),

    failed: (projectId: string, reason: string) =>
        logEvent({
            event: 'distribution.failed',
            projectId,
            reason,
        }, 'Revenue distribution failed'),
};

export const userEvents = {
    registered: (userId: string, email: string, role: string) =>
        logEvent({
            event: 'user.registered',
            userId,
            email,
            role,
        }, 'User registered'),

    login: (userId: string, email: string) =>
        logEvent({
            event: 'user.login',
            userId,
            email,
        }, 'User logged in'),

    logout: (userId: string) =>
        logEvent({
            event: 'user.logout',
            userId,
        }, 'User logged out'),

    profileUpdated: (userId: string, fields: string[]) =>
        logEvent({
            event: 'user.profile_updated',
            userId,
            fields,
        }, 'User profile updated'),
};
