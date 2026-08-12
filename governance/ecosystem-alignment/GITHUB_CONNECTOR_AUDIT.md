# GitHub Connector Audit

**Audit date:** 2026-08-05  
**Classification:** Internal — draft owner review  
**Connector:** GitHub App connected to ChatGPT  
**Authenticated controller:** `The33rdHouseMaster`  
**Audit status:** Complete for connector-visible scope

## Executive assessment

| Dimension | Assessment |
|---|---|
| Strategic value | **Very high — 9/10** |
| Current operational maturity | **Developing — 4/10** |
| Current governance risk | **High** |
| Recommended disposition | **Retain, consolidate and harden** |

GitHub should remain the controlled system of record for source code, architecture, configuration templates, tests, migration scripts, runbooks, decision records and release evidence. It must not store production secrets, private keys, recovery codes, raw identity evidence or confidential account-control packs.

The connector provides material value because it can inspect repositories, issues, pull requests, commits and status evidence; create controlled branches and documentation; and support review-first workflows. Its value is currently reduced by duplicated repositories, an oversized public documentation fork, overlapping pull-request stacks, incomplete status reporting and uncertainty about the canonical application repository.

## Connector-visible scope

### Installations

| Installation | Type | Connector state |
|---|---|---|
| `The33rdHouseMaster` | User | Active |
| `The33rdHouse` | Organisation | Active |

### Repositories exposed by the installations

#### `The33rdHouseMaster`

| Repository | Visibility | Observed role | Current classification |
|---|---|---|---|
| `the33rdhouse-platform` | Private | Governance and architecture | Declared canonical governance repository |
| `the33rdhouse-bots` | Private | Bot and publisher runtime | Declared canonical runtime repository |
| `the33rdhouse-assets` | Private | Approved non-secret assets | Empty; custody model not yet operating |

#### `The33rdHouse`

| Repository | Visibility | Observed role | Current classification |
|---|---|---|---|
| `the33rdhouse-platform` | Private | Substantial application and deployment history | Canonical status unresolved |
| `The33rdhouse` | Private | Substantial duplicate or related application | Requires comparison and classification |
| `deity-atlas-explorer` | Private | Product/application repository | Retain pending product mapping |
| `docs` | Public | Very large upstream GitHub documentation fork/import with limited custom content | High-noise, high-maintenance exception |
| `cautious-telegram-demo-repository` | Private | Small demonstration repository | Review for archive eligibility |
| `.github-private` | Private | Organisation governance/configuration | Retain and inspect controls |

The connector also surfaced issues and pull requests from repositories outside these two installation inventories. The authenticated profile returned no organisation memberships. This mismatch means connector-visible search results must not be treated as a complete ownership or access-control inventory.

## Material findings

### GH-01 — Canonical repository mismatch

`The33rdHouseMaster/the33rdhouse-platform` is declared as the canonical governance repository, but its `main` branch is a minimal baseline and most work remains in draft pull requests. `The33rdHouse/the33rdhouse-platform` is substantially larger and contains the active application, governance, Netlify and Vercel history.

**Risk:** deployment, documentation and development work may continue against different repositories, creating split authority and unclear provenance.

**Required action:** complete a file-tree, commit-lineage, deployment-source and domain-mapping comparison before selecting the canonical application repository. Do not archive or delete either repository until the decision record and migration evidence are approved.

### GH-02 — Bot pull-request stack sprawl

`The33rdHouseMaster/the33rdhouse-bots` contains multiple overlapping draft pull requests covering the original publisher, OpenAI intake, security hardening, media roadmap, production authority, scheduled research, release configuration, partial DigitalCruzeBot recovery and the fail-closed Cloudflare adapter.

**Risk:** stacked branches may contain duplicated, superseded or conflicting changes; merging them independently could regress controls or create an unreviewable release history.

**Required action:** build one PR dependency map, identify the latest valid change from each branch, create one coherent release candidate from an approved base, rerun all checks and close superseded PRs only after their unique commits and evidence are preserved.

### GH-03 — No combined status evidence on the current governance and Worker heads

The connector returned no combined status records for:

- governance PR #10 head `aaa62dc97c65d05293bb06c6239c178444f59ae7`;
- Worker adapter PR #13 head `25d7d003c18f0f0fe606749a3bba41c5c89efc1f`.

This does not prove that no check runs exist; it proves that the connected status endpoint reported none.

**Risk:** mergeability may be mistaken for verification.

**Required action:** configure required GitHub Actions checks or confirm check-run visibility, then require lint, tests, strict type-check, dependency audit, secret scan, build validation and dry-run safety checks on the exact release head.

### GH-04 — Cloudflare adapter is preview-deployed but intentionally non-production

PR #13 corrects the Worker entrypoint and received a successful Cloudflare preview deployment. The code and PR explicitly classify the adapter as non-production: only `GET /health` is enabled and all other routes return HTTP 503.

**Risk:** a successful provider deployment badge could be misread as proof that the publisher is operational.

**Required action:** keep the adapter draft and fail-closed until the owner selects persistent Node hosting or full Worker migration and all persistence, Telegram, OpenAI, throttling, testing and supervised staging gates are complete.

### GH-05 — Public `docs` repository is misaligned with the estate

`The33rdHouse/docs` is a multi-gigabyte public fork or import of GitHub's own documentation repository and contains extensive upstream history, automated dependency pull requests and a small amount of custom domain content.

