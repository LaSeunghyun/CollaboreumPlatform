#!/usr/bin/env node

/**
 * UI 일관성 개선 자동화 스크립트
 * 간격 표준화 및 CVA 패턴 적용
 */

const fs = require('fs');
const path = require('path');

function log(message) {
  console.log(`[UI-REFACTOR] ${message}`);
}

function findSpacingInconsistencies() {
  log('간격 사용 현황 분석...');

  const spacingPatterns = {
    padding: /p-\d+/g,
    margin: /m-\d+/g,
    space: /space-[xy]-\d+/g,
    gap: /gap-\d+/g,
  };

  const inconsistencies = {
    padding: new Set(),
    margin: new Set(),
    space: new Set(),
    gap: new Set(),
  };

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');

        Object.entries(spacingPatterns).forEach(([type, pattern]) => {
          const matches = content.match(pattern);
          if (matches) {
            matches.forEach(match => inconsistencies[type].add(match));
          }
        });
      }
    });
  }

  scanDirectory('src');

  return {
    padding: Array.from(inconsistencies.padding).sort(),
    margin: Array.from(inconsistencies.margin).sort(),
    space: Array.from(inconsistencies.space).sort(),
    gap: Array.from(inconsistencies.gap).sort(),
  };
}

function generateDesignTokens() {
  log('디자인 토큰 생성...');

  const designTokens = `// src/shared/design-tokens/spacing.ts
// 간격 디자인 토큰

export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
} as const;

export const spacingPx = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

// Tailwind CSS 클래스 매핑
export const spacingClasses = {
  padding: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    '2xl': 'p-12',
    '3xl': 'p-16',
    '4xl': 'p-24',
  },
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
    '2xl': 'm-12',
    '3xl': 'm-16',
    '4xl': 'm-24',
  },
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
    '2xl': 'gap-12',
    '3xl': 'gap-16',
    '4xl': 'gap-24',
  },
  space: {
    xs: 'space-y-1',
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
    '2xl': 'space-y-12',
    '3xl': 'space-y-16',
    '4xl': 'space-y-24',
  }
} as const;

export type SpacingSize = keyof typeof spacing;
export type SpacingType = keyof typeof spacingClasses;
`;

  // 디렉토리 생성
  const tokensDir = 'src/shared/design-tokens';
  if (!fs.existsSync(tokensDir)) {
    fs.mkdirSync(tokensDir, { recursive: true });
  }

  fs.writeFileSync(path.join(tokensDir, 'spacing.ts'), designTokens);
  log('✅ 디자인 토큰 생성 완료');
}

function generateCVAComponents() {
  log('CVA 패턴 컴포넌트 생성...');

  const cardComponent = `// src/shared/ui/Card/Card.tsx
import React, { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const cardStyles = cva(
  "bg-card text-card-foreground rounded-lg border shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border/50",
        outlined: "border-border bg-transparent",
        filled: "border-transparent bg-secondary/50",
        elevated: "border-border/50 shadow-lg",
      },
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      spacing: {
        none: "",
        xs: "space-y-1",
        sm: "space-y-2",
        md: "space-y-4",
        lg: "space-y-6",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      spacing: "md",
    },
  }
);

const cardHeaderStyles = cva(
  "flex flex-col space-y-1.5 p-6",
  {
    variants: {
      size: {
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      }
    },
    defaultVariants: {
      size: "md",
    }
  }
);

const cardTitleStyles = cva(
  "text-2xl font-semibold leading-none tracking-tight",
  {
    variants: {
      size: {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-2xl",
        xl: "text-3xl",
      }
    },
    defaultVariants: {
      size: "md",
    }
  }
);

const cardDescriptionStyles = cva(
  "text-sm text-muted-foreground",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      }
    },
    defaultVariants: {
      size: "md",
    }
  }
);

const cardContentStyles = cva(
  "p-6 pt-0",
  {
    variants: {
      size: {
        sm: "p-3 pt-0",
        md: "p-4 pt-0",
        lg: "p-6 pt-0",
        xl: "p-8 pt-0",
      }
    },
    defaultVariants: {
      size: "md",
    }
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardStyles> {}

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderStyles> {}

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleStyles> {}

export interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionStyles> {}

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentStyles> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, spacing, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardStyles({ variant, size, spacing }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderStyles({ size }), className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, size, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(cardTitleStyles({ size }), className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(cardDescriptionStyles({ size }), className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentStyles({ size }), className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
`;

  // Card 컴포넌트 디렉토리 생성
  const cardDir = 'src/shared/ui/Card';
  if (!fs.existsSync(cardDir)) {
    fs.mkdirSync(cardDir, { recursive: true });
  }

  fs.writeFileSync(path.join(cardDir, 'Card.tsx'), cardComponent);
  fs.writeFileSync(path.join(cardDir, 'index.ts'), 'export * from "./Card";');

  log('✅ CVA 패턴 컴포넌트 생성 완료');
}

