import { useId } from 'react';
import { Button } from '@/shared/ui';
import { cn } from '@/shared/lib/cn';

type FundingMode = 'all-or-nothing' | 'flexible';

const MODE_OPTIONS: Array<{
  value: FundingMode;
  title: string;
  description: string;
  tone: 'default' | 'success';
}> = [
  {
    value: 'all-or-nothing',
    title: 'All-or-Nothing',
    description: '목표 금액 달성 시에만 결제되는 전통적인 크라우드펀딩 방식입니다.',
    tone: 'default'
  },
  {
    value: 'flexible',
    title: 'Flexible Funding',
    description: '목표 금액에 도달하지 못해도 모금액을 받을 수 있는 유연한 방식입니다.',
    tone: 'success'
  }
];

export interface FundingModeSelectorProps {
  value: FundingMode;
  onChange: (value: FundingMode) => void;
  disabled?: boolean;
}

export function FundingModeSelector({ value, onChange, disabled }: FundingModeSelectorProps) {
  const fieldsetId = useId();

  return (
    <fieldset
      aria-labelledby={`${fieldsetId}-legend`}
      className="space-y-4"
      disabled={disabled}
    >
      <legend id={`${fieldsetId}-legend`} className="text-base font-semibold text-foreground">
        모금 방식 선택
      </legend>
      <p className="text-sm text-muted-foreground">
        프로젝트 특성에 맞는 모금 방식을 선택하세요. Flexible Funding은 목표에 미달하더라도 창작을 이어갈 수 있도록 도와줍니다.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {MODE_OPTIONS.map(option => {
          const optionId = `${fieldsetId}-${option.value}`;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                'group relative block cursor-pointer rounded-3xl border border-border/80 bg-surface/80 p-4 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary-300',
                isSelected && 'border-primary-400 bg-primary-50/60 shadow-apple-lg'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground">{option.title}</span>
                    {option.value === 'flexible' && (
                      <Button asChild size="sm" tone={option.tone} variant="ghost" className="pointer-events-none select-none">
                        <span>New</span>
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-1 size-5 rounded-full border-2 border-muted-foreground/40 transition-colors duration-200',
                    isSelected ? 'border-primary-500 bg-primary-500' : 'bg-background'
                  )}
                />
              </div>
              <input
                id={optionId}
                type="radio"
                name={fieldsetId}
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="sr-only"
                disabled={disabled}
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
