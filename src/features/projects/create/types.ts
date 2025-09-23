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
  startDate: string; // 시작 예정일 (YYYY-MM-DD 형식)
}
