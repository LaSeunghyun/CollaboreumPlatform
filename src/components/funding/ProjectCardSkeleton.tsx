import React from "react";

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const ProjectCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
    );
};

export default ProjectCardSkeleton;