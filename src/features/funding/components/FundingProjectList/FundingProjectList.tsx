import React from 'react';
import { useFundingProjects } from '../../hooks/useFundingProjects';
import { ProjectFilters } from './ProjectFilters';
import { ProjectGrid } from './ProjectGrid';
import { ProjectPagination } from './ProjectPagination';
import { FundingFilters } from '../../types/funding.types';

interface FundingProjectListProps {
  onProjectClick?: (projectId: number) => void;
  initialFilters?: FundingFilters;
}

export const FundingProjectList: React.FC<FundingProjectListProps> = ({
  onProjectClick,
  initialFilters,
}) => {
  const [filters, setFilters] = React.useState<FundingFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = React.useState(1);
  
  const { data: projects, isLoading, error } = useFundingProjects({
    ...filters,
    page: currentPage,
  });

  const handleFilterChange = (newFilters: Partial<FundingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 페이지 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          프로젝트를 불러오는 중 오류가 발생했습니다.
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectFilters 
        filters={filters}
        onFiltersChange={handleFilterChange}
      />
      
      <ProjectGrid 
        projects={projects || []}
        isLoading={isLoading}
        onProjectClick={onProjectClick}
      />
      
      {projects && projects.length > 0 && (
        <ProjectPagination
          currentPage={currentPage}
          totalPages={Math.ceil(projects.length / 12)} // 페이지당 12개 아이템
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
