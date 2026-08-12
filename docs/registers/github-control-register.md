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

## Corrected Repository Name

The requested `The33rdHouseMaster/the33rdhouse-aibhub` was not found. The confirmed accessible repository is:

`The33rdHouseMaster/aibhub`

## Pending Repository Targets

| Repository | Status | Check result | Next action |
| --- | --- | --- | --- |
| legacy-sketch/the33rdhouse | Pending access or confirmation | GitHub returned 404 for the exact repository and likely name variants; public repo listing for `legacy-sketch` returned no repositories. | Confirm the repo spelling, make the repo visible to the connected GitHub app, or install/connect the GitHub app on the `legacy-sketch` account. |

Checked variants:

- `legacy-sketch/the33rdhouse`
- `legacy-sketch/The33rdhouse`
- `legacy-sketch/The33rdHouse`
- `legacy-sketch/the-33rd-house`

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
| The 33rd House site and codex presentation | The33rdHouse/The33rdhouse | Store public-facing or member-facing site code and content. |
| AIB Hub operating workflows | The33rdHouseMaster/aibhub | Store AIB-specific workflows, finance metadata, ops automations, and business process code. |

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

- Create an AIB Hub finance metadata folder in `The33rdHouseMaster/aibhub`.
- Add a transaction category schema without raw transaction rows.
- Add a bot/network deployment map in `The33rdHouseMaster/the33rdhouse-bots`.
- Add API boundary notes in `The33rdHouseMaster/the33rdhouse-api`.
- Confirm or connect `legacy-sketch/the33rdhouse` before treating it as an active repository.
- Link the master platform register to future issues and pull requests.
