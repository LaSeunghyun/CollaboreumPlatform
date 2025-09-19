# Collaboreum MVP Platform - 폴더 구조 개선 계획

## 📊 현재 폴더 구조 분석

### 현재 구조의 문제점

```
src/
├── components/           # 모든 컴포넌트가 한 곳에 집중
│   ├── FundingProjects.tsx (716줄)
│   ├── AdminDashboard.tsx (1215줄)
│   ├── ArtistDashboard.tsx (433줄)
│   └── ... (100+ 컴포넌트)
├── pages/               # 페이지 컴포넌트
├── shared/              # 공통 컴포넌트
├── lib/                 # 라이브러리 설정
└── services/            # API 서비스
```

### 개선이 필요한 부분

1. **거대한 컴포넌트들**: 700줄 이상의 단일 파일들
2. **기능별 분리 부족**: 관련 기능이 흩어져 있음
3. **의존성 관리**: 순환 의존성 위험
4. **재사용성 부족**: 컴포넌트 재사용 어려움

## 🎯 개선된 폴더 구조

### 새로운 구조 설계

```
src/
├── shared/                    # 공통 모듈
│   ├── ui/                   # UI 컴포넌트 시스템
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   ├── Modal/
│   │   ├── Input/
│   │   └── ...
│   ├── hooks/                # 공통 훅
│   │   ├── useDebounce.ts
│   │   ├── useThrottle.ts
│   │   └── usePerformance.ts
│   ├── lib/                  # 유틸리티
│   │   ├── performance.ts
│   │   ├── webVitals.ts
│   │   └── utils.ts
│   └── types/                # 공통 타입
│       ├── api.ts
│       ├── common.ts
│       └── index.ts
├── features/                  # 기능별 모듈
│   ├── auth/                 # 인증 모듈
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── AuthGuard.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   ├── funding/              # 펀딩 모듈
│   │   ├── components/
│   │   │   ├── FundingProjectList/
│   │   │   │   ├── FundingProjectList.tsx
│   │   │   │   ├── FundingProjectCard.tsx
│   │   │   │   ├── FundingProjectFilters.tsx
│   │   │   │   └── index.ts
│   │   │   ├── FundingProjectDetail/
│   │   │   │   ├── FundingProjectDetail.tsx
│   │   │   │   ├── ProjectHeader.tsx
│   │   │   │   ├── ProjectTabs.tsx
│   │   │   │   └── index.ts
│   │   │   ├── PaymentModal/
│   │   │   │   ├── PaymentModal.tsx
│   │   │   │   ├── PaymentForm.tsx
│   │   │   │   ├── PaymentMethods.tsx
│   │   │   │   └── index.ts
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   ├── useFundingProjects.ts
│   │   │   ├── usePayment.ts
│   │   │   └── useFundingStats.ts
│   │   ├── services/
│   │   │   ├── fundingService.ts
│   │   │   └── paymentService.ts
│   │   ├── types/
│   │   │   ├── funding.types.ts
│   │   │   └── payment.types.ts
│   │   └── index.ts
│   ├── community/            # 커뮤니티 모듈
│   │   ├── components/
│   │   │   ├── PostList/
│   │   │   ├── PostDetail/
│   │   │   ├── PostForm/
│   │   │   └── CommentSection/
│   │   ├── hooks/
│   │   │   ├── usePosts.ts
│   │   │   └── useComments.ts
│   │   ├── services/
│   │   │   └── communityService.ts
│   │   ├── types/
│   │   │   └── community.types.ts
│   │   └── index.ts
│   ├── admin/                # 관리자 모듈
│   │   ├── components/
│   │   │   ├── AdminDashboard/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── DashboardMetrics.tsx
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ProjectApproval/
│   │   │   └── ContentModeration/
│   │   ├── hooks/
│   │   │   ├── useAdminData.ts
│   │   │   └── useAdminPermissions.ts
│   │   ├── services/
│   │   │   └── adminService.ts
│   │   ├── types/
│   │   │   └── admin.types.ts
│   │   └── index.ts
│   └── artist/               # 아티스트 모듈
│       ├── components/
│       │   ├── ArtistProfile/
│       │   ├── ArtistDashboard/
│       │   ├── ArtworkGallery/
│       │   └── ProjectManagement/
│       ├── hooks/
│       │   ├── useArtistProfile.ts
│       │   └── useArtwork.ts
│       ├── services/
│       │   └── artistService.ts
│       ├── types/
│       │   └── artist.types.ts
│       └── index.ts
├── pages/                    # 페이지 컴포넌트
│   ├── home/
│   │   ├── HomePage.tsx
│   │   └── index.ts
│   ├── funding/
│   │   ├── FundingPage.tsx
│   │   ├── CreateFundingPage.tsx
│   │   └── index.ts
│   └── ...
├── lib/                      # 라이브러리 설정
│   ├── api/
│   │   ├── queryClient.ts
│   │   ├── useFunding.ts
│   │   └── useAuth.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── config/
│       ├── api.ts
│       └── env.ts
├── contexts/                 # React Context
│   ├── AuthContext.tsx
│   ├── HistoryContext.tsx
│   └── index.ts
├── test-utils/              # 테스트 유틸리티
│   ├── testUtils.tsx
│   ├── mocks/
│   │   ├── handlers.ts
│   │   └── server.ts
│   └── fixtures/
│       ├── user.fixtures.ts
│       └── project.fixtures.ts
└── types/                   # 전역 타입
    ├── api.ts
    ├── common.ts
    └── index.ts
```

## 🚀 마이그레이션 계획

### Phase 1: 공통 모듈 분리 (1주)

#### 1.1 UI 컴포넌트 시스템 구축

