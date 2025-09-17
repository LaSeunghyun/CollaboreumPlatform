import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { CommunityPostForm } from './CommunityPostForm';
import { CommunityPostList } from './CommunityPostList';
import { CommunityPostDetail } from './CommunityPostDetail';
import { ArrowLeft, Plus } from 'lucide-react';

interface CommunityMainProps {
  onBack?: () => void;
}

export const CommunityMain: React.FC<CommunityMainProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  useEffect(() => {
    // 현재 페이지 정보를 세션 스토리지에 저장
    const currentPage = window.location.href;
    const previousPage = sessionStorage.getItem('currentPage');

    if (previousPage && previousPage !== currentPage) {
      sessionStorage.setItem('previousPage', previousPage);
    }

    sessionStorage.setItem('currentPage', currentPage);
  }, []);



  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
  };

  // 이전 페이지로 돌아가기
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // 더 확실한 뒤로가기 방법
      try {
        // 세션 스토리지에서 이전 페이지 정보 확인
        const previousPage = sessionStorage.getItem('previousPage');

        if (previousPage && previousPage !== window.location.href) {
          // 이전 페이지로 이동
          window.location.href = previousPage;
        } else if (window.history.length > 1) {
          // 브라우저 히스토리에서 이전 페이지로 이동
          window.history.back();
        } else {
          // 모두 실패하면 홈으로 이동
          window.location.href = '/';
        }
      } catch (error) {
        console.error('뒤로가기 실패:', error);
        // 에러 발생 시 홈으로 이동
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              뒤로가기
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
          </div>

          {!showForm && (
            <Button
              onClick={() => navigate('/community/create')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 글 작성
            </Button>
          )}
        </div>

        {/* 메인 컨텐츠 */}
        {selectedPostId ? (
          <CommunityPostDetail
            postId={selectedPostId}
            onBack={handleBackToList}
          />
        ) : showForm ? (
          <div className="mb-8">
            <CommunityPostForm
              onBack={handleCancelForm}
            />
          </div>
        ) : (
          <CommunityPostList
            onWritePost={() => navigate('/community/create')}
            onPostClick={handlePostClick}
          />
        )}
      </div>
    </div>
  );
};
