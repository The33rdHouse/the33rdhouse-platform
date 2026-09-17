# HARMGA console integration

Status: source integration for review, not an active production deployment.
The user-supplied v2.5.0 console is the design source. This implementation replaces simulated authority, audits and downloads with authenticated workflows or explicit unavailable states. It does not establish historical repository provenance or IP ownership.

## Local operation

Use Node.js 24 and pnpm 10.15.0. Install with `pnpm install --frozen-lockfile`.
Set DATABASE_URL to a disposable PostgreSQL 16+ database, run `pnpm db:migrate`, and set APP_ORIGIN to `http://127.0.0.1:5173`.
Run `pnpm dev` and `pnpm dev:client`. For a built single-origin service run `pnpm build`, set APP_ORIGIN to its exact origin, then `pnpm start`.
Environment variables must be exported by the shell or supplied by the hosting platform; scripts do not automatically load `.env`.

## Internal pilot access

The console uses the existing users, roles and sessions tables. An operator with database access runs `pnpm console:session <existing-user-id>` to issue a random 256-bit credential with a one-hour absolute expiry. No user or role is automatically created. Deliver the credential privately and enter it into the console form. Never place it in a URL, repository, CI log or browser storage.

The database stores only the SHA-256 digest. Sign-in sets an HttpOnly, SameSite=Strict cookie, also Secure when NODE_ENV=production. Each request checks session existence and expiry, and roles are reloaded from the database. Sign-out deletes the session; an operator can revoke it by deleting its digest row. The credential remains reusable until expiry or revocation. This is an operator-issued pilot session mechanism, not an SSO/MFA onboarding system. Replace issuance with the approved identity provider before broad rollout.

All unsafe HTTP methods require the configured exact Origin. Do not configure wildcard CORS, trust identity headers, expose private keys to the frontend, or override authUserId from request data. Existing non-browser mutation clients must send APP_ORIGIN and a valid session; public GET queries remain available.

## Data and permissions

- Signed-in accounts can view their own application and submit one application per account.
- Submission stores the server timestamp, acknowledgement version and a pending status atomically with an audit log event. It grants no permission, membership, XP, voting weight or signature.
- Admin rights remain governed by the existing persisted roles and adminProcedure.
- Browser storage contains only a validated navigation preference. Legacy browser stakeholder records are not imported as authority.
- The acknowledgement is an application receipt, not approved membership terms or an IP assignment.
- Application review/approval, multi-model audit jobs and signature verification are not implemented. Their UI states say so explicitly.

## Exhibit vault

EXHIBITS in src/console/vault.ts is intentionally empty. Each added entry needs a reviewed ID, title, tier, relative filename and actual SHA-256. Every currently allowlisted file is available to every signed-in account: include member-readable exhibits only. Files requiring narrower access need a per-file authorization policy before addition.

Set EXHIBIT_ROOT outside the served directory. Requests use exact IDs; real paths must remain inside the root, and bytes must match the allowlisted hash. Unknown IDs return 404, anonymous requests return 401, integrity or storage errors return 503. There is no public fallback. Files download as attachments with generic binary MIME type.

## Deployment and verification gate

No Vercel project settings, production branches, DNS, secrets, database records or live deployments were changed by this integration. Do not point production at the documentation-only main branch. Reconcile the release branch and run the repository's PostgreSQL 16 CI gate before promotion.

Verify the actual Vercel project/team and Git linkage, its runtime support for this Express service, repository root, build command and same-origin routing before configuring deployment. Vite's frontend output is dist/client; the backend is required and must not be omitted by deploying that directory as a standalone static site. No speculative vercel.json is supplied.

Configure DATABASE_URL, APP_ORIGIN and NODE_ENV=production through secret/environment management. Enable HTTPS, deployment protection, ingress rate limiting (especially /auth/session), request timeouts and redacted request logging. The app sets a restrictive CSP, no-store caching and nosniff; deployment controls still need verification.

Tests cover runtime validation, untrusted headers, expired sessions, cross-origin requests, private download rejection, file tampering/path escape, application persistence and account isolation, duplicate submission, audit logging and logout revocation. Run pnpm check, pnpm test and pnpm build. Run pnpm db:generate and confirm no new migration diff after the committed migration.

The source asset record is docs/asset-register/harmga-console.json. Its source hash is an integrity identifier, not a signature or evidence of deployment. Record an actual deployment ID, URL, commit and verification time only after successful deployment checks.
