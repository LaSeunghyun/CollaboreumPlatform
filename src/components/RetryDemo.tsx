import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useRetry } from '../hooks/useRetry';
import { RetryButton } from './ui/retry-button';
import { LoadingSpinner, ErrorRetry, EmptyState } from './ui/loading-states';

export const RetryDemo: React.FC = () => {
  const [showSuccess, setShowSuccess] = useState(false);

  // useRetry 훅 데모
  const { data, error, isLoading, retry, retryCount } = useRetry(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { message: '데이터를 성공적으로 불러왔습니다!' };
    },
    { maxRetries: 3 }
  );

  const { 
    data: errorData, 
    error: errorError, 
    isLoading: errorLoading, 
    retry: retryError, 
    retryCount: errorRetryCount 
  } = useRetry(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('의도적으로 실패하는 API');
    },
    { maxRetries: 3 }
  );

  const fetchData = () => {
    retry();
  };

  const fetchErrorData = () => {
    retryError();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">재시도 시스템 데모</h1>
          <p className="text-gray-600">useRetry 훅과 재시도 버튼 컴포넌트들을 테스트해보세요</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* useRetry 훅 데모 - 성공 케이스 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                useRetry 훅 - 성공 케이스
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchData} disabled={isLoading}>
                데이터 불러오기
              </Button>

              {isLoading && (
                <LoadingSpinner text="데이터를 불러오는 중..." />
              )}

              {data && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-green-800 text-sm">{data.message}</p>
                  <p className="text-green-600 text-xs mt-1">재시도 횟수: {retryCount}</p>
                </div>
              )}

              {error && (
                <ErrorRetry
                  error={error}
                  onRetry={retry}
                  isLoading={isLoading}
                  retryCount={retryCount}
                  maxRetries={3}
                />
              )}
            </CardContent>
          </Card>

          {/* useRetry 훅 데모 - 에러 케이스 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                useRetry 훅 - 에러 케이스
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={fetchErrorData} disabled={errorLoading}>
                실패하는 API 호출
              </Button>

              {errorLoading && (
                <LoadingSpinner text="실패할 예정..." />
              )}

              {errorError && (
                <ErrorRetry
                  error={errorError}
                  onRetry={retryError}
                  isLoading={errorLoading}
                  retryCount={errorRetryCount}
                  maxRetries={3}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* 재시도 버튼 컴포넌트들 */}
        <Card>
          <CardHeader>
            <CardTitle>재시도 버튼 컴포넌트들</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">기본 재시도 버튼:</p>
                <RetryButton
                  onRetry={() => console.log('재시도 클릭')}
                  variant="default"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">로딩 중인 재시도 버튼:</p>
                <RetryButton
                  onRetry={() => console.log('재시도 클릭')}
                  isLoading={true}
                  variant="outline"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">재시도 횟수가 있는 버튼:</p>
                <RetryButton
                  onRetry={() => console.log('재시도 클릭')}
                  retryCount={2}
                  maxRetries={3}
                  variant="destructive"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로딩 상태 컴포넌트들 */}
        <Card>
          <CardHeader>
            <CardTitle>로딩 상태 컴포넌트들</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">로딩 스피너:</p>
                <LoadingSpinner size="sm" text="작은 스피너" />
                <LoadingSpinner size="md" text="중간 스피너" />
                <LoadingSpinner size="lg" text="큰 스피너" />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">에러 상태:</p>
                <ErrorRetry
                  error={new Error('테스트 에러')}
                  onRetry={() => console.log('재시도')}
                  retryCount={1}
                  maxRetries={3}
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">빈 상태:</p>
                <EmptyState
                  icon={<AlertTriangle className="w-8 h-8 text-gray-400" />}
                  title="데이터가 없습니다"
                  description="새로운 데이터를 추가해보세요"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