```typescript
// src/shared/ui/Button/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        sm: "h-9 px-3 rounded-md",
        md: "h-10 py-2 px-4",
        lg: "h-11 px-8 rounded-md",
      },
      tone: {
        default: "",
        success: "bg-success-600 text-white hover:bg-success-700",
        warning: "bg-warning-600 text-white hover:bg-warning-700",
        danger: "bg-danger-600 text-white hover:bg-danger-700",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
      tone: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, tone, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, tone, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
```

#### 1.2 공통 훅 분리

```typescript
// src/shared/hooks/useDebounce.ts
import { useCallback, useRef, useEffect } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay],
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
```

### Phase 2: 기능별 모듈 분리 (2주)

#### 2.1 펀딩 모듈 분리

```typescript
// src/features/funding/components/FundingProjectList/FundingProjectList.tsx
import React from 'react';
import { useFundingProjects } from '../../hooks/useFundingProjects';
import { FundingProjectCard } from './FundingProjectCard';
import { FundingProjectFilters } from './FundingProjectFilters';
import { VirtualizedList } from '@/shared/ui/VirtualizedList';

interface FundingProjectListProps {
  onProjectClick?: (projectId: number) => void;
}

export const FundingProjectList: React.FC<FundingProjectListProps> = ({
  onProjectClick,
}) => {
  const { data: projects, isLoading, error } = useFundingProjects();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (error) {
    return <div>에러가 발생했습니다.</div>;
  }

  return (
    <div className="space-y-4">
      <FundingProjectFilters />
      <VirtualizedList
        items={projects || []}
        itemHeight={200}
        containerHeight={600}
        renderItem={(project) => (
          <FundingProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick?.(project.id)}
          />
        )}
      />
    </div>
  );
};
```

#### 2.2 커스텀 훅 분리

```typescript
// src/features/funding/hooks/useFundingProjects.ts
import { useQuery } from '@tanstack/react-query';
import { fundingService } from '../services/fundingService';
import { FundingProject } from '../types/funding.types';

export function useFundingProjects() {
  return useQuery<FundingProject[]>({
    queryKey: ['funding', 'projects'],
    queryFn: fundingService.getProjects,
  });
}

export function useFundingProject(id: number) {
  return useQuery<FundingProject>({
    queryKey: ['funding', 'project', id],
    queryFn: () => fundingService.getProject(id),
    enabled: !!id,
  });
}
```

### Phase 3: 거대한 컴포넌트 분해 (2주)

#### 3.1 AdminDashboard 분해

```typescript
// src/features/admin/components/AdminDashboard/AdminDashboard.tsx
import React from 'react';
import { DashboardMetrics } from './DashboardMetrics';
import { UserManagement } from './UserManagement';
import { ProjectApproval } from './ProjectApproval';
import { ContentModeration } from './ContentModeration';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="admin-dashboard">
      <DashboardMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserManagement />
        <ProjectApproval />
      </div>
      <ContentModeration />
    </div>
  );
};
```

#### 3.2 FundingProjects 분해

```typescript
// src/features/funding/components/FundingProjectList/FundingProjectList.tsx
import React from 'react';
import { useFundingProjects } from '../../hooks/useFundingProjects';
import { ProjectFilters } from './ProjectFilters';
import { ProjectGrid } from './ProjectGrid';
import { ProjectPagination } from './ProjectPagination';

export const FundingProjectList: React.FC = () => {
  const { data: projects, isLoading, error } = useFundingProjects();

  return (
    <div className="funding-project-list">
      <ProjectFilters />
      <ProjectGrid projects={projects} isLoading={isLoading} error={error} />
      <ProjectPagination />
    </div>
  );
};
```

### Phase 4: 의존성 정리 (1주)

#### 4.1 순환 의존성 제거

```typescript
// src/shared/types/index.ts
export * from './api';
export * from './common';
export * from './ui';
```

#### 4.2 절대 경로 설정

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/shared/*": ["src/shared/*"],
      "@/features/*": ["src/features/*"],
      "@/lib/*": ["src/lib/*"],
      "@/test-utils/*": ["src/test-utils/*"]
    }
  }
}
```

## 📈 기대 효과

### 개발 생산성 향상

- **모듈화**: 기능별 독립적 개발 가능
- **재사용성**: 컴포넌트 재사용 용이
- **유지보수성**: 관련 코드가 한 곳에 집중

### 코드 품질 개선

- **가독성**: 작은 단위의 컴포넌트
- **테스트 용이성**: 독립적인 모듈 테스트
- **타입 안정성**: 명확한 타입 정의

### 팀 협업 개선

- **역할 분담**: 기능별 담당자 배정
- **충돌 최소화**: 독립적인 모듈 개발
- **코드 리뷰**: 작은 단위의 리뷰

## 🛠️ 구현 계획

### 1단계: 공통 모듈 구축 (1주)

- [ ] UI 컴포넌트 시스템 구축
- [ ] 공통 훅 분리
- [ ] 유틸리티 함수 정리

### 2단계: 기능별 모듈 분리 (2주)

- [ ] 펀딩 모듈 분리
- [ ] 커뮤니티 모듈 분리
- [ ] 관리자 모듈 분리
- [ ] 아티스트 모듈 분리

### 3단계: 거대한 컴포넌트 분해 (2주)

- [ ] AdminDashboard 분해
- [ ] FundingProjects 분해
- [ ] ArtistDashboard 분해

### 4단계: 의존성 정리 (1주)

- [ ] 순환 의존성 제거
- [ ] 절대 경로 설정
- [ ] Import 정리

이 폴더 구조 개선을 통해 Collaboreum 플랫폼을 더욱 체계적이고 확장 가능한 시스템으로 발전시킬 수 있습니다.
