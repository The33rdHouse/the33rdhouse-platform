# GitHub Control Register

Date anchored: 2026-08-12 UTC
Owner context: The 33rd House / AIB ecosystem
Status: Active control register

## Purpose

This register maps the confirmed GitHub repositories and defines where ecosystem, platform, bot, API, and AIB Hub control work should be tracked.

Sensitive financial material must not be committed to GitHub by default. GitHub should hold sanitized control metadata, reconciliation summaries, tasks, schemas, and code only.

## Confirmed Repositories

| Repository | Status | Visibility | Default branch | Access confirmed | Register role |
| --- | --- | --- | --- | --- | --- |
| The33rdHouse/The33rdhouse | Active | Private | main | Admin/write | Primary The 33rd House site, codex, and brand-facing codebase. |
| The33rdHouseMaster/the33rdhouse-bots | Active | Private | main | Admin/write | Telegram bots, publisher workers, automation jobs, bot routing, and channel operations. |
| The33rdHouseMaster/the33rdhouse-api | Active | Private | main | Admin/write | API contracts, service endpoints, integrations, and backend boundary code. |
| The33rdHouseMaster/the33rdhouse-platform | Active | Private | main | Admin/write | Master platform coordination, docs, registers, governance tasks, and ecosystem architecture. |
| The33rdHouseMaster/aibhub | Active | Private | main | Admin/write | AIB Hub operating code, business workflows, financial-control metadata, and entity-specific automations. |
| The33rdHouseMaster/the33rdhouse-docs | Active | Private | main | Admin/write | Master docs, sanitized source registers, governance notes, and document index material. |
| The33rdHouseMaster/the33rdhouse-website | Active | Private | main | Admin/write | Website code, landing/site content, routing, and public presentation assets. |
| The-33rd-House-Community-Foundation/community | Active fork | Public | main | Admin/write | Community foundation public fork; treat as community-facing/adjacent until purpose is confirmed. |

## Repository Aliases

| Supplied repository | Canonical GitHub repository | Status |
| --- | --- | --- |
| the33rdhouse/the33rdhouse | The33rdHouse/The33rdhouse | Confirmed alias; resolves to the active private repo. |
| @The-33rd-House-Community-Foundation | The-33rd-House-Community-Foundation/community | Owner/org confirmed; public repo `community` is visible with admin/write access. |

## Corrected Repository Name

The requested `The33rdHouseMaster/the33rdhouse-aibhub` was not found. The confirmed accessible repository is:

`The33rdHouseMaster/aibhub`

## Control Artifacts Created

| Repository | File | Purpose | Commit |
| --- | --- | --- | --- |
| The33rdHouseMaster/aibhub | `docs/finance-control/README.md` | Sanitized AIB finance-control metadata structure. | `fc228dcf1ce6bb1042bdf00ec0bcd07ec7cfd065` |
| The33rdHouseMaster/aibhub | `docs/finance-control/transaction-category-schema.md` | Transaction category schema without raw transaction rows. | `c5b036c3263fee3f9c137023f095ef6f2192c7c7` |
| The33rdHouseMaster/the33rdhouse-bots | `docs/registers/telegram-network-deployment-map.md` | Sanitized Telegram network and bot deployment boundary map. | `81f26ce9b6aa00ba43a4f0bb959aed721ffe6cec` |
| The33rdHouseMaster/the33rdhouse-api | `docs/registers/api-boundary-notes.md` | Initial API boundary, endpoint contract template, and secret rules. | `d2fa0505d71a392f0b1f5ed8100945218192e7bb` |

## Read-Only or External Observed Repositories

| Repository/account | Status | Visibility | Access | Note |
| --- | --- | --- | --- | --- |
| aib-solutions | GitHub user account | Public profile | Read/list only | Supplied as an account target, not a repo full name. Public listing exposes `aib-solutions/aib-app`. |
| aib-solutions/aib-app | Active repository | Public | Pull only | Public empty/placeholder app repo; no write access through the connected GitHub app. |
| AIBHUB | GitHub user account | Public profile | Read/list only | Public listing exposes `AIBHUB/skills`. |
| AIBHUB/skills | Archived repository | Public | Pull only | Forked skills catalog; archived; no write access through the connected GitHub app. |

## Pending Repository Targets

| Repository or owner | Status | Check result | Next action |
| --- | --- | --- | --- |
| the-33rd-house | Pending access or confirmation | GitHub returned 404 for the owner profile, user repo listing, and org repo listing. | Confirm the owner spelling/case or connect the GitHub app to the owning account. |
| legacy-sketch/the33rdhouse | Pending access or confirmation | GitHub returned 404 for the exact repository and likely name variants; public repo listing for `legacy-sketch` returned no repositories. | Confirm the repo spelling, make the repo visible to the connected GitHub app, or install/connect the GitHub app on the `legacy-sketch` account. |
| AIBHUB/Master | Pending access or confirmation | GitHub returned 404. `AIBHUB` resolves as a user account with public repo `AIBHUB/skills`, but `Master` is not visible. | Confirm spelling/case or connect the GitHub app to the account that owns the repo. |
| AIBHUB/DCEcosystem | Pending access or confirmation | GitHub returned 404. `AIBHUB` resolves as a user account with public repo `AIBHUB/skills`, but `DCEcosystem` is not visible. | Confirm spelling/case or connect the GitHub app to the account that owns the repo. |
| TheCruzeEstate | Pending access or confirmation | GitHub returned 404 for both user-repo listing and org-repo listing. | Confirm the GitHub owner spelling or connect the GitHub app to the owning account. |
| DanielCruzeAU | Pending access or confirmation | GitHub returned 404 for both user-repo listing and org-repo listing. | Confirm the GitHub owner spelling or connect the GitHub app to the owning account. |
| aibhubofficial-boop | Pending access or confirmation | GitHub returned 404 for both user-repo listing and org-repo listing. | Confirm the GitHub owner spelling or connect the GitHub app to the owning account. |
| Enterprise/DanielCruzeAU | Pending access or confirmation | GitHub returned 404 for the exact repo, and `Enterprise` did not resolve as a visible user or organization. | Confirm whether this is a GitHub Enterprise workspace URL, a different owner name, or a private repo needing app access. |
| The-33rd-House-Community-Foundation/.github | Pending access or confirmation | GitHub returned 404 for the exact repository URL. | Confirm the special org `.github` repo exists and is visible to the connected GitHub app before treating it as active. |

