# Evidence Register

| Evidence ID | Source | Classification | Verified fact | Handling |
|---|---|---|---|---|
| EVID-001 | Uploaded 15-page PDF | Confidential | Source report contains sandbox, entity, domain, platform and security claims | Local archive only; do not commit |
| EVID-002 | Uploaded PDF file metadata | Confidential | 15 A4 pages; created 2026-08-05; SHA-256 `1e81fcb9d291a48faed3c974ed5efff6e15485f4c60e9c04e468be121ab393f2` | Record checksum only |
| EVID-003 | GitHub connected account | Internal | Authenticated identity is `The33rdHouseMaster` | Non-secret identifier |
| EVID-004 | GitHub repository inventory | Internal | Accessible repositories: `the33rdhouse-platform`, `the33rdhouse-bots`, `the33rdhouse-assets` | Canonical repository list |
| EVID-005 | GitHub PR #13 | Internal | Fail-closed Cloudflare Worker adapter; successful preview deployment; non-health routes disabled | Keep draft |
| EVID-006 | GitHub PR #12 | Internal | Release branch remains open and not production-ready | No merge |
| EVID-007 | Vercel team inventory | Internal | Two teams and 15 projects observed | Consolidation input |
| EVID-008 | Vercel `33rdhouse-platform` | Internal | Services framework, Node 24.x, latest deployment READY, `live=false` | Candidate canonical project |
| EVID-009 | Airtable base inventory | Internal | `Daniel Cruze Ecosystem Command Centre` already contains control, deployment, security, duplicate and action tables | Extend rather than replace |

## Source-report exceptions

- The PDF title date and embedded file creation date are inconsistent.
- Several pages contain broken character encoding.
- The GitHub account and organisation names in the PDF do not match the currently connected GitHub identity.
- The Vercel, domain, Shopify and social maps are historical assertions and require re-verification.
- Corporate, tax, legal and wallet claims are outside this technical alignment and must not be treated as verified by this baseline.
