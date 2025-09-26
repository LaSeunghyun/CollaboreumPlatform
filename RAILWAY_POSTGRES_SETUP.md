# Railway PostgreSQL 설정 가이드

## 문제 상황

Railway에 배포된 서버가 PostgreSQL 연결에 실패하거나 `DATABASE_URL` 환경 변수가 누락되었다는 메시지를 출력할 수 있습니다.

```
⚠️  PostgreSQL 연결 실패 - DATABASE_URL 환경변수를 확인하세요
```

## 해결 방법

### 1. Railway 대시보드에서 환경 변수 설정

Railway 프로젝트 대시보드에서 다음 환경 변수를 설정하세요.

#### 필수 환경 변수

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
PRISMA_MAX_RETRIES=5
PRISMA_RETRY_DELAY_MS=2000
```

#### 선택 환경 변수

```
CLIENT_URL=https://your-frontend-domain.com
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 2. Railway PostgreSQL 플러그인 프로비저닝

1. Railway 대시보드에서 **Add Plugin** → **PostgreSQL**을 선택합니다.
2. 생성된 데이터베이스의 "Connect" 탭에서 `DATABASE_URL` 값을 확인합니다.
3. 복사한 값을 서비스의 환경 변수에 붙여넣습니다.
4. Prisma 스키마(`prisma/schema.prisma`)를 기반으로 마이그레이션이 필요한 경우 `npx prisma migrate deploy`를 실행합니다.

### 3. 연결 문자열 형식

```
postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public
```

- `USER` / `PASSWORD`: Railway가 생성한 자격 증명입니다.
- `HOST`: Railway가 제공한 호스트명 (예: `containers-us-west-12.railway.app`).
- `5432`: 기본 PostgreSQL 포트.
- `schema`: 기본적으로 `public`을 사용합니다.

### 4. Health Check 및 재시도 설정

- `/api/health` 엔드포인트는 Prisma를 통해 데이터베이스 상태를 확인합니다.
- `PRISMA_MAX_RETRIES`와 `PRISMA_RETRY_DELAY_MS` 값으로 연결 재시도 횟수와 간격을 조정할 수 있습니다.

### 5. 배포 재시작

환경 변수 설정 후:

1. Railway에서 **Deploy** 버튼을 눌러 재배포를 트리거합니다.
2. 자동 재배포가 시작될 때까지 기다립니다.

### 6. 로그 확인

Railway 대시보드의 **Deployments** 탭에서 로그를 확인하여 Prisma 연결 성공 여부를 검증하세요.

## 주의사항

- 비밀번호에 특수 문자가 포함된 경우 URL 인코딩이 필요할 수 있습니다.
- PostgreSQL 인스턴스가 일시 중단되었다면 Railway 대시보드에서 재시작하세요.
- 마이그레이션이 필요한 경우 CI/CD 파이프라인에서 `npx prisma migrate deploy`를 실행하도록 구성하는 것이 좋습니다.
