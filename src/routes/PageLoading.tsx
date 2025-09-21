import React from 'react';

export const PageLoading: React.FC = () => (
  <div className='flex min-h-screen items-center justify-center'>
    <div className='text-center'>
      <div className='border-indigo-600 mx-auto h-12 w-12 animate-spin rounded-full border-b-2' />
      <p className='mt-4 text-gray-600'>페이지를 불러오는 중...</p>
    </div>
  </div>
);
