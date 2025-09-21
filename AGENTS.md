# Repository Guidelines

## Project Structure & Module Organization

- `src/` hosts the React 18 client. Use `components/` for UI atoms, `features/` for flows, `pages/` for routed screens, shared helpers in `lib/` and `utils/`, and colocated specs in `__tests__/` and `test-utils/`.
- `public/` serves static assets; `cypress/` contains end-to-end specs and fixtures.
- `server/` provides the Node/Express API with `routes/`, `models/`, `services/`, and Jest suites in `tests/`.
- Automation lives in `scripts/` and `server/scripts/` (env verification, orphan page audits, seeding).

## Build, Test, and Development Commands

- Client dev server: `npm run dev` (Vite) or `npm start`.
- Production build: `npm run build` (Vite); backend health check: `cd server && npm run start:check`.
- Full quality gate: `npm run check:all` (lint, types, format, unit, a11y, dead code, deps, colors, build).
- API development: `cd server && npm run dev`; seed data with `cd server && npm run seed-data`.
- Storybook and contract validation: `npm run storybook`, `npm run pact:test`, and `cd server && npm run pact:test`.

## Coding Style & Naming Conventions

- `.editorconfig` fixes LF endings and 2-space indentation; Prettier plus the Tailwind plugin sorts class names automatically.
- ESLint and TypeScript strict rules run in CI; avoid `any`, favor typed events, and keep imports using the `@/` alias.
- Components use `PascalCase`, hooks/utilities `camelCase`, and routed pages `kebab-case.tsx`.

## Testing Guidelines

- Front-end suite: `npm test` for watch mode; `npm run check:test` for coverage reports.
- Accessibility and contract checks: `npm run test:a11y`, `npm run check:accessibility`, and `npm run pact:test`.
- E2E specs live in `cypress/`; API suites run via `cd server && npm test`. Aim for >=80% coverage and leave failing specs as blockers.

## Commit & Pull Request Guidelines

- Prefer conventional commits (`feat:`, `fix:`, `chore:`) and reference issues (e.g., `#123`); keep commits lint-clean so Husky passes.
- Use `.github/pull_request_template.md`, attach UI screenshots, note API/schema impacts, and check the verification boxes (`check:lint`, `check:format`, `check:deps`, etc.).
- Document environment changes and rollback plans in the PR before requesting review.

## Security & Configuration Tips

- Copy `.env.example` files and validate with `npm run env:verify` or `cd server && npm run env:verify`.
- Run `npm run check:colors` for contrast and `npm audit`/`npm run audit` before releases.
- Keep secrets out of git; temporary uploads stay in `server/uploads/` which is gitignored.
