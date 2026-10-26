# Reference website feature inventory

Inspected 26 October 2026. Reference: https://sap-blueprint.vercel.app/.

This is an independently written behavioral specification, not copied application source. Evidence is inert inspection of the reference's publicly delivered JavaScript modules. No third-party JavaScript was executed in this investigation. Static findings describe implemented branches, not proof that every branch is reachable or works in production. The initial entry bundle was analyzed by REA in parent evidence `ev_cfa467bd3479282c1918848439fb8584613b57fec44b7deba5dd61c82d8a28f6`; its analysis reported partial/unknown semantic coverage, not behavioral equivalence. Further module findings below are direct static observations and should be corroborated by browser tests.

## User journeys

| Area | Observed behavior | Reconstruction tests |
|---|---|---|
| Landing page | Dark slate/purple interface, requirement textarea, Generate button, scope dialog, example launch, three quick-start prompts, optional custom-source editor | Empty input disables generation; Enter submits; Shift+Enter creates newline; prompt card fills editable input |
| Templates | P&L, fixed asset register/depreciation, accounts payable aging | Each selects distinct appropriate sources and output; no P&L leakage into unrelated reports |
| Discovery | Three sequential steps: source, data warehouse, reporting; Back, Continue, final generation, close | Preserve selections on back; cancel does not call API; output reflects all three selections |
| Source choices | S/4HANA or ECC | Source table recommendations and compatibility reflect selected source |
| Warehouse choices | Datasphere, BW/4HANA, Embedded Analytics | Extraction, transformation, and consumption advice changes coherently |
| Reporting choices | SAC, Fiori, Analysis for Office, Power BI | Correct selected tool in UI, recommendations, and every export |
| Generation | Search/classify, then catalog enhancement or dynamic build; asynchronous solution enrichment | Loading, streaming, error, retries, cancellation/stale responses, malformed output, owner authorization |
| Result shell | Requirement input, regenerate, landscape badges, release selector, Save, Share, Mine, Export | Regeneration updates all tabs; preserves intentionally selected landscape |
| Tabs | Blueprint, Table Map, Architecture, Solution, Code | Each renders relevant content; works with loading, empty, custom, and saved results |
| Save/library | Save to browser localStorage, newest first, count, relative age, source/table/warehouse badges; load, copy link, delete | Reload persistence, corrupt storage, quota errors, deletion, distinct requirements/landscapes |
| Sharing | Copies URL with `?bp=<id>`; actual record exists only in the creating browser's localStorage | Test in a fresh browser; reference design cannot share actual content across devices |
| Export | Excel, PDF, clipboard Markdown; separate HLD from Solution | Correct selected report/landscape/custom fields; open resulting files; no secret or stale output |

## Scope

The scope dialog covers FI/CO reporting: general ledger, accounts payable/receivable, assets, bank/tax, document splitting, parallel ledgers, foreign currency, intercompany, cost/profit centers, internal orders, product costing, profitability analysis, allocations. Cross-module procurement and billing are treated as interfaces into FI, with customer/vendor master data and declared custom sources.

The dialog excludes complete treasury/risk, real estate, travel, grants, PP/PM/PS beyond financial postings, payroll/SuccessFactors process design, Ariba procurement, full SD order management, broad MM/EWM, and general non-FI/CO development. Some shipped catalog processes extend into WBS/project costs, so the displayed scope and catalog are not perfectly aligned. Reconstruction should clearly separate supported report templates from unsupported arbitrary domain generation.

## Custom-source editor

- Source identifier is uppercased and stripped to letters, digits, underscore, dot; maximum 40 characters in the input.
- Types: custom Z table, flat file, non-SAP system; optional origin/description.
- Paste fields as comma-separated names or one field per line with type and description. CSV-header parsing assigns default CHAR type; line parsing reads first token as name, second as type, remainder as description.
- Parsed fields are editable: name, type, key checkbox, description; manual field add/remove supported.
- Add source creates metadata containing `id`, `name`, `type`, `origin`, `description`, `system: Custom`, `module: Z`, `status: Custom`, `keyFields`, and field objects `{name,dataType,isKey,description}`.
- Duplicate source IDs are silently refused in the reference; fields are not deduplicated robustly. Reconstruction should show validation errors and reject malformed/duplicate fields.
- Sources can be removed before generation and are sent to all relevant AI operations. Custom nodes appear in Table Map. The reference does not clearly retain custom sources in its saved-record schema; persistence must be tested and improved.

