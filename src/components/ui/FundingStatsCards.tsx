import { Card, CardContent } from './card';
import { calculateFundingStats } from '../../utils/fundingUtils';
import { ArtistFundingHistory } from '../../types/funding';

interface FundingStatsCardsProps {
  filteredHistory: ArtistFundingHistory[];
}

export function FundingStatsCards({ filteredHistory }: FundingStatsCardsProps) {
  const stats = calculateFundingStats(filteredHistory);

  const statItems = [
    {
      label: '성공한 프로젝트',
      value: stats.success,
      color: 'text-green-600'
    },
    {
      label: '진행중인 프로젝트',
      value: stats.ongoing,
      color: 'text-blue-600'
    },
    {
      label: '실패한 프로젝트',
      value: stats.failed,
      color: 'text-red-600'
    },
    {
      label: '전체 프로젝트',
      value: stats.total,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${item.color} mb-1`}>
              {item.value}
            </div>
            <p className="text-sm text-gray-600">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
