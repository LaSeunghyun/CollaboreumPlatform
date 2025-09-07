import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { RetryButton } from './ui/retry-button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
    private maxRetries = 3;

    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // 에러 로깅
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // 커스텀 에러 핸들러 호출
        this.props.onError?.(error, errorInfo);

        // 에러 리포팅 서비스에 전송 (예: Sentry, LogRocket 등)
        // this.reportError(error, errorInfo);
    }

    private handleRetry = () => {
        if (this.state.retryCount < this.maxRetries) {
            this.setState(prevState => ({
                hasError: false,
                error: null,
                errorInfo: null,
                retryCount: prevState.retryCount + 1,
            }));
        }
    };

    private handleReload = () => {
        window.location.reload();
    };

    private handleGoHome = () => {
        window.location.href = '/';
    };

    private handleReportBug = () => {
        const { error, errorInfo } = this.state;
        const bugReport = {
            error: error?.message,
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };

        // 버그 리포트를 서버로 전송하거나 클립보드에 복사
        navigator.clipboard.writeText(JSON.stringify(bugReport, null, 2))
            .then(() => {
                alert('버그 리포트가 클립보드에 복사되었습니다. 개발팀에 전달해주세요.');
            })
            .catch(() => {
                alert('버그 리포트가 콘솔에 출력되었습니다.');
            });
    };

    render() {
        if (this.state.hasError) {
            // 커스텀 fallback이 있으면 사용
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const { error, retryCount } = this.state;
            const isMaxRetriesReached = retryCount >= this.maxRetries;

            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 flex items-center justify-center p-4">
                    <div className="max-w-2xl w-full">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8 text-center">
                            {/* 에러 아이콘 */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </div>
                            </div>

                            {/* 에러 제목 */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                문제가 발생했습니다
                            </h1>

                            {/* 에러 메시지 */}
                            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                예상치 못한 오류가 발생했습니다.
                                {isMaxRetriesReached
                                    ? ' 여러 번 시도했지만 문제가 지속되고 있습니다.'
                                    : ' 잠시 후 다시 시도해주세요.'
                                }
                            </p>

                            {/* 에러 상세 정보 (개발 모드에서만) */}
                            {this.props.showDetails && error && (
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                                    <details>
                                        <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            기술적 세부사항
                                        </summary>
                                        <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-40">
                                            {error.message}
                                            {error.stack && `\n\n${error.stack}`}
                                        </pre>
                                    </details>
                                </div>
                            )}

                            {/* 액션 버튼들 */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                {!isMaxRetriesReached && (
                                    <RetryButton
                                        onRetry={this.handleRetry}
                                        retryCount={retryCount}
                                        maxRetries={this.maxRetries}
                                        variant="default"
                                        size="lg"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        다시 시도
                                    </RetryButton>
                                )}

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={this.handleReload}
                                    className="flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    페이지 새로고침
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={this.handleGoHome}
                                    className="flex items-center gap-2"
                                >
                                    <Home className="w-4 h-4" />
                                    홈으로 이동
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="lg"
                                    onClick={this.handleReportBug}
                                    className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                                >
                                    <Bug className="w-4 h-4" />
                                    버그 리포트
                                </Button>
                            </div>

                            {/* 재시도 횟수 표시 */}
                            {retryCount > 0 && (
                                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                                    재시도 횟수: {retryCount}/{this.maxRetries}
                                </div>
                            )}

                            {/* 도움말 */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    문제가 지속되면 브라우저 캐시를 삭제하거나 다른 브라우저를 시도해보세요.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// 함수형 컴포넌트를 위한 에러 바운더리 래퍼
interface ErrorBoundaryWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    showDetails?: boolean;
}

export function ErrorBoundaryWrapper({
    children,
    fallback,
    onError,
    showDetails = process.env.NODE_ENV === 'development',
}: ErrorBoundaryWrapperProps) {
    return (
        <ErrorBoundary
            fallback={fallback}
            onError={onError}
            showDetails={showDetails}
        >
            {children}
        </ErrorBoundary>
    );
}

// 특정 컴포넌트를 감싸는 HOC
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    errorBoundaryProps?: Omit<Props, 'children'>
) {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary {...errorBoundaryProps}>
            <Component {...props} />
        </ErrorBoundary>
    );

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

    return WrappedComponent;
}
