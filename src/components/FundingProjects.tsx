import { FundingProjectList } from '@/features/funding/components/FundingProjectList/FundingProjectList';

export interface FundingProjectsProps {
  onViewProject?: (projectId: string) => void;
}

export function FundingProjects({ onViewProject }: FundingProjectsProps) {
  return <FundingProjectList onProjectClick={onViewProject} />;
}

export default FundingProjects;
