# Collaboreum Admin MVP 설계 문서

## 개요
Collaboreum은 독립 아티스트와 팬이 협업 및 후원을 통해 지속 가능한 창작 생태계를 만드는 플랫폼입니다. 본 문서는 플랫폼 운영을 위한 관리자(Admin) 패널의 MVP 설계를 다룹니다.

---

## 1. 기능별 상세 기획서

### 1.1 회원 관리 (User Management)
**목적**: 플랫폼 회원의 전반적인 활동을 모니터링하고 관리

**주요 기능**:
- 회원 목록 조회 및 검색/필터링
- 회원 상태 관리 (활성/정지/탈퇴)
- 신고 처리 및 제재 관리
- 회원 가입 추이 모니터링

**운영자 액션**:
- 회원 정지/해제
- 신고 접수 처리
- 회원 상세 정보 열람
- 활동 로그 확인

### 1.2 아티스트 관리 (Artist Management)
**목적**: 아티스트 등록 요청 관리 및 프로필 검수

**주요 기능**:
- 아티스트 등록 신청 승인/반려
- 포트폴리오 및 프로필 검수
- 아티스트 활동 현황 모니터링
- 이벤트 일정 관리

**운영자 액션**:
- 등록 신청 검토 및 승인
- 포트폴리오 품질 검수
- 프로필 정보 수정 요청
- 활동 제재 조치

### 1.3 펀딩/후원 관리 (Funding Management)
**목적**: 펀딩 프로젝트의 전체 생명주기 관리

**주요 기능**:
- 프로젝트 제안 승인/반려
- 펀딩 진행 현황 모니터링
- 후원자 관리 및 환불 처리
- 목표 달성률 추적

**운영자 액션**:
- 프로젝트 심사 및 승인
- 부적절한 프로젝트 제재
- 환불 요청 처리
- 정산 승인

### 1.4 커뮤니티 관리 (Community Management)
**목적**: 건전한 커뮤니티 환경 조성

**주요 기능**:
- 게시글/댓글 신고 처리
- 스팸/광고성 콘텐츠 관리
- 카테고리별 활동량 모니터링
- 라이브 스트리밍 모니터링

**운영자 액션**:
- 부적절한 콘텐츠 삭제
- 사용자 경고/제재
- 커뮤니티 가이드라인 적용
- 실시간 모니터링

### 1.5 수익 관리 (Revenue Management)
**목적**: 플랫폼 수익 구조 관리 및 정산

**주요 기능**:
- 수익 분배 관리
- 아티스트 정산 요청 검토
- 포인트 시스템 관리
- 재무 리포트 생성

**운영자 액션**:
- 정산 승인/반려
- 포인트 지급/회수
- 수수료 정책 적용
- 세무 관련 문서 관리

---

## 2. DB 스키마 설계

### 2.1 핵심 테이블 구조