## Blueprint detail panels

Four summary cards open detailed content:

1. **Source Tables:** expandable table rows; identifier, name, system, description, key fields and reporting fields; field decoder gives business labels/reasons; bulk copy of table IDs; compatibility/deprecation notices.
2. **Integration Pipeline:** phases grouped into Data Integration, Modeling, Visualization. Each group can collapse. AI text can contain structured join rows (from/to/key/type/cardinality), measures (name/source/aggregation), attributes, general actions, and unresolved-placeholder warnings. The reference extracts these structures from formatted strings, which is fragile; use typed schema instead.
3. **DWH / Transformation:** extraction method and rationale; locally assembled sample SQL; AI CDS view name, DDL, notes; copy controls.
4. **Reporting:** selected BI tool, consumption details, business value headline, ROI summary, benefits, and SAP authorization objects with field/value/description.

Compatibility selector offers any release, ECC 6.0, and S/4HANA 2020–2024. Most checks are coarse table-system flags, not release-specific technical validation. Listed predecessor/successor mappings must be fact-checked against official SAP sources; do not replicate inaccuracies as facts (especially blanket statements that BSEG is merely a compatibility view).

## Diagrams and solution

**Table Map:** React Flow graph with table nodes, system/module/status badges, animated relationship arrows and cardinalities, selection, panning/zoom/fit controls, minimap, movable nodes, and runtime connect handler. Matched tables highlighted; connected non-matches dimmed; unrelated nodes hidden. Custom sources appear as separate amber nodes. Node selection opens metadata sidebar. Added edges and dragged positions appear to be in-memory only and are not part of saved/exported business logic.

**Architecture:** four-layer diagram (source, integration, warehouse, reporting) selected from the landscape; includes technical explanations and business analogies. This is a landscape diagram, not generated infrastructure or a live SAP connection.

**Solution:** phase navigation with direct phase pills and Previous/Next. Shows phase description, AI considerations, source/CDS/key fields/dimensions/measures/output formats, final-stage effort estimates and considerations. Download HLD is available whenever at least one phase exists; its tooltip implies completion but no actual completion gate is enforced.

**Code:** code block selection, syntax highlighting, line numbers, copy, toggle notes. Important defect: the viewer unconditionally selects the first bundled template, ignores the generated result, and therefore shows P&L staging/dimension SQL even for other reports. The separate SQL logic library has currency conversion, fiscal period, and ledger fragments used by applied-logic documentation. Reconstruction should generate or select report-specific code and clearly identify examples versus validated implementation code.

## Public catalog inventory

The downloaded catalog contains **92 table records** and **61 relationships** (the landing page advertises 80+). Fifteen process IDs: P&L, aged payables, aged receivables, vendor spend, cost-center actuals, profit-center report, balance sheet, GL trial balance, asset register, budget versus actuals, intercompany reconciliation, tax, internal orders, cash position, WBS/project costs. Five architecture families: financial reporting, assets, master data quality, procurement, controlling. Catalog presence does not prove correct release availability or working AI routing.

Rebuild a sourced catalog independently; do not copy the reference's descriptions or SQL as original work. Every join needs explicit left/right field mapping and grain, client, language, date-validity, currency, and ledger rules. The reference's generic SQL assembler often assumes identical field names across a relationship and appends company/year filters regardless of primary-table applicability; these are not safe production assumptions.

## Backend contracts observed in client code

All requests are JSON POSTs to the same origin. The server implementation, provider, system prompts, validation, authentication, storage, rate limiting, and model configuration are not publicly established by these assets.

| Endpoint | Request | Response handling |
|---|---|---|
| `/api/ai/search` | `{query, system, systemSet}` | JSON classification/decision described below; special handling for HTTP 429 |
| `/api/ai/enhance` | `{query, processId, system, customSources}` | SSE-like `data: <JSON>` events separated by blank lines |
| `/api/ai/build` | `{query, system, customSources}` | Same stream protocol |
| `/api/ai/solution` | `{query, system, matchedTableIds, processName, customSources}` | JSON merged into current result; failures logged as non-critical |

