# PostgreSQL 설정 가이드 (서버)

이 문서는 Collaboreum 서버에서 PostgreSQL과 Prisma를 구성하는 방법을 안내합니다.

## 1. 필수 환경 변수

`.env` 파일 또는 Railway/Vercel 환경 변수에 다음 값을 설정하세요.

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public
PRISMA_MAX_RETRIES=5
PRISMA_RETRY_DELAY_MS=2000
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
```

`DATABASE_URL`은 Prisma 클라이언트가 사용하는 표준 PostgreSQL 연결 문자열입니다. Railway PostgreSQL 플러그인을 생성하면 제공되는 값을 그대로 사용하면 됩니다.

## 2. 로컬 개발 환경 준비

1. PostgreSQL 설치 (예: [Postgres.app](https://postgresapp.com/), `brew install postgresql`, Docker 등)
2. 데이터베이스 생성:
   ```bash
   createdb collaboreum
   ```
3. `.env` 파일에 로컬 접속 정보를 추가:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/collaboreum?schema=public
   ```
4. Prisma 스키마를 동기화:
   ```bash
   npx prisma db push
   ```

## 3. 배포 환경

- **Railway**: PostgreSQL 플러그인에서 제공되는 `DATABASE_URL`을 그대로 사용합니다.
- **Vercel**: 백엔드는 Railway에 배포하고, Vercel에는 API URL만 설정합니다.
- **헬스체크**: `/api/health` 엔드포인트가 Prisma를 통해 데이터베이스 연결 상태를 반환합니다.

## 4. 유용한 Prisma 명령어

| 명령어 | 설명 |
| --- | --- |
| `npx prisma migrate dev` | 로컬 개발 중 마이그레이션 생성 |
| `npx prisma migrate deploy` | 배포 환경에서 마이그레이션 적용 |
| `npx prisma generate` | Prisma Client 재생성 |
| `npx prisma studio` | 브라우저에서 데이터 탐색 |

## 5. 문제 해결

- **연결 실패**: `DATABASE_URL` 호스트/포트/비밀번호가 올바른지 확인하세요.
- **타임아웃**: `PRISMA_MAX_RETRIES`, `PRISMA_RETRY_DELAY_MS` 값을 조정해 재시도 정책을 변경합니다.
- **권한 오류**: PostgreSQL 사용자에게 데이터베이스 권한이 있는지 확인하세요.

## 6. 마이그레이션 전략

현재 `prisma/schema.prisma`에는 데이터 소스와 클라이언트 설정만 정의되어 있습니다. 마이그레이션을 추가하려면 `prisma/migrations` 디렉터리에서 Prisma CLI를 사용해 스키마를 정의하고, CI/CD 파이프라인에서 `npx prisma migrate deploy`를 실행하세요.

---

Prisma 기반의 연결 초기화는 `server/config/database.js`에서 수행하며, 서버 시작 스크립트(`start.js`)에서도 동일한 연결 확인 로직을 재사용합니다.
