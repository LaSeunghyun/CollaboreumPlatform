import React from 'react';
import { Button, ButtonProps } from './Button';
import { cn } from '../lib/cn';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      loadingText,
      loadingIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Button
        ref={ref}
        disabled={isDisabled}
        className={cn(loading && 'cursor-not-allowed', className)}
        {...props}
      >
        {loading && (
          <span className='flex items-center gap-2'>
            {loadingIcon || <Loader2 className='h-4 w-4 animate-spin' />}
            {loadingText || '처리 중...'}
          </span>
        )}
        {!loading && children}
      </Button>
    );
  },
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
