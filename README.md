# Blueprint Studio

An independent reporting architecture workspace for SAP software, implemented for Saumitra Mishra.

Describe a Finance or Controlling report, choose the source/warehouse/reporting landscape, and inspect source tables, relationships, implementation steps and illustrative code.

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

## Use the app

[Open Blueprint Studio](https://mishra-saumitra.github.io/blueprint-studio/) · [Feature guide](research/FEATURES.md)

The public app runs entirely in the browser with 15 report templates and a curated 42-table catalog. Choose a reporting requirement and landscape, add optional custom schemas, then explore the blueprint, table map, architecture, implementation phases and code examples. Save designs locally, create portable share links, and download PDF, Excel, Markdown, CSV or JSON files.


## Verification

```sh
node --experimental-strip-types --test tests/*.test.ts
npx tsc --noEmit
npm run build

```


## Scope and ownership

Blueprint Studio is an independent reporting architecture project developed for Saumitra Mishra. It brings source-table exploration, landscape planning, diagrams, implementation guidance and portable design documents into one workspace.

Catalog fields are representative. Release support, released CDS interfaces, source metadata, financial grain, currency, authorizations and generated code require validation in the target SAP system. No SAP data connection, SAP execution or SAP deployment is performed. Local templates intentionally reject unsupported or unrecognized requirements rather than fabricate a report.

SAP component symbols are used under their documented Apache-2.0 license; Lucide symbols retain ISC/MIT notices under `public/licenses/`. SAP and other product names belong to their respective owners. This project is not affiliated with or endorsed by SAP SE.

Saving uses this browser's local storage; export JSON for a backup. Portable share links contain the design itself, so do not include private business data. Shared content never authorizes paid AI access.
