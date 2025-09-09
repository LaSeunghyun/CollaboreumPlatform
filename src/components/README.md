# Components 폴더 (점진 마이그레이션 대상)

⚠️ **중요**: 이 폴더는 점진 마이그레이션 대상입니다.

## 규칙

- **신규 UI 컴포넌트는 `src/shared/ui`에서만 생성하세요**
- 기존 컴포넌트는 점진적으로 `src/shared/ui`로 마이그레이션 예정
- 마이그레이션 완료 후 이 폴더는 제거될 예정

## 마이그레이션 가이드

기존 컴포넌트를 사용할 때는:
```tsx
// ❌ 금지 - 기존 방식
import { Button } from 'src/components/Button'

// ✅ 권장 - 새로운 방식  
import { Button } from '@/shared/ui/Button'
```

## 컴포넌트 매핑표

| 기존 (src/components) | 신규 (src/shared/ui) | 상태 |
|----------------------|---------------------|------|
| Button* | @/shared/ui/Button | 마이그레이션 예정 |
| Modal* | @/shared/ui/Modal | 마이그레이션 예정 |
| Input*, TextField* | @/shared/ui/Input | 마이그레이션 예정 |
| Tag*, Chip* | @/shared/ui/Badge | 마이그레이션 예정 |
| Panel*, Card* | @/shared/ui/Card | 마이그레이션 예정 |
| Select*, Dropdown* | @/shared/ui/Select | 마이그레이션 예정 |
