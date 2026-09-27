# THE 33RD HOUSE — MASTER GITHUB IMPLEMENTATION & CANON RECONCILIATION CONTROL DOCUMENT

**Document role:** GitHub implementation/evidence control plane  
**Project:** The 33rd House  
**Primary implementation system:** GitHub — `The33rdHouse`  
**Control principle:** Code proves implementation. Authority evidence proves canon.  
**Audit posture:** Read first → reconcile → document → approve → mutate  
**Live GitHub verification:** 2026-09-27  
**Control status:** ACTIVE CONTROL DOCUMENT  
**Destructive actions:** NOT AUTHORIZED BY IMPLICATION

---

## 1. EXECUTIVE SNAPSHOT

The 33rd House has a substantial implemented software estate alongside an extensive canonical/content/IP corpus.

The central architectural-control problem is repository proliferation and the existence of multiple repositories that encode overlapping portions of the same conceptual system, including:

- Gates
- Realms
- curriculum
- Deity Atlas
- traditions
- cosmology
- Sacred Library
- Living Codex
- platform architecture
- mobile applications
- production websites
- publishing
- automation
- assets
- governance
- AIB Hub
- Daniel Cruze properties
- Dragons
- historical/prototype applications.

The current live GitHub organisation read establishes **55 repositories** visible in `The33rdHouse`. The organisation currently contains internal, private and public repositories, with multiple duplicate/placeholder families and multiple substantial application estates.

The most important current implementation finding is a **material 12-Gate / 13-Gate divergence**:

- `the33rdhouse-mobile-app`, `333`, and `the-33rd-house-production` contain explicit 12-Gate implementation evidence.
- `deity-atlas-explorer` contains explicit 13-Gate implementation evidence in UI, data architecture and database schema.

This is an implementation conflict requiring canonical authority resolution. It is **not** a reason to silently rewrite either repository.

---

## 2. GOVERNING PRINCIPLE

### 2.1 Code proves implementation

A repository can prove that a feature, schema, page, dataset, route, interface, workflow or application component exists in code.

The evidence chain is:

`repository → file → implementation → commit → branch → deployment`

This proves implementation evidence.

It does not, by itself, prove that the implemented structure is the authoritative canonical model.

### 2.2 Authority evidence proves canon

Canonical authority must come from the project's designated source materials and controlled decisions.

The governing chain is:

`Source Evidence → Canon Control → MASTER 04 → GitHub Implementation → Deployment / Publishing → Commerce`

GitHub is therefore an implementation/evidence layer, not an autonomous authority layer.

---

## 3. CANON / IMPLEMENTATION AUTHORITY RULE

Use these classifications:

| Evidence condition | Required state |
|---|---|
| Code agrees with canon | CONFIRMED IMPLEMENTATION |
| Code differs from canon | IMPLEMENTATION CONFLICT — DO NOT AUTO-CORRECT |
| Code exists but canon is unclear | IMPLEMENTED / CANON UNRESOLVED |
| Canon exists but implementation cannot be found | CANONICAL / IMPLEMENTATION MISSING |
| Referenced implementation cannot be found | REFERENCE UNVERIFIED |
| Two repositories implement competing versions | PARALLEL IMPLEMENTATION |
| Repository appears obsolete but dependencies are unknown | ARCHIVE CANDIDATE — DEPENDENCY GATE REQUIRED |

---

## 4. CURRENT LIVE GITHUB INVENTORY

The live GitHub read on 2026-09-27 returned **55 repositories**.

