import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';

interface ExpenseRecordsOverviewProps {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
}

export const ExpenseRecordsOverview: React.FC<ExpenseRecordsOverviewProps> = ({
  totalBudget,
  totalExpenses,
  remainingBudget,
}) => {
  const budgetUsage = totalBudget > 0 ? totalExpenses / totalBudget : 0;
  const usagePercent = Math.min(100, Math.max(0, budgetUsage * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle>예산 현황</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='mb-4 grid grid-cols-1 gap-6 md:grid-cols-3'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              ₩{totalBudget.toLocaleString()}
            </div>
            <div className='text-sm text-gray-500'>총 예산</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>
              ₩{totalExpenses.toLocaleString()}
            </div>
            <div className='text-sm text-gray-500'>사용된 금액</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              ₩{remainingBudget.toLocaleString()}
            </div>
            <div className='text-sm text-gray-500'>남은 예산</div>
          </div>
        </div>
        <div className='h-3 w-full rounded-full bg-gray-200'>
          <div
            className='h-3 rounded-full bg-blue-500 transition-all duration-300'
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
