import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { TrendingUp, Gift, Heart } from "lucide-react";
import { BackingsResponse, NotificationsResponse, Notification } from './types';

interface OverviewTabProps {
  backingsData: BackingsResponse | undefined;
  backingsLoading: boolean;
  backingsError: Error | null;
  notificationsData: NotificationsResponse | undefined;
  notificationsLoading: boolean;
  notificationsError: Error | null;
}

export function OverviewTab({
  backingsData,
  backingsLoading,
  backingsError: _backingsError,
  notificationsData,
  notificationsLoading,
  notificationsError
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* 통계 카드들 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-1">총 투자 금액</h3>
            {backingsLoading ? (
              <Skeleton className="h-8 w-24 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">
                ₩{backingsData?.data?.totalInvested?.toLocaleString() || '0'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium mb-1">누적 수익</h3>
            {backingsLoading ? (
              <Skeleton className="h-8 w-24 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-green-600">
                +₩{backingsData?.data?.totalReturned?.toLocaleString() || '0'}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium mb-1">후원 프로젝트</h3>
            {backingsLoading ? (
              <Skeleton className="h-8 w-16 mx-auto" />
            ) : (
              <p className="text-2xl font-bold text-purple-600">
                {backingsData?.data?.totalProjects || 0}개
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          ) : notificationsError ? (
            <ErrorMessage error={notificationsError} />
          ) : (
            <div className="space-y-4">
              {notificationsData?.data && notificationsData.data.length > 0 ? (
                notificationsData.data.slice(0, 5).map((notification: Notification) => {
                  const getNotificationColor = (type: string) => {
                    switch (type) {
                      case 'funding':
                        return 'bg-blue-500';
                      case 'revenue':
                        return 'bg-green-500';
                      case 'artist':
                        return 'bg-purple-500';
                      case 'point':
                        return 'bg-orange-500';
                      case 'event':
                        return 'bg-pink-500';
                      case 'system':
                        return 'bg-gray-500';
                      default:
                        return 'bg-blue-500';
                    }
                  };

                  const getNotificationIcon = (type: string) => {
                    switch (type) {
                      case 'funding':
                        return '💰';
                      case 'revenue':
                        return '📈';
                      case 'artist':
                        return '🎨';
                      case 'point':
                        return '⭐';
                      case 'event':
                        return '🎉';
                      case 'system':
                        return '⚙️';
                      default:
                        return '🔔';
                    }
                  };

                  return (
                    <div key={notification.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                        <div className={`w-2 h-2 rounded-full ${getNotificationColor(notification.type)}`} />
                      </div>
                      <span className="text-sm flex-1">{notification.message}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">최근 활동이 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
