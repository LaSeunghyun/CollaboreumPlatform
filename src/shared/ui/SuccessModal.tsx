import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './Dialog';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  message?: string;
}

export function SuccessModal({
  open,
  onOpenChange,
  title = '성공',
  message = '작업이 완료되었습니다.',
}: SuccessModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <CheckCircle className='h-5 w-5 text-green-500' />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className='py-4'>
          <p className='text-sm text-muted-foreground'>{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