Search success fields: `processId` (nullable), `confidence`, `reasoning`, optional `suggestDatasphere`, `scopeStatus`, and `outOfScopeItems` (item/reason/suggestion). Decisions: `rateLimited` plus `error/message/resetAt`, `needsEnvironment/environmentMessage`, `isNonSAP`, `outOfScope/outOfScopeTopic`, `needsMoreInfo/questionType/question`.

Stream events: `chunk` with `text`; `result` with `data`; `missing_data` with `requested_topic`; `error` with `message`. The reference parser ignores a final unterminated buffer and has weak malformed-event handling; implement robust decoding.

Enhancement data: `summary`, `enhancements[{stepOrder,considerations}]`, `appliedLogic`. Catalog process resolves source table IDs, architecture ID and code-template ID locally; enhancements attach by phase order.

Dynamic build data: `processName`, `selectedTableIds`, `approach`, `steps[{order,phase,description,considerations}]`, `summary`, `appliedLogic`. Selected IDs are intersected with the bundled catalog; “data accuracy score” is merely the percentage of selected IDs found in the catalog, **not verified factual accuracy**.

Solution JSON consumers expect `solutionArchitecture` with `extractionStrategy{method,rationale}`, `transformationLogic{cdsViewName,ddl,notes}`, `consumptionLayer{type,details}`, `securityLayer{authObjects[{object,field,value,description}]}`, plus `businessValue{headline,roiSummary,keyBenefits}`. Other fields may exist; no full server schema was available.

Landscape is appended to the query string, not sent as separate fields, in the reference. A new implementation should send the landscape explicitly and validate it server-side.

## Persistence and notable defects

- Session cache key uses normalized query plus source system only. Changes in custom sources, warehouse/reporting landscape, model, or catalog revision can accidentally reuse stale results.
- Local saved-record ID is a short deterministic hash of query+system. It can collide and ignores landscape/custom-source differences.
- Saved result excludes `codeTemplate`, custom-source state and several scope/diagnostic fields. Loaded results may differ from newly generated results.
- Share URLs require local saved state, so the “share” feature is not portable.
- The ordinary example button invokes the AI backend. Only URL `?demo` changes it to load the bundled fixed demo. Reference browser behavior should distinguish these two paths.
- Several non-success results are added to internal message state, but the current landing renderer visibly renders only the last generic error. Clarification, scope, rate-limit, or environment states may not be surfaced properly; verify runtime.
- Solution enrichment applies to current state without checking request identity; a delayed old response could overwrite a newer blueprint.
- Generation failures can leave partial matched state and misleading loading UI. Abort and retry behavior require improvement.
- No user authentication UI was found in these public modules. Absence in this bounded frontend inspection does not prove the backend has no protection.

## Exports

- “Excel” is an escaped HTML table document with MIME `application/vnd.ms-excel` and `.xls` extension, not a native XLS/XLSX workbook. It includes tables, field labels, generic SQL, pipeline, extraction/CDS/consumption/security. A native XLSX export would avoid format mismatch warnings.
- Markdown builds a report and copies it to the clipboard. Includes table detail, SQL, pipeline, CDS, security, and business value. Needs markdown-cell escaping for arbitrary generated/custom text.
- Main PDF export invokes `generateDataJourneyDoc`: implementation guide, prerequisite/setup phases, data model/consumption/security material, checklists and estimates. The large generator includes hard-coded generic and report-family fragments; check for landscape leakage.
- Solution “Download HLD” invokes `generateHLD`; inspect actual PDF output before claiming completeness.
- An additional `generateDesignDoc` path exists for tables, field specs, joins, logic, roadmap, solution and diagram capture; do not assume every exported function is reachable from current UI.
- Reference exports carry an AI draft / senior review notice. Preserve the distinction between generated design assistance and verified SAP execution.

## Required acceptance coverage

