import React from "react";

// 임시 스텁 컴포넌트 - 타입 안전성을 위해 최소한의 구현
const ProjectCardActions: React.FC = () => {
    return (
        <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                액션 1
            </button>
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                액션 2
            </button>
        </div>
    );
};

export default ProjectCardActions;