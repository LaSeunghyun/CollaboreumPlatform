import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    this.setState({
      error,
      errorInfo,
    });
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
        <div className='flex min-h-screen items-center justify-center bg-gray-50'>
          <div className='mx-auto max-w-md px-4 text-center'>
            <div className='mb-6 text-red-500'>
              <AlertTriangle className='mx-auto mb-4 h-16 w-16' />
              <h2 className='mb-2 text-xl font-semibold text-gray-900'>
                문제가 발생했습니다
              </h2>
              <p className='mb-6 text-gray-600'>
                예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
              </p>
            </div>
            <Button
              variant='outline'
              onClick={() => window.location.reload()}
              className='w-full'
            >
              페이지 새로고침
            </Button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='mt-6 text-left'>
                <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
                  개발자 정보 (클릭하여 확장)
                </summary>
                <div className='mt-2 overflow-auto rounded bg-gray-100 p-4 font-mono text-xs text-gray-700'>
                  <div className='mb-2'>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className='mt-1 whitespace-pre-wrap'>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
