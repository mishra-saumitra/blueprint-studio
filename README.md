# Blueprint Studio

An independent reporting architecture workspace for SAP software, implemented for Saumitra Mishra.

Describe a Finance or Controlling report, choose the source/warehouse/reporting landscape, and inspect source tables, relationships, implementation steps and illustrative code.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

## Public demo and private AI

The public GitHub Pages build runs entirely in the browser. It has 15 deterministic report templates and a curated 42-table reference catalog. It sends no requests to OpenAI and contains no API key. The private Sites deployment uses the same interface and a server-only generation route. AI is disabled until billing and a live acceptance test are complete.

The owner-private Sites access policy and an explicit server-side `OWNER_USER_ID` check protect paid generation. Runtime `OPENAI_API_KEY` is stored as a secret, never in source or frontend build variables. Persistent D1 limits enforce at most two attempts per minute and twenty per UTC day. Input/output bounds and a 90-second request timeout limit each call. These are request limits, not a guaranteed dollar budget. Never make the private Site public without reviewing its access policy.

Runtime variables: `OPENAI_API_KEY` (secret), `OPENAI_MODEL`, `OWNER_USER_ID`, `AI_ENABLED`. Database binding: `DB`. The published demo must never have any of these secrets.

## Verification

```sh
node --experimental-strip-types --test tests/*.test.ts
npx tsc --noEmit
npm run build
npx vite build --config vite.demo.config.ts
```

The optional `scripts/live-smoke.ts` makes a billable API call only when explicitly run with a key supplied through the environment. It never prints that key. Do not put it in CI.

## Scope and attribution

Inspired by observable workflows of https://sap-blueprint.vercel.app/. This is an independent implementation, not the original source or a claim of identical hidden AI logic. Inspection found defects in the reference's sharing, saved custom-source state and report-specific code selection; this implementation addresses those workflows independently.

Catalog fields are representative. Release support, released CDS interfaces, source metadata, financial grain, currency, authorizations and generated code require validation in the target SAP system. No SAP data connection, SAP execution or SAP deployment is performed. Local templates intentionally reject unsupported or unrecognized requirements rather than fabricate a report.

SAP component symbols are used under their documented Apache-2.0 license; Lucide symbols retain ISC/MIT notices under `public/licenses/`. SAP and other product names belong to their respective owners. This project is not affiliated with or endorsed by SAP SE.

Saving uses this browser's local storage; export JSON for a backup. Portable share links contain the design itself, so do not include private business data. Shared content never authorizes paid AI access.