Checked variants for `legacy-sketch/the33rdhouse`:

- `legacy-sketch/the33rdhouse`
- `legacy-sketch/The33rdhouse`
- `legacy-sketch/The33rdHouse`
- `legacy-sketch/the-33rd-house`

Checked foundation spelling variant:

- `The-33rd-House-Community-Foundation` confirmed
- `The-33rd-House-Comunity-Foundation` not found

## Current Financial Control Source Set

Sanitized GitHub anchor only. Raw statements, full transaction rows, bank PDFs, account numbers, and screenshots remain outside GitHub unless explicitly approved for a separate secure repository policy.

| Source set | Entity/account context | Period covered | Extracted entries | Credits | Debits | Closing balance | Reconciliation |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| FCR-001 to FCR-007 | AIB HUB PTY LTD - Westpac Business One | 2024-11-05 to 2026-05-05 | 2,238 | AUD 303,886.58 | AUD 304,448.54 | AUD -561.96 | Exact |

Notes:

- The cash-flow screenshot is tracked as supporting context only.
- The app cash-flow snapshot is not merged into bank statement totals because it uses a different 12-month view and excludes transfers.
- Uncertain transaction categories remain review items instead of guessed classifications.

## Routing Rules

| Work type | Primary repo | Rule |
| --- | --- | --- |
| Master architecture and governance registers | The33rdHouseMaster/the33rdhouse-platform | Store sanitized markdown, schema notes, and task anchors under `docs/registers/`. |
| Telegram channels, bots, publishing workers | The33rdHouseMaster/the33rdhouse-bots | Store bot code, worker code, channel routing, and deployment notes only. Never commit bot tokens. |
| Shared APIs and integrations | The33rdHouseMaster/the33rdhouse-api | Store API contracts, integration adapters, and backend service boundaries. |
| Docs, source registers, and document indexes | The33rdHouseMaster/the33rdhouse-docs | Store sanitized documentation, source indexes, and governance notes. Do not store raw bank/source PDFs by default. |
| Website and public presentation | The33rdHouseMaster/the33rdhouse-website | Store site code, content routing, and public presentation assets. |
| The 33rd House site and codex presentation | The33rdHouse/The33rdhouse | Store public-facing or member-facing site code and content. |
| AIB Hub operating workflows | The33rdHouseMaster/aibhub | Store AIB-specific workflows, finance metadata, ops automations, and business process code. |
| Community foundation public material | The-33rd-House-Community-Foundation/community | Treat as public/adjacent until confirmed; avoid private governance, finance, identity, or secret material. |

## Security Rules

Do not commit:

- Bank statements, raw ledgers, full transaction exports, or screenshots containing account details.
- API keys, bot tokens, session cookies, OAuth secrets, HMAC secrets, or webhook signing secrets.
- Private personal identifiers beyond what is required for a sanitized control summary.
- Deployment environment files containing live secrets.

Allowed by default:

- Sanitized reconciliation summaries.
- Repository maps and ownership/routing notes.
- Empty templates and schemas.
- Issue checklists and implementation plans.
- Code that reads secrets from environment variables without embedding the secret values.

## Next Control Tasks

- Decide whether `aib-solutions/aib-app` and `AIBHUB/skills` are historical, adjacent, or active ecosystem assets.
- Confirm or connect `the-33rd-house` before treating it as an active owner.
- Confirm or connect `legacy-sketch/the33rdhouse` before treating it as an active repository.
- Confirm or connect `AIBHUB/Master` and `AIBHUB/DCEcosystem` before treating them as active repositories.
- Confirm or connect `TheCruzeEstate`, `DanielCruzeAU`, and `aibhubofficial-boop` before treating them as active owners.
- Confirm whether `Enterprise/DanielCruzeAU` is a GitHub Enterprise URL, a different owner, or a private repo needing app access.
- Confirm whether `The-33rd-House-Community-Foundation/.github` exists and should hold org profile, default health files, and community standards.
- Confirm whether `The-33rd-House-Community-Foundation/community` should stay as a public adjacent asset or receive its own community governance docs.
- Decide whether to initialize `The33rdHouseMaster/the33rdhouse-docs` and `The33rdHouseMaster/the33rdhouse-website` with starter README/control docs.
- Link future PRs back to the master platform register issue.
