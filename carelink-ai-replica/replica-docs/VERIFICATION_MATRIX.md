# Verification Matrix

## Evidence status
No browser automation or local Node runtime was available to execute the app in this GitHub-only implementation session. Consequently, build/test success and pixel parity are not claimed.

| Requirement | Status | Evidence / next verification |
|---|---|---|
| Separate runnable project directory | PARTIAL | `carelink-ai-replica/` contains independent package/config and source copy; run npm install/build locally |
| Home source and styles copied | PARTIAL | exact source files fetched from original branch and copied |
| Route inventory | PARTIAL | source-level hash routes recorded in ROUTE_AND_INTERACTION_MAP.md |
| Component inventory | PARTIAL | source-derived catalog; verify rendered instances in browser |
| Design tokens | PARTIAL | exact values read from original CSS |
| Desktop screenshots at required sizes | BLOCKED | original production browser capture not available |
| Tablet/mobile screenshots | BLOCKED | original and replica screenshots not captured |
| AI assistant visual parity | PARTIAL | original component copied; live response needs configured Edge Function |
| Supabase data parity | BLOCKED until configured | local `.env.local` required; use a development Supabase project |
| Functional automated tests | PARTIAL | Node built-in source sanity tests added; not a substitute for browser E2E |
| Type check / build | NOT RUN | no Node execution environment available through GitHub connector |
| Pixel-level parity | NOT VERIFIED | requires paired screenshots at identical viewport and states |

## Status definitions
- MATCHED: tested visually and behaviorally against the original.
- PARTIAL: source copied or some evidence exists, but equivalence not fully verified.
- BLOCKED: missing runtime, credentials, external service, or reference evidence prevents verification.
- NOT APPLICABLE: verified absent from the original source.