```sql
-- 회원 테이블
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'fan',
    status user_status NOT NULL DEFAULT 'active',
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_investment DECIMAL(12,2) DEFAULT 0,
    funding_count INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 아티스트 프로필 테이블
CREATE TABLE artist_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    stage_name VARCHAR(100),
    category artist_category NOT NULL,
    bio TEXT,
    portfolio_url TEXT,
    social_links JSONB,
    verification_status verification_status DEFAULT 'pending',
    approval_date TIMESTAMP,
    approved_by BIGINT REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 펀딩 프로젝트 테이블
CREATE TABLE funding_projects (
    id BIGSERIAL PRIMARY KEY,
    artist_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category project_category NOT NULL,
    goal_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    backer_count INTEGER DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status project_status DEFAULT 'draft',
    approval_status approval_status DEFAULT 'pending',
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT REFERENCES admin_users(id),
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 후원 테이블
CREATE TABLE funding_pledges (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES funding_projects(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    reward_tier VARCHAR(100),
    status pledge_status DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    pledged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- 신고 테이블
CREATE TABLE reports (
    id BIGSERIAL PRIMARY KEY,
    reporter_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    reported_content_type content_type NOT NULL,
    reported_content_id BIGINT NOT NULL,
    reason report_reason NOT NULL,
    description TEXT,
    status report_status DEFAULT 'pending',
    assigned_to BIGINT REFERENCES admin_users(id),
    resolved_at TIMESTAMP,
    resolution_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 관리자 테이블
CREATE TABLE admin_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role admin_role NOT NULL DEFAULT 'operator',
    permissions JSONB,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 수익 분배 테이블
CREATE TABLE revenue_distributions (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES funding_projects(id) ON DELETE CASCADE,
    total_revenue DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    artist_payout DECIMAL(12,2) NOT NULL,
    investor_returns DECIMAL(12,2) NOT NULL,
    distribution_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status distribution_status DEFAULT 'pending',
    approved_by BIGINT REFERENCES admin_users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 포인트 트랜잭션 테이블
CREATE TABLE point_transactions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES funding_projects(id),
    amount INTEGER NOT NULL,
    transaction_type point_transaction_type NOT NULL,
    description TEXT,
    status transaction_status DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 ENUM 타입 정의

```sql
-- 사용자 역할
CREATE TYPE user_role AS ENUM ('fan', 'artist', 'admin');

-- 사용자 상태
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending', 'deactivated');

-- 아티스트 카테고리
CREATE TYPE artist_category AS ENUM ('music', 'art', 'film', 'literature', 'photography', 'design', 'performance');

-- 검증 상태
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

-- 프로젝트 카테고리
CREATE TYPE project_category AS ENUM ('album', 'single', 'exhibition', 'film', 'book', 'photography', 'performance');

-- 프로젝트 상태
CREATE TYPE project_status AS ENUM ('draft', 'active', 'successful', 'failed', 'cancelled');

-- 승인 상태
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'under_review');

-- 후원 상태
CREATE TYPE pledge_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- 신고 관련
CREATE TYPE content_type AS ENUM ('user', 'project', 'post', 'comment', 'live_stream');
CREATE TYPE report_reason AS ENUM ('spam', 'harassment', 'inappropriate_content', 'fraud', 'copyright', 'other');
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- 관리자 역할
CREATE TYPE admin_role AS ENUM ('super_admin', 'operator', 'finance', 'community_manager');

-- 수익 분배 상태
CREATE TYPE distribution_status AS ENUM ('pending', 'approved', 'distributed', 'failed');

-- 포인트 거래 타입
CREATE TYPE point_transaction_type AS ENUM ('earned', 'spent', 'refunded', 'bonus', 'penalty');

-- 거래 상태
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
```

---

## 3. API 설계

### 3.1 인증 및 권한 관리

```typescript
// 관리자 로그인
POST /admin/auth/login
{
  "email": "admin@collaboreum.com",
  "password": "secure_password",
  "mfa_code": "123456" // 2FA 코드 (옵션)
}

// 응답
{
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "admin": {
      "id": 1,
      "name": "관리자",
      "email": "admin@collaboreum.com",
      "role": "super_admin",
      "permissions": ["user_management", "funding_management", "finance"]
    }
  }
}
```

### 3.2 회원 관리 API

```typescript
// 회원 목록 조회
GET /admin/users?page=1&limit=20&status=active&search=김민수&sort=join_date&order=desc

// 응답
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "김민수",
        "email": "minsu@example.com",
        "role": "artist",
        "status": "active",
        "join_date": "2025-03-15T00:00:00Z",
        "last_activity": "2025-08-09T15:30:00Z",
        "total_investment": 2500000,
        "funding_count": 3,
        "report_count": 0
      }
    ],
    "pagination": {
      "total": 850,
      "page": 1,
      "limit": 20,
      "total_pages": 43
    }
  }
}

// 회원 상태 변경
PATCH /admin/users/:id/status
{
  "status": "suspended",
  "reason": "신고 누적으로 인한 계정 정지",
  "duration_days": 7
}

