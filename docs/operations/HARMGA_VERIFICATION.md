# HARMGA integration verification — 2026-09-17

- TypeScript backend and frontend checks: passed.
- Production Vite build: passed.
- Local suite: 66 tests passed, one full-source import test skipped because the controlled source archives were not supplied.
- Database migrations and HTTP integration were exercised on a disposable PGlite PostgreSQL-compatible runtime, not the required native PostgreSQL 16 service. Native PostgreSQL 16 remains a CI/promotion gate.
- HTTP checks: forged identity headers, session expiry, cross-origin login/logout, anonymous vault access, account isolation, persistent intake, duplicate rejection, atomic audit recording and session revocation.
- File checks: unknown IDs, altered bytes and symlink escape are rejected.
- Browser visual check: blocked by the cloud browser's localhost restriction. No visual or mobile-browser verification is claimed.
- No production credentials, migration, Vercel configuration, live deployment or signed provenance certificate was created.

The CI workflow now also runs for pull requests targeting feat/canonical-content-core-phase-1, so the integration can be reviewed on the actual backend branch.
