import React from 'react';

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const ProjectFilters: React.FC = () => {
  return (
    <div className='mb-6 rounded-lg bg-white p-4 shadow-sm'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900'>필터</h3>
      <div className='text-gray-600'>
        <p>이 컴포넌트는 현재 개발 중입니다.</p>
        <p>새로운 기능 모듈로 마이그레이션 예정입니다.</p>
      </div>
    </div>
  );
};

export default ProjectFilters;
