# Source Evidence

This directory defines the immutable source packages approved for the Canonical Content Core import pipeline.

## Rules

- Do **not** commit the raw ZIP archives.
- Place the three approved ZIPs in this directory only in the local/operator environment.
- `SOURCE_MANIFEST.json` is the committed evidence contract for filename, byte size, and SHA-256.
- Run `pnpm sources:inventory` before parsing or importing anything.
- A missing file, byte-size mismatch, SHA-256 mismatch, or unreadable ZIP fails closed.
- Inventory reads ZIP metadata only. It does not extract or modify the archives.

## Approved packages

- `the-33rd-house-complete-backend.zip`
- `escape-matrix-data (1).zip`
- `deity-atlas-data.zip`

The originals remain evidence/input. Parsed and canonical records are created separately by later pipeline stages.
