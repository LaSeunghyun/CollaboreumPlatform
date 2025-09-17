import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fundingAPI } from '../../services/api';
import { useRetry } from '../../hooks/useRetry';
import { ProjectHeader } from './ProjectHeader';
import { ProjectTabs } from './ProjectTabs';
import { PaymentModal } from '../PaymentModal';
import { FundingProject } from '../../types/fundingProject';

export const FundingProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState<FundingProject | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const {
        data,
        isLoading,
        error,
        retry,
        retryCount
    } = useRetry<FundingProject | null>(
        () => id ? fundingAPI.getProject(id) as Promise<FundingProject | null> : Promise.resolve(null)
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">프로젝트를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        프로젝트를 불러올 수 없습니다
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {typeof error === 'string' ? error : '알 수 없는 오류가 발생했습니다.'}
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={retry}
                            disabled={retryCount >= 3}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            다시 시도 ({retryCount}/3)
                        </button>
                        <button
                            onClick={handleBack}
                            className="block mx-auto px-6 py-2 text-gray-600 hover:text-gray-800"
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        프로젝트를 찾을 수 없습니다
                    </h2>
                    <p className="text-gray-600 mb-6">
                        요청하신 프로젝트가 존재하지 않거나 삭제되었습니다.
                    </p>
                    <button
                        onClick={handleBack}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        뒤로가기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <ProjectHeader
                    project={project}
                    onBack={handleBack}
                    onLike={handleLike}
                    onShare={handleShare}
                    onSupport={handleSupport}
                />

                <div className="mt-8">
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
