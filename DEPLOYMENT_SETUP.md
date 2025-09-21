# 자동 배포 설정 가이드

## 🚀 GitHub Actions를 통한 자동 배포

이 프로젝트는 GitHub에 푸시할 때마다 자동으로 Vercel(프론트엔드)과 Railway(백엔드)에 배포됩니다.

## 📋 필요한 설정

### 1. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿들을 추가해야 합니다:

#### Vercel 관련

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

#### Railway 관련

```
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_NAME=your_railway_service_name
```

#### 환경 변수

```
REACT_APP_API_URL=https://your-railway-app.railway.app/api
```

### 2. Vercel 토큰 및 ID 얻기

1. **Vercel 토큰**:
   - Vercel 대시보드 > Settings > Tokens
   - "Create Token" 클릭하여 새 토큰 생성

2. **Vercel Org ID**:
   - Vercel 대시보드 > Settings > General
   - "Team ID" 복사

3. **Vercel Project ID**:
   - 프로젝트 페이지 > Settings > General
   - "Project ID" 복사

### 3. Railway 토큰 얻기

1. **Railway 토큰**:
   - Railway 대시보드 > Account Settings > Tokens
   - "New Token" 클릭하여 새 토큰 생성

2. **Railway 서비스 이름**:
   - Railway 프로젝트에서 서비스 이름 확인

## 🔄 배포 프로세스

### 자동 배포 트리거

- `master` 또는 `main` 브랜치에 푸시할 때
- Pull Request가 생성될 때

### 배포 단계

1. **프론트엔드 (Vercel)**:
   - Node.js 18 환경 설정
   - 의존성 설치 (`npm ci`)
   - 프로젝트 빌드 (`npm run build`)
   - Vercel에 프로덕션 배포

2. **백엔드 (Railway)**:
   - Railway CLI를 통한 자동 배포
   - 환경 변수 자동 적용

3. **알림**:
   - 배포 성공/실패 상태 알림

## 🛠️ 수동 배포

### Vercel 수동 배포

```bash
vercel --prod
```

### Railway 수동 배포

```bash
railway up
```

## 📊 배포 상태 확인

### GitHub Actions

- GitHub 저장소 > Actions 탭에서 배포 상태 확인

### Vercel

- Vercel 대시보드에서 배포 로그 및 상태 확인

### Railway

- Railway 대시보드에서 배포 로그 및 상태 확인

## 🔧 문제 해결

### 일반적인 문제들

1. **빌드 실패**:
   - GitHub Actions 로그 확인
   - 로컬에서 `npm run build` 테스트

2. **환경 변수 누락**:
   - GitHub Secrets 확인
   - Vercel/Railway 환경 변수 설정 확인

3. **배포 실패**:
   - 토큰 유효성 확인
   - 권한 설정 확인

### 로그 확인 방법

```bash
# GitHub Actions 로그
gh run list
gh run view [run-id]

# Vercel 로그
vercel logs

# Railway 로그
railway logs
```

## 📝 추가 설정

### 브랜치별 배포

- `master`: 프로덕션 배포
- `develop`: 스테이징 배포
- `feature/*`: 프리뷰 배포

### 환경별 설정

- **Production**: 프로덕션 환경 변수
- **Preview**: 스테이징 환경 변수
- **Development**: 개발 환경 변수
