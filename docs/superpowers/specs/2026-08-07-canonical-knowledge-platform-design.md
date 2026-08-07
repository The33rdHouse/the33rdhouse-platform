# Canonical Knowledge Platform — Design Specification

**Status:** Approved architecture baseline  
**Decision:** Approach B — Canonical Knowledge Platform  
**Repository:** `The33rdHouseMaster/the33rdhouse-platform`  
**Date:** 2026-08-07  

## 1. Objective

Create one canonical knowledge and progression platform for The 33rd House ecosystem. Deity Atlas, Escape the Matrix, the 12 Gates, 144 Realms, meditation assets, curriculum, research provenance and user progression must consume one governed source of truth rather than maintaining competing datasets.

The platform will expose multiple experiences from one canonical backend:

- Deity Atlas
- Escape the Matrix
- 12 Gates / 144 Realms journey
- Meditation and teaching library
- Correspondence / cosmology explorer
- Research provenance and mapping-claim review
- User progression, ranks and achievements

## 2. Architectural principle

**One canon → one backend → many experiences.**

No source archive is overwritten during ingestion. Imported records retain source provenance, source identifiers, source hashes where available, and source-version metadata. Canonical records are created only after reconciliation rules have selected or approved the canonical representation.

## 3. Current source baseline

The integration baseline consists of:

- complete backend archive
- Escape Matrix data archive
- Deity Atlas data archive

The combined source set includes structured material for deities, traditions, Gates, Paths, Realms, laws, traps, teachings, meditations, correspondences, research references and progression concepts.

Known discrepancies from the audit must be treated as migration gates rather than silently normalized:

1. The backend deployment documentation and implementation disagree on database/storage/payment architecture.
2. The backend's meditation-realm data is incomplete relative to the stated 144-Realm model.
3. Multiple Realm source files contain materially different names or metadata for many of the same Realm identifiers.
4. Audio coverage is incomplete relative to 144 Realm records.

## 4. Canon hierarchy

### 4.1 Canon object levels

The canonical system should support four governance levels:

1. **Foundational** — identity, doctrine-defining structures and immutable top-level concepts.
2. **Structural** — Gates, Paths, Realms, rank models, correspondence taxonomies.
3. **Content** — teachings, meditations, deity/tradition entries, law/lore content, descriptions.
4. **Operational** — publishing state, media state, indexing, deployment and administrative metadata.

### 4.2 Canon lifecycle

Every governable canon object uses an explicit lifecycle:

`DRAFT → UNDER_REVIEW → APPROVED → REJECTED / ARCHIVED`

Published user experiences may consume only approved canonical versions unless a specific preview/admin mode is enabled.

## 5. Data domains

### 5.1 Identity

- `users`
- `roles`
- `user_roles`
- `sessions`

### 5.2 Canon governance

- `canon_objects`
- `canon_versions`
- `canon_source_records`
- `canon_pins`
- `canon_reviews`
- `audit_log`

### 5.3 Knowledge

- `deities`
- `traditions`
- `concepts`
- `eras`
- `citations`
- `sources`
- `mapping_claims`
- `mapping_claim_evidence`

### 5.4 33rd House structure

- `gates`
- `paths`
- `realms`
- `practices`
- `glyphs`
- `correspondences`

### 5.5 Curriculum and media

- `teachings`
- `meditations`
- `media_assets`
- `realm_media`
- `content_releases`

### 5.6 Progression

- `user_progress`
- `user_gate_progress`
- `user_realm_progress`
- `discoveries`
- `achievements`
- `user_achievements`
- `ranks`
- `user_rank_history`
- `bookmarks`
- `journal_entries`

## 6. Realm reconciliation rule

Realm identity must be separated from Realm presentation.

A canonical Realm record owns a stable internal ID and Gate/ordinal identity. Source-specific Realm names, descriptions and metadata remain attached as source variants until reconciled.

Minimum model:

- `realm_id`
- `gate_id`
- `realm_number`
- `canonical_name`
- `canonical_description`
- `canon_status`
- `source_variants[]`
- `teaching_id`
- `meditation_id`
- `glyph_id`
- `media_assets[]`

### 6.1 Conflict policy

When two source files disagree:

1. Never overwrite either source representation.
2. Preserve both as source variants.
3. Mark the canonical object `UNDER_REVIEW` if no approved precedence rule exists.
4. Record the selected canonical value together with decision provenance.
5. Permit later canonical versioning without changing the historical source record.

This policy applies to Realm names, descriptions, Gate mappings, meditation metadata and other canon-significant fields.

## 7. Research provenance and mapping claims

Cross-tradition statements must not be stored as unqualified facts when they are interpretive mappings.

Supported mapping types:

- `EQUIVALENCE`
- `ANALOGY`
- `FUNCTIONAL_SIMILARITY`
- `SYMBOLIC_RESONANCE`

Supported evidence confidence:

