import React from 'react';

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const ErrorState: React.FC = () => {
  return (
    <div className='py-8 text-center'>
      <div className='mb-2 text-red-600'>
        <svg
          className='mx-auto h-12 w-12'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
          />
        </svg>
      </div>
      <h3 className='mb-2 text-lg font-medium text-gray-900'>
        오류가 발생했습니다
      </h3>
      <p className='text-gray-600'>이 컴포넌트는 현재 개발 중입니다.</p>
    </div>
  );
};

export default ErrorState;
