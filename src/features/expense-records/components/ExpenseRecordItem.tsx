import React from 'react';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Edit3, Eye, Receipt } from 'lucide-react';
import { ExpenseRecord, ExecutionStage } from '../types';

interface ExpenseRecordItemProps {
  expense: ExpenseRecord;
  stages: ExecutionStage[];
  canEdit: boolean;
  isEditingDisabled: boolean;
  onEdit: (expense: ExpenseRecord) => void;
}

export const ExpenseRecordItem: React.FC<ExpenseRecordItemProps> = ({
  expense,
  stages,
  canEdit,
  isEditingDisabled,
  onEdit,
}) => {
  const stageName = expense.stage
    ? stages.find(stage => stage.id === expense.stage)?.name
    : null;

  return (
    <Card className='transition-shadow hover:shadow-md'>
      <CardContent className='p-6'>
        <div className='mb-4 flex items-start justify-between'>
          <div className='flex-1'>
            <div className='mb-2 flex items-center gap-3'>
              <Badge className='bg-blue-100 text-blue-800'>
                {expense.category}
              </Badge>
              {stageName && <Badge variant='outline'>{stageName}</Badge>}
              {expense.verified && (
                <Badge className='bg-green-100 text-green-800'>검증완료</Badge>
              )}
            </div>
            <h4 className='mb-2 text-lg font-medium'>{expense.title}</h4>
            <p className='mb-3 text-gray-600'>{expense.description}</p>

            <div className='grid grid-cols-1 gap-4 text-sm md:grid-cols-3'>
              <div>
                <span className='text-gray-500'>금액:</span>
                <span className='ml-2 font-medium'>
                  ₩{expense.amount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className='text-gray-500'>사용일:</span>
                <span className='ml-2 font-medium'>
                  {new Date(expense.date).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className='text-gray-500'>영수증:</span>
                <span className='ml-2 font-medium'>
                  {expense.receipt ? '있음' : '없음'}
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onEdit(expense)}
              disabled={isEditingDisabled}
            >
              <Edit3 className='h-4 w-4' />
            </Button>
          )}
        </div>

        {expense.receipt && (
          <div className='border-t pt-4'>
            <div className='mb-2 flex items-center gap-2'>
              <Receipt className='h-4 w-4 text-gray-500' />
              <span className='text-sm font-medium'>영수증</span>
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => window.open(expense.receipt!, '_blank')}
              >
                <Eye className='mr-2 h-4 w-4' />
                보기
              </Button>
              <Button variant='outline' size='sm'>
                <Download className='mr-2 h-4 w-4' />
                다운로드
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