- `A` — strong evidence
- `B` — good evidence
- `C` — reasonable inference
- `D` — speculative

Each mapping claim must be independently reviewable and link to one or more citations or source records.

## 8. Media asset model

Meditation audio and other media are governed independently from Realm definitions.

Minimum `media_assets` fields:

- stable asset ID
- asset type
- storage provider
- storage key / URI
- MIME type
- duration where applicable
- SHA-256 where available
- version
- publication status
- availability status

Availability states:

- `AVAILABLE`
- `PLANNED`
- `MISSING`
- `ARCHIVED`

The application must never infer that all 144 Realms have audio simply because 144 Realm records exist.

## 9. API architecture

The server should be separated into bounded tRPC modules rather than one general router.

Initial API surface:

- `atlas.search`
- `atlas.getDeity`
- `traditions.list`
- `traditions.get`
- `gates.list`
- `gates.get`
- `realms.list`
- `realms.get`
- `realms.complete`
- `paths.list`
- `progress.get`
- `progress.recordDiscovery`
- `achievements.list`
- `correspondences.search`
- `research.getSources`
- `claims.list`
- `claims.create`
- `claims.review`
- `admin.auditLog`

Each module must expose a small, explicit interface and must not depend directly on imported raw JSON at runtime.

## 10. Import architecture

Raw archives are evidence/input, not the runtime database.

Import stages:

1. **Preserve** — store original source files unchanged outside canonical tables.
2. **Inventory** — record file name, type, size, hash and source package.
3. **Parse** — convert source-specific structures into staging records.
4. **Validate** — schema validation, identifiers, duplicates and referential integrity.
5. **Diff** — detect conflicting records across source sets.
6. **Reconcile** — apply approved precedence rules or create review tasks.
7. **Promote** — create approved canonical versions.
8. **Index** — build search / relationship indexes for user-facing experiences.

No production import should skip validation or reconciliation.

## 11. User journey

The user-facing architecture should present one journey rather than disconnected products:

`Gate → Realm → Learn / Explore → Teaching / Tradition / Deity → Correspondence → Practice / Meditation → Discovery → XP / Rank → Next Realm`

Deity Atlas and Escape the Matrix remain distinct experiences, but they read from the same canonical graph and progression system.

## 12. Persistence and progression

The existing progression concepts should be server-backed so progress survives devices and sessions.

Initial ranks:

- Seeker
- Novice
- Initiate
- Adept
- Keeper
- Guardian
- Sage
- Elder

Rank unlock conditions must be data-driven rather than hard-coded into UI components.

## 13. Infrastructure decision gate

Before implementation, the backend infrastructure mismatch must be resolved explicitly.

The canonical platform must select one supported database path and one media-storage path. Deployment documentation must then be updated to match actual implementation.

No production deployment should proceed while documentation claims PostgreSQL/S3/Stripe but runtime code uses materially different services or lacks the claimed integration.

## 14. Security and audit requirements

- No secrets committed to Git.
- Source archives preserved without mutation.
- Administrative canon changes must be auditable.
- Canon approval/rejection must capture actor, timestamp and version.
- User-facing APIs must enforce authorization by role.
- Media access rules must be separated from storage implementation.
- Import jobs must fail closed on schema or referential-integrity errors.

## 15. Testing strategy

### Unit tests

- source parsers
- normalization rules
- Realm conflict detection
- mapping-claim validation
- rank calculation
- asset availability rules

### Integration tests

- staging → canonical promotion
- canonical versioning
- Realm progression persistence
- search and correspondence queries
- role enforcement

### Migration fixtures

Create deterministic fixtures containing:

- matching Realm variants
- conflicting Realm variants
- missing audio
- duplicate deity aliases
- conflicting tradition labels
- claims with A–D evidence confidence

## 16. Implementation boundaries

Phase 1 must build the Canonical Content Core only:

1. schema and migrations
2. import/staging framework
3. source provenance
4. Realm reconciliation
5. core read APIs
6. canon governance primitives

Phase 1 explicitly does **not** require a visual redesign, payment implementation, full gamification UI, social features or speculative AI agents.

Those capabilities can be layered on after the canonical data model is stable.

## 17. Acceptance criteria

The architecture is considered successfully implemented when:

1. All three source packages can be inventoried without changing the originals.
2. Canonical Gates/Paths/Realms have stable identifiers.
3. conflicting Realm variants are surfaced rather than silently overwritten.
4. Deities, traditions, correspondences and research references resolve through canonical IDs.
5. user-facing read APIs no longer depend directly on raw JSON files.
6. media availability is explicit per Realm.
7. canon changes are versioned and auditable.
8. progression data persists server-side.
9. deployment documentation accurately matches runtime infrastructure.

## 18. Approved decision

**Approach B is the governing architecture.**

The 33rd House canonical knowledge core is the master system. Deity Atlas and Escape the Matrix are modules powered by that core. Original source packages remain preserved, and conflicting records require explicit reconciliation before canonical promotion.
