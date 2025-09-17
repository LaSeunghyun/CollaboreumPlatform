import React from 'react';

/**
 * 안전한 데이터 렌더링을 위한 유틸리티 함수들
 */

// 객체를 안전하게 문자열로 변환
export const safeString = (value: unknown, fallback: string = ''): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'object' && value !== null) {
        // 객체인 경우 name, username, title 등의 속성을 찾아서 반환
        const obj = value as Record<string, unknown>;
        if (obj.name) return String(obj.name);
        if (obj.username) return String(obj.username);
        if (obj.title) return String(obj.title);
        if (obj.content) return String(obj.content);
        return fallback;
    }
    return fallback;
};

// 숫자를 안전하게 렌더링
export const safeNumber = (value: unknown, fallback: number = 0): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? fallback : parsed;
    }
    if (Array.isArray(value)) return value.length;
    return fallback;
};

// 배열을 안전하게 렌더링
export const safeArray = (value: unknown, fallback: unknown[] = []): unknown[] => {
    if (Array.isArray(value)) return value;
    return fallback;
};

// 객체를 안전하게 렌더링
export const safeObject = (value: unknown, fallback: Record<string, unknown> = {}): Record<string, unknown> => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>;
    }
    return fallback;
};

// React 자식으로 안전하게 렌더링할 수 있는 값인지 확인
export const isRenderable = (value: unknown): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
    if (React.isValidElement(value)) return true;
    return false;
};

// 안전한 React 자식 렌더링
export const SafeRender: React.FC<{
    children: unknown;
    fallback?: React.ReactNode;
    asString?: boolean;
}> = ({ children, fallback = null, asString = false }) => {
    if (isRenderable(children)) {
        return <>{children}</>;
    }

    if (asString) {
        return <>{safeString(children)}</>;
    }

    return <>{fallback}</>;
};

// 댓글/답글 수를 안전하게 계산
export const getCommentCount = (comments: unknown, replies: unknown): number => {
    const commentCount = safeNumber(comments);
    const replyCount = safeNumber(replies);
    return commentCount + replyCount;
};

// 좋아요 수를 안전하게 계산
export const getLikeCount = (likes: unknown): number => {
    return safeNumber(likes);
};

// 작성자 이름을 안전하게 가져오기
export const getAuthorName = (author: unknown): string => {
    if (typeof author === 'string') return author;
    if (author && typeof author === 'object' && author !== null) {
        const obj = author as Record<string, unknown>;
        return safeString(obj.name || obj.username || obj.authorName);
    }
    return 'Unknown';
};

// 날짜를 안전하게 포맷팅
export const safeDateFormat = (date: unknown, fallback: string = '방금 전'): string => {
    if (!date) return fallback;

    try {
        const dateObj = new Date(date as string | number | Date);
        if (isNaN(dateObj.getTime())) return fallback;

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`;

        return dateObj.toLocaleDateString('ko-KR');
    } catch {
        return fallback;
    }
};
