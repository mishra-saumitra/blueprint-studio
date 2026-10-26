# Icon provenance and permitted use

Checked 26 October 2026. Availability in draw.io is not itself a license. Each included asset is traced to its own source and license.

## Included SAP component diagram symbols

SAP's [btp-solution-diagrams repository](https://github.com/SAP/btp-solution-diagrams) explicitly supplies architecture diagram components. Its [REUSE.toml](https://github.com/SAP/btp-solution-diagrams/blob/main/REUSE.toml) assigns `Apache-2.0` and copyright `2024 SAP SE or an SAP affiliate company and btp-solution-diagrams contributors` to `**` with aggregate precedence. No conflicting inline SVG license or per-file license sidecar was present for the selected files in the inspected tree (`57199627c08fe3f4d7dc14d5ffee920fab70bd94`).

These four SVGs are copied unmodified; only local filenames are shortened. They are component symbols for architecture diagrams, not the SAP corporate logo. Use each only to represent its named product; do not substitute SAP HANA Cloud for BW/4HANA, aDSO, generic ECC, or generic storage.

| Local asset under `site/public/icons` | Upstream path below `assets/shape-libraries-and-editable-presets/svg/` | SHA-256 |
|---|---|---|
| `sap-datasphere.svg` | `10025-sap-datasphere_sd.svg` | `5e552bf409e0f0d232c519dd5be104b425275575cdc6062e0acf9c4d9568874f` |
| `sap-analytics-cloud.svg` | `20061-sap-analytics-cloud_sd.svg` | `c2b4af2b00267cbe0cda56c9c621fbc216351748d8029ff31ec908bdb0de034b` |
| `sap-hana-cloud.svg` | `20083-sap-hana-cloud_sd.svg` | `e0eecac402afa2837c0e28efb097ef55d09503bfde1791b7125a0f27409417db` |
| `sap-integration-suite.svg` | `32086-sap-integration-suite_sd.svg` | `cf746c06d0a2d3f5d9eb2e740dd83b7b3850084e6f87af113f6e79203dd276a5` |

The upstream [Apache license](https://github.com/SAP/btp-solution-diagrams/blob/main/LICENSE), aggregate REUSE declaration, and an attribution notice are distributed in `site/public/licenses/`. Retain them with the website and source distribution. Apache section 6 does not grant a general trademark right. These assets should not become the app's logo or imply SAP endorsement. The upstream README describes them as solution-diagram components in the SAP platform context.

XML parsing checks passed for all four files. No script, foreignObject, external href, or event-handler attributes were found. No downloaded SVG was executed to inspect it.

## General interface and architecture symbols

Use [Lucide](https://lucide.dev/license) for database cylinders, tables, warehouse, server, pipeline arrows, code, folders and report controls. `lucide-react` is already installed. Its complete bundled notice is copied to `site/public/licenses/Lucide-ISC-MIT.txt`: ISC for Lucide contributions and MIT for listed Feather-derived icons. Preserve both notices in redistributed builds.

Generic Lucide database/layers symbols with a visible `aDSO` label are preferable to guessing an aDSO-specific asset's license. Label these as generic architecture symbols, not official SAP product icons. Do not use SAP HANA Cloud's icon as an aDSO symbol.

## draw.io example

The [draw.io extra Sap set](https://icons.diagrams.net/sets/sap) lists 33 icons, MIT, authored by Sandro Pereira. This confirms that draw.io exposes per-set licensing, but does not override trademark restrictions for logo artwork within the set. This project does not redistribute that set; it uses the first-party licensed component symbols above plus Lucide.

## UI attribution

A footer or About link to `/licenses/SAP-BTP-NOTICE.txt` and `/licenses/Lucide-ISC-MIT.txt` makes notices accessible. Use relative URLs in the GitHub Pages build so they work under its repository subpath.
