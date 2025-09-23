export interface ExpenseRecord {
  id: string;
  category: '인건비' | '재료비' | '장비비' | '마케팅비' | '기타';
  title: string;
  description: string;
  amount: number;
  receipt: string | null;
  date: string;
  stage: string | null;
  verified: boolean;
}

export interface ExecutionStage {
  id: string;
  name: string;
  budget: number;
}

export interface ExpenseCategoryOption {
  id: string;
  label: string;
  icon: string;
  value: ExpenseRecord['category'];
}

export interface ExpenseRecordsProps {
  expenseRecords: ExpenseRecord[];
  executionPlan: {
    stages: ExecutionStage[];
    totalBudget: number;
  };
  projectStatus: string;
  isArtist: boolean;
  projectId: string;
  onUpdate: () => void;
}
