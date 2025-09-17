import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    override render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <div className="flex flex-col items-center space-y-4">
                            <AlertCircle className="h-12 w-12 text-red-500" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">
                                    오류가 발생했습니다
                                </h3>
                                <p className="text-red-600 mb-4">
                                    페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
                                </p>
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <details className="text-left text-sm text-red-700 bg-red-100 p-3 rounded mt-2">
                                        <summary className="cursor-pointer font-medium">에러 상세 정보</summary>
                                        <pre className="mt-2 whitespace-pre-wrap">
                                            {this.state.error.toString()}
                                            {this.state.errorInfo?.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={this.handleRetry}
                                    variant="outline"
                                    className="border-red-300 text-red-700 hover:bg-red-100"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    다시 시도
                                </Button>
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="default"
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    페이지 새로고침
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

// 함수형 컴포넌트용 에러 경계 (React 18+)
export const ErrorBoundaryFunction: React.FC<Props> = ({ children, fallback }) => {
    const [hasError, setHasError] = React.useState(false);
    const [, setError] = React.useState<Error | null>(null);

    React.useEffect(() => {
        const handleError = (event: any) => {
            setHasError(true);
            const errorEvent = event as any;
            setError(new Error(errorEvent.message || 'Unknown error'));
        };

        const handleUnhandledRejection = (event: any) => {
            setHasError(true);
            const rejectionEvent = event as any;
            setError(new Error(rejectionEvent.reason || 'Unhandled promise rejection'));
        };

        window.addEventListener('error', handleError);
        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    if (hasError) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-red-500" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-800 mb-2">
                                오류가 발생했습니다
                            </h3>
                            <p className="text-red-600 mb-4">
                                페이지를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setHasError(false)}
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-100"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                다시 시도
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="default"
                                className="bg-red-600 hover:bg-red-700"
                            >
                                페이지 새로고침
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <>{children}</>;
};