| # | Repository | Size KB | Visibility | Initial control classification |
|---:|---|---:|---|---|
| 1 | `dragons-current` | 431,865 | Internal | Product / major implementation — investigate canonicality |
| 2 | `nextjs-boilerplate` | 62 | Private | Starter / duplicate candidate |
| 3 | `vite-react` | 7 | Private | Starter / template |
| 4 | `sacred-library` | 98,780 | Public | Knowledge/library candidate |
| 5 | `dragon-current` | 397 | Private | Duplicate/product-line review |
| 6 | `veiled-heart-sovereign-web` | 5,653 | Private | Distinct interactive application |
| 7 | `the33rdhouse-inner-circle-curriculum` | 27,268 | Private | Curriculum product |
| 8 | `the-33rd-house` | 182,389 | Private | Full-stack platform candidate |
| 9 | `sacred-library-static` | 4,086 | Private | Static library duplicate candidate |
| 10 | `daniel-cruze-elite` | 27 | Private | Personal-brand/product |
| 11 | `demo-repository` | 2 | Private | Demo |
| 12 | `ascension-full-knowledge-base` | 27,276 | Private | Knowledge-base review |
| 13 | `33` | 75,430 | Internal | Framework/product — identity review |
| 14 | `333` | 17,617 | Private | Full-stack/curriculum implementation |
| 15 | `the33rdhouse-sacred-library-static` | 4,058 | Private | Static library duplicate |
| 16 | `curriculum` | 17,617 | Private | Duplicate implementation candidate |
| 17 | `next-platform-starter-0d74e` | 0 | Private | Empty placeholder |
| 18 | `next-platform-starter-d3604` | 0 | Private | Empty placeholder |
| 19 | `next-platform-starter` | 2,254 | Private | Starter |
| 20 | `ascension-full-knowledge-basee` | 18,247 | Private | Near-duplicate knowledge base |
| 21 | `nextjs` | 62 | Private | Starter / near duplicate |
| 22 | `escape-the-matrix` | 36,456 | Private | Distinct interactive experience |
| 23 | `the-33rd-house-production` | 824 | Internal | Production/content implementation |
| 24 | `the33rdhouse-website` | 51,995 | Private | Main web candidate |
| 25 | `the-33rd-house-app` | 294,831 | Private | Large application suite |
| 26 | `the33rdhouse-living-codex` | 713 | Internal | Knowledge/Codex application |
| 27 | `the33rdhouse-mobile-app` | 10,523 | Internal | Mobile implementation |
| 28 | `deity-atlas-explorer` | 570 | Private | Deity Atlas / cosmology implementation |
| 29 | `the-33rd-house-org` | 0 | Private | Empty namespace |
| 30 | `newsletter_sources_website` | 147 | Private | Publishing/content |
| 31 | `the-33rd-house-seal` | 0 | Internal | Empty placeholder |
| 32 | `the-33rd-house-govern` | 0 | Private | Empty governance placeholder |
| 33 | `33rdhouse-landing` | 222 | Private | Landing/lead-capture |
| 34 | `turbo-monorepo` | 187 | Private | Starter |
| 35 | `monorepo-turborepo` | 187 | Private | Duplicate starter |
| 36 | `master` | 0 | Private | Empty namespace |
| 37 | `portfolio` | 10 | Internal | Portfolio/registry |
| 38 | `the33rdhouse-platform-commit-b8baa4ada7aa03c9fa496ce3c45ffd2436603e4d` | 71 | Private | Snapshot |
| 39 | `turbo-lamp` | 4 | Private | Legacy reference shell |
| 40 | `the33` | 0 | Private | Empty namespace |
| 41 | `documents` | 2,347,950 | Public | Large document/archive estate |
| 42 | `animated-octo-enigma` | 1 | Private | Prototype/demo |
| 43 | `the-house` | 5 | Private | Minimal prototype |
| 44 | `the33rdhouse-platform` | 312 | Private | Platform control plane |
| 45 | `the33rdhouse-api` | 9 | Private | API boundary / reserved namespace |
| 46 | `the33rdhouse-bots` | 497 | Internal | Bot/automation estate |
| 47 | `the33rdhouse-mobile` | 0 | Private | Empty mobile namespace |
| 48 | `the33rdhouse-docs` | 2 | Private | Documentation placeholder |
| 49 | `the33rdhouse-assets` | 4 | Private | Shared asset repository |
| 50 | `aibhub` | 9 | Private | AIB Hub |
| 51 | `cautious-telegram-demo-repository` | 4 | Internal | Demo |
| 52 | `.github-private` | 15 | Internal | Organisation governance |
| 53 | `australian-network-publisher` | 108 | Internal | Publishing |
| 54 | `Daniels-Ecosystem` | 86 | Internal | Ecosystem registry/application |
| 55 | `daniels-multi-account-registry` | 0 | Private | Empty registry namespace |

**Control note:** repository size, name, creation order, or visibility does not establish production or canonical authority.

---

## 5. REPOSITORY ROLE TAXONOMY

Every retained repository should ultimately have one primary role:

1. **Control plane**
2. **Canonical product/application**
3. **Canonical knowledge**
4. **Curriculum**
5. **Infrastructure/API**
6. **Automation/publishing**
7. **Shared assets**
8. **Governance/documentation**
9. **Personal brand/ecosystem**
10. **Template/demo/experiment**
11. **Placeholder/namespace**
12. **Snapshot/derived artefact**

Primary control-plane candidate: `The33rdHouse/the33rdhouse-platform`.

Its current README describes it as the “Master Sovereign Platform for The 33rd House ecosystem.”

---

## 6. CANONICAL IMPLEMENTATION MODEL

The implementation architecture should be represented as:

