import React from 'react';

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className='animate-pulse rounded-lg bg-white p-4 shadow-sm'>
      <div className='mb-2 h-4 rounded bg-gray-200'></div>
      <div className='mb-2 h-3 rounded bg-gray-200'></div>
      <div className='h-3 w-2/3 rounded bg-gray-200'></div>
    </div>
  );
};

export default ProjectCardSkeleton;