// 회원 상세 정보 조회
GET /admin/users/:id
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "김민수",
      "email": "minsu@example.com",
      "role": "artist",
      "status": "active",
      "join_date": "2025-03-15T00:00:00Z",
      "last_activity": "2025-08-09T15:30:00Z",
      "profile": {
        "stage_name": "MinSu",
        "category": "music",
        "bio": "독립 싱어송라이터입니다.",
        "verification_status": "approved"
      },
      "activity_stats": {
        "total_investment": 2500000,
        "funding_count": 3,
        "projects_created": 2,
        "community_posts": 15
      },
      "reports": []
    }
  }
}
```

### 3.3 펀딩 관리 API

```typescript
// 펀딩 프로젝트 목록 조회
GET /admin/funding/projects?status=active&approval_status=pending&page=1&limit=20

// 응답
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": 1,
        "title": "첫 번째 정규앨범 'Dreams'",
        "artist": {
          "id": 1,
          "name": "김민수",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "category": "album",
        "goal_amount": 5000000,
        "current_amount": 3750000,
        "backer_count": 125,
        "progress_percentage": 75,
        "end_date": "2025-09-15T23:59:59Z",
        "status": "active",
        "approval_status": "approved",
        "submission_date": "2025-07-20T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 20,
      "total_pages": 8
    }
  }
}

// 프로젝트 승인/반려
PATCH /admin/funding/projects/:id/approval
{
  "approval_status": "approved",
  "feedback": "모든 요구사항을 충족합니다. 승인됩니다.",
  "conditions": []
}

// 프로젝트 상세 정보 조회
GET /admin/funding/projects/:id
{
  "success": true,
  "data": {
    "project": {
      "id": 1,
      "title": "첫 번째 정규앨범 'Dreams'",
      "description": "10년간 준비한 첫 정규앨범을 발매하고 싶습니다...",
      "artist": {
        "id": 1,
        "name": "김민수",
        "stage_name": "MinSu",
        "category": "music"
      },
      "funding_details": {
        "goal_amount": 5000000,
        "current_amount": 3750000,
        "backer_count": 125,
        "progress_percentage": 75,
        "start_date": "2025-08-01T00:00:00Z",
        "end_date": "2025-09-15T23:59:59Z"
      },
      "rewards": [
        {
          "tier": "후원자",
          "amount": 10000,
          "description": "디지털 앨범 + 감사 메시지",
          "backer_count": 80
        }
      ],
      "financials": {
        "budget_breakdown": {
          "recording": 2000000,
          "mixing_mastering": 1500000,
          "marketing": 1000000,
          "manufacturing": 500000
        },
        "revenue_sharing": {
          "artist": 70,
          "investors": 20,
          "platform": 10
        }
      }
    }
  }
}
```

### 3.4 대시보드 통계 API

```typescript
// 대시보드 메트릭 조회
GET /admin/dashboard/metrics

// 응답
{
  "success": true,
  "data": {
    "user_metrics": {
      "total_users": 850,
      "new_users_this_week": 47,
      "active_artists": 128,
      "user_growth_rate": 12.5
    },
    "funding_metrics": {
      "active_projects": 23,
      "successful_projects_this_month": 32,
      "total_funded_amount": 48900000,
      "success_rate": 78.5
    },
    "revenue_metrics": {
      "monthly_revenue": 48900000,
      "platform_fees": 4890000,
      "pending_payouts": 2100000,
      "growth_rate": 15.2
    },
    "community_metrics": {
      "pending_reports": 3,
      "posts_this_week": 156,
      "active_discussions": 42,
      "moderation_queue": 8
    }
  }
}

// 사용자 증가 추이 데이터
GET /admin/analytics/user-growth?period=monthly&months=8

// 응답
{
  "success": true,
  "data": [
    {
      "month": "2025-01",
      "total_users": 120,
      "new_users": 30,
      "artists": 25,
      "new_artists": 8
    },
    {
      "month": "2025-02",
      "total_users": 180,
      "new_users": 60,
      "artists": 32,
      "new_artists": 7
    }
  ]
}