```
THE 33RD HOUSE CONTROL PLANE
        │
        ├── Governance
        ├── Repository Registry
        ├── Canonical IDs
        ├── Provenance
        ├── Deployment Map
        └── Adapter / Integration Map
                 │
                 ├── Knowledge
                 │    ├── Sacred Library
                 │    ├── Living Codex
                 │    └── Deity Atlas
                 │
                 ├── Curriculum
                 │    └── Inner Circle
                 │
                 ├── Applications
                 │    ├── Web
                 │    ├── Mobile
                 │    ├── Atlas Explorer
                 │    └── Interactive Experiences
                 │
                 ├── Operations
                 │    ├── Bots
                 │    ├── Publishing
                 │    └── Assets
                 │
                 └── Commerce / Entitlements
```

This is an architecture/control target, not an instruction to merge repositories immediately.

---

## 7. GATE / REALM IMPLEMENTATION AUDIT

### 7.1 144 Realms

Direct implementation evidence exists for the 144-Realm model.

`the33rdhouse-mobile-app` contains `constants/realms-data.ts`, including explicit 144-Realm data and lookup functions such as:

- `getRealmById`
- `getRealmsByGate`
- `getRealmsByElement`
- `getRealmsByZodiac`

`the-33rd-house-production` contains a schema explicitly documenting **144 Realms (12 per Gate)**.

`deity-atlas-explorer` also describes **144 Realms**.

### 7.2 12-Gate implementation family

Strong implementation evidence exists in:

- `the33rdhouse-mobile-app`
- `333`
- `the-33rd-house-production`

These implementations establish a substantial 12-Gate family.

---

## 8. CRITICAL CONFLICT — `deity-atlas-explorer`

`deity-atlas-explorer` contains a material alternative architecture.

Its `client/src/pages/MasterDocument.tsx` explicitly defines:

**13 Gates & 144 Realms**

and describes:

- 13 Gates
- Gate 0–12
- 13 Chakras
- 144 Realms.

Its `drizzle/schema.ts` contains a Gates table documented as:

**13 Gates of Consciousness (Gate 0-12)**

Its Master Document implementation also presents:

**447 Deities Across 8 ERAs**

The repository therefore contains direct UI, data and schema evidence for a 13-Gate model.

### Control interpretation

The correct state is:

**IMPLEMENTED / CANON CONFLICT**

It is not:

**repository is wrong**

and it is not:

**delete or rewrite the 13-Gate model**

until canonical authority is formally resolved.

---

## 9. 12 GATES VS 13 GATES

Current implementation models:

### Model A — 12-Gate family

Evidence:

- `the33rdhouse-mobile-app`
- `333`
- `the-33rd-house-production`

### Model B — 13-Gate family

Evidence:

- `deity-atlas-explorer`
- UI
- database schema
- Master Document architecture.

Possible compatibility interpretation requiring explicit approval:

- Gate 0 = threshold / pre-Gate state
- Gates 1–12 = canonical twelve Gates.

That interpretation must **not** be inferred from code.

Required architecture decision:

- canonical Gate count
- Gate numbering
- Gate 0 semantics
- Realm numbering
- Realm-to-Gate mapping
- curriculum relationship
- chakra relationship
- membership/progression relationship
- backward compatibility.

---

## 10. NUMERIC SEMANTICS CONTROL

Never infer a count from an identifier.

Examples:

`gate_id = 7` does not mean `gate_count = 7`.

`realm_id = 70` does not mean `realm_count = 70`.

Use typed fields:

```
gate_id
realm_id
gate_count
realm_count
```

---

## 11. 8-ERA DEITY ATLAS DIMENSION

The Deity Atlas contains an 8-ERA classification dimension.

The implementation describes:

- ERA-01 — Early Urban Civilizations
- ERA-02 — Late Bronze / Iron Age
- ERA-03 — Classical Antiquity
- ERA-04 — Vedic & South Asian
- ERA-05 — Norse & Germanic
- ERA-06 — Late Antiquity & Medieval
- ERA-07 — Pre-Columbian Americas
- ERA-08 — Modern & Syncretic

Control rule:

**Era ≠ Gate**

unless canonical authority explicitly establishes a mapping.

The ERA system should remain a historical/classification dimension, while Gates remain an initiatic/curriculum dimension, unless formally reconciled.

---

## 12. DEITY ATLAS IMPLEMENTATION

`deity-atlas-explorer` contains implementation evidence for:

- 447 deity entries
- 109 traditions
- 13 Gates
- 144 Realms
- cosmology
- zodiac
- planets
- stars
- chakras
- research/library material
- meditation content.

Its Master Document uses a 21-field deity schema and identifies the corpus as 447 deities across 8 ERAs.

