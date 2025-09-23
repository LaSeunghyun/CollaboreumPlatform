import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
} from '@/shared/ui';
import { Label } from '@radix-ui/react-label';

interface ProjectSecretPerksSectionProps {
  secretPerks: string;
  onChange: (value: string) => void;
}

export const ProjectSecretPerksSection: React.FC<
  ProjectSecretPerksSectionProps
> = ({ secretPerks, onChange }) => (
  <Card>
    <CardHeader>
      <CardTitle className='text-foreground'>비밀 혜택 구성</CardTitle>
    </CardHeader>
    <CardContent className='space-y-2'>
      <Label
        htmlFor='secretPerks'
        className='text-sm font-semibold text-foreground'
      >
        비밀 혜택 설명
      </Label>
      <Textarea
        id='secretPerks'
        value={secretPerks}
        onChange={event => onChange(event.target.value)}
        placeholder='예: 일정 금액 이상 후원자에게 한정판 굿즈 제공'
        rows={4}
      />
      <p className='text-sm text-muted-foreground'>
        줄바꿈으로 여러 혜택을 구분할 수 있습니다. 이 정보는 후원 완료 시에만
        공개됩니다.
      </p>
    </CardContent>
  </Card>
);