// 펀딩 성과 데이터
GET /admin/analytics/funding-performance?period=monthly&months=8

// 응답
{
  "success": true,
  "data": [
    {
      "month": "2025-01",
      "successful_projects": 8,
      "failed_projects": 3,
      "total_amount": 15420000,
      "success_rate": 72.7
    }
  ]
}
```

### 3.5 신고 관리 API

```typescript
// 신고 목록 조회
GET /admin/reports?status=pending&type=user&page=1&limit=20

// 신고 처리
PATCH /admin/reports/:id/resolve
{
  "resolution": "warning_issued",
  "action_taken": "사용자에게 경고 발송",
  "notes": "첫 번째 경고이므로 계정 정지 없이 경고로 처리"
}
```

---

## 4. React Admin UI 구조

### 4.1 컴포넌트 계층 구조

```
AdminDashboard/
├── AdminLayout.tsx              # 공통 레이아웃
├── MetricsCard.tsx             # 메트릭 카드 컴포넌트
├── charts/
│   ├── UserGrowthChart.tsx     # 사용자 증가 차트
│   ├── FundingChart.tsx        # 펀딩 현황 차트
│   └── RevenueChart.tsx        # 수익 분배 차트
├── tables/
│   ├── UserManagementTable.tsx # 회원 관리 테이블
│   ├── FundingManagementTable.tsx # 펀딩 관리 테이블
│   └── ReportManagementTable.tsx # 신고 관리 테이블
└── forms/
    ├── UserStatusModal.tsx     # 회원 상태 변경 모달
    └── ProjectApprovalModal.tsx # 프로젝트 승인 모달
```

### 4.2 주요 컴포넌트 예시

현재 구현된 Admin Dashboard는 다음과 같은 주요 기능을 포함합니다:

1. **대시보드 개요**: 핵심 메트릭과 차트를 통한 현황 파악
2. **회원 관리**: 회원 목록, 검색, 상태 관리 기능
3. **펀딩 관리**: 프로젝트 승인, 진행 상황 모니터링
4. **수익 관리**: 재정 현황 및 정산 관리
5. **커뮤니티 관리**: 신고 처리 및 콘텐츠 관리

---

## 5. 대시보드 차트 위젯 설계

### 5.1 사용자 증가 추이 차트
- **목적**: 플랫폼 성장 모니터링
- **데이터**: 월별 총 사용자 수, 신규 가입자, 아티스트 수
- **차트 타입**: Line Chart
- **주요 지표**: 성장률, 아티스트 비율

### 5.2 펀딩 프로젝트 현황 차트
- **목적**: 펀딩 성공률 및 트렌드 파악
- **데이터**: 월별 성공/실패 프로젝트 수
- **차트 타입**: Bar Chart
- **주요 지표**: 성공률, 평균 펀딩 금액

### 5.3 수익 분배 현황 차트
- **목적**: 플랫폼 수익 구조 시각화
- **데이터**: 총 매출, 플랫폼 수수료, 아티스트 정산, 투자자 수익
- **차트 타입**: Stacked Area Chart
- **주요 지표**: 수익 성장률, 분배 비율

### 5.4 커뮤니티 활동 지표
- **목적**: 커뮤니티 건전성 모니터링
- **데이터**: 게시글 수, 댓글 수, 신고 건수, 제재 조치
- **차트 타입**: Multi-metric Dashboard
- **주요 지표**: 활동 증가율, 신고 처리 시간

---

## 6. 보안 및 권한 관리

### 6.1 접근 권한 체계
```typescript
interface AdminPermissions {
  user_management: boolean;      // 회원 관리
  artist_approval: boolean;      // 아티스트 승인
  funding_oversight: boolean;    // 펀딩 관리
  finance_access: boolean;       // 재무 정보 접근
  community_moderation: boolean; // 커뮤니티 관리
  system_admin: boolean;         // 시스템 관리
}

