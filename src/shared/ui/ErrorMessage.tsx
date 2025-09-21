import * as React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className='flex flex-col items-center justify-center py-12 text-center'>
      <AlertCircle className='mb-4 h-12 w-12 text-red-500' />
      <h3 className='mb-2 text-lg font-semibold text-gray-900'>
        오류가 발생했습니다
      </h3>
      <p className='mb-4 max-w-sm text-gray-500'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600'
        >
          페이지 새로고침
        </button>
      )}
    </div>
  );
}
