import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/card';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { Eye, Save, X } from 'lucide-react';
import {
  ExpenseCategoryOption,
  ExpenseRecord,
  ExecutionStage,
} from '../types';

interface ExpenseRecordFormProps {
  expense: ExpenseRecord;
  stages: ExecutionStage[];
  categories: ExpenseCategoryOption[];
  error: string | null;
  isSubmitting: boolean;
  onChange: (updates: Partial<ExpenseRecord>) => void;
  onCancel: () => void;
  onSave: () => void;
  onReceiptUpload: (file: File | null | undefined) => void;
}

export const ExpenseRecordForm: React.FC<ExpenseRecordFormProps> = ({
  expense,
  stages,
  categories,
  error,
  isSubmitting,
  onChange,
  onCancel,
  onSave,
  onReceiptUpload,
}) => {
  return (
    <Card className='border-2 border-blue-200'>
      <CardHeader>
        <CardTitle className='text-lg'>
          {expense.id.startsWith('expense_') ? '새 비용 내역 추가' : '비용 내역 수정'}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='expenseCategory' className='text-sm font-medium'>
              카테고리 *
            </Label>
            <Select
              value={expense.category}
              onValueChange={value =>
                onChange({ category: value as ExpenseRecord['category'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor='expenseAmount' className='text-sm font-medium'>
              금액 (원) *
            </Label>
            <Input
              id='expenseAmount'
              type='number'
              value={expense.amount || ''}
              onChange={event =>
                onChange({ amount: parseInt(event.target.value, 10) || 0 })
              }
              placeholder='100000'
              min='0'
            />
          </div>
        </div>

        <div>
          <Label htmlFor='expenseTitle' className='text-sm font-medium'>
            제목 *
          </Label>
          <Input
            id='expenseTitle'
            value={expense.title}
            onChange={event => onChange({ title: event.target.value })}
            placeholder='예: 디자인 작업비'
          />
        </div>

        <div>
          <Label htmlFor='expenseDescription' className='text-sm font-medium'>
            상세 설명 *
          </Label>
          <Textarea
            id='expenseDescription'
            value={expense.description}
            onChange={event => onChange({ description: event.target.value })}
            placeholder='비용 사용 내역을 상세히 설명하세요'
            rows={3}
          />
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <Label htmlFor='expenseDate' className='text-sm font-medium'>
              사용일 *
            </Label>
            <Input
              id='expenseDate'
              type='date'
              value={expense.date}
              onChange={event => onChange({ date: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor='expenseStage' className='text-sm font-medium'>
              관련 단계
            </Label>
            <Select
              value={expense.stage || ''}
              onValueChange={value =>
                onChange({ stage: value === '' ? null : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder='선택사항' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>선택하지 않음</SelectItem>
                {stages.map(stage => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor='expenseReceipt' className='text-sm font-medium'>
            영수증 업로드
          </Label>
          <div className='flex items-center gap-3'>
            <Input
              id='expenseReceipt'
              type='file'
              accept='image/*,.pdf'
              onChange={event => onReceiptUpload(event.target.files?.[0])}
              className='flex-1'
            />
            {expense.receipt && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open(expense.receipt!, '_blank')}
              >
                <Eye className='mr-2 h-4 w-4' />
                보기
              </Button>
            )}
          </div>
          <p className='mt-1 text-xs text-gray-500'>
            영수증, 인보이스, 계약서 등을 업로드하여 투명성을 높이세요
          </p>
        </div>

        {error && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
            <div className='flex items-center gap-2 text-red-800'>
              <span className='text-sm'>{error}</span>
            </div>
          </div>
        )}

        <div className='flex justify-end gap-3'>
          <Button variant='outline' onClick={onCancel}>
            <X className='mr-2 h-4 w-4' />
            취소
          </Button>
          <Button onClick={onSave} disabled={isSubmitting}>
            <Save className='mr-2 h-4 w-4' />
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
