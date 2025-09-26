# Prisma Data Model Overview

이 문서는 기존 Mongoose 모델을 Prisma 기반 PostgreSQL 스키마로 이전하면서 고려해야 할 뷰 모델 및 서비스 계층 책임을 정리합니다.

## 핵심 개념

- **정규화**: 배열 필드로 표현되던 `Project.tasks`, `FundingProject.rewards`, `CommunityPost.comments` 등을 전용 테이블로 분리했습니다. 각 테이블은 복합 인덱스를 제공하여 검색 성능을 보장합니다.
- **JSONB 활용**: `Payment.metadata`, `Artist.socialLinks`, `Artwork.metadata` 등 Map/Mixed 타입은 PostgreSQL `Json` 컬럼으로 치환하여 유연한 스키마를 유지했습니다.
- **Prisma Enum 공유**: `@prisma/client` 에 정의된 enum 을 재사용하여 프런트엔드와 백엔드가 동일한 상수 집합을 참조할 수 있도록 `server/constants/enums.js` 를 갱신했습니다.

## 서비스 계층으로 이동한 계산 로직

| 대상 | 이전 동작 | 현재 설계 |
| ---- | -------- | -------- |
| 프로젝트 진행률 | Mongoose pre-save 훅에서 `progress` 갱신 | `Project` 모델에 `progress`, `spent` 필드를 유지하고, 서비스 레이어에서 태스크/마일스톤 상태를 기반으로 배치 업데이트. `ProjectTask`/`ProjectMilestone`에 인덱스가 있어 효율적 계산 가능 |
| 펀딩 진행 현황 | pre-save 훅에서 `daysLeft`, `progress`, `status` 조정 | `FundingProject`에 동일 필드를 저장하되, 예약된 잡 또는 서비스 함수(`updateFundingProgress`)가 남은 일수/달성률을 계산하여 갱신 |
| 수익 분배 | Map 필드에서 분배 내역 계산 | `FundingProjectDistribution` 및 `RevenueDistribution` 테이블로 분리. 서비스 계층이 정산 시점에 분배 합계를 계산하고 `RevenueDistribution`의 `processedAt`, `payoutStatus`를 갱신 |
| 라이브 스트림 상태 | pre-save 훅에서 `status` 전환 | `LiveStream` 레코드에 `scheduledAt`, `startedAt`, `endedAt`, `isLive` 필드를 유지하고, 스트림 제어 서비스가 상태 전환을 책임짐 |
| 커뮤니티 반응 수 | 가상 필드에서 길이를 계산 | `CommunityPostReaction`, `TrackLike` 테이블을 통해 COUNT 쿼리 및 캐싱 전략 사용 |

## 뷰 모델 제안

- **ProjectProgressView**: `Project` 와 연관된 `ProjectTask`, `ProjectMilestone` 를 조인하여 진행률, 지연 마일스톤 수를 계산하는 서비스 DTO.
- **FundingDashboardView**: `FundingProject`, `Pledge`, `Payment`, `FundingProjectDistribution` 를 묶어 후원자 수, 평균 후원금, 분배 상태를 요약.
- **RevenuePayoutView**: `RevenueDistribution` 과 `CreatorPayout` 데이터를 조합하여 관리자 화면에 필요한 상태/재시도 가능 여부를 계산.
- **EngagementSnapshot**: `Track`, `TrackLike`, `Artwork` 지표를 합산하여 아티스트 대시보드용 KPI 생성.

이러한 뷰 모델은 Prisma의 `include`/`select` 기능과 서비스 계층의 집계 로직을 결합하여 구현합니다.

## 마이그레이션 팁

1. Prisma Client 생성 후 `@prisma/client` 를 서버와 프런트 공통 유틸에서 재사용합니다.
2. 배열이 테이블로 분리되면서 생성/갱신 시 트랜잭션(`prisma.$transaction`)을 활용하여 일관성을 유지합니다.
3. pre-save 훅 대체 로직은 스케줄러(예: BullMQ)나 서비스 메서드에서 실행하며, 관련 필드에 대한 인덱스를 통해 퍼포먼스를 확보합니다.
