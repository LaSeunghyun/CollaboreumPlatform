import React from 'react';

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const ProjectCardInfo: React.FC = () => {
  return (
    <div className='space-y-2'>
      <div className='text-sm text-gray-600'>
        <span className='font-medium'>프로젝트 정보:</span>
        <p>이 컴포넌트는 현재 개발 중입니다.</p>
      </div>
    </div>
  );
};

export default ProjectCardInfo;
