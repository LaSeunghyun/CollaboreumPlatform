import { useCallback, useEffect, useMemo, useState } from 'react';
import { dynamicConstantsService } from '@/api/services/constantsService';
import { fundingAPI } from '@/api/modules/funding';
import {
  ExpenseCategoryOption,
  ExpenseRecord,
  ExpenseRecordsProps,
} from '../types';

const FALLBACK_CATEGORIES: ExpenseCategoryOption[] = [
  { id: 'labor', label: '인건비', icon: '👥', value: '인건비' },
  { id: 'material', label: '재료비', icon: '🧱', value: '재료비' },
  { id: 'equipment', label: '장비비', icon: '⚙️', value: '장비비' },
  { id: 'marketing', label: '마케팅비', icon: '📢', value: '마케팅비' },
  { id: 'other', label: '기타', icon: '📋', value: '기타' },
];

const KNOWN_CATEGORY_LABELS = new Set(
  FALLBACK_CATEGORIES.map(category => category.value),
);

const normalizeCategory = (
  category: { id: string; label: string; icon: string },
): ExpenseCategoryOption => {
  const label = category.label as ExpenseRecord['category'];
  const value = KNOWN_CATEGORY_LABELS.has(label) ? label : '기타';

  return {
    id: category.id,
    label: category.label,
    icon: category.icon,
    value,
  };
};

interface UseExpenseRecordsOptions extends ExpenseRecordsProps {}

export const useExpenseRecords = ({
  expenseRecords,
  executionPlan,
  projectStatus,
  isArtist,
  projectId,
  onUpdate,
}: UseExpenseRecordsOptions) => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(
    expenseRecords || [],
  );
  const [isAdding, setIsAdding] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expenseCategories, setExpenseCategories] = useState<
    ExpenseCategoryOption[]
  >(FALLBACK_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<
    ExpenseRecord['category'] | '전체'
  >('전체');
  const [selectedStage, setSelectedStage] = useState<string | '전체'>(
    '전체',
  );

  useEffect(() => {
    setExpenses(expenseRecords || []);
  }, [expenseRecords]);

  useEffect(() => {
    const fetchExpenseCategories = async () => {
      try {
        const categories = await dynamicConstantsService.getExpenseCategories();
        if (Array.isArray(categories) && categories.length > 0) {
          setExpenseCategories(categories.map(normalizeCategory));
          return;
        }
      } catch (fetchError) {
        console.error('비용 카테고리를 가져오는 중 오류 발생:', fetchError);
      }

      setExpenseCategories(FALLBACK_CATEGORIES);
    };

    fetchExpenseCategories();
  }, []);

  const canEdit = useMemo(
    () => isArtist && projectStatus === '집행중',
    [isArtist, projectStatus],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, expense) => sum + expense.amount, 0),
    [expenses],
  );

  const remainingBudget = useMemo(
    () => executionPlan.totalBudget - totalExpenses,
    [executionPlan.totalBudget, totalExpenses],
  );

  const categoryStats = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<ExpenseRecord['category'], number>);
  }, [expenses]);

  const stageStats = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      if (expense.stage) {
        acc[expense.stage] = (acc[expense.stage] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const categoryMatch =
        selectedCategory === '전체' || expense.category === selectedCategory;
      const stageMatch =
        selectedStage === '전체' || expense.stage === selectedStage;
      return categoryMatch && stageMatch;
    });
  }, [expenses, selectedCategory, selectedStage]);

  const handleAddExpense = useCallback(() => {
    const newExpense: ExpenseRecord = {
      id: `expense_${Date.now()}`,
      category: '기타',
      title: '',
      description: '',
      amount: 0,
      receipt: null,
      date: new Date().toISOString().split('T')[0] || '',
      stage: null,
      verified: false,
    };

    setEditingExpense(newExpense);
    setIsAdding(true);
    setError(null);
  }, []);

  const handleEditExpense = useCallback((expense: ExpenseRecord) => {
    setEditingExpense({ ...expense });
    setIsAdding(true);
    setError(null);
  }, []);

  const updateEditingExpense = useCallback(
    (updates: Partial<ExpenseRecord>) => {
      setEditingExpense(prev => (prev ? { ...prev, ...updates } : prev));
    },
    [],
  );

  const handleReceiptUpload = useCallback(
    (file: File | null | undefined) => {
      if (!file || !editingExpense) return;

      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string | undefined;
        if (!result) return;

        setEditingExpense(prev =>
          prev
            ? {
                ...prev,
                receipt: result,
              }
            : prev,
        );
      };
      reader.readAsDataURL(file);
    },
    [editingExpense],
  );

  const handleCancelEdit = useCallback(() => {
    setIsAdding(false);
    setEditingExpense(null);
    setError(null);
  }, []);

  const handleSaveExpense = useCallback(async () => {
    if (!editingExpense) return;

    if (
      !editingExpense.title ||
      !editingExpense.description ||
      editingExpense.amount <= 0
    ) {
      setError('모든 필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const isNewExpense = editingExpense.id.startsWith('expense_');
      const expensePayload = {
        category: editingExpense.category,
        title: editingExpense.title,
        description: editingExpense.description,
        amount: editingExpense.amount,
        receipt: editingExpense.receipt,
        date: editingExpense.date,
        stageId: editingExpense.stage,
      };

      const response = await fundingAPI.addExpense(projectId, expensePayload);

      if (
        response &&
        typeof response === 'object' &&
        'success' in response &&
        response.success
      ) {
        setExpenses(prev => {
          const nextExpense: ExpenseRecord = isNewExpense
            ? { ...editingExpense, id: `expense_${Date.now()}` }
            : editingExpense;

          if (isNewExpense) {
            return [...prev, nextExpense];
          }

          return prev.map(expense =>
            expense.id === nextExpense.id ? nextExpense : expense,
          );
        });
        setIsAdding(false);
        setEditingExpense(null);
        onUpdate();
        return;
      }

      const errorMessage =
        response &&
        typeof response === 'object' &&
        'message' in response
          ? String(response.message)
          : '비용 내역 저장에 실패했습니다.';

      setError(errorMessage);
    } catch (saveError) {
      console.error('비용 내역 저장 오류:', saveError);
      setError('비용 내역 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }, [editingExpense, onUpdate, projectId]);

  return {
    expenses,
    isAdding,
    editingExpense,
    isSubmitting,
    error,
    canEdit,
    totalExpenses,
    remainingBudget,
    categoryStats,
    stageStats,
    filteredExpenses,
    expenseCategories,
    selectedCategory,
    selectedStage,
    setSelectedCategory,
    setSelectedStage,
    handleAddExpense,
    handleEditExpense,
    handleCancelEdit,
    handleSaveExpense,
    updateEditingExpense,
    handleReceiptUpload,
  };
};