This is substantial implementation evidence, not a placeholder.

---

## 13. PRODUCTION IMPLEMENTATION

`the-33rd-house-production` contains implementation evidence for:

- Gates
- 144 Realms
- curriculum
- library
- traditions
- glossary
- memberships
- Stripe products
- user progress
- public-site content
- legal/terms material.

Its schema explicitly describes **144 Realms (12 per Gate)** and its Gate schema is documented as a **12-Gate** structure.

This is strong evidence for the 12-Gate implementation family.

---

## 14. `333` / `curriculum` DUPLICATE CONTROL

The repositories:

- `The33rdHouse/333`
- `The33rdHouse/curriculum`

have the same current repository size and are established by prior audit evidence as a duplicate/derived family.

Current live verification also confirms that `333` is a substantial implementation repository.

Control state:

**DUPLICATE FAMILY — PROVENANCE COMPARISON REQUIRED**

Do not delete either repository merely from naming similarity.

Required comparison:

- HEAD SHA
- history
- tree
- unique files
- data
- routes
- dependencies
- deployments
- external references.

---

## 15. SACRED LIBRARY CONTROL

Current repositories include:

- `sacred-library`
- `sacred-library-static`
- `the33rdhouse-sacred-library-static`
- `the33rdhouse-living-codex`
- `ascension-full-knowledge-base`
- `ascension-full-knowledge-basee`.

Required hierarchy:

```
SOURCE CORPUS
   ↓
CANONICAL KNOWLEDGE MODEL
   ↓
APPLICATION
   ↓
STATIC EXPORT
```

Do not treat a generated/static repository as the authoritative corpus merely because it is public or large.

---

## 16. CURRENT PLACEHOLDER ESTATE

Current zero-size repositories include:

- `next-platform-starter-0d74e`
- `next-platform-starter-d3604`
- `the-33rd-house-org`
- `the-33rd-house-seal`
- `the-33rd-house-govern`
- `master`
- `the33`
- `the33rdhouse-mobile`
- `daniels-multi-account-registry`

They are **archive/deletion candidates**, not approved deletion targets.

Before destructive action:

- external references
- deployments
- package dependencies
- CI
- webhooks
- documentation references
- namespace requirements

must be checked.

---

## 17. REPOSITORY STATUS VOCABULARY

Use:

`CANONICAL`  
`ACTIVE`  
`SUPPORTING`  
`DERIVED`  
`EXPERIMENTAL`  
`TEMPLATE`  
`EXTERNAL-FORK`  
`SNAPSHOT`  
`DEPRECATED`  
`ARCHIVED`  
`DELETE-LATER`  
`UNRESOLVED`

Avoid vague lifecycle labels such as:

- old
- new
- main
- backup
- final
- latest
- master
- test
- temporary

unless accompanied by controlled metadata.

---

## 18. REQUIRED REPOSITORY METADATA

Every retained repository should ultimately document:

- purpose
- owner
- canonical status
- visibility rationale
- runtime
- dependencies
- environment variable **names only**
- test command
- deployment destination
- CI
- branch policy
- rollback process
- upstream/downstream repositories
- source content
- derived artefacts
- migration history
- licence/IP position.

Recommended controlled metadata:

```
canonical: true|false
lifecycle: active|supporting|derived|deprecated|archived|...
owner_role: ...
criticality: low|medium|high
data_classification: public|internal|confidential
product: the33rdhouse
domain: web|mobile|knowledge|curriculum|automation|publishing|platform
source_of_truth: true|false
```

---

## 19. CODE-TO-CANON EVIDENCE CHAIN

Every governed implementation object should be traceable as:

```
Canonical Object ID
      ↓
Canonical source record
      ↓
Canonical version
      ↓
Implementation repository
      ↓
Repository path
      ↓
Commit SHA
      ↓
Deployment
      ↓
Public/application surface
```

If two repositories implement the same object differently:

```
Canonical Object
      ↓
CONFLICT RECORD
      ↓
Repository A implementation
Repository B implementation
      ↓
Canonical decision required
```

---

## 20. PARALLEL REPOSITORY / DUPLICATE PROTOCOL

### Step 1 — Freeze interpretation

Do not call either implementation “wrong”.

### Step 2 — Identify source

Record:

- repository
- branch
- commit
- date
- owner
- deployment
- consumer.

### Step 3 — Compare

Compare:

- schema
- data
- routes
- UI
- business logic
- configuration
- tests
- integrations
- content.

### Step 4 — Preserve unique material

Anything existing only in one repository must be retained until disposition is decided.

### Step 5 — Identify authority

Use canonical project evidence.