interface AdminRole {
  id: string;
  name: string;
  permissions: AdminPermissions;
}

const adminRoles: AdminRole[] = [
  {
    id: "super_admin",
    name: "최고 관리자",
    permissions: {
      user_management: true,
      artist_approval: true,
      funding_oversight: true,
      finance_access: true,
      community_moderation: true,
      system_admin: true
    }
  },
  {
    id: "finance_manager",
    name: "재무 담당자",
    permissions: {
      user_management: false,
      artist_approval: false,
      funding_oversight: true,
      finance_access: true,
      community_moderation: false,
      system_admin: false
    }
  },
  {
    id: "community_manager",
    name: "커뮤니티 매니저",
    permissions: {
      user_management: true,
      artist_approval: true,
      funding_oversight: false,
      finance_access: false,
      community_moderation: true,
      system_admin: false
    }
  }
];
```

### 6.2 보안 기능
- **2FA 인증**: 관리자 로그인 시 필수
- **감사 로그**: 모든 관리자 행동 기록
- **세션 관리**: 일정 시간 후 자동 로그아웃
- **IP 제한**: 특정 IP 대역에서만 접근 허용

---

## 7. 알림 시스템

### 7.1 실시간 알림
```typescript
interface AdminNotification {
  id: string;
  type: 'urgent' | 'warning' | 'info';
  title: string;
  message: string;
  action_required: boolean;
  created_at: string;
  read: boolean;
}

// 알림 유형별 예시
const notificationTypes = {
  funding_deadline: "펀딩 마감 24시간 전",
  report_accumulation: "신고 누적 사용자 발생",
  payment_delay: "정산 지연 발생",
  system_alert: "시스템 오류 감지",
  high_volume_activity: "비정상적 활동 감지"
};
```

---

## 8. 성능 및 최적화

### 8.1 데이터 최적화
- **페이지네이션**: 대용량 데이터 처리
- **인덱싱**: 자주 검색되는 필드에 인덱스 적용
- **캐싱**: 자주 사용되는 통계 데이터 캐싱
- **실시간 업데이트**: WebSocket을 통한 실시간 데이터 동기화

### 8.2 UI/UX 최적화
- **지연 로딩**: 큰 테이블의 점진적 로딩
- **필터링**: 실시간 검색 및 필터 기능
- **반응형 디자인**: 다양한 화면 크기 지원
- **접근성**: WCAG 가이드라인 준수

---

## 9. 배포 및 모니터링

### 9.1 배포 전략
- **환경 분리**: 개발/스테이징/프로덕션 환경
- **CI/CD**: 자동화된 배포 파이프라인
- **롤백 계획**: 문제 발생 시 즉시 롤백 가능

### 9.2 모니터링 및 로깅
- **성능 모니터링**: 응답 시간, 오류율 추적
- **사용자 행동 분석**: 관리자 패널 사용 패턴 분석
- **보안 모니터링**: 비정상 접근 시도 감지

---

## 10. 향후 확장 계획

### 10.1 Phase 2 기능
- **AI 기반 콘텐츠 모더레이션**: 자동 스팸/부적절 콘텐츠 감지
- **예측 분석**: 펀딩 성공률 예측, 사용자 이탈 예측
- **자동화된 정산**: 스마트 컨트랙트 기반 자동 수익 분배

### 10.2 통합 기능
- **외부 결제 시스템 연동**: 다양한 결제 방식 지원
- **소셜 미디어 통합**: 외부 플랫폼 활동 모니터링
- **이메일 마케팅 도구**: 자동화된 사용자 커뮤니케이션

---

이 설계 문서는 Collaboreum Admin MVP의 핵심 기능과 구조를 정의하며, 단계적 개발과 확장이 가능하도록 설계되었습니다. 각 기능은 독립적으로 개발 및 배포 가능하며, 사용자 피드백을 바탕으로 지속적으로 개선될 예정입니다.