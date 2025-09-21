# CI/CD 자동화 설정 가이드

## 🚀 GitHub Branch Protection 설정

### 1. Repository Settings에서 Branch Protection Rules 설정

1. GitHub Repository → Settings → Branches
2. "Add rule" 클릭
3. Branch name pattern: `main` 또는 `*` (모든 브랜치)
4. 다음 옵션들 활성화:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require linear history
   - ✅ Include administrators

### 2. Required Status Checks 설정

다음 체크들을 필수로 설정:

- `build-test-quality` (필수)
- `security-scan` (필수)
- `e2e-tests` (PR에서만, 선택사항)

### 3. GitHub Secrets 설정

Repository Settings → Secrets and variables → Actions에서 다음 시크릿 추가:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
RAILWAY_TOKEN=your_railway_token
```

## 🔧 로컬 개발 환경 설정

### 1. 의존성 설치

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. 환경변수 설정

```bash
# Frontend .env 파일 생성
cp .env.example .env

# Backend .env 파일 생성
cd server
cp .env.example .env
```

### 3. Pre-commit 훅 활성화

```bash
npx husky install
```

## 🧪 테스트 실행

### 전체 테스트 실행

```bash
# Frontend
npm run test:ci

# Backend
cd server
npm run test:ci
```

### 개별 테스트 실행

```bash
# Lint 검사
npm run lint

# Type 체크
npm run typecheck

# Format 검사
npm run format

# 보안 스캔
npm run semgrep

# 의존성 검사
npm run depcheck

# 환경변수 검증
npm run env:verify
```

## 📊 CI/CD 파이프라인 설명

### 1. build-test-quality Job

- 코드 품질 검사 (Lint, Type, Format)
- 보안 스캔 (Semgrep)
- 의존성 검사 (Depcheck)
- 단위 테스트 및 계약 테스트
- 빌드 검증

### 2. security-scan Job

- 보안 취약점 스캔
- 의존성 보안 검사
- 코드 보안 패턴 검사

### 3. e2e-tests Job (PR에서만)

- Cypress E2E 테스트 실행
- 실제 사용자 시나리오 검증

### 4. deploy-preview Job (PR에서만)

- Vercel Preview 배포
- 변경사항 미리보기

### 5. deploy-production Job (main 브랜치에서만)

- Vercel Production 배포
- Railway Backend 배포

## 🚨 실패 시 대응 방법

### Lint 실패

```bash
npm run lint:fix
git add .
git commit -m "fix: lint errors"
```

### Format 실패

```bash
npm run format:fix
git add .
git commit -m "fix: format issues"
```

### Type 실패

- TypeScript 오류 수정 후 재커밋

### Test 실패

- 테스트 코드 수정 후 재커밋

### Build 실패

- 빌드 오류 수정 후 재커밋

### Security 실패

- 보안 취약점 해결 후 재커밋

## 📈 모니터링 및 알림

### 1. GitHub Actions 대시보드

- Repository → Actions 탭에서 실행 상태 확인

### 2. Vercel 대시보드

- 배포 상태 및 성능 모니터링

### 3. Railway 대시보드

- Backend 서버 상태 모니터링

## 🔄 지속적 개선

### 1. Semgrep 룰 추가

- `.semgrep/ci.yml`에 새로운 보안 패턴 추가
- 과거 오류 패턴을 기반으로 룰 개선

### 2. 테스트 커버리지 향상

- Jest 설정에서 커버리지 임계값 조정
- 새로운 테스트 케이스 추가

### 3. E2E 테스트 확장

- `cypress/e2e/`에 새로운 시나리오 추가
- 사용자 플로우 테스트 강화

## 📚 추가 리소스

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Vercel 배포 가이드](https://vercel.com/docs)
- [Railway 배포 가이드](https://docs.railway.app/)
- [Cypress 테스트 가이드](https://docs.cypress.io/)
- [Pact 계약 테스트 가이드](https://docs.pact.io/)
