# Collaboreum MVP Platform 개발 가이드라인

## 🎯 프로젝트 개요

Collaboreum은 독립 아티스트와 팬이 협업 및 후원을 통해 지속 가능한 창작 생태계를 만드는 플랫폼입니다.

## 📋 핵심 개발 원칙

### 1. 코드 품질 및 자동화

- **TypeScript 엄격성**: `strict: true`, `noImplicitAny: true` 활성화
- **ESLint 규칙**: `no-restricted-imports`로 `src/components/*` 직접 import 금지
- **Prettier 설정**: `prettier-plugin-tailwindcss` 사용
- **Pre-commit 훅**: 코드 포맷팅 자동 적용, ESLint 자동 수정
- **CI/CD 파이프라인**: PR에서 `npm run check:all` 필수 통과

### 2. API 호출 및 데이터 관리

- **React Query 훅 사용**: 컴포넌트에서 직접 fetch/axios 사용 금지
- **QueryKey 표준 패턴**: `['domain', id/params]` 형태
- **하드코딩 데이터 금지**: 더미 데이터 사용 금지, API 실패 시에도 하드코딩된 데이터로 UI 렌더링 금지
- **타입 안정성**: API 응답에 대한 DTO 타입 정의, `any` 타입 사용 금지

### 3. UI 컴포넌트 개발

- **UI 컴포넌트는 `@/shared/ui/*`만 사용**: `src/components/ui/*` 직접 import 금지 (Shadcn 프리미티브는 `@/shared/ui/shadcn/*`)
- **색상 사용 규칙**: CSS 변수만 사용, Hex/RGB/HSL 직접 사용 금지
- **CVA 패턴 사용**: class-variance-authority 패턴으로 variant, size, tone 속성 표준화
- **접근성 규칙**: WCAG AA 기준 충족, ARIA 속성 완비, 키보드 네비게이션 지원

## 🎨 디자인 시스템 가이드라인

### 색상 팔레트

```css
/* Primary Colors */
--primary-50 ~ --primary-900

/* Semantic Colors */
--success-50 ~ --success-900
--warning-50 ~ --warning-900
--danger-50 ~ --danger-900
--neutral-50 ~ --neutral-900
```

### 컴포넌트 API 표준

```tsx
// Button 컴포넌트
<Button variant="solid" size="md" tone="success">
  버튼
</Button>

// Input 컴포넌트
<Input size="lg" tone="warning" placeholder="입력하세요" />

// Modal 컴포넌트
<Modal size="lg" open={open} onOpenChange={setOpen}>
  <ModalHeader>
    <ModalTitle>제목</ModalTitle>
    <ModalDescription>설명</ModalDescription>
  </ModalHeader>
  <ModalContentWrapper>내용</ModalContentWrapper>
  <ModalFooter>액션</ModalFooter>
</Modal>
```

## 🏗️ 프로젝트 구조

```
src/
├── shared/
│   ├── ui/                    # 표준화된 UI 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   └── theme/                 # 디자인 토큰
├── components/                # 기존 컴포넌트 (점진 마이그레이션)
├── features/                  # 기능별 모듈
├── lib/api/                   # React Query 훅
├── services/                  # API 서비스
└── types/                     # TypeScript 타입 정의
```

## 🧪 테스트 가이드라인

### 테스트 범위

- **컴포넌트 테스트**: 각 React 컴포넌트의 렌더링 및 상호작용
- **통합 테스트**: 전체 플로우의 연동 테스트
- **접근성 테스트**: 키보드 네비게이션 및 스크린 리더 지원
- **계약 테스트**: Pact를 통한 API 계약 검증

### 테스트 실행

```bash
npm test                    # 전체 테스트 실행
npm test -- --watch        # 감시 모드로 테스트 실행
npm test -- --coverage     # 커버리지 리포트 생성
npm run test:a11y          # 접근성 테스트
```

## 🚀 배포 가이드라인

### Pre-deploy Checklist

- [x] **Lint / Format / Typecheck** 통과
- [x] **Unit & Pact 계약 테스트** 통과
- [x] **Build 성공** (FE/BE)
- [x] **Security Audit** 통과
- [x] **E2E 테스트** 통과

### 배포 명령어

```bash
# 전체 점검 (로컬)
npm run check:all

# 색상 하드코딩 체크
npm run check:colors

# 컴포넌트 마이그레이션
npm run migrate:components

# Storybook 실행
npm run storybook
```

## 🔒 보안 및 권한 관리

### 접근 권한 체계

- **user_management**: 회원 관리
- **artist_approval**: 아티스트 승인
- **funding_oversight**: 펀딩 관리
- **finance_access**: 재무 정보 접근
- **community_moderation**: 커뮤니티 관리
- **system_admin**: 시스템 관리

### 보안 기능

- **2FA 인증**: 관리자 로그인 시 필수
- **감사 로그**: 모든 관리자 행동 기록
- **세션 관리**: 일정 시간 후 자동 로그아웃
- **IP 제한**: 특정 IP 대역에서만 접근 허용

## 📊 성능 최적화

### 데이터 최적화

- **페이지네이션**: 대용량 데이터 처리
- **인덱싱**: 자주 검색되는 필드에 인덱스 적용
- **캐싱**: 자주 사용되는 통계 데이터 캐싱
- **실시간 업데이트**: WebSocket을 통한 실시간 데이터 동기화

### UI/UX 최적화

- **지연 로딩**: 큰 테이블의 점진적 로딩
- **필터링**: 실시간 검색 및 필터 기능
- **반응형 디자인**: 다양한 화면 크기 지원
- **접근성**: WCAG 가이드라인 준수

## 🤝 기여 가이드라인

### 커밋 메시지

- 한글로 작성
- 변경 사항 명확히 설명
- 관련 이슈 번호 포함

### PR 프로세스

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### CI 체크 목록

- **Lint/Type/Format**: 오류 0, 경고 기준은 팀 합의치 이하
- **Unit/Contract Tests**: 실패 0, Pact 계약 검증 통과
- **Build**: FE/BE 빌드 성공
- **Security Audit**: 보안 취약점 0

---

**Collaboreum MVP Platform** - 아티스트와 팬을 연결하는 혁신적인 크리에이터 경제의 미래를 만들어갑니다. 🎨✨
