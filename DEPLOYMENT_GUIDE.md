# Collaboreum 배포 가이드

## 개요

이 문서는 Collaboreum 플랫폼의 배포 및 운영에 대한 종합적인 가이드입니다.

## 아키텍처

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Vercel)      │◄──►│   (Railway)     │◄──►│   (MongoDB)     │
│   React + TS    │    │   Node + Express│    │   Atlas         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN           │    │   Redis Cache   │    │   File Storage  │
│   (Vercel Edge) │    │   (Railway)     │    │   (Cloudinary)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 환경 설정

### 1. 환경 변수

#### 프론트엔드 (Vercel)

```bash
REACT_APP_API_URL=https://collaboreumplatform-production.up.railway.app/api
REACT_APP_ENVIRONMENT=production
```

#### 백엔드 (Railway)

```bash
# 데이터베이스
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/collaboreum
REDIS_HOST=redis.railway.internal
REDIS_PORT=6379

# 인증
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# 파일 업로드
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 외부 서비스
PAYMENT_GATEWAY_API_KEY=your-payment-key
EMAIL_SERVICE_API_KEY=your-email-key

# 보안
CORS_ORIGIN=https://collaboreum-platform.vercel.app/
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 모니터링
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn
```

### 2. 데이터베이스 설정

#### MongoDB Atlas 설정

1. 클러스터 생성
2. 네트워크 액세스 설정 (Railway IP 허용)
3. 데이터베이스 사용자 생성
4. 연결 문자열 생성

#### 인덱스 생성

```javascript
// 펀딩 프로젝트 인덱스
db.fundingprojects.createIndex({ status: 1, endDate: 1 });
db.fundingprojects.createIndex({ ownerId: 1, status: 1 });
db.fundingprojects.createIndex({ categoryId: 1, status: 1 });
db.fundingprojects.createIndex({ tags: 1 });
db.fundingprojects.createIndex({ isActive: 1, isFeatured: 1 });
db.fundingprojects.createIndex({ createdAt: -1 });
db.fundingprojects.createIndex({ targetAmount: 1 });
db.fundingprojects.createIndex({ currentAmount: 1 });

// 텍스트 검색 인덱스
db.fundingprojects.createIndex({
  title: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text',
});

// 후원 인덱스
db.pledges.createIndex({ projectId: 1, userId: 1 });
db.pledges.createIndex({ projectId: 1, status: 1 });
db.pledges.createIndex({ userId: 1, status: 1 });
db.pledges.createIndex({ status: 1, createdAt: 1 });
db.pledges.createIndex({ paymentId: 1 });
db.pledges.createIndex({ idempotencyKey: 1 }, { unique: true });

// 이벤트 로그 인덱스
db.eventlogs.createIndex({ status: 1, nextAttemptAt: 1 });
db.eventlogs.createIndex({ aggregateId: 1, aggregateType: 1 });
db.eventlogs.createIndex({ eventType: 1, status: 1 });
db.eventlogs.createIndex({ createdAt: 1 });
db.eventlogs.createIndex({ processedAt: 1 });
```

## 배포 프로세스

### 1. 자동 배포 (GitHub Actions)

#### PR 생성 시

- 프론트엔드/백엔드 테스트 실행
- 보안 스캔 실행
- E2E 테스트 실행
- 프리뷰 환경 배포

#### Main 브랜치 머지 시

- 모든 테스트 통과 확인
- Docker 이미지 빌드 및 푸시
- 프로덕션 환경 배포
- 성능 테스트 실행
- 알림 발송

### 2. 수동 배포

#### 프론트엔드 (Vercel)

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

#### 백엔드 (Railway)

```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# 배포
railway up
```

### 3. 데이터베이스 마이그레이션

```bash
# 마이그레이션 실행
cd server
node scripts/migration.js up

# 마이그레이션 상태 확인
node scripts/migration.js status

# 마이그레이션 롤백
node scripts/migration.js down 001
```

## 모니터링 및 로깅

### 1. 메트릭 수집

#### 주요 메트릭

- **가용성**: 99.9% 목표
- **응답 시간**: 200ms 이하 목표
- **에러율**: 0.1% 이하 목표
- **처리량**: 초당 요청 수

#### SLO/SLI 대시보드

```javascript
// 메트릭 조회 API
GET / api / metrics;
GET / api / metrics / slo;
GET / api / metrics / alerts;
```

### 2. 로깅

#### 로그 레벨

- **ERROR**: 시스템 오류, 예외 상황
- **WARN**: 경고 상황, 성능 이슈
- **INFO**: 일반적인 비즈니스 이벤트
- **DEBUG**: 개발/디버깅 정보

