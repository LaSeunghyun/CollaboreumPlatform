import { useEffect, useState } from 'react';
import { FundingProjectStatus } from '@/features/funding/types';
import { calculateProjectStatus } from '@/utils/projectStatusUtils';

interface Project {
  id: string;
  startDate: string;
  endDate: string;
  status: FundingProjectStatus;
}

/**
 * 프로젝트 상태를 자동으로 관리하는 훅
 * @param projects 프로젝트 목록
 * @param updateInterval 상태 업데이트 간격 (밀리초, 기본값: 60000 = 1분)
 * @returns 업데이트된 프로젝트 목록과 상태 정보
 */
export const useProjectStatus = (
  projects: Project[],
  updateInterval: number = 60000,
) => {
  const [updatedProjects, setUpdatedProjects] = useState<Project[]>(projects);

  useEffect(() => {
    // 초기 상태 업데이트
    const updateStatuses = () => {
      setUpdatedProjects(prevProjects =>
        prevProjects.map(project => ({
          ...project,
          status: calculateProjectStatus(project.startDate, project.endDate),
        })),
      );
    };

    // 즉시 실행
    updateStatuses();

    // 주기적으로 상태 업데이트
    const interval = setInterval(updateStatuses, updateInterval);

    return () => clearInterval(interval);
  }, [updateInterval]);

  // 프로젝트 목록이 변경되면 상태 업데이트
  useEffect(() => {
    setUpdatedProjects(projects);
  }, [projects]);

  return {
    projects: updatedProjects,
    updateStatuses: () => {
      setUpdatedProjects(prevProjects =>
        prevProjects.map(project => ({
          ...project,
          status: calculateProjectStatus(project.startDate, project.endDate),
        })),
      );
    },
  };
};
