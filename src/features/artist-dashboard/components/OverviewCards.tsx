import { Card, CardContent } from '@/components/ui/card';
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react';
import { OverviewStat, OverviewStatKey } from '@/features/artist-dashboard/hooks/useArtistDashboard';

const iconMap: Record<OverviewStatKey, { bgClass: string; iconClass: string; Icon: typeof TrendingUp }> = {
  projects: { bgClass: 'bg-blue-100', iconClass: 'text-blue-600', Icon: TrendingUp },
  funding: { bgClass: 'bg-green-100', iconClass: 'text-green-600', Icon: DollarSign },
  followers: { bgClass: 'bg-purple-100', iconClass: 'text-purple-600', Icon: Users },
  growth: { bgClass: 'bg-yellow-100', iconClass: 'text-yellow-600', Icon: Calendar },
};

interface OverviewCardsProps {
  stats: OverviewStat[];
}

export const OverviewCards = ({ stats }: OverviewCardsProps) => {
  return (
    <div className='mb-8 grid gap-6 md:grid-cols-4'>
      {stats.map(stat => {
        const { bgClass, iconClass, Icon } = iconMap[stat.key];

        return (
          <Card key={stat.key}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-gray-600'>{stat.label}</p>
                  <p className='text-2xl font-bold'>{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${bgClass}`}>
                  <Icon className={`h-6 w-6 ${iconClass}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
