import React from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FundingProject } from "../../types";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { 
    Heart, 
    Users, 
    Calendar, 
    Target,
    TrendingUp,
    Clock
} from "lucide-react";

interface ProjectGridProps {
  projects: FundingProject[];
  isLoading?: boolean;
  onProjectClick?: (projectId: string) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  isLoading = false,
  onProjectClick
}) => {
  const handleProjectClick = (project: FundingProject) => {
    if (onProjectClick) {
      onProjectClick(project.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting':
        return 'bg-primary-100 text-primary-700';
      case 'succeeded':
        return 'bg-success-100 text-success-700';
      case 'failed':
        return 'bg-danger-100 text-danger-700';
      case 'executing':
        return 'bg-warning-100 text-warning-700';
      case 'distributing':
        return 'bg-info-100 text-info-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collecting':
        return '모금 중';
      case 'succeeded':
        return '성공';
      case 'failed':
        return '실패';
      case 'executing':
        return '집행 중';
      case 'distributing':
        return '분배 중';
      case 'closed':
        return '종료';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">프로젝트가 없습니다</p>
          <p className="text-sm">새로운 펀딩 프로젝트를 확인해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card 
          key={project.id} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => handleProjectClick(project)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {project.shortDescription}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusText(project.status)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{project.backerCount}명</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDistanceToNow(new Date(project.endDate), { 
                    addSuffix: true, 
                    locale: ko 
                  })}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* 프로젝트 이미지 */}
              {project.images.length > 0 && (
                <div className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={project.images[0]}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {project.isFeatured && (
                    <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      추천
                    </div>
                  )}
                </div>
              )}

              {/* 진행률 바 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">진행률</span>
                  <span className="font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(project.progress, 100)}%` }}
                  />
                </div>
              </div>

              {/* 금액 정보 */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">모금액</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(project.currentAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">목표액</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(project.targetAmount)}
                  </span>
                </div>
              </div>

              {/* 태그 */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="text-xs text-gray-400">
                      +{project.tags.length - 3}개
                    </span>
                  )}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant="solid"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProjectClick(project);
                  }}
                >
                  {project.status === 'collecting' ? '후원하기' : '자세히 보기'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectGrid;