import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RetryButton, ErrorRetry, LoadingRetry } from './ui/retry-button';
import { LoadingSpinner, PageLoading, CardLoading, NetworkStatus, SuccessState, ErrorState, EmptyState } from './ui/loading-states';
import { useRetry } from '../hooks/useRetry';
import { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

// 데모용 API 함수들
const simulateAPI = (shouldFail: boolean = false, delay: number = 1000) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (shouldFail) {
                reject(new Error('네트워크 오류가 발생했습니다.'));
            } else {
                resolve({ message: '데이터를 성공적으로 불러왔습니다!' });
            }
        }, delay);
    });
};

export function RetryDemo() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [wasOffline, setWasOffline] = useState(false);

    // useRetry 훅 데모
    const {
        data,
        error,
        isLoading,
        retryCount,
        isMaxRetriesReached,
        execute: fetchData,
        retry,
    } = useRetry(
        () => simulateAPI(false, 2000),
        {
            maxRetries: 3,
            retryDelay: 1000,
            onRetry: (attempt) => {
                console.log(`재시도: ${attempt + 1}번째 시도`);
            },
            onMaxRetriesReached: () => {
                console.log('최대 재시도 횟수 도달');
            },
        }
    );

    const {
        data: errorData,
        error: errorError,
        isLoading: errorLoading,
        retryCount: errorRetryCount,
        execute: fetchErrorData,
        retry: retryError,
    } = useRetry(
        () => simulateAPI(true, 1500),
        {
            maxRetries: 3,
            retryDelay: 1000,
        }
    );

    const handleNetworkToggle = () => {
        setIsOnline(!isOnline);
        if (isOnline) {
            setWasOffline(true);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">재시도 시스템 데모</h1>
                <p className="text-gray-600">다양한 재시도 컴포넌트와 상태 관리 기능을 확인해보세요.</p>
            </div>

            {/* 네트워크 상태 */}
            <NetworkStatus isOnline={isOnline} wasOffline={wasOffline} />

            {/* 성공/에러 상태 알림 */}
            {showSuccess && (
                <SuccessState
                    message="작업이 성공적으로 완료되었습니다!"
                    onDismiss={() => setShowSuccess(false)}
                />
            )}

            {showError && (
                <ErrorState
                    message="작업 중 오류가 발생했습니다."
                    onDismiss={() => setShowError(false)}
                    onRetry={() => {
                        setShowError(false);
                        setShowSuccess(true);
                    }}
                />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
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

                {/* 재시도 버튼 컴포넌트들 */}
                <Card>
                    <CardHeader>
                        <CardTitle>재시도 버튼 컴포넌트들</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                variant="outline"
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">최대 재시도 도달:</p>
                            <RetryButton
                                onRetry={() => console.log('재시도 클릭')}
                                retryCount={3}
                                maxRetries={3}
                                variant="destructive"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 로딩 상태 컴포넌트들 */}
                <Card>
                    <CardHeader>
                        <CardTitle>로딩 상태 컴포넌트들</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">로딩 스피너:</p>
                            <LoadingSpinner size="sm" text="작은 스피너" />
                            <LoadingSpinner size="md" text="중간 스피너" />
                            <LoadingSpinner size="lg" text="큰 스피너" />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">카드 로딩 스켈레톤:</p>
                            <CardLoading lines={3} />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">로딩 재시도 컴포넌트:</p>
                            <LoadingRetry
                                message="데이터를 불러오는 중..."
                                showRetryButton={true}
                                onRetry={() => console.log('취소 클릭')}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 빈 상태와 네트워크 제어 */}
                <Card>
                    <CardHeader>
                        <CardTitle>빈 상태 & 네트워크 제어</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium">빈 상태 컴포넌트:</p>
                            <EmptyState
                                icon={<AlertTriangle className="w-8 h-8 text-gray-400" />}
                                title="데이터가 없습니다"
                                description="아직 등록된 프로젝트가 없습니다. 첫 번째 프로젝트를 만들어보세요!"
                                action={
                                    <Button size="sm" variant="outline">
                                        프로젝트 만들기
                                    </Button>
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium">네트워크 상태 토글:</p>
                            <Button
                                onClick={handleNetworkToggle}
                                variant={isOnline ? "destructive" : "default"}
                                size="sm"
                            >
                                {isOnline ? "오프라인으로 전환" : "온라인으로 전환"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* 알림 상태 데모 */}
                <Card>
                    <CardHeader>
                        <CardTitle>알림 상태 데모</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Button
                                onClick={() => setShowSuccess(true)}
                                variant="default"
                                size="sm"
                            >
                                성공 알림 표시
                            </Button>

                            <Button
                                onClick={() => setShowError(true)}
                                variant="destructive"
                                size="sm"
                            >
                                에러 알림 표시
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
