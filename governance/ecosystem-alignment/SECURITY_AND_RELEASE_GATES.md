# Security and Release Gates

## Gate A - Confidentiality

- Source PDF remains outside GitHub.
- No raw identity evidence, wallet details, API keys, bot tokens, private chat IDs, recovery codes or seed phrases in source control or Airtable.
- Only checksums, non-secret identifiers and evidence references may be recorded.

## Gate B - GitHub

- Draft PR only until owner review.
- Required checks: lint, tests, strict type-check, dependency audit and secret scan.
- Main branch protection and least-privilege app access must be confirmed manually.
- No merge of stacked publisher PRs until the deployment architecture is selected and rebased into a coherent release branch.

## Gate C - Cloudflare

- Valid Worker entrypoint using `fetch(request, env, ctx)`.
- Worker-safe persistence: Hyperdrive for external PostgreSQL or a Worker-native data design.
- Generated binding types and checked `wrangler.jsonc`.
- Encrypted secrets stored in Cloudflare, never in GitHub.
- Structured observability enabled.
- Non-health routes remain closed until functional adapters and tests pass.
- Cron triggers remain disabled or draft-only until owner-controlled dry-run evidence is recorded.

## Gate D - Vercel

- Canonical project selected per web product.
- Git repository and branch mapping verified.
- Production domains verified and preview protection enabled.
- Environment variables audited and rotated when provenance is uncertain.
- Generated or duplicate projects are not deleted until their latest deployments and domains are recorded.

## Gate E - Airtable

- Airtable records mirror provider state but do not override it.
- Every record includes verification date, evidence reference, risk and next action.
- No attachments containing restricted evidence or secrets.
- Status changes that imply production approval require owner confirmation.

## Gate F - Supervised production test

1. Encrypted runtime configuration verified.
2. `PUBLISH_MODE=dry-run` verified.
3. Destination numeric identity and permissions verified.
4. Database backup and migrations verified.
5. Dry-run proves no live message is sent.
6. One owner-observed staging publication is reconciled to provider message ID and audit record.
7. Rollback is rehearsed and documented.
