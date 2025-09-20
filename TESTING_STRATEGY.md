# Collaboreum MVP Platform - 테스트 전략 및 커버리지 향상 계획

## 📊 현재 테스트 현황 분석

### 1. 기존 테스트 구조

```
src/__tests__/
├── a11y.test.ts                    # 접근성 테스트
├── AdminDashboardSystem.test.tsx   # 관리자 대시보드 테스트
├── APIService.test.tsx            # API 서비스 테스트
├── Button.test.tsx                # 버튼 컴포넌트 테스트
├── CommunitySystem.test.tsx       # 커뮤니티 시스템 테스트
├── EventSystem.test.tsx           # 이벤트 시스템 테스트
├── FundingSystem.test.tsx         # 펀딩 시스템 테스트 (2019줄)
├── Integration.test.tsx           # 통합 테스트
├── LiveAndPointsSection.test.tsx  # 라이브 섹션 테스트
└── UserProfileSystem.test.tsx     # 사용자 프로필 테스트
```

### 2. 테스트 커버리지 분석

- **단위 테스트**: 컴포넌트별 기본 테스트 존재
- **통합 테스트**: API 연동 테스트 부분적 구현
- **E2E 테스트**: Cypress 설정되어 있으나 제한적
- **접근성 테스트**: 기본적인 a11y 테스트 존재

### 3. 개선이 필요한 부분

- **테스트 커버리지**: 전체 코드의 60% 미만
- **테스트 품질**: 단순 렌더링 테스트 위주
- **모킹 전략**: API 모킹이 일관되지 않음
- **성능 테스트**: 부족한 성능 관련 테스트

## 🎯 테스트 전략 개선 계획

### Phase 1: 테스트 인프라 구축

#### 1.1 테스트 설정 표준화

```typescript
// jest.config.js 개선
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{ts,tsx}',
  ],
};
```

#### 1.2 테스트 유틸리티 구축

