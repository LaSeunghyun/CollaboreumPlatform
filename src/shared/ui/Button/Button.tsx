import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { forwardRef } from 'react';

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/30 focus-visible:ring-4 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        solid:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-apple hover:shadow-apple-lg active:scale-95 focus:ring-primary-300',
        outline:
          'border border-border bg-background/80 backdrop-blur-sm text-foreground hover:bg-secondary/50 hover:border-border/80 focus:ring-primary-300',
        ghost:
          'hover:bg-secondary/60 hover:text-foreground focus:ring-primary-300',
        link: 'text-primary-600 underline-offset-4 hover:underline focus:ring-primary-300',
        // 새로운 variant들
        indigo:
          'bg-indigo text-white hover:bg-indigo/90 shadow-sm hover:shadow-md active:scale-95 focus:ring-indigo-300',
        gradient:
          'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:from-primary-700 hover:to-indigo-700 shadow-lg hover:shadow-xl active:scale-95 focus:ring-primary-300',
        glass:
          'bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 focus:ring-white/30',
        // 추가 variant들
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md active:scale-95 focus:ring-secondary-300',
        default:
          'bg-primary-600 text-white hover:bg-primary-700 shadow-apple hover:shadow-apple-lg active:scale-95 focus:ring-primary-300',
      },
      size: {
        xs: 'h-6 rounded-lg gap-1 px-2 text-xs [&_svg]:size-3',
        sm: 'h-8 rounded-xl gap-1.5 px-4 text-sm [&_svg]:size-4',
        md: 'h-10 px-6 py-2 text-sm [&_svg]:size-4',
        lg: 'h-12 rounded-2xl px-8 text-base [&_svg]:size-5',
        xl: 'h-14 rounded-2xl px-10 text-lg [&_svg]:size-6',
        icon: 'size-10 rounded-2xl',
        'icon-sm': 'size-8 rounded-xl',
        'icon-lg': 'size-12 rounded-2xl',
      },
      tone: {
        default: '',
        success:
          'bg-success-600 text-white hover:bg-success-700 focus:ring-success-300',
        warning:
          'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-300',
        danger:
          'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-300',
        info: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
        muted: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300',
      },
    },
    compoundVariants: [
      // tone이 설정된 경우 variant를 무시하고 tone 색상 사용
      {
        tone: 'success',
        variant: 'solid',
        class:
          'bg-success-600 text-white hover:bg-success-700 focus:ring-success-300',
      },
      {
        tone: 'success',
        variant: 'outline',
        class:
          'border-success-300 text-success-700 hover:bg-success-50 focus:ring-success-300',
      },
      {
        tone: 'success',
        variant: 'ghost',
        class: 'text-success-700 hover:bg-success-100 focus:ring-success-300',
      },
      {
        tone: 'warning',
        variant: 'solid',
        class:
          'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-300',
      },
      {
        tone: 'warning',
        variant: 'outline',
        class:
          'border-warning-300 text-warning-700 hover:bg-warning-50 focus:ring-warning-300',
      },
      {
        tone: 'warning',
        variant: 'ghost',
        class: 'text-warning-700 hover:bg-warning-100 focus:ring-warning-300',
      },
      {
        tone: 'danger',
        variant: 'solid',
        class:
          'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-300',
      },
      {
        tone: 'danger',
        variant: 'outline',
        class:
          'border-danger-300 text-danger-700 hover:bg-danger-50 focus:ring-danger-300',
      },
      {
        tone: 'danger',
        variant: 'ghost',
        class: 'text-danger-700 hover:bg-danger-100 focus:ring-danger-300',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      size: 'md',
      tone: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonStyles> {
  asChild?: boolean;
  loading?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      tone,
      asChild = false,
      loading = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? 'span' : 'button';

    return (
      <Comp
        className={cn(buttonStyles({ variant, size, tone }), className)}
        ref={ref}
        type={asChild ? undefined : 'button'}
        disabled={loading || props.disabled}
        aria-busy={loading}
        aria-disabled={loading || props.disabled}
        aria-label={props['aria-label'] || (loading ? '로딩 중' : undefined)}
        aria-describedby={props['aria-describedby']}
        role={asChild ? 'button' : undefined}
        tabIndex={asChild ? 0 : undefined}
        onKeyDown={
          asChild
            ? e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  (e.target as HTMLElement).click();
                }
              }
            : undefined
        }
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonStyles };
