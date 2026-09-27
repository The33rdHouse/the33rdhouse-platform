# ADR-001 — Canonical Gate and Realm Architecture

**Status:** OPEN — REQUIRES CANONICAL AUTHORITY  
**Date:** 2026-09-27  
**Scope:** Gates, Gate 0 semantics, Realms, curriculum/progression/chakra relationships  
**Control rule:** Code proves implementation. Authority evidence proves canon.

## Context

The live GitHub implementation estate contains materially different Gate architectures. This ADR records the conflict without selecting a winner.

### 12-Gate implementation family

**the33rdhouse-mobile-app**
- Path: `constants/realms-data.ts`
- Commit: `e104537739f98cc32031222b5f87bc4e930d8cbe`
- Direct evidence: file header states 144 Realms and 12 Gates × 12 Realms = 144; the data itself uses `gate: 0` for the Threshold.
- Control state: IMPLEMENTED / 12-GATE FAMILY

**the-33rd-house-production**
- Path: `drizzle/schema.ts`
- Commit: `f3135488cd64117343a836faee2a573c14709917`
- Direct evidence: schema comments define “12 Gates” and “144 Realms (12 per Gate)”.
- Control state: IMPLEMENTED / 12-GATE FAMILY

### 13-Gate implementation

**deity-atlas-explorer**
- Path: `client/src/pages/MasterDocument.tsx`
- Commit: `d9883176d7859695c9cb52deadf0e6544c195086`
- Direct evidence: UI model states “13 Gates & 144 Realms” and describes 13 Gates.
- Path: `drizzle/schema.ts`
- Commit: `fa95283bc7cf950de082e0a7462d46aa4cc19300`
- Direct evidence: Gates table comment states “13 Gates of Consciousness (Gate 0-12)”; Realms table states 144 Realms.
- Control state: IMPLEMENTED / CANON CONFLICT

## Decision

**No canonical Gate count is selected by this ADR.**

The conflict remains OPEN until designated canonical authority explicitly decides the structure.

Possible structures to decide between include:

### Structure A
- 12 canonical Gates
- Gate 0 is a threshold/pre-Gate state or metadata layer
- Canonical instructional Gates are 1–12

### Structure B
- 13 canonical Gates
- Gate range is 0–12
- Gate 0 is a fully canonical Gate

### Structure C
- Another formally specified structure, with explicit compatibility rules.

Structure A must not be inferred merely because multiple repositories use 12 Gates. Structure B must not be inferred merely because Atlas implements Gate 0–12.

## Required canonical outputs

The approving authority must specify:

| Field | Required decision |
|---|---|
| canonical_gate_count | Integer |
| gate_id_range | Exact range |
| threshold_definition | Meaning and lifecycle of Gate 0, if applicable |
| realm_count | Canonical total |
| realm_id_range | Exact range |
| gate_realm_mapping | Formal mapping |
| curriculum_relationship | How curriculum maps to Gates |
| chakra_relationship | Whether/how chakras map to Gates |
| progression_relationship | User/member progression semantics |
| historical_compatibility | Treatment of legacy implementations |
| ui_naming | Display terminology |
| database_schema | Canonical schema contract |
| migration_rule | How non-canonical implementations are migrated |
| backward_compatibility_rule | Required compatibility behavior |

## Numeric semantics

Identifiers and counts are separate concepts.

- `gate_id` is an identifier.
- `realm_id` is an identifier.
- `gate_count` is a count.
- `realm_count` is a count.

No implementation may infer a count from an identifier.

## 144-Realm control

The 144-Realm model is independently corroborated by multiple repositories. The Gate-count conflict therefore does not, by itself, invalidate the 144-Realm implementation evidence.

The canonical decision must explicitly define how 144 Realms map to the selected Gate structure.

## Non-decisions

This ADR does **not**:
- rewrite code;
- migrate data;
- archive repositories;
- delete repositories;
- select a canonical repository;
- declare either implementation “wrong”.

## Exit criteria

ADR-001 may move from OPEN to ACCEPTED only when the canonical authority record contains the required fields above and is linked into the MASTER 04 decision register.

After acceptance:
1. create a migration specification;
2. map every affected implementation;
3. identify backward-compatibility requirements;
4. implement only on isolated branches;
5. test;
6. review;
7. verify deployment;
8. update MASTER 04.

**Current state: OPEN / CANONICAL DECISION REQUIRED.**