### Step 6 — Create ADR

Record the architecture decision.

### Step 7 — Migrate

Only after approval.

### Step 8 — Archive

Only after dependency verification.

### Step 9 — Delete later

Only with explicit approval and retention satisfaction.

---

## 21. SUPERPOWERS OPERATING WORKFLOW

The implementation workflow is:

```
1. BRAINSTORM
       ↓
2. INVENTORY
       ↓
3. EVIDENCE AUDIT
       ↓
4. PLAN
       ↓
5. ISOLATED IMPLEMENTATION
       ↓
6. TEST
       ↓
7. REVIEW
       ↓
8. VERIFY
       ↓
9. MERGE
       ↓
10. READ-BACK
       ↓
11. UPDATE MASTER 04
```

No “fix everything” mutation.

---

## 22. SAFE GITHUB MUTATION RULE

**Read freely. Write deliberately. Destroy never by implication.**

Read operations are appropriate during forensic audit.

Code migration requires:

- explicit source
- explicit destination
- rollback path
- verification.

Archive requires dependency/reference verification.

Delete requires:

- provenance preservation
- backup/retention
- reference scan
- deployment scan
- owner approval
- retention determination
- restore path.

---

## 23. DEPLOYMENT AUTHORITY CONTROL

Repository names do not establish production authority.

Before archiving any web repository verify:

```
Repository
 ↓
Deployment workflow
 ↓
Vercel/project
 ↓
Domain
 ↓
Production deployment
 ↓
DNS / routing
```

Do not archive a web repository because another repository appears newer, larger or better named.

---

## 24. SECURITY CONTROL

No control document should contain:

- passwords
- API keys
- private keys
- recovery codes
- session tokens
- secret environment values
- full payment credentials.

Record only:

```
SECRET NAME
PURPOSE
LOCATION
OWNER
ROTATION STATUS
```

---

## 25. IMPLEMENTATION EVIDENCE MATRIX

| Architecture object | Implementation evidence | Current control state |
|---|---|---|
| 12 Gates | Mobile, `333`, production | Strong implementation family |
| 13 Gates | `deity-atlas-explorer` | Strong competing implementation |
| 144 Realms | Mobile, `333`, production, Atlas | Strong implementation |
| Gate 0 | Atlas | Explicit structural concept |
| 8 ERAs | Living Codex / Atlas | Strong Atlas classification |
| 447 deities | Atlas | Strong implementation |
| 109 traditions | Atlas / production | Strong implementation |
| 48-week curriculum | Curriculum / production / Atlas | Strong implementation family |
| Sacred Library | Multiple repositories | Parallel implementation |
| Living Codex | Dedicated repository | Implemented |
| Mobile | Dedicated repository | Implemented |
| Bots | Dedicated repository | Implemented |
| Publishing | Dedicated repositories | Implemented |
| API | Repository exists | Implementation status requires verification |
| Platform control plane | `the33rdhouse-platform` | Strong architectural candidate |

---

## 26. IMPLEMENTATION STATUS MATRIX

Use:

| Status | Meaning |
|---|---|
| `CONFIRMED` | Direct implementation evidence found |
| `CONFIRMED-PARTIAL` | Some implementation confirmed |
| `DUPLICATED` | Same/near-identical implementation exists elsewhere |
| `PARALLEL` | Two materially different implementations exist |
| `CONFLICTING` | Implementation conflicts with canonical authority |
| `MISSING` | Canonical object has no confirmed implementation |
| `ORPHANED` | Implementation exists but canonical owner is unknown |
| `UNRESOLVED` | Evidence insufficient |
| `DERIVED` | Repository is generated/exported derivative |
| `SNAPSHOT` | Historical implementation copy |
| `ARCHIVE-CANDIDATE` | Candidate pending dependency gate |

---

## 27. MASTER 04 IMPLEMENTATION VIEW

MASTER 04 should maintain one row per significant implementation object.

Required fields:

| Field | Purpose |
|---|---|
| Implementation ID | Immutable internal record ID |
| Canonical Object ID | Link to canonical entity |
| Repository | GitHub repository |
| Branch | Implementation branch |
| Commit SHA | Exact implementation evidence |
| Path | File/component |
| Implementation Type | UI/data/schema/API/workflow |
| Status | Controlled implementation state |
| Canonical Version | Canonical version implemented |
| Source Authority | Canonical source |
| Conflict Flag | Yes/no |
| Conflict Type | Gate/count/schema/content/etc. |
| Deployment | Production/staging/local |
| Consumer | Application or product |
| Last Verified | Audit date |
| Evidence URL | Direct GitHub evidence |
| Notes | Controlled explanation |

