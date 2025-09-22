import React from 'react';
import { StatCard } from '@/components/ui/StatCard';
import type { HomeStatItem } from '../types';

interface HomeStatsSectionProps {
  stats: HomeStatItem[];
}

export const HomeStatsSection: React.FC<HomeStatsSectionProps> = ({
  stats,
}) => {
  if (stats.length === 0) {
    return null;
  }

  return (
    <div className='mx-auto grid max-w-5xl grid-cols-2 gap-4 pt-8 md:pt-12 lg:grid-cols-4 lg:gap-8'>
      {stats.map(stat => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
};