**Risk:** unnecessary public attack surface, Dependabot noise, maintenance cost, possible brand confusion and accidental reliance on unrelated upstream content.

**Required action:** identify and export all original 33rd House content and provenance; determine whether a small purpose-built documentation repository should replace it; then archive, privatise or otherwise contain the current repository only after owner approval and preservation checks. Do not delete it as an initial action.

### GH-06 — Provider-generated pull-request duplication

The organisation platform repository contains repeated Vercel Analytics pull requests and historic Netlify-generated repair and deployment pull requests.

**Risk:** external agents may create overlapping changes without a single release authority, increasing branch noise and deployment ambiguity.

**Required action:** permit one deployment provider to write PRs per canonical application, disable obsolete provider automations after migration evidence is captured, and require owner review for provider-generated code changes.

### GH-07 — Main branches do not represent the accumulated work

The declared canonical governance and bot repositories have minimal `main` branches while substantial work remains in draft branches.

**Risk:** cloning `main`, disaster recovery, external review or a new deployment integration will not reproduce the intended current system.

**Required action:** after architecture and release review, merge only the approved consolidated baselines so `main` becomes a reliable recoverable state. Until then, explicitly label `main` as incomplete and prohibit production deployment from it.

### GH-08 — Branch protection and least privilege are not verified

Repository metadata confirms administrative access and available merge strategies, but the connector evidence gathered in this audit does not verify branch-protection rules, required reviews, required checks, CODEOWNERS enforcement, signed-commit policy or environment protection.

**Risk:** administrative capability may exceed the intended owner-control workflow.

**Required action:** manually verify or programmatically audit repository rulesets, GitHub App repository selection, Actions permissions, environments, deploy keys, webhooks, personal access tokens and outside collaborators.

### GH-09 — Asset custody repository is not yet delivering value

`The33rdHouseMaster/the33rdhouse-assets` is private and empty.

**Opportunity:** it can become a controlled store for approved, publishable, non-confidential assets and their manifests.

**Required action:** define allowed asset classes, licensing metadata, SHA-256 manifests, naming conventions and maximum file sizes. Keep confidential evidence, credentials and private keys outside it.

## Value map

| Capability | Ecosystem value | Recommended use |
|---|---|---|
| Version control | Critical | Canonical source and governance history |
| Pull-request review | Critical | Owner-controlled approval gates and auditable change review |
| Actions / CI | High | Tests, lint, type-check, builds, dependency audit and secret scanning |
| Issues and milestones | High | Engineering backlog and external-gate tracking |
| Releases and tags | High | Approved immutable release references and checksums |
| Deployment integrations | High with controls | Trigger previews and approved deployments from one canonical source |
| Repository search | High | Recovery, duplicate detection and provenance investigation |
| Public repositories | Selective | Only intentionally public code or documentation after disclosure review |
| Binary document storage | Low to medium | Manifests and approved small artifacts only; not the primary evidence archive |
| Secret storage | Restricted | GitHub Actions secrets only where CI requires them; provider runtime secrets stay with the provider |

## Prioritised remediation register

| ID | Priority | Action | Acceptance evidence |
|---|---:|---|---|
| GHA-001 | P0 | Freeze new generated platform and publisher PRs while the canonical map is completed | Written freeze notice and provider automation inventory |
| GHA-002 | P0 | Decide the canonical application repository after comparing the two platform repositories | Signed decision record, commit mapping, deployment mapping and migration plan |
| GHA-003 | P0 | Map all open bot PR dependencies and construct one coherent release candidate | PR dependency matrix and one reviewed release branch |
| GHA-004 | P0 | Keep publisher deployment fail-closed and in dry-run | Health evidence, 503 evidence and no live publication evidence |
| GHA-005 | P1 | Establish required checks and protected-branch rules | Ruleset export/screenshots and passing checks on exact head SHA |
| GHA-006 | P1 | Classify the public `docs` repository and preserve original content | Content provenance manifest and approved containment decision |
| GHA-007 | P1 | Reconcile GitHub App installation scope with all owned organisations and repositories | Installation inventory, repository selection and access review |
| GHA-008 | P1 | Standardise issue labels, milestones and release gates | Label taxonomy, milestones and linked gate issues |
| GHA-009 | P2 | Activate the assets repository under a documented custody policy | Asset policy, manifest schema and first approved asset set |
| GHA-010 | P2 | Produce a quarterly GitHub access and repository hygiene review | Dated report with owners, visibility, integrations and stale-object decisions |

## Target operating model

1. **One owner-controlled GitHub identity** governs approvals.
2. **One canonical repository per deployable product** supplies its deployment providers.
3. **One governance repository** contains architecture, decision logs and cross-platform registers.
4. **One coherent release branch at a time** replaces overlapping stacked PRs.
5. **Required checks run on the exact head SHA** before approval.
6. **Provider previews are evidence, not production authority.**
7. **Runtime secrets remain in provider secret stores.**
8. **Confidential evidence remains outside source control.**
9. **Public repositories are intentional, minimal and disclosure-reviewed.**
10. **Destructive actions require inventory, backup, provenance and owner approval.**

## Connector disposition

**RETAIN — HIGH VALUE.** GitHub is foundational to the ecosystem, but its immediate value depends on repository canonicalisation, PR consolidation, access review and enforced verification gates. No merge, repository deletion, archive action, visibility change, secret rotation or deployment is authorised by this audit.