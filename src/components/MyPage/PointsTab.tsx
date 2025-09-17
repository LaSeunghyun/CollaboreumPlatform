import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { Badge } from "@/shared/ui/Badge";
import {
  Wallet,
  TrendingUp,
  Gift,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  CreditCard,
  History
} from "lucide-react";
import { UserProfile } from './types';
import { useUserPoints, useUserPointsHistory, useInvestWithPoints } from '../../lib/api/useUser';

interface PointsTabProps {
  userData: UserProfile;
}

export function PointsTab({ userData }: PointsTabProps) {
  const [showHistory, setShowHistory] = useState(false);

  // 포인트 데이터 로드
  const {
    data: pointsData,
    isLoading: pointsLoading,
    error: pointsError
  } = useUserPoints(userData?.id || '');

  // 포인트 사용 내역 로드
  const {
    data: pointsHistoryData,
    isLoading: historyLoading,
    error: historyError
  } = useUserPointsHistory(userData?.id || '', {
    page: 1,
    limit: 10
  });

  const investWithPointsMutation = useInvestWithPoints();

  // 포인트 투자 핸들러
  const handleInvestWithPoints = () => {
    // TODO: 프로젝트 선택 모달 구현
    console.log('포인트 투자 모달 열기');
  };

  if (pointsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Skeleton className="h-4 w-24 mx-auto mb-2" />
                <Skeleton className="h-8 w-32 mx-auto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (pointsError) {
    return (
      <div className="space-y-6">
        <ErrorMessage error={pointsError} />
      </div>
    );
  }

  const points = (pointsData as any)?.data || {
    available: 0,
    total: 0,
    pending: 0,
    history: []
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* 포인트 현황 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              포인트 현황
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <p className="text-sm text-gray-600">사용 가능 포인트</p>
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-1">
                {points.available?.toLocaleString() || '0'}P
              </p>
              <Badge variant="outline" className="text-xs">
                즉시 사용 가능
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <p className="text-gray-600">총 적립</p>
                </div>
                <p className="font-bold text-lg">
                  {points.total?.toLocaleString() || '0'}P
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <p className="text-gray-600">대기 중</p>
                </div>
                <p className="font-bold text-lg">
                  {points.pending?.toLocaleString() || '0'}P
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 포인트 활용 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              포인트 활용
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={handleInvestWithPoints}
                disabled={points.available === 0 || investWithPointsMutation.isPending}
              >
                <TrendingUp className="w-4 h-4 mr-3" />
                새 프로젝트에 투자하기
                {points.available === 0 && (
                  <Badge variant="secondary" className="ml-auto">포인트 부족</Badge>
                )}
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="w-4 h-4 mr-3" />
                포인트 내역 보기
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Gift className="w-4 h-4 mr-3" />
                굿즈샵에서 사용하기
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <CreditCard className="w-4 h-4 mr-3" />
                현금으로 전환하기
              </Button>
            </div>

            {/* 포인트 적립 방법 안내 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">포인트 적립 방법</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 프로젝트 후원 시 1% 적립</li>
                <li>• 커뮤니티 활동 시 포인트 지급</li>
                <li>• 이벤트 참여 시 보너스 포인트</li>
                <li>• 친구 초대 시 양쪽 모두 적립</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 포인트 사용 내역 */}
      {showHistory && (
        <Card>
          <CardHeader>
            <CardTitle>포인트 사용 내역</CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : historyError ? (
              <ErrorMessage error={historyError} />
            ) : (pointsHistoryData as any)?.data?.history?.length > 0 ? (
              <div className="space-y-3">
                {(pointsHistoryData as any).data.history.map((transaction: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {transaction.type === 'earned' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'earned' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}P
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>포인트 사용 내역이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