1. Three quick-starts plus the fifteen catalog process routes and a genuinely new in-scope requirement.
2. Every supported source/warehouse/reporting combination, with explicit unsupported-combination handling where necessary.
3. Custom table/file parsing, editing, key flags, duplicate validation, deletion, transmission, save/reload, diagrams, exports.
4. All classification states and streamed success/error/truncation; malformed server/model output; timeouts; two overlapping requests.
5. All five tabs, four blueprint detail panels, map controls and details, solution navigation, copy/notes controls.
6. Version notices with trustworthy sources; report-specific code and correct join keys.
7. Save/load/delete, corrupt/full local storage, share into clean browser, Unicode and long requirements.
8. Native export files reopened and checked; special characters/formula injection in spreadsheet export; no incorrect cached report.
9. Keyboard/mobile/accessibility, text contrast, empty screens, loading, focus restoration and escape dismissal.
10. Owner-only paid API calls: unauthenticated/other-user denial before provider call; no key in repository/build/map/export/log/error; request limits and bounded model output.

## Coverage boundary

No SAP tenant connection, database query execution, AI correctness, original-server identity, secret storage, server rate limits, or cross-device sharing was validated by this static analysis. A faithful new implementation can reproduce observable workflows but cannot claim identical hidden prompts or model outputs. Record functional parity and known intentional fixes explicitly.

## Downloaded module digests

Digests identify the inspected artifacts only. These assets are analysis material outside the implementation repository.

| Module | SHA-256 |
|---|---|
| `ArchitectureStepper-BOvMo5S8.js` | `f06e6e8debe6092c984e7641fd10a8aa97144391173b8e8f71709bec46bbf582` |
| `BlueprintOutput-DmPMKfJ6.js` | `4134296e1a961d475e929625e02821df695724ada2be653b74ab5b13a826094e` |
| `CodeViewer-CCuLCpI3.js` | `582d56448d30104470572ed09dba2946b0c4c48de40171d860263b2e604ee04e` |
| `DiscoveryWizard-BjsAEf4_.js` | `59c03bc79dd74c9dbbda67e7235635ddf0038a191f1b98b371370d731de80cf7` |
| `ExportMenu-CBLcU2PA.js` | `6428e5305a5467ed4de5a842eef40583e84e82982d9a3185288f7140c59f8beb` |
| `MyBlueprintsPanel-BMhuDNUp.js` | `4ba8f55c5f6a6dc6c9da6aff3c308b77f81891ee26a7e50cb71a601f860f07ce` |
| `PipelineFlowChart-CqlMwSoV.js` | `bf89c6c80ec1000f184d595871c38ddaaadc139ca2cbac80ed02e7b4da214813` |
| `SolutionFlow-bzxNHSQ2.js` | `b7f27c4d8b8111d9b99c9c8affffe121f98fb2342682803805787478064592f1` |
| `TableMap-BBiJpfHn.js` | `1e905c172a86f6a1c58556b72ee816a016afdb48f366e387da0132f4c7610720` |
| `TableSidebar-D5jrjfVy.js` | `44b7b2f767609db908e9c7c5d5496d4639f81c23a80543dcf4adfbeb44f08df5` |
| `architectures-DkGm258z.js` | `f5bd8758fd9501c4c2ff7a55fc26f1ad5810b8d5726dce078045d2b504c0182b` |
| `code_templates-CEfoc78_.js` | `707c8d57382ee15238037f91eb3346f3a6c38b284892d1e7bbf02493de5ebfcc` |
| `demoResult-BHP6Ci1S.js` | `965c6ec53195e101fe6e8ff12567076132bec499707155eab45ffe2ea45cc6bd` |
| `fieldDecoder-CoQT2sTu.js` | `05641beac5bddd7f12f1fdf556f1f635d401477cfbc89fed4d512356e397184a` |
| `generateDesignDoc-Dd6HV-y2.js` | `142be2d57d2ff57312467b24b73ef9b9825cb24647b84c195ea2afca579de9e6` |
| `index.js` | `db26a676881cd6178eb647a5a9caf7f9f800ee84ea4297acb2c1e4feeef73a34` |
| `processes-BqFrJVs7.js` | `04ca7f1c94ac054ffd688838fa84248713be74401d70393d03ca87d3d775a7a0` |
| `relationships-Dai8Oax6.js` | `aa5acd89bcdf412a495d55984d35ba7108196678a5d74d6ed5922295180b0933` |
| `tables-CgRXekXe.js` | `940dce5d0c12a1287b5609218bcdc246e37b6876d56864d5c8becd10a50a25e9` |
