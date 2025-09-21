import { useState, useMemo } from 'react';
import {
  useFundingProjects,
  useBackFundingProject,
  useLikeFundingProject,
} from '@/lib/api/useFunding';
import { useCategories } from '@/lib/api/useCategories';
import { normalizeProjectData } from '@/utils/fundingUtils';
import { KOREAN_CATEGORIES } from '@/constants/categories';
import { FundingProject, PaymentData } from '@/types/funding';

export const useFundingProjectsData = () => {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('인기순');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProjectForPayment, setSelectedProjectForPayment] =
    useState<FundingProject | null>(null);

  const {
    data: projectsData,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useFundingProjects({
    category: selectedCategory !== '전체' ? selectedCategory : undefined,
    search: searchQuery || undefined,
    sortBy: sortBy,
    page: 1,
    limit: 20,
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories();
  const backProjectMutation = useBackFundingProject();
  const likeProjectMutation = useLikeFundingProject();

  const projects = useMemo(() => {
    if (!projectsData) return [];
    const data = projectsData as any;
    if (!data?.data?.projects) return [];
    return data.data.projects.map((project: any) =>
      normalizeProjectData(project),
    );
  }, [projectsData]);

  const categories = useMemo(() => {
    if (categoriesLoading) return ['전체'];
    if (Array.isArray(categoriesData)) return ['전체', ...categoriesData];
    if (
      (categoriesData as any)?.data &&
      Array.isArray((categoriesData as any).data)
    ) {
      const categoryLabels = (categoriesData as any).data.map(
        (cat: { label?: string; name?: string }) => cat.label || cat.name || '',
      );
      return [
        '전체',
        ...categoryLabels.filter((label: string) => label !== ''),
      ];
    }
    return KOREAN_CATEGORIES;
  }, [categoriesData, categoriesLoading]);

  const handleBackProject = (project: FundingProject) => {
    setSelectedProjectForPayment(project);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentData: PaymentData) => {
    if (!selectedProjectForPayment) return;
    try {
      const response = await backProjectMutation.mutateAsync({
        projectId: selectedProjectForPayment.id.toString(),
        amount: paymentData.amount,
        message: paymentData.message || '',
        rewardId: paymentData.rewardId,
      });
      if (response.success) {
        setShowPaymentModal(false);
        setSelectedProjectForPayment(null);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleViewProject = (project: FundingProject) => {
    try {
      const popup = window.open(
        '',
        '_blank',
        'width=600,height=400,scrollbars=yes,resizable=yes',
      );
      if (popup) {
        popup.document.write(`
                    <html>
                        <head>
                            <title>${project.title} - 상세 정보</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                                .info { margin: 10px 0; }
                                .close-btn { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
                            </style>
                        </head>
                        <body>
                            <div class="header">
                                <h1>${project.title}</h1>
                                <p><strong>아티스트:</strong> ${project.artist || '정보 없음'}</p>
                            </div>
                            <div class="info">
                                <p><strong>설명:</strong> ${project.description || '설명 없음'}</p>
                                <p><strong>목표 금액:</strong> ₩${(project.targetAmount || 0).toLocaleString()}</p>
                                <p><strong>현재 금액:</strong> ₩${(project.currentAmount || 0).toLocaleString()}</p>
                                <p><strong>후원자 수:</strong> ${project.backers || 0}명</p>
                            </div>
                            <button class="close-btn" onclick="window.close()">닫기</button>
                        </body>
                    </html>
                `);
        popup.document.close();
      }
    } catch (error) {
      console.error('Failed to open project details:', error);
    }
  };

  const handleLikeProject = async (project: FundingProject) => {
    try {
      await likeProjectMutation.mutateAsync({
        projectId: project.id.toString(),
      });
    } catch (error) {
      console.error('Failed to like project:', error);
    }
  };

  const handleRetry = () => refetchProjects();

  return {
    projects,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showPaymentModal,
    setShowPaymentModal,
    selectedProjectForPayment,
    setSelectedProjectForPayment,
    projectsLoading,
    projectsError,
    handleBackProject,
    handlePaymentSuccess,
    handleViewProject,
    handleLikeProject,
    handleRetry,
  };
};
