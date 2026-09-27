# P0 Forensic Evidence Register — GitHub Canon Reconciliation

**Audit date:** 2026-09-27  
**Repository:** The33rdHouse/the33rdhouse-platform  
**Branch:** control/master-github-canon-reconciliation-2026-09-27  
**Method:** Read → reconcile → document → approve → mutate

## Control principle

**Code proves implementation. Authority evidence proves canon.**

## Gate / Realm evidence

| Repository | Path | Commit | Evidence | State |
|---|---|---|---|---|
| deity-atlas-explorer | client/src/pages/MasterDocument.tsx | d9883176d7859695c9cb52deadf0e6544c195086 | UI explicitly models 13 Gates & 144 Realms | IMPLEMENTED / CANON CONFLICT |
| deity-atlas-explorer | drizzle/schema.ts | fa95283bc7cf950de082e0a7462d46aa4cc19300 | Schema explicitly defines 13 Gates of Consciousness (Gate 0-12); 144 Realms | IMPLEMENTED / CANON CONFLICT |
| the33rdhouse-mobile-app | constants/realms-data.ts | e104537739f98cc32031222b5f87bc4e930d8cbe | Header states 12 Gates × 12 Realms = 144; data includes Gate 0 Threshold | IMPLEMENTED / 12-GATE FAMILY |
| the-33rd-house-production | drizzle/schema.ts | f3135488cd64117343a836faee2a573c14709917 | Schema comments define 12 Gates and 144 Realms (12 per Gate) | IMPLEMENTED / 12-GATE FAMILY |

## Duplicate-family readback

### 333 ↔ curriculum
- Current sizes: both 17,617 KB.
- Current README content is materially different in purpose wording.
- Current HEAD commits differ.
- Prior control evidence recorded a shared historical commit SHA `d795796a15b822899b74366fc5063ac22262a9a7`.
- Current conclusion: DUPLICATE/DERIVED FAMILY — provenance and unique-content comparison still required.

### sacred-library-static ↔ the33rdhouse-sacred-library-static
- Current README content is byte-equivalent at the fetched content level.
- Both current README files identify the same static Temple Series portal structure.
- Both current repositories are approximately the same size (4,086 KB vs 4,058 KB).
- Current conclusion: STRONG DUPLICATE EVIDENCE — deployment/reference scan still required before archive.

### ascension-full-knowledge-base ↔ ascension-full-knowledge-basee
- Current repositories differ in size (27,276 KB vs 18,247 KB).
- README material overlaps on The 33rd House curriculum/platform, but the current README texts are materially different.
- Current conclusion: NEAR-DUPLICATE / POSSIBLE FORK — unique content and history comparison required.

### nextjs ↔ nextjs-boilerplate
- Current sizes are identical (62 KB).
- Current README content is byte-equivalent at the fetched content level.
- Both are standard create-next-app starter projects.
- Current conclusion: STRONG DUPLICATE STARTER EVIDENCE — deployment/reference scan required before archive.

### turbo-monorepo ↔ monorepo-turborepo
- Current sizes are identical (187 KB).
- Current README content is byte-equivalent at the fetched content level.
- Both identify the same standard Turborepo starter structure.
- Current conclusion: STRONG DUPLICATE STARTER EVIDENCE — deployment/reference scan required before archive.

### dragon-current ↔ dragons-current
- Current sizes differ materially (397 KB vs 431,865 KB).
- Current HEADs differ.
- Current conclusion: NOT PROVEN DUPLICATE — retain as parallel/unresolved pending content, deployment and provenance analysis.

## Repository inventory controls verified in this pass

The following current repository metadata was read back:
- the33rdhouse-platform — private, main, 312 KB
- deity-atlas-explorer — private, main, 570 KB
- the-33rd-house-production — internal, main, 824 KB
- 333 — private, main, 17,617 KB
- curriculum — private, main, 17,617 KB
- sacred-library-static — private, main, 4,086 KB
- the33rdhouse-sacred-library-static — private, main, 4,058 KB
- ascension-full-knowledge-base — private, main, 27,276 KB
- ascension-full-knowledge-basee — private, main, 18,247 KB
- nextjs — private, main, 62 KB
- nextjs-boilerplate — private, main, 62 KB
- turbo-monorepo — private, main, 187 KB
- monorepo-turborepo — private, main, 187 KB
- dragon-current — private, main, 397 KB
- dragons-current — internal, main, 431,865 KB

## Deployment control

A current Vercel account read identified two accessible teams:
- AIB HUB PTY LTD
- Guardian's projects

The AIB HUB PTY LTD team currently exposes five Vercel projects:
- the-daniel-cruze-experience
- daniel-cruze
- daniel-cruze-site
- project-chcp9
- v0-aibhubofficial-1571-ae8212d3

This establishes current project inventory only. Repository-to-project-to-domain-to-production ownership is **not yet proven** from this pass.

## Destructive-action status

No repository was archived, deleted, renamed, transferred, or overwritten.

## P0 conclusion

1. The 12/13 Gate conflict is real and directly evidenced.
2. 144 Realms is independently corroborated.
3. Several duplicate starter/static families have strong current evidence.
4. Exact duplicate status is not established for every family because the available repository comparison interface does not provide a direct cross-repository tree comparison.
5. Deployment authority remains an open control item.
6. ADR-001 is therefore OPEN and must not be converted to an implementation decision without canonical authority.
