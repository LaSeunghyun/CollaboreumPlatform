import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock,
  PieChart,
  Download,
  AlertTriangle
} from "lucide-react";

interface RevenueDistributionProps {
  projectId: number;
  totalRevenue: number;
  platformFee: number;
  artistShare: number;
  backerShare: number;
  distributionDate?: string;
  status: 'pending' | 'distributed';
  backers: Array<{
    id: number;
    name: string;
    investmentAmount: number;
    sharePercentage: number;
    distributedAmount: number;
    status: 'pending' | 'paid';
  }>;
}

export function RevenueDistribution({
  projectId,
  totalRevenue,
  platformFee,
  artistShare,
  backerShare,
  distributionDate,
  status,
  backers
}: RevenueDistributionProps) {
  const [showBackerDetails, setShowBackerDetails] = useState(false);

  const totalDistributed = backers.reduce((sum, backer) => 
    sum + (backer.status === 'paid' ? backer.distributedAmount : 0), 0
  );

  const distributionProgress = backerShare > 0 ? (totalDistributed / backerShare) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            수익 분배 현황
          </CardTitle>
          <Badge className={status === 'distributed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {status === 'distributed' ? '분배 완료' : '분배 대기'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Revenue */}
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <DollarSign className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              ₩{totalRevenue.toLocaleString()}
            </h3>
            <p className="text-gray-600">총 수익</p>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                ₩{platformFee.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">플랫폼 수수료</div>
              <div className="text-xs text-gray-500">
                {((platformFee / totalRevenue) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                ₩{artistShare.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">아티스트 몫</div>
              <div className="text-xs text-gray-500">
                {((artistShare / totalRevenue) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-bold text-green-600">
                ₩{backerShare.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">후원자 배분</div>
              <div className="text-xs text-gray-500">
                {((backerShare / totalRevenue) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Distribution Progress */}
          {status === 'distributed' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">후원자 배분 진행률</span>
                <span className="text-sm text-gray-600">
                  {Math.round(distributionProgress)}%
                </span>
              </div>
              <Progress value={distributionProgress} className="h-3" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>배분 완료: ₩{totalDistributed.toLocaleString()}</span>
                <span>남은 금액: ₩{(backerShare - totalDistributed).toLocaleString()}</span>
              </div>
            </div>
          )}

          {distributionDate && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>분배일: {distributionDate}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backer Distribution Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              후원자별 분배 내역
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBackerDetails(!showBackerDetails)}
                className="cursor-pointer"
              >
                {showBackerDetails ? '숨기기' : '상세보기'}
              </Button>
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Download className="w-4 h-4 mr-2" />
                내역서 다운로드
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{backers.length}</div>
              <div className="text-sm text-gray-600">총 후원자 수</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {backers.filter(b => b.status === 'paid').length}
              </div>
              <div className="text-sm text-gray-600">분배 완료</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {backers.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">분배 대기</div>
            </div>
          </div>

          {showBackerDetails && (
            <div className="space-y-3">
              <Separator />
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {backers.map((backer) => (
                  <div 
                    key={backer.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{backer.name}</span>
                        <Badge className={
                          backer.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }>
                          {backer.status === 'paid' ? '완료' : '대기'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        투자금: ₩{backer.investmentAmount.toLocaleString()} 
                        ({backer.sharePercentage.toFixed(2)}%)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ₩{backer.distributedAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">분배 예정액</div>
                    </div>
                    <div className="ml-4">
                      {backer.status === 'paid' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Actions */}
      {status === 'pending' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800">분배 대기 중</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  프로젝트 완료 후 수익이 확정되면 자동으로 분배가 시작됩니다.
                </p>
              </div>
            </div>
            <Button className="w-full cursor-pointer" disabled>
              <PieChart className="w-4 h-4 mr-2" />
              분배 시작 (자동 실행 예정)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Legal Notice */}
      <Card>
        <CardContent className="p-4">
          <div className="text-xs text-gray-500 space-y-2">
            <p>• 수익 분배는 프로젝트 완료 및 수익 확정 후 진행됩니다.</p>
            <p>• 분배 금액은 투자 비율에 따라 자동 계산되며, 관련 세금은 개별적으로 처리됩니다.</p>
            <p>• 분배 과정에서 문의사항이 있으시면 고객센터로 연락 바랍니다.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 사용 예시 데이터
export const mockRevenueData = {
  projectId: 1,
  totalRevenue: 5250000,
  platformFee: 157500, // 3%
  artistShare: 3667500, // 70%
  backerShare: 1425000, // 27%
  distributionDate: "2025-09-15",
  status: "distributed" as const,
  backers: [
    {
      id: 1,
      name: "김후원",
      investmentAmount: 100000,
      sharePercentage: 7.02,
      distributedAmount: 100000,
      status: "paid" as const
    },
    {
      id: 2,
      name: "이투자",
      investmentAmount: 150000,
      sharePercentage: 10.53,
      distributedAmount: 150000,
      status: "paid" as const
    },
    {
      id: 3,
      name: "박서포터",
      investmentAmount: 50000,
      sharePercentage: 3.51,
      distributedAmount: 50000,
      status: "pending" as const
    }
  ]
};