# Prisma Migration Implementation Plan

## Objective
Migrate the Collaboreum backend from the current MongoDB/Mongoose stack to a PostgreSQL/Prisma stack while maintaining developer velocity, automated testing reliability, and data integrity. The scope covers unit/e2e contract tests, data seeding scripts, and CI tasks referenced in the user story.

## Guiding Principles
- **Test-first**: introduce Prisma clients and Postgres containers in test setup before replacing production code paths.
- **Incremental rollout**: migrate shared utilities and scripts feature-by-feature to avoid large bang rewrites.
- **Traceability**: document every schema/table mapping and data transform so that rollback is straightforward.
- **Automation parity**: keep all Husky, CI, and developer scripts working end-to-end after each milestone.

## Milestones & Tasks

### 1. Bootstrap Prisma Foundation
1. Scaffold `server/prisma/` with `schema.prisma`, `.env.test`, and seed fixtures mirroring current domain models (users, categories, funding projects, pledges, etc.).
2. Add `prisma` CLI and `@prisma/client` dependencies. Update `server/package.json` scripts (`prisma:generate`, `prisma:migrate`, `db:test:reset`).
3. Configure Prisma generators (TypeScript client) and set up naming conventions (snake_case tables, camelCase fields) aligning with existing API contracts.
4. Update application config loader to resolve Postgres URLs from `.env` and test env overrides.

### 2. Test Infrastructure Migration
1. Replace `server/tests/setup/testSetup.js` Mongo Memory Server bootstrap with a `PrismaClient` connected to a disposable Postgres database (e.g., `postgres://localhost:5434/collaboreum_test`).
2. Introduce helper utilities for transaction-based isolation (`beforeEach` begin transaction, `afterEach` rollback), plus fixture factories that write via Prisma.
3. Update Jest and Pact configuration to consume the Prisma-aware setup file and share the same teardown hooks.
4. Ensure Cypress/API e2e suites seed their own data through Prisma seeds rather than Mongoose models.

### 3. Rewrite Seed & Maintenance Scripts
1. Recreate `server/scripts/seed-*.js`, `init-db.js`, and helper utilities as Prisma-powered modules (TypeScript-friendly). Use modular seed data definitions and transaction batching.
2. Provide idempotent seed commands (`npm run db:seed`, `npm run db:seed:test`) with environment detection safeguards.
3. Port maintenance scripts (`updateProjectStatuses`, `quick-user`, etc.) to leverage Prisma queries. Add dry-run flags and structured logging for parity with existing behaviour.
4. Update root `package.json` and `server/package.json` scripts to point to the new Prisma script entry points.

### 4. Continuous Integration & Husky Updates
1. Extend Husky pre-push/pre-commit hooks to run `prisma generate` when schema changes are detected.
2. Modify `server` and workspace-level CI commands (`npm run start:check`, `npm run check:all`) to execute `prisma migrate deploy --preview-feature` (or equivalent) against ephemeral Postgres services and regenerate the client.
3. Cache Prisma client generation artifacts in CI to reduce build times.
4. Document new environment variables and fallback behaviour in `README.md` and `.env.example` files.

## Data Migration Strategy (Production)
1. Implement dual-write/dual-read compatibility layers while the production database transitions.
2. Use the existing `scripts/migrate-mongo-to-prisma.js` as a basis—refactor to latest Prisma schema and support resumable batches.
3. Produce audit reports comparing record counts, foreign keys, and integrity constraints between MongoDB and Postgres outputs.
4. Schedule cutover with a maintenance window. Provide rollback steps (`prisma migrate reset`, restore Mongo) if anomalies appear.

## Tooling & Environment Requirements
- Dockerized Postgres 15 image for development and CI.
- Node 18+ runtime (matching current server requirements).
- Prisma CLI >= 5.x for multi-schema support once required.
- Test containers or localstack alternative for reproducible pipeline runs.

## Risks & Mitigations
- **Schema drift**: Mitigate via automated migrations and review gates on `schema.prisma` edits.
- **Seed divergence**: Centralize seed data definitions to avoid duplication across tests/scripts.
- **CI slowdown**: Use transaction rollbacks for test isolation instead of full database resets.
- **Legacy object IDs**: Maintain mapping tables (`reports/prisma-id-mapping.json`) for referential integrity.

## Next Steps
1. Commit this plan and align with stakeholders for sign-off.
2. Implement Milestone 1 tasks in a dedicated feature branch, ensuring `prisma generate` and `prisma migrate dev` succeed locally.
3. Iterate through milestones sequentially, using feature flags or toggles for runtime switchovers.

---
Prepared by: Backend & Platform Engineering (Collaboreum)
