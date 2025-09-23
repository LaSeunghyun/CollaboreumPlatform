import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Plus } from 'lucide-react';
import { ExpenseRecordsProps } from '../types';
import { useExpenseRecords } from '../hooks/useExpenseRecords';
import { ExpenseRecordsOverview } from './ExpenseRecordsOverview';
import { ExpenseRecordsStats } from './ExpenseRecordsStats';
import { ExpenseRecordItem } from './ExpenseRecordItem';
import { ExpenseRecordsEmptyState } from './ExpenseRecordsEmptyState';
import { ExpenseRecordForm } from './ExpenseRecordForm';

export const ExpenseRecords: React.FC<ExpenseRecordsProps> = props => {
  const {
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
  } = useExpenseRecords(props);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold'>비용 사용 내역</h3>
          <p className='text-sm text-gray-600'>
            투명한 비용 공개를 통해 후원자들의 신뢰를 얻으세요
          </p>
        </div>
        {canEdit && (
          <Button onClick={handleAddExpense} disabled={isAdding}>
            <Plus className='mr-2 h-4 w-4' />비용 내역 추가
          </Button>
        )}
      </div>

      <ExpenseRecordsOverview
        totalBudget={props.executionPlan.totalBudget}
        totalExpenses={totalExpenses}
        remainingBudget={remainingBudget}
      />

      <ExpenseRecordsStats
        categoryStats={categoryStats}
        stageStats={stageStats}
        totalExpenses={totalExpenses}
        stages={props.executionPlan.stages}
        categories={expenseCategories}
        selectedCategory={selectedCategory}
        selectedStage={selectedStage}
        onCategoryChange={value =>
          setSelectedCategory(value as typeof selectedCategory)
        }
        onStageChange={value => setSelectedStage(value as typeof selectedStage)}
      />

      <div className='space-y-4'>
        {filteredExpenses.length === 0 ? (
          <ExpenseRecordsEmptyState canEdit={canEdit} />
        ) : (
          filteredExpenses.map(expense => (
            <ExpenseRecordItem
              key={expense.id}
              expense={expense}
              stages={props.executionPlan.stages}
              canEdit={canEdit}
              isEditingDisabled={isAdding}
              onEdit={handleEditExpense}
            />
          ))
        )}
      </div>

      {isAdding && editingExpense && (
        <ExpenseRecordForm
          expense={editingExpense}
          stages={props.executionPlan.stages}
          categories={expenseCategories}
          error={error}
          isSubmitting={isSubmitting}
          onChange={updateEditingExpense}
          onCancel={handleCancelEdit}
          onSave={handleSaveExpense}
          onReceiptUpload={handleReceiptUpload}
        />
      )}
    </div>
  );
};
