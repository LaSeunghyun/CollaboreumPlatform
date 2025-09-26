# Railway 배포 가이드

## 🚀 Railway 배포 설정

### 1. 환경 변수 설정

Railway 대시보드에서 다음 환경 변수들을 설정해야 합니다:

#### 필수 환경 변수

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PRISMA_MAX_RETRIES=5
PRISMA_RETRY_DELAY_MS=2000
```

#### 선택적 환경 변수

```
CLIENT_URL=https://your-frontend-domain.com
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 2. Railway PostgreSQL 데이터베이스 설정

1. Railway 대시보드에서 **Add Plugin** → **PostgreSQL** 선택
2. 자동으로 생성된 데이터베이스의 연결 정보를 확인
3. `DATABASE_URL` 값을 복사하여 서비스 환경 변수에 추가
4. 필요 시 Prisma 스키마(`prisma/schema.prisma`)를 기반으로 `npx prisma migrate deploy` 실행

### 3. Railway 프로젝트 설정

1. Railway 대시보드에서 새 프로젝트 생성
2. GitHub 저장소 연결
3. 환경 변수 설정
4. 배포 시작

### 4. 배포 확인

배포가 완료되면 다음 엔드포인트로 확인:

- Health Check: `https://your-app.railway.app/api/health`
- API Base URL: `https://your-app.railway.app/api/`

### 5. 문제 해결

#### 일반적인 문제들:

1. **환경 변수 누락**
   - Railway 대시보드에서 모든 필수 환경 변수가 설정되었는지 확인

2. **PostgreSQL 연결 실패**
   - Railway PostgreSQL 인스턴스가 실행 중인지 확인
   - `DATABASE_URL` 값이 정확한지 검증 (비밀번호, 포트, 데이터베이스 이름)
   - Prisma 연결 재시도 환경 변수(`PRISMA_MAX_RETRIES`, `PRISMA_RETRY_DELAY_MS`)를 조정

3. **포트 문제**
   - Railway는 자동으로 PORT 환경 변수를 설정
   - 서버 코드에서 `process.env.PORT` 사용 확인

4. **빌드 실패**
   - package.json의 의존성 확인
   - Node.js 버전 호환성 확인

### 6. 로그 확인

Railway 대시보드의 "Deployments" 탭에서 배포 로그를 확인할 수 있습니다.

### 7. 자동 배포 설정

GitHub 저장소에 푸시할 때마다 자동으로 배포되도록 설정할 수 있습니다.
