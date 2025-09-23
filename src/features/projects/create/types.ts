import type { ProjectCategory, ProjectCategoryKey } from '@/types/constants';

export type FundingMode = 'all-or-nothing' | 'flexible';

export interface CreateProjectFormState {
  title: string;
  description: string;
  category: ProjectCategoryKey | '';
  goal: string;
  duration: string;
  revenueShare: string;
  tags: string;
  image: File | null;
  fundingMode: FundingMode;
  secretPerks: string;
}

export interface ProjectCategoryOption {
  id: ProjectCategoryKey;
  value: ProjectCategoryKey;
  label: ProjectCategory;
}
