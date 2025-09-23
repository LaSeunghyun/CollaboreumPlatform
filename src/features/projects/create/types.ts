export type FundingMode = 'all-or-nothing' | 'flexible';

export interface CreateProjectFormState {
  title: string;
  description: string;
  category: string;
  goal: string;
  duration: string;
  revenueShare: string;
  tags: string;
  image: File | null;
  fundingMode: FundingMode;
  secretPerks: string;
}

export interface ProjectCategoryOption {
  id: string;
  value: string;
  label: string;
}