```typescript
// src/test-utils/testUtils.tsx
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

### Phase 2: 단위 테스트 강화

#### 2.1 컴포넌트 테스트 표준화

```typescript
// src/shared/ui/Button/Button.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '../../../test-utils/testUtils';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct variant styles', () => {
    render(<Button variant="solid">Solid Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-600');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

#### 2.2 훅 테스트 강화

```typescript
// src/shared/hooks/usePerformance.test.ts
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useThrottle } from '../hooks/usePerformance';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('debounces function calls', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 100));

    act(() => {
      result.current('test1');
      result.current('test2');
      result.current('test3');
    });

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test3');
  });
});
```

#### 2.3 펀딩 신규 기능 테스트

- `src/features/funding/components/FundingModeSelector/__tests__/FundingModeSelector.test.tsx`에서 라디오 기반 모금 방식 선택 UI를 검증하여 `variant`/`tone` 업데이트 이후 상호작용과 접근성을 보장합니다.
- `src/features/funding/components/SecretPerksEditor/__tests__/SecretPerksEditor.test.tsx`는 비밀 혜택 폼이 입력을 트리밍하고 비동기 저장을 처리하는지 확인합니다.
- `src/__tests__/CreateProjectPage.integration.test.tsx`는 `msw` 서버로 `/funding/projects` POST 요청을 모킹하여 Flexible Funding 옵션과 Secret Perks 데이터가 올바르게 전송되는 통합 시나리오를 담습니다.

### Phase 3: 통합 테스트 강화

#### 3.1 API 통합 테스트

```typescript
// src/lib/api/useFunding.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../test-utils/mocks/server';
import { useFundingProjects } from './useFunding';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useFundingProjects', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('fetches funding projects successfully', async () => {
    const { result } = renderHook(() => useFundingProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[0]).toMatchObject({
      id: 1,
      title: 'Test Project',
      status: 'active',
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/funding/projects', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server Error' }));
      })
    );

    const { result } = renderHook(() => useFundingProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});
```

#### 3.2 사용자 플로우 테스트

```typescript
// src/__tests__/UserFlow.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils/testUtils';
import { FundingProjectDetail } from '../components/FundingProjectDetail';

describe('Funding Project User Flow', () => {
  it('allows user to view project and make payment', async () => {
    render(<FundingProjectDetail />);

    // 프로젝트 로딩 확인
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    // 후원 버튼 클릭
    const supportButton = screen.getByRole('button', { name: /후원하기/i });
    fireEvent.click(supportButton);

    // 결제 모달 열림 확인
    await waitFor(() => {
      expect(screen.getByText('후원 금액을 입력하세요')).toBeInTheDocument();
    });

    // 금액 입력
    const amountInput = screen.getByLabelText(/후원 금액/i);
    fireEvent.change(amountInput, { target: { value: '50000' } });

    // 결제 진행 버튼 클릭
    const proceedButton = screen.getByRole('button', { name: /결제 진행/i });
    fireEvent.click(proceedButton);

    // 결제 완료 확인
    await waitFor(() => {
      expect(screen.getByText('후원이 완료되었습니다')).toBeInTheDocument();
    });
  });
});
```

### Phase 4: E2E 테스트 강화

#### 4.1 Cypress 테스트 시나리오

```typescript
// cypress/e2e/funding-flow.cy.ts
describe('Funding Flow E2E', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login('test@example.com', 'password');
  });

  it('should complete full funding flow', () => {
    // 홈페이지에서 프로젝트 클릭
    cy.get('[data-testid="project-card"]').first().click();

    // 프로젝트 상세 페이지 로딩 확인
    cy.url().should('include', '/project/');
    cy.get('[data-testid="project-title"]').should('be.visible');

    // 후원하기 버튼 클릭
    cy.get('[data-testid="support-button"]').click();

    // 결제 모달 열림 확인
    cy.get('[data-testid="payment-modal"]').should('be.visible');

    // 후원 금액 입력
    cy.get('[data-testid="amount-input"]').type('100000');

    // 결제 정보 입력
    cy.get('[data-testid="card-number"]').type('4111111111111111');
    cy.get('[data-testid="card-expiry"]').type('12/25');
    cy.get('[data-testid="card-cvv"]').type('123');

    // 결제 진행
    cy.get('[data-testid="proceed-payment"]').click();

    // 결제 완료 확인
    cy.get('[data-testid="payment-success"]').should('be.visible');
    cy.get('[data-testid="success-message"]').should(
      'contain',
      '후원이 완료되었습니다',
    );
  });
});
```

#### 4.2 성능 테스트

```typescript
// cypress/e2e/performance.cy.ts
describe('Performance Tests', () => {
  it('should load homepage within performance budget', () => {
    cy.visit('/');

    // Lighthouse 성능 점수 확인
    cy.lighthouse({
      performance: 90,
      accessibility: 90,
      'best-practices': 90,
      seo: 90,
    });
  });

  it('should handle large datasets efficiently', () => {
    cy.visit('/projects');

    // 대용량 프로젝트 리스트 로딩 시간 측정
    cy.get('[data-testid="project-list"]').should('be.visible');

    // 가상화 확인
    cy.get('[data-testid="virtualized-list"]').should('exist');

    // 스크롤 성능 테스트
    cy.get('[data-testid="project-list"]').scrollTo('bottom', {
      duration: 1000,
    });
    cy.get('[data-testid="project-list"]').should('be.visible');
  });
});
```

### Phase 5: 접근성 테스트 강화

#### 5.1 자동화된 접근성 테스트

```typescript
// src/__tests__/accessibility.test.tsx
import React from 'react';
import { render } from '../test-utils/testUtils';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../shared/ui/Button';
import { Modal } from '../shared/ui/Modal';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button should not have accessibility violations', async () => {
    const { container } = render(<Button>Test Button</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Modal should be accessible', async () => {
    const { container } = render(
      <Modal open={true} onOpenChange={() => {}}>
        <ModalHeader>
          <ModalTitle>Test Modal</ModalTitle>
        </ModalHeader>
        <ModalContent>Test Content</ModalContent>
      </Modal>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## 📈 테스트 커버리지 목표

### 단위 테스트

- **컴포넌트**: 90% 이상
- **훅**: 95% 이상
- **유틸리티**: 100%

### 통합 테스트

- **API 연동**: 80% 이상
- **사용자 플로우**: 70% 이상

### E2E 테스트

- **핵심 기능**: 100%
- **결제 플로우**: 100%
- **관리자 기능**: 90%

### 접근성 테스트

- **WCAG AA 준수**: 100%
- **키보드 네비게이션**: 100%

## 🛠️ 구현 계획

### 1단계: 테스트 인프라 구축 (1주)

- [ ] Jest 설정 최적화
- [ ] 테스트 유틸리티 구축
- [ ] 모킹 전략 수립

### 2단계: 단위 테스트 강화 (2주)

- [ ] 컴포넌트 테스트 표준화
- [ ] 훅 테스트 강화
- [ ] 유틸리티 함수 테스트

### 3단계: 통합 테스트 강화 (2주)

- [ ] API 통합 테스트
- [ ] 사용자 플로우 테스트
- [ ] 상태 관리 테스트

### 4단계: E2E 테스트 강화 (1주)

- [ ] Cypress 시나리오 작성
- [ ] 성능 테스트 추가
- [ ] CI/CD 통합

### 5단계: 접근성 테스트 강화 (1주)

- [ ] 자동화된 a11y 테스트
- [ ] 키보드 네비게이션 테스트
- [ ] 스크린 리더 테스트

## 🔧 도구 및 라이브러리

### 테스트 프레임워크

- **Jest**: 단위 테스트
- **React Testing Library**: 컴포넌트 테스트
- **Cypress**: E2E 테스트
- **MSW**: API 모킹

### 접근성 테스트

- **jest-axe**: 자동화된 접근성 테스트
- **@testing-library/jest-dom**: DOM 테스트 유틸리티

### 성능 테스트

- **cypress-lighthouse**: Lighthouse 통합
- **@testing-library/user-event**: 사용자 상호작용 시뮬레이션

이 테스트 전략을 통해 Collaboreum 플랫폼의 안정성과 신뢰성을 크게 향상시킬 수 있습니다.
