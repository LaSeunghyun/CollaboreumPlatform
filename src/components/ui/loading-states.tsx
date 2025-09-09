import React from 'react';
import { RefreshCw, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from './utils';

// 기본 로딩 스피너
interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

export function LoadingSpinner({
    size = 'md',
    className,
    text = '로딩 중...'
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8'
    };

    return (
        <div className={cn('flex items-center justify-center space-x-2', className)}>
            <RefreshCw className={cn('animate-spin text-blue-600', sizeClasses[size])} />
            {text && <span className="text-sm text-gray-600">{text}</span>}
        </div>
    );
}

// 페이지 전체 로딩
interface PageLoadingProps {
    message?: string;
    showProgress?: boolean;
    progress?: number;
    className?: string;
}

export function PageLoading({
    message = '데이터를 불러오는 중...',
    showProgress = false,
    progress,
    className
}: PageLoadingProps) {
    return (
        <div className={cn(
            'min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center',
            className
        )}>
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {message}
                    </h3>

                    {showProgress && (
                        <div className="w-64 mx-auto">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress || 0}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {progress ? `${Math.round(progress)}%` : '처리 중...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 카드 로딩 스켈레톤
interface CardLoadingProps {
    lines?: number;
    className?: string;
}

export function CardLoading({ lines = 3, className }: CardLoadingProps) {
    return (
        <div className={cn('animate-pulse space-y-4', className)}>
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>

            {Array.from({ length: lines - 2 }).map((_, i) => (
                <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
        </div>
    );
}

// 네트워크 상태 표시
interface NetworkStatusProps {
    isOnline: boolean;
    wasOffline?: boolean;
    className?: string;
}

export function NetworkStatus({
    isOnline,
    wasOffline = false,
    className
}: NetworkStatusProps) {
    if (isOnline && !wasOffline) return null;

    return (
        <div className={cn(
            'fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300',
            isOnline
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200',
            className
        )}>
            {isOnline ? (
                <>
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm font-medium">연결 복구됨</span>
                </>
            ) : (
                <>
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">오프라인</span>
                </>
            )}
        </div>
    );
}

// 성공 상태 표시
interface SuccessStateProps {
    message: string;
    onDismiss?: () => void;
    autoHide?: boolean;
    duration?: number;
    className?: string;
}

export function SuccessState({
    message,
    onDismiss,
    autoHide = true,
    duration = 3000,
    className
}: SuccessStateProps) {
    React.useEffect(() => {
        if (autoHide && onDismiss) {
            const timer = setTimeout(onDismiss, duration);
            return () => clearTimeout(timer);
        }
        return undefined;
    }, [autoHide, onDismiss, duration]);

    return (
        <div className={cn(
            'flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-100 text-green-800 border border-green-200',
            className
        )}>
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{message}</span>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="ml-2 text-green-600 hover:text-green-800"
                >
                    ×
                </button>
            )}
        </div>
    );
}

// 에러 상태 표시
interface ErrorStateProps {
    message: string;
    onDismiss?: () => void;
    onRetry?: () => void;
    className?: string;
}

export function ErrorState({
    message,
    onDismiss,
    onRetry,
    className
}: ErrorStateProps) {
    return (
        <div className={cn(
            'flex items-center justify-between px-4 py-2 rounded-lg bg-red-100 text-red-800 border border-red-200',
            className
        )}>
            <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{message}</span>
            </div>

            <div className="flex items-center space-x-2">
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                        재시도
                    </button>
                )}
                {onDismiss && (
                    <button
                        onClick={onDismiss}
                        className="text-red-600 hover:text-red-800"
                    >
                        ×
                    </button>
                )}
            </div>
        </div>
    );
}

// 빈 상태 표시
interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className
}: EmptyStateProps) {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-12 text-center',
            className
        )}>
            {icon && (
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    {icon}
                </div>
            )}

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
                    {description}
                </p>
            )}

            {action}
        </div>
    );
}
