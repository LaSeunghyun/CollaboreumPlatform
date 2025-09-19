import React from "react";

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const OverviewTab: React.FC = () => {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">개요</h2>
      <div className="text-gray-600">
        <p>이 탭은 현재 개발 중입니다.</p>
        <p>새로운 기능 모듈로 마이그레이션 예정입니다.</p>
      </div>
    </div>
  );
};

export default OverviewTab;