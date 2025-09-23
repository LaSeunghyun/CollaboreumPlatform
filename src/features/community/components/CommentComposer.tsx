import { FC, FormEvent, ChangeEvent } from 'react';

import { Button } from '@/shared/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Input } from '@/shared/ui/shadcn/input';

import { getFirstChar } from '@/utils/typeGuards';

interface CommentComposerProps {
  user: {
    name: string;
    avatar?: string;
  };
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  maxLength?: number;
}

export const CommentComposer: FC<CommentComposerProps> = ({
  user,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  maxLength = 1000,
}) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <form onSubmit={onSubmit} className='mb-6'>
      <div className='flex gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{getFirstChar(user.name)}</AvatarFallback>
        </Avatar>
        <div className='flex-1'>
          <Input
            value={value}
            onChange={handleChange}
            placeholder='댓글을 입력하세요...'
            maxLength={maxLength}
            disabled={isSubmitting}
          />
          <div className='mt-1 text-right text-sm text-gray-500'>
            {value.length}/{maxLength}
          </div>
        </div>
        <Button
          type='submit'
          disabled={!value.trim() || isSubmitting}
          size='sm'
        >
          {isSubmitting ? '작성 중...' : '댓글 작성'}
        </Button>
      </div>
    </form>
  );
};
