import React, { useEffect } from 'react';
import { useProjectStatus } from '@/hooks/useProjectStatus';
import { FundingProjectStatus } from '@/features/funding/types';

interface Project {
  id: string;
  startDate: string;
  endDate: string;
  status: FundingProjectStatus;
}

interface ProjectStatusManagerProps {
  projects: Project[];
  onStatusUpdate?: (updatedProjects: Project[]) => void;
  updateInterval?: number;
  children: React.ReactNode;
}

/**
 * 프로젝트 상태를 자동으로 관리하는 컴포넌트
 * 주기적으로 프로젝트 상태를 확인하고 업데이트합니다.
 */
export const ProjectStatusManager: React.FC<ProjectStatusManagerProps> = ({
  projects,
  onStatusUpdate,
  updateInterval = 60000, // 1분마다 업데이트
  children,
}) => {
  const { projects: updatedProjects, updateStatuses } = useProjectStatus(
    projects,
    updateInterval,
  );

  // 상태가 업데이트되면 부모 컴포넌트에 알림
  useEffect(() => {
    if (onStatusUpdate) {
      onStatusUpdate(updatedProjects);
    }
  }, [updatedProjects, onStatusUpdate]);

  // 수동으로 상태 업데이트하는 함수를 children에 전달
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        ...child.props,
        updateProjectStatuses: updateStatuses,
        projects: updatedProjects,
      });
    }
    return child;
  });

  return <>{childrenWithProps}</>;
};
