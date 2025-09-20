import { FormEvent, useId } from 'react';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Textarea } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

export interface SecretPerksEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => Promise<void> | void;
  isSaving?: boolean;
  className?: string;
}

export function SecretPerksEditor({ value, onChange, onSubmit, isSaving = false, className }: SecretPerksEditorProps) {
  const controlId = useId();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(value.trim());
  };

  return (
    <Card className={cn('bg-surface/80', className)}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">비밀 혜택 (Secret Perks)</CardTitle>
          <p className="text-sm text-muted-foreground">
            열성 팬을 위해 숨겨진 혜택을 구성해보세요. 이 정보는 프로젝트를 후원하는 사용자에게만 공개됩니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <label htmlFor={controlId} className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">혜택 설명</span>
            <Textarea
              id={controlId}
              value={value}
              onChange={event => onChange(event.target.value)}
              placeholder="예: 일정 금액 이상 후원자에게만 공개되는 한정판 굿즈 제공"
              rows={4}
            />
          </label>
          <p className="text-xs text-muted-foreground">
            여러 혜택을 제공하려면 줄바꿈으로 구분하세요. 민감한 정보는 포함하지 않는 것이 좋습니다.
          </p>
        </CardContent>
        <CardFooter className="justify-end gap-3">
          <Button type="submit" size="md" variant="solid" tone="default" loading={isSaving} disabled={isSaving}>
            {isSaving ? '저장 중...' : '비밀 혜택 저장'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
