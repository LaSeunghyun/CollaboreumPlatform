import React from 'react';

export const NotFoundRoute: React.FC = () => (
  <div className="text-center py-12">
    <h1 className="text-4xl font-bold mb-4">404</h1>
    <p className="text-muted-foreground mb-6">페이지를 찾을 수 없습니다.</p>
    <a href="/" className="text-indigo hover:underline">
      홈으로 돌아가기
    </a>
  </div>
);
