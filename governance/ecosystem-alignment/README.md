# The 33rd House Ecosystem Alignment Baseline v1

**Status:** Draft - owner review required  
**Effective date:** 2026-08-05  
**Owner controller:** Daniel Cruze  
**Repository target:** `The33rdHouseMaster/the33rdhouse-platform`

## Purpose

This baseline aligns GitHub, Cloudflare, Vercel, Airtable and controlled PDF evidence into one operating model. It replaces the uploaded 15-page reverse-engineering report as a live operational authority. The uploaded report remains confidential source evidence only.

## Canonical source hierarchy

1. **GitHub - `the33rdhouse-platform`:** architecture, governance, deployment mappings, decision logs and release gates.
2. **GitHub - `the33rdhouse-bots`:** bot and publisher source code, tests, migrations and runtime runbooks.
3. **Cloudflare:** edge runtime, Worker routes, bindings, schedules and observability. No source-of-truth data or administrative API tokens in application runtime.
4. **Vercel:** web application deployments and preview environments. One canonical project per product or site.
5. **Airtable - Daniel Cruze Ecosystem Command Centre:** operational register, status tracking, risk, ownership and next actions. No source code, credentials or private keys.
6. **PDF evidence:** immutable or signed snapshots for review and audit. PDFs are not the living configuration authority.

## Non-negotiable controls

- No production credentials, private keys, recovery codes or raw personal evidence in GitHub or Airtable.
- The uploaded confidential PDF must not be committed to GitHub.
- Cloudflare PR #13 is a fail-closed health adapter, not a production publisher.
- Vercel duplicates must be inventoried before any deletion or domain reassignment.
- Production promotion requires owner approval and recorded evidence.

## Files

- `CANONICAL_SYSTEM_MAP.md`
- `ALIGNMENT_ACTION_REGISTER.md`
- `SECURITY_AND_RELEASE_GATES.md`
- `EVIDENCE_REGISTER.md`
- `VERCEL_CONSOLIDATION_REGISTER.csv`
