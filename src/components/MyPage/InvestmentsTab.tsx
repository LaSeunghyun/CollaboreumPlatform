import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Skeleton } from "@/shared/ui/Skeleton";
import { ErrorMessage } from "@/shared/ui/ErrorMessage";
import { BackingsResponse, Backing } from './types';

interface InvestmentsTabProps {
  backingsData: BackingsResponse | undefined;
  backingsLoading: boolean;
  backingsError: Error | null;
}

export function InvestmentsTab({
  backingsData,
  backingsLoading,
  backingsError
}: InvestmentsTabProps) {
  const getStatusBadge = (status: Backing['status']) => {
    const statusConfig = {
      completed: { className: 'bg-green-100 text-green-800', text: '완료' },
      failed: { className: 'bg-red-100 text-red-800', text: '실패' },
      ongoing: { className: 'bg-blue-100 text-blue-800', text: '진행중' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getReturnText = (backing: Backing) => {
    const prefix = backing.status === 'completed' ? '+' :
      backing.status === 'failed' ? '-' : '예상 ';
    return `${prefix}₩${backing.returnedAmount?.toLocaleString() || '0'}`;
  };

  const getReturnTextColor = (status: Backing['status']) => {
    return status === 'completed' ? 'text-green-600' :
      status === 'failed' ? 'text-red-600' : 'text-blue-600';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>투자 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {backingsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : backingsError ? (
            <ErrorMessage error={backingsError} />
          ) : (
            <div className="space-y-4">
              {backingsData?.data?.backings && backingsData.data.backings.length > 0 ? (
                backingsData.data.backings.map((backing: Backing) => (
                  <div key={backing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{backing.project?.title || '프로젝트'}</h4>
                        <p className="text-sm text-gray-600">by {backing.project?.artist?.name || '아티스트'}</p>
                      </div>
                      {getStatusBadge(backing.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">투자금:</span>
                        <p className="font-medium">₩{backing.amount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">수익:</span>
                        <p className={`font-medium ${getReturnTextColor(backing.status)}`}>
                          {getReturnText(backing)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">투자일:</span>
                        <p className="font-medium">
                          {backing.createdAt ? new Date(backing.createdAt).toLocaleDateString() : '알 수 없음'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">투자 내역이 없습니다.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