---

## 28. MASTER 04 RECORD TYPES

At minimum:

1. Repository
2. Repository Family
3. Canonical Object
4. Implementation Evidence
5. Canonical Version
6. Conflict
7. Duplicate
8. Migration
9. Deployment
10. Domain
11. Application
12. Service
13. Dependency
14. Asset
15. Data Source
16. Content Source
17. Publication
18. Archive Candidate
19. Decision
20. Audit Event.

---

## 29. CONFIDENCE MAPPING

Use:

- **A — Direct primary evidence**
- **B — Strong corroborated evidence**
- **C — Secondary evidence**
- **D — Historical evidence**
- **E — Inference only**

Current examples:

**Atlas 13-Gate implementation — A**

Direct evidence exists in UI and database schema.

**12-Gate mobile implementation — A**

Direct static data and application implementation exists.

**12 Gates is final canonical model — NOT YET ESTABLISHED**

This requires designated canonical authority.

---

## 30. CURRENT HIGH-PRIORITY CONFLICT REGISTER

### CONFLICT-001 — 12 vs 13 Gates

**Severity:** Critical architecture reconciliation

**Evidence**

12-Gate:
- mobile
- `333`
- production

13-Gate:
- `deity-atlas-explorer`
- Master Document
- database schema.

**Required decision**

Determine whether:

**Structure A**
- 12 canonical Gates
- Gate 0 = threshold metadata

or:

**Structure B**
- 13 canonical Gates
- Gate 0–12

or another formally defined structure.

No repository should be rewritten until the decision is recorded.

### CONFLICT-002 — Gate/Realm numeric semantics

Identifiers must not be interpreted as counts.

### CONFLICT-003 — Deity Atlas 8 ERAs vs Gate architecture

Maintain as separate dimensions unless explicitly joined by canonical authority.

### CONFLICT-004 — `333` / `curriculum`

Strong duplicate-family evidence. Exact tree/history/provenance comparison required.

### CONFLICT-005 — Sacred Library static duplicates

Determine source → build → deployment relationships.

### CONFLICT-006 — ASCENSION knowledge-base pair

Determine whether the pair is duplicate, fork, snapshot or materially distinct.

### CONFLICT-007 — Dragon pair

Do not merge based on naming. The live sizes differ materially.

---

## 31. RECOMMENDED CONSOLIDATION TARGET

The objective is:

**Minimum repository count consistent with clear ownership, provenance, independent deployment boundaries, security, and product responsibility.**

It is not a fixed numerical quota.

The number 33 must not override architecture, provenance or deployment requirements.

---

## 32. PROVISIONAL CANONICAL CORE

Subject to final validation:

```
the33rdhouse-platform
the33rdhouse-website
the33rdhouse-mobile-app
the-33rd-house-app
the-33rd-house-production
the33rdhouse-inner-circle-curriculum
sacred-library
the33rdhouse-living-codex
deity-atlas-explorer
the33rdhouse-api
the33rdhouse-bots
australian-network-publisher
the33rdhouse-assets
.github-private
```

Provisionally separate pending evidence:

```
dragons-current
33
escape-the-matrix
veiled-heart-sovereign-web
Daniels-Ecosystem
```

This is an architecture candidate, **not a deletion instruction**.

---

## 33. CONSOLIDATION SEQUENCE

### Wave 0 — Evidence freeze

Capture:

- repository
- default branch
- HEAD
- branches
- tags
- releases
- workflows
- deployment references
- package manifests
- environment variable names
- external references
- repository relationships.

### Wave 1 — Obvious placeholders

Investigate:

- empty repositories
- snapshots
- generic demos
- duplicate starters.

### Wave 2 — Strong duplicate families

Resolve:

- `333` / `curriculum`
- Sacred Library static pair
- ASCENSION pair
- Next.js pair
- Turbo pair.

### Wave 3 — Production applications

Resolve:

- `the33rdhouse-website`
- `the-33rd-house-production`
- `the-33rd-house-app`
- `the33rdhouse-platform`

with deployment verification.

### Wave 4 — Knowledge architecture

Resolve:

- Sacred Library
- Living Codex
- Deity Atlas
- ASCENSION KB
- Curriculum

into a source/application/derived hierarchy.

### Wave 5 — Gate/Realm canonical reconciliation

Resolve the 12/13 Gate architecture before migrating competing implementations.

---

## 34. ADR-001 — CANONICAL GATE AND REALM ARCHITECTURE

**Problem**

Multiple active implementations encode different Gate counts.

**Evidence**

12-Gate:
- mobile
- `333`
- production

13-Gate:
- `deity-atlas-explorer`

