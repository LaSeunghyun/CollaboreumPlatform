# 데이터베이스 설정

## 🗄️ PostgreSQL 연결 정보

### 프로덕션 데이터베이스 (Railway)

```
postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public
```

> 실제 자격 증명은 Railway PostgreSQL 플러그인에서 제공됩니다. 비밀번호는 안전하게 보관하고, 문서나 이슈에 그대로 공유하지 마세요.

### 연결 정보

- **호스트**: Railway PostgreSQL 인스턴스
- **데이터베이스명**: `collaboreum`
- **스키마**: `public`
- **상태**: ✅ Prisma로 연결 확인 완료

## 🔌 Prisma 연결 설정

### 환경 변수

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/collaboreum?schema=public
PRISMA_MAX_RETRIES=5
PRISMA_RETRY_DELAY_MS=2000
```

### Prisma Client 초기화

```javascript
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

await prisma.$connect();
```

### 연결 해제

```javascript
await prisma.$disconnect();
```

## 🛠️ 마이그레이션 및 스키마 관리

- Prisma 스키마 파일은 `prisma/schema.prisma`에 위치합니다.
- 마이그레이션 적용: `npx prisma migrate deploy`
- 스키마 동기화: `npx prisma db push` (개발 환경에서만 권장)
- 클라이언트 생성: `npx prisma generate`

## 📊 데이터 상태 확인

Prisma 또는 PostgreSQL 클라이언트 툴(예: psql, TablePlus)을 사용해 데이터 상태를 확인할 수 있습니다. 샘플 쿼리:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

## 📝 운영 시 주의사항

1. **보안**: `DATABASE_URL`에는 비밀번호가 포함되어 있으므로 반드시 환경 변수로만 관리하세요.
2. **백업**: Railway에서 제공하는 스냅샷 또는 외부 백업 전략을 수립하세요.
3. **모니터링**: Railway 대시보드에서 연결 상태와 리소스 사용량을 주기적으로 확인하세요.
4. **확장성**: 동시 연결이 많아질 경우 Prisma 풀 설정이나 Railway 플랜 업그레이드를 고려하세요.

## 🚀 배포 시 고려사항

- `start.js`에서 Prisma를 사용해 사전 헬스체크를 수행합니다.
- `/api/health` 엔드포인트는 PostgreSQL 연결 상태를 포함하여 보고합니다.
- CI/CD 파이프라인에서 마이그레이션 적용 명령을 실행하는 것을 권장합니다.

## 📞 문제 해결

연결 문제가 발생하면 다음 항목을 순서대로 확인하세요.

1. Railway PostgreSQL 인스턴스가 실행 중인지 확인
2. `DATABASE_URL`의 자격 증명과 호스트, 포트가 정확한지 검증
3. Prisma 재시도 환경 변수를 조정하여 일시적인 네트워크 오류에 대비
4. 로그(`server/logs` 또는 Railway Deployments 탭)를 확인해 구체적인 에러 메시지 파악
