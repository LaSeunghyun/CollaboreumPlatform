import { Card, CardContent } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function MetricsCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  className = '',
}: MetricsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          valueColor: 'text-green-600',
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          valueColor: 'text-yellow-600',
        };
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          valueColor: 'text-red-600',
        };
      default:
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          valueColor: 'text-blue-600',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Card className={className}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='mb-1 text-sm text-gray-600'>{title}</p>
            <p className={`text-2xl font-bold ${styles.valueColor}`}>{value}</p>
            {trend && (
              <div className='mt-1 flex items-center'>
                <span
                  className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className='ml-1 text-xs text-gray-500'>vs 이전 기간</span>
              </div>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${styles.iconBg}`}
          >
            <Icon className={`h-6 w-6 ${styles.iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
