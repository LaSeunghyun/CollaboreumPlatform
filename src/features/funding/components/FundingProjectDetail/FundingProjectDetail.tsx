import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { fundingAPI } from '@/api/modules/funding';
import { useRetry } from '@/hooks/useRetry';
import { ProjectHeader } from './ProjectHeader';
import { ProjectTabs } from './ProjectTabs';
import { PaymentModal } from '@/features/funding/components/PaymentModal';
import { FundingProject } from '@/types/fundingProject';

export const FundingProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<FundingProject | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data, isLoading, error, retry, retryCount } =
    useRetry<FundingProject | null>(() =>
      id
        ? (fundingAPI.getProject(id) as Promise<FundingProject | null>)
        : Promise.resolve(null),
    );

  useEffect(() => {
    if (data) {
      setProject(data);
    }
  }, [data]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleLike = () => {
    // 좋아요 기능 구현
    console.log('좋아요 클릭');
  };

  const handleShare = () => {
    // 공유 기능 구현
    console.log('공유 클릭');
  };

  const handleSupport = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // 프로젝트 데이터 새로고침
    retry();
  };

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='mt-4 text-gray-600'>프로젝트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 text-6xl text-red-500'>⚠️</div>
          <h2 className='mb-2 text-2xl font-bold text-gray-900'>
            프로젝트를 불러올 수 없습니다
          </h2>
          <p className='mb-6 text-gray-600'>
            {typeof error === 'string'
              ? error
              : '알 수 없는 오류가 발생했습니다.'}
          </p>
          <div className='space-y-2'>
            <button
              onClick={retry}
              disabled={retryCount >= 3}
              className='rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
            >
              다시 시도 ({retryCount}/3)
            </button>
            <button
              onClick={handleBack}
              className='mx-auto block px-6 py-2 text-gray-600 hover:text-gray-800'
            >
              뒤로가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mb-4 text-6xl text-gray-400'>📄</div>
          <h2 className='mb-2 text-2xl font-bold text-gray-900'>
            프로젝트를 찾을 수 없습니다
          </h2>
          <p className='mb-6 text-gray-600'>
            요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
          </p>
          <button
            onClick={handleBack}
            className='rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700'
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <ProjectHeader
          project={project}
          onBack={handleBack}
          onLike={handleLike}
          onShare={handleShare}
          onSupport={handleSupport}
        />

        <div className='mt-8'>
          <ProjectTabs project={project} />
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal
          project={project}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
