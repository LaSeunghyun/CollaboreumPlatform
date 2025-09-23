import * as React from 'react';
import { cn } from './utils';

interface SegmentedTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'segmented' | 'underline';
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  value,
  onValueChange,
  options,
  className,
  size = 'md',
  variant = 'segmented',
}) => {
  const sizeClasses = {
    sm: 'h-8 text-sm px-3', // --h-sm: 32px
    md: 'h-10 text-sm px-4', // --h-md: 40px
    lg: 'h-12 text-base px-6',
  };

  if (variant === 'underline') {
    return (
      <div
        role='tablist'
        className={cn('border-border/20 flex border-b', className)}
        aria-label='탭 목록'
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            role='tab'
            aria-selected={value === option.value}
            aria-controls={`tabpanel-${option.value}`}
            disabled={option.disabled}
            onClick={() => !option.disabled && onValueChange(option.value)}
            className={cn(
              'relative flex items-center justify-center font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              sizeClasses[size],
              value === option.value
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:border-b-2 hover:border-border hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      role='tablist'
      className={cn(
        'inline-flex items-center rounded-lg bg-muted p-1 shadow-inner',
        'border-0', // borderless
        className,
      )}
      aria-label='탭 목록'
    >
      {options.map((option, index) => (
        <React.Fragment key={option.value}>
          <button
            role='tab'
            aria-selected={value === option.value}
            aria-controls={`tabpanel-${option.value}`}
            disabled={option.disabled}
            onClick={() => !option.disabled && onValueChange(option.value)}
            className={cn(
              'relative flex items-center justify-center font-medium transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'rounded-md', // 개별 탭의 radius
              sizeClasses[size],
              value === option.value
                ? 'bg-background text-foreground shadow-sm' // 활성 탭은 살짝 떠 보이도록
                : 'hover:bg-background/50 text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>

          {/* 구분선 - 헤어라인 그라데이션 */}
          {index < options.length - 1 && (
            <div
              className='via-border/40 h-6 w-px bg-gradient-to-b from-transparent to-transparent'
              aria-hidden='true'
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