function generateSpacingUtils() {
  log('간격 유틸리티 함수 생성...');

  const spacingUtils = `// src/shared/lib/spacingUtils.ts
import { spacingClasses, type SpacingSize, type SpacingType } from '../design-tokens/spacing';

/**
 * 간격 클래스를 생성하는 유틸리티 함수
 */
export function getSpacingClass(type: SpacingType, size: SpacingSize): string {
  return spacingClasses[type][size];
}

/**
 * 여러 간격 클래스를 조합하는 함수
 */
export function combineSpacingClasses(
  padding?: SpacingSize,
  margin?: SpacingSize,
  gap?: SpacingSize,
  space?: SpacingSize
): string {
  const classes: string[] = [];
  
  if (padding) classes.push(getSpacingClass('padding', padding));
  if (margin) classes.push(getSpacingClass('margin', margin));
  if (gap) classes.push(getSpacingClass('gap', gap));
  if (space) classes.push(getSpacingClass('space', space));
  
  return classes.join(' ');
}

/**
 * 반응형 간격 클래스를 생성하는 함수
 */
export function getResponsiveSpacing(
  base: SpacingSize,
  sm?: SpacingSize,
  md?: SpacingSize,
  lg?: SpacingSize,
  xl?: SpacingSize
): string {
  const classes = [getSpacingClass('padding', base)];
  
  if (sm) classes.push(\`sm:\${getSpacingClass('padding', sm)}\`);
  if (md) classes.push(\`md:\${getSpacingClass('padding', md)}\`);
  if (lg) classes.push(\`lg:\${getSpacingClass('padding', lg)}\`);
  if (xl) classes.push(\`xl:\${getSpacingClass('padding', xl)}\`);
  
  return classes.join(' ');
}

/**
 * 간격 값 검증 함수
 */
export function isValidSpacingSize(size: string): size is SpacingSize {
  return ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'].includes(size);
}
`;

  fs.writeFileSync('src/shared/lib/spacingUtils.ts', spacingUtils);
  log('✅ 간격 유틸리티 함수 생성 완료');
}

function main() {
  log('🚀 UI 일관성 개선 자동화 시작');

  // 1. 간격 사용 현황 분석
  const inconsistencies = findSpacingInconsistencies();

  log('📊 간격 사용 현황:');
  log(`Padding: ${inconsistencies.padding.join(', ')}`);
  log(`Margin: ${inconsistencies.margin.join(', ')}`);
  log(`Space: ${inconsistencies.space.join(', ')}`);
  log(`Gap: ${inconsistencies.gap.join(', ')}`);

  // 2. 디자인 토큰 생성
  generateDesignTokens();

  // 3. CVA 패턴 컴포넌트 생성
  generateCVAComponents();

  // 4. 간격 유틸리티 함수 생성
  generateSpacingUtils();

  log('✅ UI 일관성 개선 자동화 완료');
  log('다음 단계: 기존 컴포넌트에 새로운 간격 시스템을 적용하세요');
}

if (require.main === module) {
  main();
}

module.exports = {
  findSpacingInconsistencies,
  generateDesignTokens,
  generateCVAComponents,
  generateSpacingUtils,
};