#### 로그 구조

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "requestId": "req-123",
  "userId": "user-456",
  "event": "PLEDGE_CREATED",
  "data": {
    "projectId": "proj-789",
    "amount": 50000
  }
}
```

### 3. 알람 설정

#### 알람 조건

- 가용성 < 99.9%
- 평균 응답 시간 > 200ms
- 에러율 > 0.1%
- 메모리 사용률 > 90%

#### 알람 채널

- Slack (#alerts)
- 이메일 (admin@collaboreum.com)
- SMS (긴급 상황)

## 보안

### 1. 인증 및 권한

#### JWT 토큰

- 액세스 토큰: 15분 만료
- 리프레시 토큰: 7일 만료
- 키 롤링: 월 1회
- 블랙리스트: Redis 저장

#### 권한 스코프

```javascript
const permissions = {
  admin: ['*'], // 모든 권한
  artist: [
    'user:read',
    'user:write',
    'funding:read',
    'funding:write',
    'community:read',
    'community:write',
  ],
  fan: [
    'user:read',
    'user:write',
    'funding:read',
    'community:read',
    'community:write',
  ],
};
```

### 2. 데이터 보호

#### 암호화

- 전송 중: TLS 1.3
- 저장 시: AES-256
- 비밀번호: bcrypt (salt rounds: 12)

#### PII 보호

- 개인정보 최소 수집
- 감사 로그 별도 저장
- 데이터 보존 정책 적용

### 3. 네트워크 보안

#### CORS 설정

```javascript
const corsOptions = {
  origin: ['https://collaboreum-platform.vercel.app/', 'https://*.vercel.app'],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

#### Rate Limiting

```javascript
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
  skipSuccessfulRequests: true,
};
```

## 백업 및 복구

### 1. 데이터베이스 백업

#### 자동 백업

- 일일 백업 (UTC 02:00)
- 주간 백업 보관 (4주)
- 월간 백업 보관 (12개월)

#### 백업 스크립트

```bash
# 백업 생성
mongodump --uri="$MONGODB_URI" --out=backup/$(date +%Y%m%d)

# 백업 복원
mongorestore --uri="$MONGODB_URI" backup/20240101/
```

### 2. 파일 백업

#### Cloudinary 설정

- 자동 백업 활성화
- 다중 리전 복제
- 버전 관리

### 3. 복구 절차

#### 1단계: 영향도 평가

- 서비스 중단 시간
- 데이터 손실 범위
- 사용자 영향

#### 2단계: 복구 실행

- 백업에서 복원
- 서비스 재시작
- 데이터 무결성 검증

#### 3단계: 모니터링

- 서비스 상태 확인
- 성능 메트릭 모니터링
- 사용자 피드백 수집

## 성능 최적화

### 1. 프론트엔드 최적화

#### 번들 최적화

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

#### 캐싱 전략

- 정적 자산: 1년 캐시
- API 응답: 5분 캐시
- 사용자 데이터: 세션 기반

### 2. 백엔드 최적화

#### 데이터베이스 최적화

- 인덱스 최적화
- 쿼리 최적화
- 연결 풀링

#### 캐싱 전략

```javascript
// Redis 캐싱
const cacheKey = `project:${projectId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const project = await FundingProject.findById(projectId);
await redis.setex(cacheKey, 300, JSON.stringify(project)); // 5분 캐시
```

### 3. CDN 최적화

#### Vercel Edge Functions

```javascript
// 이미지 최적화
export default function handler(req, res) {
  const { url, w, h, q } = req.query;

  const optimizedUrl = `https://images.weserv.nl/?url=${url}&w=${w}&h=${h}&q=${q}`;

  res.redirect(optimizedUrl);
}
```

## 트러블슈팅

### 1. 일반적인 문제

#### 데이터베이스 연결 실패

```bash
# 연결 상태 확인
mongo --eval "db.adminCommand('ping')"

# 연결 문자열 검증
echo $MONGODB_URI
```

#### 메모리 부족

```bash
# 메모리 사용량 확인
free -h
ps aux --sort=-%mem | head

# Node.js 힙 덤프
kill -USR2 <pid>
```

#### 느린 쿼리

```javascript
// MongoDB 프로파일링 활성화
db.setProfilingLevel(2, { slowms: 100 });

// 느린 쿼리 조회
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

### 2. 로그 분석

#### 에러 로그 검색

```bash
# 최근 에러 로그
grep "ERROR" logs/app.log | tail -20

# 특정 사용자 로그
grep "userId.*123" logs/app.log
```

#### 성능 로그 분석

```bash
# 느린 요청 분석
grep "duration.*[5-9][0-9][0-9][0-9]" logs/app.log
```

## 운영 체크리스트

### 일일 체크리스트

- [ ] 서비스 가용성 확인
- [ ] 에러율 모니터링
- [ ] 응답 시간 확인
- [ ] 디스크 사용량 확인
- [ ] 백업 상태 확인

### 주간 체크리스트

- [ ] 성능 메트릭 분석
- [ ] 보안 로그 검토
- [ ] 용량 계획 검토
- [ ] 의존성 업데이트 확인

### 월간 체크리스트

- [ ] 보안 패치 적용
- [ ] 성능 최적화 검토
- [ ] 백업 복원 테스트
- [ ] 재해 복구 계획 검토

## 연락처

### 개발팀

- 기술 리드: tech-lead@collaboreum.com
- DevOps: devops@collaboreum.com
- 보안: security@collaboreum.com

### 외부 서비스

- Vercel 지원: support@vercel.com
- Railway 지원: support@railway.app
- MongoDB Atlas: support@mongodb.com

---

이 가이드는 지속적으로 업데이트되며, 새로운 기능이나 변경사항이 있을 때마다 갱신됩니다.
