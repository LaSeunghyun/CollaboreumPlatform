# Prisma 전환 마이그레이션 런북

## 1. 개요
- **목표**: MongoDB(Mongoose) 기반 컬렉션을 Prisma 기반 RDB 스키마로 이전하면서 데이터 정합성과 참조 관계를 유지합니다.
- **범위**: 사용자 → 아티스트 → 프로젝트 → 펀딩 → 결제까지 주요 도메인을 포함합니다.
- **도구**: `server/scripts/migrate-mongo-to-prisma.js` 스크립트, Prisma Client, Mongoose, `reports/prisma-id-mapping.json` 출력 파일.

## 2. 실행 순서 및 트랜잭션 전략
| 단계 | 설명 | 트랜잭션 범위 |
| --- | --- | --- |
| 1 | 사용자(`User`) 마이그레이션. Prisma `user` 테이블에 생성. | Prisma 배치 트랜잭션(기본 50건). |
| 2 | 아티스트(`Artist`) 마이그레이션. 사용자 FK 매핑 확인. | 사용자 기준 FK 검증 후 배치 트랜잭션. |
| 3 | 프로젝트(`Project`) 마이그레이션. `tasks`, `milestones`, `team`, `notes` 서브도큐먼트를 정규화. | 프로젝트 단위 트랜잭션. |
| 4 | 펀딩(`FundingProject`) 마이그레이션. `rewards`, `backers`, `executionPlan.stages`, `expenseRecords`, `revenueDistribution.distributions`, `updates` 정규화. | 펀딩 프로젝트 단위 트랜잭션. |
| 5 | 결제(`Payment`) 마이그레이션. 백커 및 리워드 FK 확인. | 결제 단위 트랜잭션. |

- 스크립트 실행 시 `--dry-run`, `--limit` 플래그로 사전 검증 가능.
- Prisma 트랜잭션은 Interactive Transaction 모드를 사용하며, FK가 포함된 엔터티는 동일 트랜잭션에서 생성합니다.

## 3. ID 매핑 전략
- 모든 Mongo ObjectId는 `reports/prisma-id-mapping.json`에 기록됩니다.
- 매핑 구조: `{ collections: { user: [{ legacyId, prismaId }], ... } }`.
- 마이그레이션 스크립트는 FK 참조 시 `resolveMapping()`을 사용해 일관된 UUID/INT를 적용합니다.

## 4. 검증
1. 스크립트 실행 후 각 단계에서 콘솔에 출력되는 "📊 샘플 비교 리포트"로 Legacy vs Prisma 레코드를 확인합니다.
2. `reports/prisma-id-mapping.json`을 Spot-check하여 FK 변환이 일관적인지 검토합니다.
3. 추가 검증: Prisma DB에서 `SELECT COUNT(*)` 및 `checksum` 비교 스크립트를 실행하여 레코드 수/주요 합계를 비교합니다.

## 5. 백업 및 롤백 절차
1. **사전 백업**
   - MongoDB: `mongodump --uri=$MONGODB_URI --archive=backup-$(date +%F).gz --gzip` 실행.
   - Prisma DB: 데이터베이스 엔진 별 스냅샷 또는 `pg_dump`/`mysqldump`/`sqlite .backup` 수행.
2. **롤백 시나리오**
   - 오류 발생 시 Prisma DB를 백업 시점으로 복구하고, MongoDB는 read-only 상태 유지.
   - `reports/prisma-id-mapping.json`과 로그를 활용해 문제 지점을 분석 후 재시도.
3. **부분 롤백**
   - 스크립트 단계별 실행이 가능하므로 문제가 발생한 단계 이후의 데이터만 Prisma DB에서 삭제한 뒤 해당 단계만 재실행.

## 6. Downtime 전략
- 마이그레이션 동안 앱을 메인터넌스 모드로 전환합니다.
- 예상 소요 시간은 배치 크기 50 기준 약 45~90분 (데이터량에 따라 변동).
- 데이터 일관성을 위해 마이그레이션 시작 전 쓰기 트래픽을 중지하거나 Queue에 보관합니다.
- 마이그레이션 완료 후, `reports/prisma-id-mapping.json`과 샘플 리포트 확인 -> Smoke 테스트 -> 서비스 재개 순으로 진행합니다.

## 7. 리허설 및 배포 준비
1. **리허설 환경 구성**
   - 프로덕션 MongoDB 덤프 → Stage MongoDB 복원.
   - Prisma RDB 스키마는 Stage 인프라에 최신 마이그레이션으로 반영.
2. **리허설 절차**
   - `npm install` 후 `cd server && npm run migrate:prisma -- --dry-run`으로 기본 동작 확인.
   - Dry-run 결과 검토 후 실제 Stage DB를 대상으로 전체 마이그레이션 실행.
   - Stage 환경에서 API/프론트엔드 통합 테스트 진행.
3. **체크리스트**
   - [ ] Dry-run 로그 검토
   - [ ] Stage 마이그레이션 성공 로그 확인
   - [ ] Prisma DB 및 MongoDB 백업 완료
   - [ ] Downtime 공지 및 릴리즈 창 확정
   - [ ] 운영팀/CS팀 사전 안내 완료

## 8. 배포 후 모니터링
- 마이그레이션 직후 24시간 동안 오류 로그 및 성능 메트릭을 모니터링합니다.
- 결제/펀딩과 같이 민감한 도메인은 샘플 데이터를 기준으로 양쪽 시스템(Prisma vs Mongo) 결과를 재차 비교.
- 이상 징후 발생 시 즉시 롤백 프로세스 가동.

## 9. 참고
- `server/scripts/migrate-mongo-to-prisma.js` 내부 주석에 각 단계별 변환 규칙이 문서화되어 있습니다.
- Prisma Schema 변경 시 해당 스크립트와 본 런북을 함께 업데이트해야 합니다.
