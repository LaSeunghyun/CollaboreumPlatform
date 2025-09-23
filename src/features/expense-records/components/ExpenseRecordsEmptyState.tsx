import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

interface ExpenseRecordsEmptyStateProps {
  canEdit: boolean;
}

export const ExpenseRecordsEmptyState: React.FC<ExpenseRecordsEmptyStateProps> = ({
  canEdit,
}) => (
  <Card>
    <CardContent className='p-8 text-center text-gray-500'>
      <Receipt className='mx-auto mb-4 h-12 w-12 opacity-50' />
      <p>아직 비용 내역이 없습니다.</p>
      {canEdit && (
        <p className='mt-2 text-sm'>
          비용 내역 추가 버튼을 클릭하여 첫 번째 비용을 등록하세요.
        </p>
      )}
    </CardContent>
  </Card>
);