**Decision required**

Define:

- canonical Gate count
- Gate numbering
- Gate 0 semantics
- Realm numbering
- Realm-to-Gate mapping
- curriculum relationship
- chakra relationship
- historical compatibility
- UI naming
- database schema.

**Required outputs**

```
canonical_gate_count
gate_id_range
threshold_definition
realm_count
realm_id_range
gate_realm_mapping
migration_rule
backward_compatibility_rule
```

---

## 35. ADR-002 — DEITY ATLAS ERA MODEL

Define ERA-01 through ERA-08 as an independent classification dimension.

Control rule:

**Era ≠ Gate**

unless canonical authority explicitly establishes a relationship.

---

## 36. ADR-003 — CANONICAL KNOWLEDGE SOURCE

Define:

```
source corpus
     ↓
canonical knowledge model
     ↓
application indexes
     ↓
static exports
```

No application repository becomes an accidental source of truth merely because it contains the largest dataset.

---

## 37. ADR-004 — REPOSITORY LIFECYCLE

Adopt:

```
ACTIVE
  ↓
DEPRECATED
  ↓
ARCHIVED
  ↓
RETENTION HOLD
  ↓
DELETE
```

Delete requires explicit approval.

Archive preserves history.

---

## 38. AUDIT CHECKLIST

### Identity

- [ ] Repository verified
- [ ] Owner verified
- [ ] Visibility verified
- [ ] Default branch verified
- [ ] HEAD verified

### Architecture

- [ ] Purpose identified
- [ ] Runtime identified
- [ ] Dependencies identified
- [ ] Data model identified
- [ ] Entry points identified

### Canon

- [ ] Canonical objects identified
- [ ] Canonical version identified
- [ ] Source authority identified
- [ ] Conflicts logged

### Deployment

- [ ] CI verified
- [ ] Deployment verified
- [ ] Domain verified
- [ ] Production relationship verified

### Security

- [ ] Environment names documented
- [ ] Secrets excluded
- [ ] Security workflows checked
- [ ] Dependency status checked

### Consolidation

- [ ] Duplicate family checked
- [ ] References checked
- [ ] Unique assets checked
- [ ] Migration required?
- [ ] Archive candidate?
- [ ] Delete-later candidate?

---

## 39. GITHUB EVIDENCE RULE

For every important implementation claim preserve:

- Repository
- Path
- Commit SHA
- Date checked
- Evidence excerpt
- Canonical object
- Status.

Current verified examples:

**Repository:** `The33rdHouse/deity-atlas-explorer`  
**Path:** `client/src/pages/MasterDocument.tsx`  
**Finding:** Application explicitly implements 13 Gates and 144 Realms.  
**Status:** IMPLEMENTED / CANON CONFLICT  
**Action:** ADR-001

**Repository:** `The33rdHouse/deity-atlas-explorer`  
**Path:** `drizzle/schema.ts`  
**Finding:** Gates schema explicitly documents 13 Gates of Consciousness (Gate 0-12).  
**Status:** IMPLEMENTED / CANON CONFLICT  
**Action:** ADR-001

**Repository:** `The33rdHouse/the33rdhouse-mobile-app`  
**Path:** `constants/realms-data.ts`  
**Finding:** Direct 144-Realm data and Gate-based lookup implementation.  
**Status:** IMPLEMENTED / 12-GATE FAMILY

**Repository:** `The33rdHouse/the-33rd-house-production`  
**Path:** `drizzle/schema.ts`  
**Finding:** Gates schema and 144-Realm schema explicitly document the 12-Gate / 144-Realm family.  
**Status:** IMPLEMENTED / 12-GATE FAMILY

---

## 40. CURRENT CONTROL POSITION

The live implementation layer has now been read directly rather than inferred from repository names.

Current control position:

**IMPLEMENTATION AUDIT ACTIVE**

The strongest current conclusion is:

> The GitHub estate contains multiple real implementations of The 33rd House architecture, including a material 12-Gate / 13-Gate divergence.

Therefore the next stage is:

**FORENSIC IMPLEMENTATION RECONCILIATION**

with MASTER 04 functioning as the control plane.

---

## 41. NON-NEGOTIABLE RULE

**CODE PROVES IMPLEMENTATION.**

**AUTHORITY EVIDENCE PROVES CANON.**

Therefore:

```
Code disagreement
        ↓
Evidence record
        ↓
Canon reconciliation
        ↓
Architecture decision
        ↓
Migration plan
        ↓
Implementation change
        ↓
Verification
        ↓
MASTER 04 update
```

---

## 42. IMMEDIATE NEXT ACTIONS

### P0 — Canonical Gate decision

