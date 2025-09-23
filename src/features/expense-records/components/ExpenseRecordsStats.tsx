import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Label } from '@/shared/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { PieChart, TrendingUp } from 'lucide-react';
import { ExpenseCategoryOption, ExecutionStage } from '../types';

interface ExpenseRecordsStatsProps {
  categoryStats: Record<string, number>;
  stageStats: Record<string, number>;
  totalExpenses: number;
  stages: ExecutionStage[];
  categories: ExpenseCategoryOption[];
  selectedCategory: string | '전체';
  selectedStage: string | '전체';
  onCategoryChange: (value: string | '전체') => void;
  onStageChange: (value: string | '전체') => void;
}

export const ExpenseRecordsStats: React.FC<ExpenseRecordsStatsProps> = ({
  categoryStats,
  stageStats,
  totalExpenses,
  stages,
  categories,
  selectedCategory,
  selectedStage,
  onCategoryChange,
  onStageChange,
}) => {
  return (
    <>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChart className='h-5 w-5' />카테고리별 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {Object.entries(categoryStats).map(([category, amount]) => {
                const percentage =
                  totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

                return (
                  <div
                    key={category}
                    className='flex items-center justify-between'
                  >
                    <span className='text-sm font-medium'>{category}</span>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-24 rounded-full bg-gray-200'>
                        <div
                          className='h-2 rounded-full bg-blue-500'
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className='w-20 text-right text-sm font-medium'>
                        ₩{amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />단계별 비용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stages.map(stage => {
                const stageAmount = stageStats[stage.id] || 0;
                const percentage =
                  totalExpenses > 0 ? (stageAmount / totalExpenses) * 100 : 0;

                return (
                  <div key={stage.id} className='space-y-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{stage.name}</span>
                      <span className='text-sm text-gray-500'>
                        ₩{stageAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className='h-2 w-full rounded-full bg-gray-200'>
                      <div
                        className='h-2 rounded-full bg-emerald-500'
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex gap-4'>
        <div className='flex-1'>
          <Label htmlFor='categoryFilter' className='text-sm font-medium'>
            카테고리
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='전체'>전체</SelectItem>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.value}>
                  {category.icon} {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex-1'>
          <Label htmlFor='stageFilter' className='text-sm font-medium'>
            집행 단계
          </Label>
          <Select value={selectedStage} onValueChange={onStageChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='전체'>전체</SelectItem>
              {stages.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
};
