import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-indigo',
}) => {
  return (
    <div className='group'>
      <div className='glass-morphism border-border/30 hover:border-primary/20 hover:shadow-apple-lg rounded-3xl border p-6 transition-all duration-300 hover:scale-105 lg:p-8'>
        <div className='mb-3 text-2xl transition-transform duration-300 group-hover:scale-110'>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
        <div
          className={`mb-2 text-2xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary lg:text-4xl ${iconColor}`}
        >
          {value}
        </div>
        <div className='text-sm font-medium text-muted-foreground lg:text-base'>
          {label}
        </div>
      </div>
    </div>
  );
};
