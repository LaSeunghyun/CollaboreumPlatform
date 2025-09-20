# UI 컴포넌트 마이그레이션 가이드

## 개요

이 가이드는 기존 `src/components` 폴더의 컴포넌트들을 새로운 `src/shared/ui` 시스템으로 마이그레이션하는 방법을 설명합니다.

> 업데이트: 프로젝트는 Create React App 툴링에서 완전히 벗어나 `react-scripts` 없이 Vite 빌드 파이프라인과 Flat ESLint 설정(`eslint.config.js`)을 사용합니다. 타입 정의 패키지와 `typescript`는 모두 devDependencies로 이동했습니다.

## 마이그레이션 원칙

1. **점진적 마이그레이션**: 기존 코드를 한 번에 바꾸지 않고 점진적으로 마이그레이션
2. **하위 호환성 유지**: 기존 컴포넌트는 유지하되 새로운 컴포넌트 사용 권장
3. **디자인 토큰 우선**: 모든 색상과 스타일은 디자인 토큰 사용
4. **접근성 보장**: 모든 컴포넌트는 접근성 표준 준수

## 컴포넌트 매핑표

| 기존 컴포넌트 | 새로운 컴포넌트 | 상태 | 마이그레이션 우선순위 |
|--------------|----------------|------|-------------------|
| `src/components/Button*` | `@/shared/ui/Button` | ✅ 완료 | 높음 |
| `src/components/Modal*` | `@/shared/ui/Modal` | ✅ 완료 | 높음 |
| `src/components/Input*`, `TextField*` | `@/shared/ui/Input` | ✅ 완료 | 높음 |
| `src/components/Textarea*` | `@/shared/ui/Textarea` | ✅ 완료 | 높음 |
| `src/components/Select*`, `Dropdown*` | `@/shared/ui/Select` | ✅ 완료 | 높음 |
| `src/components/Checkbox*` | `@/shared/ui/Checkbox` | ✅ 완료 | 높음 |
| `src/components/Card*`, `Panel*` | `@/shared/ui/Card` | ✅ 완료 | 높음 |
| `src/components/Badge*`, `Tag*`, `Chip*` | `@/shared/ui/Badge` | ✅ 완료 | 높음 |

## 마이그레이션 단계

### 1단계: Import 경로 변경

```tsx
// ❌ 기존 방식
import { Button } from 'src/components/Button'
import { Modal } from 'src/components/Modal'

// ✅ 새로운 방식
import { Button } from '@/shared/ui/Button'
import { Modal } from '@/shared/ui/Modal'
```

### 2단계: Props 업데이트

새로운 컴포넌트는 `variant`, `size`, `tone` props를 사용합니다:

```tsx
// ❌ 기존 방식
<Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2">
  클릭하세요
</Button>

// ✅ 새로운 방식
<Button variant="solid" tone="default" size="md">
  클릭하세요
</Button>

// 또는 tone을 사용하여 의미적 색상 적용
<Button variant="solid" tone="success">
  성공
</Button>
```

### 3단계: 색상 클래스 제거

```tsx
// ❌ 기존 방식
<div className="bg-red-500 text-white p-4 rounded-lg">
  오류 메시지
</div>

// ✅ 새로운 방식
<div className="bg-danger-600 text-white p-4 rounded-lg">
  오류 메시지
</div>

// 또는 Badge 컴포넌트 사용
<Badge variant="danger">오류</Badge>
```

## 자동화 도구

### 1. 색상 체크

```bash
npm run check:colors
```

### 2. 전체 검사

```bash
npm run check:all
```

### 3. 마이그레이션 스크립트

```bash
npm run migrate:components
```

## 마이그레이션 체크리스트

- [ ] Import 경로를 `@/shared/ui/*`로 변경
- [ ] 하드코딩된 색상 클래스를 디자인 토큰으로 변경
- [ ] 컴포넌트 props를 새로운 API에 맞게 업데이트
- [ ] 접근성 속성 확인 (aria-*, role, tabIndex 등)
- [ ] 테스트 코드 업데이트
- [ ] 스토리북 스토리 업데이트

## 주의사항

1. **기존 컴포넌트 제거 전 확인**: 다른 파일에서 사용 중인지 확인
2. **스타일 충돌 방지**: 새로운 컴포넌트와 기존 스타일 간 충돌 확인
3. **테스트 업데이트**: 컴포넌트 변경에 따른 테스트 코드 수정
4. **문서화**: 변경된 컴포넌트의 사용법 문서화

## 도움말

마이그레이션 과정에서 문제가 발생하면:

1. `src/shared/ui` 폴더의 컴포넌트 문서 확인
2. `src/shared/theme/vars.css`에서 사용 가능한 토큰 확인
3. 기존 컴포넌트와 새 컴포넌트의 API 비교
4. 팀 내 디자인 시스템 가이드라인 참조

## 완료 기준

- [ ] 모든 UI 컴포넌트가 `@/shared/ui`에서 import됨
- [ ] 하드코딩된 색상 클래스가 모두 제거됨
- [ ] 모든 컴포넌트가 접근성 표준을 준수함
- [ ] 테스트 커버리지가 70% 이상 유지됨
- [ ] 스토리북에서 모든 컴포넌트가 정상 작동함
