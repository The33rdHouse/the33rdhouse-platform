# Realm Conflict Review Procedure

## Purpose

Realm source disagreements are governance events, not data-cleaning errors. The canonical system must preserve every source variant and must never silently overwrite a conflicting name, description, Gate mapping, meditation reference, or other canon-significant field.

## Canon lifecycle

Conflicted canonical objects remain `UNDER_REVIEW` until an authorized reviewer records a decision. Published user-facing reads may consume only `APPROVED` canonical versions unless an explicit authenticated preview/admin path is used.

## Required review sequence

For every Realm marked `UNDER_REVIEW`:

1. **Identify the canonical Realm identity**
   - Confirm the stable Realm ID and ordinal.
   - Confirm the expected structural Gate relationship.

2. **Inspect every source variant**
   - Review all preserved source names, descriptions, Gate metadata, meditation metadata, and other canon-significant fields.
   - Do not edit or delete a source variant during review.

3. **Verify provenance**
   - Confirm source package identifier.
   - Confirm source record identifier.
   - Confirm the source package passed the approved filename, byte-size, and SHA-256 manifest checks.
   - Review source-version metadata and citations where available.

4. **Compare the disagreement explicitly**
   - Record which fields agree.
   - Record which fields conflict.
   - Distinguish structural conflict from presentation/content variation.

5. **Select or compose the proposed canonical value**
   - Apply an approved precedence rule where one exists.
   - If no precedence rule exists, use review judgment supported by provenance and evidence.
   - Never represent an interpretive cross-tradition mapping as an unqualified factual equivalence.

6. **Record the rationale**
   - State why the proposed canonical value was selected.
   - Link the decision to the source variants and citations/evidence used.
   - Preserve unresolved uncertainty in the review notes rather than hiding it.

7. **Administrative approval**
   - The reviewer must be an authenticated persisted admin role.
   - Record actor, decision, timestamp, notes, and resulting version.

8. **Create a new canon version**
   - Promotion/review must append version and audit history.
   - Historical canon versions remain queryable.

9. **Verify publication state**
   - `APPROVED` versions may be exposed by public reads.
   - `UNDER_REVIEW`, `DRAFT`, `REJECTED`, and `ARCHIVED` versions must not leak through normal public canonical reads.

## Conflict policy

The following rules are mandatory:

- Never delete the losing source representation.
- Never rewrite a raw source record to match the chosen canon.
- Never auto-promote a conflicted Realm merely because one source was imported first.
- Never use UI labels as the canonical authority when the underlying source records disagree.
- Never infer media availability from the existence of a Realm record.
- Never collapse an interpretive mapping into `EQUIVALENCE` without evidence supporting that stronger claim.

## Re-review

A later source package, citation, or governance decision may supersede the current canonical presentation. Re-review creates a new canonical version; it does not mutate the historical source record or erase the earlier approved version.

## Completion evidence

A Realm conflict is considered resolved only when all of the following are true:

- all relevant source variants remain queryable;
- provenance is intact;
- a rationale is recorded;
- an authorized admin decision exists;
- the canonical version number has advanced;
- the audit log records the action;
- public APIs return the approved canonical value and not unresolved variants.
