# Canonical System Map

## Verified state - 2026-08-05

| Layer | Verified object | Canonical role | Current state | Decision |
|---|---|---|---|---|
| GitHub identity | `The33rdHouseMaster` | Owner-controlled GitHub identity | Authenticated | Canonical GitHub controller |
| GitHub governance | `The33rdHouseMaster/the33rdhouse-platform` | Architecture and governance | Private; main contains initial baseline; multiple draft PRs | Canonical governance repository |
| GitHub runtime | `The33rdHouseMaster/the33rdhouse-bots` | Bot and publisher code | Private; multiple stacked draft PRs | Canonical bot runtime repository |
| GitHub assets | `The33rdHouseMaster/the33rdhouse-assets` | Non-secret asset custody | Private and currently empty | Use only for approved publishable assets |
| Cloudflare Worker | `australian-network-publisher` | Edge adapter / health endpoint | PR #13 preview deployed; non-health routes fail closed | Not production publisher until migration gates pass |
| Vercel team | `aibhubofficial` | AIB and experimental projects | 3 projects found | Audit and classify |
| Vercel team | `the-33rd-house-wisdom` | 33rd House web projects | 12 projects found, including generated duplicates | Consolidation required |
| Vercel project | `33rdhouse-platform` | Platform deployment candidate | Services framework; Node 24.x; latest deployment READY; `live=false` | Candidate canonical platform project after domain/source verification |
| Vercel project | `the33rdhouse` | Unresolved duplicate/name candidate | No deployment and no domains | Hold; do not delete until evidence review |
| Airtable | `Daniel Cruze Ecosystem Command Centre` | Operational control plane | Existing mature schema for deployments, security, duplicates, actions and evidence | Canonical operations register |
| PDF evidence | Uploaded reverse-engineering report | Historical source evidence | 15 pages; encoding defects; stale digital map; confidential | Archive locally; do not use as live truth |

## Required boundaries

### GitHub

GitHub stores code, configuration templates, architecture, runbooks, evidence manifests and non-secret release records. Production secrets remain in deployment-provider secret stores.

### Cloudflare

Cloudflare runs Worker-compatible code only. A long-running Node server using `server.listen()` is not the Worker entrypoint. The current fail-closed adapter is an interim safety control, not a functional migration.

### Vercel

Vercel hosts web applications. Each canonical product should have one named project, one verified Git source, explicit production domains and controlled previews. Auto-generated import projects are treated as duplicates until reconciled.

### Airtable

Airtable tracks status, responsibility, evidence references and next actions. It does not replace Git history, runtime logs or provider configuration.

### PDF

PDFs capture approved snapshots. Every PDF must carry a version, date, classification, source references and checksum. Confidential PDFs remain outside public repositories.
