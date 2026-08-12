# Alignment Action Register

| ID | Priority | System | Action | Acceptance evidence | Owner gate |
|---|---:|---|---|---|---|
| ALIGN-001 | 1 | GitHub | Establish this alignment baseline in `the33rdhouse-platform` through a draft PR | Draft PR, commit SHA, changed-file list | Required before merge |
| ALIGN-002 | 1 | Cloudflare / GitHub | Keep PR #13 draft and document that it is health-only and fail-closed | `/health` success; all other routes return 503; no secrets changed | Required before production |
| ALIGN-003 | 1 | Architecture | Decide between persistent Node hosting and full Cloudflare Worker migration | Signed architecture decision record | Required |
| ALIGN-004 | 1 | Security | Confirm no confidential source PDF or production credentials are committed | Secret scan and repository file review | Required |
| ALIGN-005 | 2 | Vercel | Map every project to repository, domain, environment and owner role | Completed consolidation register | Required before deletion |
| ALIGN-006 | 2 | Vercel | Select one canonical project for the 33rd House platform | Git source, production domain and latest deployment verified | Required before domain move |
| ALIGN-007 | 2 | Airtable | Create a cross-platform alignment register and seed verified records | Table exists with dated records | No publication needed |
| ALIGN-008 | 2 | GitHub / Cloudflare | Add Worker migration gates: Hyperdrive or Worker-native persistence, generated binding types, observability and Worker tests | CI pass and Wrangler validation | Required before merge |
| ALIGN-009 | 3 | PDF | Replace the malformed report with a clean, sanitized alignment control pack | Verified PDF and SHA-256 | Required before archival |
| ALIGN-010 | 3 | Governance | Review stale entity, domain, social and store claims in the source report before reuse | Exception register with source evidence | Required before external use |

## Current release position

**NO-GO for production publisher promotion.** The Cloudflare adapter in PR #13 removes the invalid Worker entrypoint and fails closed, but the database, Telegram, OpenAI, scheduling, shared-state throttling and production validation gates remain open.
