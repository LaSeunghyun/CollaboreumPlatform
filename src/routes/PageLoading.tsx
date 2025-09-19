import React from 'react';

export const PageLoading: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
      <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
    </div>
  </div>
);
