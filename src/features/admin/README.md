# Admin Dashboard System

콜라보리움 플랫폼의 관리자 대시보드 시스템입니다.

## 🏗️ 아키텍처

### 폴더 구조
```
src/features/admin/
├── components/              # UI 컴포넌트
│   ├── AdminDashboard.tsx   # 메인 대시보드
│   ├── AdminLayout.tsx      # 공통 레이아웃
│   ├── MetricsCard.tsx      # 메트릭 카드
│   ├── NotificationCenter.tsx # 알림 센터
│   ├── RealTimeAlerts.tsx   # 실시간 알림
│   ├── LiveSystemMonitor.tsx # 시스템 모니터링
│   ├── PermissionGuard.tsx  # 권한 가드
│   └── sections/            # 섹션별 컴포넌트
│       ├── OverviewSection.tsx
│       ├── UserManagementSection.tsx
│       ├── FundingManagementSection.tsx
│       ├── CommunityManagementSection.tsx
│       ├── ArtworkManagementSection.tsx
│       ├── FinanceManagementSection.tsx
│       └── AnalyticsSection.tsx
├── hooks/                   # 커스텀 훅
│   ├── useAdminData.ts      # 데이터 관리 훅
│   └── useAdminPermissions.ts # 권한 관리 훅
├── services/                # API 서비스
│   └── adminService.ts      # 관리자 API 서비스
├── types/                   # 타입 정의
│   └── index.ts            # 관리자 관련 타입
└── README.md               # 이 파일
```

## 🚀 주요 기능

### 1. 대시보드 개요
- **실시간 메트릭**: 사용자 수, 펀딩 현황, 수익 등
- **시스템 상태**: 서버 상태, 네트워크, 오류율 모니터링
- **최근 활동**: 사용자 활동, 시스템 이벤트 추적

### 2. 사용자 관리
- **회원 목록**: 검색, 필터링, 페이지네이션
- **상태 관리**: 활성/정지/대기/비활성 상태 변경
- **권한 관리**: 역할별 권한 설정

### 3. 펀딩 관리
- **프로젝트 승인**: 펀딩 프로젝트 검토 및 승인/반려
- **진행 현황**: 달성률, 후원자 수, 마감일 추적
- **정산 관리**: 성공한 프로젝트 정산 처리

### 4. 커뮤니티 관리
- **신고 처리**: 사용자 신고 접수 및 처리
- **콘텐츠 관리**: 부적절한 콘텐츠 모니터링
- **활동 통계**: 게시글, 댓글, 토론 현황

### 5. 작품 관리
- **갤러리 관리**: 아티스트 작품 승인/반려
- **카테고리 분류**: 작품 카테고리별 관리
- **품질 관리**: 작품 품질 검토

### 6. 재정 관리
- **수익 분배**: 플랫폼 수수료, 아티스트 정산
- **정산 현황**: 월별 재정 현황 추적
- **보류 결제**: 미정산 금액 관리

### 7. 실시간 알림
- **시스템 알림**: 서버 상태, 오류 알림
- **업무 알림**: 승인 요청, 신고 접수
- **자동 알림**: 마감 임박, 목표 달성

## 🔐 권한 관리

### 역할별 권한
- **super_admin**: 모든 권한
- **operator**: 사용자/아티스트/펀딩/커뮤니티 관리
- **finance**: 펀딩/재정 관리
- **community_manager**: 사용자/아티스트/커뮤니티 관리

### 권한 가드
```tsx
<PermissionGuard permission="userManagement">
  <UserManagementSection />
</PermissionGuard>
```

## 📊 성능 최적화

### 1. 코드 스플리팅
- 섹션별 지연 로딩
- 번들 크기 최적화

### 2. 데이터 최적화
- React Query 캐싱
- 실시간 업데이트
- 페이지네이션

### 3. UI 최적화
- 스켈레톤 로딩
- 에러 바운더리
- 반응형 디자인

## 🛠️ 사용법

### 1. 기본 사용
```tsx
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

function App() {
  return (
    <AdminDashboard onBack={() => window.history.back()} />
  );
}
```

### 2. 권한 체크
```tsx
import { useAdminPermissions } from '@/features/admin/hooks/useAdminPermissions';

function MyComponent() {
  const { canManageUsers, hasPermission } = useAdminPermissions();
  
  if (!canManageUsers) {
    return <div>권한이 없습니다</div>;
  }
  
  return <div>사용자 관리 기능</div>;
}
```

### 3. 데이터 사용
```tsx
import { useUsers, useUpdateUserStatus } from '@/features/admin/hooks/useAdminData';

function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const updateStatus = useUpdateUserStatus();
  
  const handleStatusChange = (userId: string, status: string) => {
    updateStatus.mutate({ userId, status });
  };
  
  // ...
}
```

## 🔧 개발 가이드

### 1. 새로운 섹션 추가
1. `components/sections/` 폴더에 새 컴포넌트 생성
2. `AdminDashboard.tsx`에 탭 추가
3. 권한 가드 적용

### 2. 새로운 API 추가
1. `services/adminService.ts`에 API 함수 추가
2. `hooks/useAdminData.ts`에 훅 추가
3. 컴포넌트에서 사용

### 3. 새로운 권한 추가
1. `types/index.ts`에 권한 타입 추가
2. `hooks/useAdminPermissions.ts`에 권한 로직 추가
3. `PermissionGuard`에서 사용

## 📝 주의사항

1. **타입 안정성**: 모든 API 응답에 타입 정의
2. **에러 처리**: 모든 API 호출에 에러 처리
3. **로딩 상태**: 사용자 경험을 위한 로딩 상태 관리
4. **권한 체크**: 민감한 기능에 권한 가드 적용
5. **성능**: 대용량 데이터 처리를 위한 페이지네이션

## 🚀 향후 계획

1. **AI 기반 모더레이션**: 자동 콘텐츠 검토
2. **예측 분석**: 펀딩 성공률 예측
3. **자동화**: 반복 작업 자동화
4. **모바일 최적화**: 모바일 관리자 앱
5. **실시간 대시보드**: WebSocket 기반 실시간 업데이트
