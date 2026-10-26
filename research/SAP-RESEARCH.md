# SAP technical research and implementation recommendations

Research date: 26 October 2026. Primary SAP documentation and SAP-owned repositories only. These findings guide an independent educational architecture generator; they do not establish that a generated design will deploy unchanged into a customer's SAP landscape.

## Extraction architecture

SAP recommends replication flows for replication from supported S/4HANA on-premise systems. Prefer released, extraction-enabled ABAP CDS views where appropriate. CDS extraction support, delta support, authorizations, add-ons, and connection prerequisites must be verified against the actual source release. Do not describe a raw table name such as ACDOCA as if it were automatically an available ODP extractor. Distinguish source tables (conceptual lineage) from extraction objects (deployable interfaces). For supported federation scenarios SAP recommends ABAP SQL services; legacy remote-table routes also exist. [SAP S/4HANA On-Premise Connections](https://help.sap.com/docs/SAP_DATASPHERE/c8a54ee704e94e15926551293243fd1d/a49a1e3cc50f4af89711d8306bdd8f26.html)

The product should separately represent initial load, initial plus delta, and delta only. Not every source/target pairing supports every load type. Treat “real time” as a design target with prerequisites, not a guaranteed property of every generated pipeline. [Select Source and Target Connections for Replication Flows](https://help.sap.com/docs/SAP_DATASPHERE/c8a54ee704e94e15926551293243fd1d/10891192186c4920b08939a7b46adc79.html)

## ECC compatibility

“SAP ECC 6.0” alone does not prove compatibility. Capture source product, enhancement/support-package level, installed add-ons, and connector choice. SAP documents ECC connectivity preparation and directs users to separate ECC connection guidance. SAP ABAP connections support replication flows, subject to prerequisites. Avoid presenting an S/4HANA Universal Journal design as an equivalent ECC design merely by changing the version selector. [SAP ECC connectivity KBA](https://userapps.support.sap.com/sap/support/knowledge/en/3509755), [SAP ABAP Connections](https://help.sap.com/docs/SAP_DATASPHERE/be5967d099974c69b77f4549425ca4c0/a75c1aacf951449ba3b740c7e46da3a9.html)

SAP's conversion guidance describes migration of accounting lines into ACDOCA and explains that BSEG remains, while some compatibility views aggregate ACDOCA lines. Therefore, do not substitute ACDOCA for BSEG indiscriminately, nor assume their line identifiers or grain are interchangeable. For ordinary ECC without a relevant Finance extension, route to a separately validated ECC model or explicitly report unsupported generation. [SAP S/4HANA conversion guide, line-item migration](https://help.sap.com/doc/PRODUCTION/pdfe68bfa55e988410ee10000000a441470/1511%20002/en-US/CONV_OP1511_FPS02.pdf)

## Financial correctness safeguards

SAP documents client and ledger filtering as correctness controls. A selected extension ledger may also require its underlying base ledger. Source-specific record and document status filters need explicit decisions. [Updating Filters in Node ACDOCA_Extract](https://help.sap.com/docs/SAP_BUSINESSOBJECTS_FINANCIAL_CONSOLIDATION/7d5e3944c35c41319627138a8af7aa78/de3103ecc256484984dd53b3dae854ff.html)

The following are engineering recommendations, derived from those documented dimensions and relational modeling principles, rather than a claim that SAP provides one universal SQL join:

- Require a client and ledger policy. For cross-table joins include the applicable client keys; preserve company code, fiscal year, document and line identity where relevant. Never use document number alone as a universal key.
- State the fact grain before generating SQL; validate dimension uniqueness before a many-to-one join. Do not blindly equate ACDOCA DOCLN and BSEG BUZEI.
- Include controlling area and time validity when resolving cost/profit-center master data; include language and validity choices for texts. Validate exact keys in the target release's dictionary or released CDS metadata.
- Preserve amount/currency pairs. Do not aggregate mixed transaction currencies without grouping or a specified conversion policy. Keep company-code and group-currency measures distinct.
- Actual-versus-plan needs an explicit plan source, version/category, period mapping, matching dimensional grain, and currency basis. ACDOCA alone does not establish a complete actual-versus-plan model.
- AP/AR aging needs a key date, open/cleared-item policy, due-date/payment-term logic, credit handling and mutually exclusive buckets. “Days since posting” is not universally “days overdue.”

SAP documents parallel currency configuration in the Universal Journal; currency handling depends on the accounting configuration. [Currencies Managed in Parallel in the Universal Journal](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/3cb1182b4a184bdd93f8d62e3f1f0741/0d51d7531a4d424de10000000a174cb4.html)

Test generated models for duplicate facts after joins, totals before/after enrichment, zero-balance where appropriate, missing dimensions, and source reconciliation. SAP's reconciliation guidance checks entry existence, matching fields and amounts, duplicate entries and missing company codes. [Reconcile Journal Entries](https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/651d8af3ea974ad1a4d74449122c620e/fbbc914ed0cb462e97d8fa4a53e1a3e9.html)

## Branding and licensed icons

Use **Blueprint Studio** as the independent product name; describe it as “Reporting architecture for SAP® software.” SAP permits textual references to its products, but its guidance says third parties cannot use the corporate logo without specific written permission or incorporate SAP marks into their own product/domain names. Suggested URL: `mishra-saumitra.github.io/blueprint-studio/`. Include a clear independent-project notice. Do not fabricate an “official SAP” badge. [SAP trademark guidance, effective January 12, 2026](https://www.sap.com/about/legal/trademark.html)

SAP-owned UI resources can provide authentic UI vocabulary without corporate-logo branding. `SAP/theming-base-content` and `SAP/fundamental-styles` publish Apache-2.0 licenses. Fundamental Styles documents its dependency on theming-base-content for icons/fonts. If vendoring their assets, pin a version and preserve its license and applicable notices. Their software licenses do not grant SAP trademark rights. [Theming Base Content](https://github.com/SAP/theming-base-content), [license](https://raw.githubusercontent.com/SAP/theming-base-content/master/LICENSE.txt), [Fundamental Styles](https://github.com/SAP/fundamental-styles), [license](https://raw.githubusercontent.com/SAP/fundamental-styles/main/LICENSE)

## Product design recommendations

1. A source-release and extraction-readiness checklist with verified documentation links.
2. A visible assumptions panel: client, ledger, fiscal calendar, currency, language, key date and fact grain.
3. A distinction between conceptual table lineage, suggested CDS/extractor candidates and verified deployable objects.
4. Join-quality checks and reconciliation test suggestions alongside generated SQL.
5. Explicit supported/unsupported input handling instead of silently returning a P&L design for unrelated requirements.
6. Export provenance: requirement, selected options, generator version, creation date and reference links.
7. Portable JSON import/export and browser-local saved designs; these work on static hosting without implying a live SAP connection.

These recommendations support the product roadmap. Validate implemented behavior with the application test suite and browser acceptance checks.
