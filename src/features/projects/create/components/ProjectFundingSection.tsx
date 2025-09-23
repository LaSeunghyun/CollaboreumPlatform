import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/ui';
import { Label } from '@radix-ui/react-label';

interface ProjectFundingSectionProps {
  goal: string;
  duration: string;
  revenueShare: string;
  onNumberChange: (
    field: 'goal' | 'duration' | 'revenueShare',
    value: string,
  ) => void;
  onInputChange: (field: 'duration' | 'revenueShare', value: string) => void;
  formatNumber: (value: string) => string;
}

export const ProjectFundingSection: React.FC<ProjectFundingSectionProps> = ({
  goal,
  duration,
  revenueShare,
  onNumberChange,
  onInputChange,
  formatNumber,
}) => (
  <Card>
    <CardHeader>
      <CardTitle className='flex items-center gap-2 text-foreground'>
        펀딩 정보
      </CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='goal' className='text-sm font-semibold text-foreground'>
          목표 금액 (원) <span className='text-danger-500'>*</span>
        </Label>
        <Input
          id='goal'
          value={goal ? formatNumber(goal) : ''}
          onChange={event => onNumberChange('goal', event.target.value)}
          placeholder='1,000,000'
          required
        />
        <p className='text-sm text-muted-foreground'>
          숫자만 입력하세요. 자동으로 콤마가 추가됩니다.
        </p>
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='duration'
          className='text-sm font-semibold text-foreground'
        >
          펀딩 기간 (일) <span className='text-danger-500'>*</span>
        </Label>
        <Input
          id='duration'
          type='number'
          value={duration}
          onChange={event => onInputChange('duration', event.target.value)}
          placeholder='30'
          min='1'
          max='365'
          required
        />
        <p className='text-sm text-muted-foreground'>
          1일부터 365일까지 설정 가능합니다.
        </p>
      </div>

      <div className='space-y-2'>
        <Label
          htmlFor='revenueShare'
          className='text-sm font-semibold text-foreground'
        >
          수익 공유율 (%) <span className='text-danger-500'>*</span>
        </Label>
        <Input
          id='revenueShare'
          type='number'
          value={revenueShare}
          onChange={event => onInputChange('revenueShare', event.target.value)}
          placeholder='10'
          min='1'
          max='100'
          required
        />
        <p className='text-sm text-muted-foreground'>
          후원자들에게 분배할 수익의 비율을 입력하세요. (1% ~ 100%)
        </p>
      </div>
    </CardContent>
  </Card>
);
