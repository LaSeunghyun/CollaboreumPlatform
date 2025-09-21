import * as React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      {icon && <div className='mb-4'>{icon}</div>}
      <h3 className='mb-2 text-lg font-semibold text-gray-900'>{title}</h3>
      {description && (
        <p className='mb-4 max-w-sm text-gray-500'>{description}</p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
