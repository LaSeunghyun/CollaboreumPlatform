import React from 'react';
import { Heart, Calendar, Users, Target } from 'lucide-react';
import { FundingProject } from '../../types/funding.types';
import { Card, Badge, Button, Progress, Avatar, OptimizedImage } from '@/shared/ui';

interface ProjectGridProps {
  projects: FundingProject[];
  isLoading: boolean;
  onProjectClick?: (projectId: number) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  isLoading,
  onProjectClick,
}) => {
  if (isLoading) {
    return <ProjectGridSkeleton />;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          조건에 맞는 프로젝트가 없습니다.
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          새로고침
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick?.(project.id)}
        />
      ))}
    </div>
  );
};

interface ProjectCardProps {
  project: FundingProject;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const progressPercentage = Math.min(
    (project.currentAmount / project.targetAmount) * 100,
    100
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행중';
      case 'completed':
        return '완료';
      case 'cancelled':
        return '취소';
      default:
        return '대기중';
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* 프로젝트 이미지 */}
        <div className="relative">
          <OptimizedImage
            src={project.thumbnail}
            alt={project.title}
            width={300}
            height={200}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <div className="absolute top-2 left-2">
            <Badge className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                // 좋아요 기능 구현
              }}
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 프로젝트 정보 */}
        <div className="p-4 space-y-3">
          {/* 제목과 아티스트 */}
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 mb-1">
              {project.title}
            </h3>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://via.placeholder.com/24?text=${project.artist.charAt(0)}`} />
                <AvatarFallback>{project.artist.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{project.artist}</span>
            </div>
          </div>

          {/* 카테고리 */}
          <div>
            <Badge variant="outline" className="text-xs">
              {project.category}
            </Badge>
          </div>

          {/* 진행률 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">진행률</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* 금액 정보 */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">모인 금액</span>
              <span className="font-semibold text-lg">
                {formatAmount(project.currentAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>목표 금액</span>
              <span>{formatAmount(project.targetAmount)}</span>
            </div>
          </div>

          {/* 통계 정보 */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{project.backers}명</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{project.daysLeft}일 남음</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProjectGridSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="animate-pulse">
          <CardContent className="p-0">
            <div className="w-full h-48 bg-gray-200 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-2 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
