import * as React from "react";
import { RefreshCw, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "./button";
import { cn } from "./utils";

interface RetryButtonProps {
    onRetry: () => void;
    isLoading?: boolean;
    error?: string | null;
    variant?: "default" | "outline" | "ghost" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
    children?: React.ReactNode;
    showIcon?: boolean;
    retryCount?: number;
    maxRetries?: number;
}

export function RetryButton({
    onRetry,
    isLoading = false,
    error,
    variant = "outline",
    size = "default",
    className,
    children,
    showIcon = true,
    retryCount = 0,
    maxRetries = 3,
}: RetryButtonProps) {
    const isMaxRetriesReached = retryCount >= maxRetries;
    const isNetworkError = error?.includes("네트워크") || error?.includes("연결") || error?.includes("서버");

    const getIcon = () => {
        if (isLoading) {
            return <RefreshCw className="animate-spin" />;
        }
        if (isMaxRetriesReached) {
            return <AlertCircle />;
        }
        if (isNetworkError) {
            return <WifiOff />;
        }
        return <RefreshCw />;
    };

    const getButtonText = () => {
        if (children) return children;
        if (isLoading) return "재시도 중...";
        if (isMaxRetriesReached) return "재시도 실패";
        if (retryCount > 0) return `다시 시도 (${retryCount}/${maxRetries})`;
        return "다시 시도";
    };

    return (
        <Button
            variant={isMaxRetriesReached ? "destructive" : variant}
            size={size}
            onClick={onRetry}
            disabled={isLoading || isMaxRetriesReached}
            className={cn(
                "transition-all duration-200",
                isMaxRetriesReached && "opacity-60",
                className
            )}
        >
            {showIcon && getIcon()}
            {getButtonText()}
        </Button>
    );
}

// 에러 상태를 위한 전용 컴포넌트
interface ErrorRetryProps {
    error: string;
    onRetry: () => void;
    isLoading?: boolean;
    retryCount?: number;
    maxRetries?: number;
    className?: string;
}

export function ErrorRetry({
    error,
    onRetry,
    isLoading = false,
    retryCount = 0,
    maxRetries = 3,
    className,
}: ErrorRetryProps) {
    const isMaxRetriesReached = retryCount >= maxRetries;
    const isNetworkError = error.includes("네트워크") || error.includes("연결") || error.includes("서버");

    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-6 space-y-4",
            "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg",
            className
        )}>
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                {isNetworkError ? (
                    <WifiOff className="w-6 h-6" />
                ) : (
                    <AlertCircle className="w-6 h-6" />
                )}
                <span className="font-medium">오류가 발생했습니다</span>
            </div>

            <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-md">
                {error}
            </p>

            {!isMaxRetriesReached && (
                <RetryButton
                    onRetry={onRetry}
                    isLoading={isLoading}
                    retryCount={retryCount}
                    maxRetries={maxRetries}
                    variant="outline"
                    size="sm"
                />
            )}

            {isMaxRetriesReached && (
                <div className="text-xs text-red-500 dark:text-red-400 text-center">
                    최대 재시도 횟수에 도달했습니다. 잠시 후 다시 시도해주세요.
                </div>
            )}
        </div>
    );
}

// 로딩 상태를 위한 컴포넌트
interface LoadingRetryProps {
    message?: string;
    showRetryButton?: boolean;
    onRetry?: () => void;
    className?: string;
}

export function LoadingRetry({
    message = "데이터를 불러오는 중...",
    showRetryButton = false,
    onRetry,
    className,
}: LoadingRetryProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-6 space-y-4",
            "bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg",
            className
        )}>
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                {message}
            </p>
            {showRetryButton && onRetry && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRetry}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                    취소
                </Button>
            )}
        </div>
    );
}
