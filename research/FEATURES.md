# Blueprint Studio feature guide

Developed for Saumitra Mishra. Blueprint Studio is an independent workspace for planning Finance and Controlling reporting architectures for SAP software.

## Create a blueprint

Describe the reporting requirement or choose one of fifteen report templates. The three-step landscape wizard selects the source system, data warehouse and reporting tool. Supported combinations use SAP S/4HANA or ECC, SAP Datasphere or BW/4HANA, and SAP Analytics Cloud, Fiori, Analysis for Office or Power BI. Embedded Analytics is available for supported S/4HANA designs. Unsupported requirements and combinations produce explicit feedback.

Report templates run locally in the browser without an account or API key.

## Add custom sources

Declare a Z-table, flat file or external source using a source identifier, description and field schema. Paste fields, parse them, edit names and types, mark keys, and add or remove fields. Duplicate or invalid declarations are rejected. Custom schemas appear in the generated design, diagrams, saved records and exports.

## Explore the design

| View | Features |
| --- | --- |
| Blueprint | Source details, integration pipeline, warehouse/transformation guidance, reporting layer, assumptions and review checklist |
| Table Map | Source nodes, join specifications, draggable layout, pan, zoom, fit, minimap and table details |
| Architecture | Source, integration, modeling and consumption layers for the selected landscape |
| Solution | Five implementation phases with direct phase selection and Previous/Next navigation |
| Code | Report-specific illustrative specifications and validation SQL, implementation notes, copy and download |

The catalog includes 42 curated source tables with representative fields and business descriptions. Use catalog search to find tables by identifier, module or meaning. Verify exact source metadata and released extraction interfaces in the target system.

Manual diagram edges are exploratory visual connections. They do not alter saved relationships, SQL or verified business logic.

## Save, share and export

- Save, load and delete blueprints in this browser's local storage.
- Export and import JSON to back up a complete design or move it between devices.
- Create portable share links containing the design after reviewing the content for sharing.
- Download a native Excel workbook containing overview, sources, fields, relationships, pipeline, review and code sheets.
- Download a paginated PDF design document, Markdown or field-inventory CSV.
- Copy Markdown or print a complete design document.

Shared links contain the requirement and custom schema. Large designs should use JSON export instead of long links.

## Validation and limits

The automated tests cover template routing, supported landscapes, source validation, serialization, output validation and native exports. Browser acceptance checks cover generation, diagrams, custom sources, saving, phase navigation, portable sharing and downloads.

Blueprints are design assistance. Source compatibility, financial grain, currencies, fiscal calendars, authorization and generated code require review in the target SAP system. The application does not connect to or execute changes in an SAP tenant.

## Licensing

Saumitra Mishra is the project owner. Third-party libraries and component icons retain their applicable licenses and notices in `public/licenses/` and alongside vendored code. SAP product names are used descriptively; the project is independent of SAP SE.
