import React from 'react';

export const NotFoundRoute: React.FC = () => (
  <div className='py-12 text-center'>
    <h1 className='mb-4 text-4xl font-bold'>404</h1>
    <p className='mb-6 text-muted-foreground'>페이지를 찾을 수 없습니다.</p>
    <a href='/' className='text-indigo hover:underline'>
      홈으로 돌아가기
    </a>
  </div>
);
