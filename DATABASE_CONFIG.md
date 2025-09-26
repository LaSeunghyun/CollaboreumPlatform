# 데이터베이스 설정 (PostgreSQL + Prisma)

## 📦 개요

프로젝트는 PostgreSQL을 표준 데이터베이스로 사용하며 Prisma ORM을 통해 스키마와 타입을 관리합니다. 기존 MongoDB 컬렉션 기반 모델은 `server/models`에 남아있지만, 새로운 개발은 `prisma/schema.prisma`를 기준으로 진행합니다.

## 🔌 연결 정보

- **기본 호스트**: `localhost`
- **기본 포트**: `5432`
- **기본 데이터베이스명**: `collaboreum`
- **권장 인코딩**: `UTF8`
- **드라이버**: PostgreSQL (Prisma `postgresql` provider)

로컬 개발 시 `docker compose` 또는 로컬 PostgreSQL 인스턴스를 사용하세요.

## 🔐 환경 변수

루트 `.env` 또는 `server/.env`에 다음 값을 정의합니다.

```bash
DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public"
```

> ✅ `DATABASE_URL`은 Prisma와 서버 레이어가 공유하므로, 환경 별로 (개발/스테이징/프로덕션) 각기 다른 값을 설정하세요.

## 🛠️ Prisma 워크플로우

1. **스키마 업데이트**: `prisma/schema.prisma`에서 모델과 enum을 수정합니다.
2. **타입 생성**: 루트에서 `npm run prisma:generate`를 실행하면 Prisma Client와 타입이 생성됩니다.
3. **타입 공유**: 프런트엔드는 `src/shared/types`에서 Prisma enum과 타입을 재사용합니다.
4. **마이그레이션 (추가 예정)**: 현재는 초기 스키마 정의만 포함되어 있으며, 추후 `prisma migrate` 기반 마이그레이션이 추가될 예정입니다.

## 📄 참고 자료

- [Prisma Docs](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- `src/shared/types/index.ts` — 프런트엔드에서 사용하는 Prisma 기반 타입 정의

## 🧭 레거시 참고

`server/models`와 여러 스크립트는 MongoDB/Mongoose 기반 레거시 코드입니다. 점진적으로 Prisma + PostgreSQL로 이전할 계획이며, 신규 기능은 반드시 Prisma 모델을 기준으로 설계해 주세요.