Resolve:

**12 Gates vs 13 Gates / Gate 0 semantics.**

This affects:

- database schemas
- mobile
- Atlas
- curriculum
- progression
- UI
- Realm mapping
- chakras
- membership
- publishing
- documentation.

### P0 — Current deployment map

For each production-looking repository establish:

`repo → Vercel/project → domain → production deployment`

### P0 — Exact duplicate scan

Run recursive comparison on:

- `333` ↔ `curriculum`
- `sacred-library-static` ↔ `the33rdhouse-sacred-library-static`
- `ascension-full-knowledge-base` ↔ `ascension-full-knowledge-basee`
- `nextjs` ↔ `nextjs-boilerplate`
- `turbo-monorepo` ↔ `monorepo-turborepo`

### P1 — Knowledge reconciliation

Build a Canonical Knowledge Object Registry covering:

- Deity
- Tradition
- Era
- Gate
- Realm
- Curriculum
- Book
- Chapter
- Practice
- Meditation
- Glyph
- Framework.

### P1 — Repository registry

Make `the33rdhouse-platform` and MASTER 04 mutually traceable.

### P1 — Deployment/source ownership

For every public-facing product identify exactly one production source while preserving historical repositories as evidence.

### P2 — Placeholder retirement

Only after dependency scans:

- empty namespaces
- generic demos
- starter variants
- snapshots.

---

## 43. OPERATING INSTRUCTION FOR FUTURE RECONCILIATION PASSES

You are operating as **The 33rd House Implementation Reconciliation Agent**.

Treat GitHub as the implementation/evidence layer and designated canonical project materials as the authority layer.

Your governing rule is:

**Code proves implementation. Authority evidence proves canon.**

Never silently overwrite implementation because it differs from a master document. First record the difference as evidence, classify the conflict, identify the authoritative source, and only then propose or execute remediation.

Inventory repositories before changing them.

For every important repository record:

- repository
- owner
- visibility
- default branch
- HEAD commit
- purpose
- runtime
- dependencies
- deployment
- domains
- workflows
- environment-variable names only
- canonical objects implemented
- source authority
- conflicts
- duplicate relationships
- lifecycle status.

Never place secrets into the master record.

Before archive/delete:

1. preserve provenance
2. compare unique content
3. check references
4. check deployment
5. check dependencies
6. document before/after state
7. obtain exact action approval
8. verify the mutation by read-back
9. update MASTER 04.

Treat the Gate architecture as an explicit unresolved control issue until the canonical model is formally decided.

Specifically reconcile:

- 12-Gate implementations
- 13-Gate implementation in `deity-atlas-explorer`
- Gate 0 semantics
- 144-Realm mapping
- 8-Era Deity Atlas classification.

Do not assume that an Era is a Gate.

Do not assume that a numeric identifier is a count.

Do not delete or archive production-looking repositories until deployment authority is independently verified.

The final objective is not an arbitrary repository count. The objective is the smallest defensible architecture with clear ownership, provenance, independent deployment boundaries, security, and one canonical source for each governed object.

---

## 44. SOURCE BASIS

This control document incorporates the supplied consolidated control framework and current GitHub implementation evidence.

Current live verification was performed against the `The33rdHouse` GitHub organisation on **2026-09-27**.

Direct implementation evidence was read from:

- `The33rdHouse/the33rdhouse-platform`
- `The33rdHouse/deity-atlas-explorer`
- `The33rdHouse/the33rdhouse-mobile-app`
- `The33rdHouse/the-33rd-house-production`

The project control framework supplied for this task establishes:

- GitHub as implementation/evidence layer
- canonical project materials as authority layer
- MASTER 04 as reconciliation/control plane
- inventory-first processing
- provenance preservation
- separation of fact from inference
- explicit unresolved/conflict states
- secrets hygiene
- dependency/deployment checks before destructive operations
- Superpowers-style staged implementation and verification.

---

## 45. CONTROL SIGNATURE

**THE 33RD HOUSE**

**MASTER GITHUB IMPLEMENTATION & CANON RECONCILIATION CONTROL DOCUMENT**

Status: **ACTIVE CONTROL DOCUMENT**  
Primary Layer: **GitHub Implementation / Evidence**  
Authority Layer: **Canonical Project Materials**  
Control Plane: **MASTER 04**  
Current GitHub Inventory: **55 repositories**  
Critical Open Architecture Issue: **12 vs 13 Gates**

**CORE PRINCIPLE**

> **CODE PROVES IMPLEMENTATION.**  
> **AUTHORITY EVIDENCE PROVES CANON.**

**No destructive repository action is authorised merely by this document.**
