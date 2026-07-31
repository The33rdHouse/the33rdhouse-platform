# 33RD HOUSE DocID Master Index Mapping v3

## Status

**Review-only governance release. Publication remains blocked.**

Canonical workbook artifact:

- `33rdhouse_docid_masterindex_mapping_v3.xlsx`
- SHA-256: `946ce29c99d936863b2864f5a16feeba1de3dc681396cf9b1aeb0fb2f34d4d9f`
- Generated: 2026-08-01 AWST
- Source: `33rdhouse_docid_masterindex_mapping_v2.xlsx`

## Control model

The v3 workbook implements a dual-layer registry:

1. **Document Registry** — one preserved record for every existing DocID.
2. **File Manifest** — one file-level record for every referenced or located rendition.

No DocID has been renumbered or deleted. Duplicate, alias, rendition and successor cases are represented through relationships rather than destructive consolidation.

## Workbook sheets

- `Control_Dashboard`
- `Document_Registry`
- `File_Manifest`
- `Reconciliation_Queue`
- `Decision_Log`
- `Source_v2`

## Current readiness

- Total DocIDs preserved: **216**
- Located files: **27**
- Exact filename matches: **21**
- Fuzzy matches reviewed: **6**
- Unmatched source references: **189**
- Publication-ready records: **0**

## Resolved exception policy

The current fuzzy and collision cases are classified without deleting records:

- `DOC-0002` → duplicate candidate of `DOC-0001`
- `DOC-0116` → deposit/package candidate; expected XLSX not proven
- `DOC-0141` → successor candidate requiring content verification
- `DOC-0183` → source/rendition relationship candidate with `DOC-0143`
- `DOC-0204` → source Markdown still missing; print-ready PDF is not substituted
- `DOC-0205` → print-ready PDF candidate retained as publication rendition
- Volume I Chapter 14 → recorded as a sequence-gap exception

## Publication gates

Publication is prohibited until all of the following are satisfied:

- source file located;
- checksum verified;
- canonical relationship approved;
- access tier approved;
- publication status explicitly changed from `Blocked`;
- canonical resolver URL assigned;
- controller approval recorded.

## Repository handling

The binary workbook must be uploaded to:

`governance/document-registry/33rdhouse_docid_masterindex_mapping_v3.xlsx`

The committed file must match the SHA-256 above. Do not merge or publish a workbook with a different checksum unless the Decision Log records the replacement and a new release checksum.
