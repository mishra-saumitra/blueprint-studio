/** Independently authored reference models. No live SAP system is queried. */
export type Field = { name: string; dataType: string; isKey: boolean; description: string };
export type Table = { id: string; name: string; description: string; module: string; system: string; fields: Field[]; sourceUrl?: string; custom?: boolean };
export type Landscape = { source: 'S4HANA' | 'ECC'; warehouse: 'Datasphere' | 'BW4HANA' | 'Embedded'; reporting: 'SAC' | 'Fiori' | 'AFO' | 'PowerBI'; version: string };
export type Step = { title: string; description: string; actions: string[] };
export type CodeBlock = { title: string; language: string; code: string; notes: string[] };
export type Blueprint = {
  id: string; title: string; query: string; landscape: Landscape; customSources: Table[]; tables: Table[];
  relationships: { from: string; to: string; keys: string[]; cardinality: string }[];
  summary: string; steps: Step[]; code: CodeBlock[]; assumptions: string[]; checks: string[]; warnings: string[];
  extraction: { method: string; rationale: string }; consumption: { type: string; details: string };
  security: string[]; benefits: string[]; createdAt: string; mode: 'demo' | 'ai'; schemaVersion: 1;
};

export const defaultLandscape: Landscape = { source: 'S4HANA', warehouse: 'Datasphere', reporting: 'SAC', version: 'Any' };
const help = 'https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE';
const extractionHelp = 'https://help.sap.com/docs/SAP_DATASPHERE/c8a54ee704e94e15926551293243fd1d/a49a1e3cc50f4af89711d8306bdd8f26.html';
const labels: Record<string, string> = {
  MANDT: 'SAP client', RCLNT: 'SAP client', RLDNR: 'Ledger', BUKRS: 'Company code', RBUKRS: 'Company code',
  BELNR: 'Accounting document number', GJAHR: 'Fiscal year', DOCLN: 'Universal Journal line number', BUZEI: 'Entry-view line number',
  RACCT: 'General ledger account', SAKNR: 'General ledger account', KTOPL: 'Chart of accounts',
  HSL: 'Amount in company-code currency', RHCUR: 'Company-code currency', TSL: 'Amount in transaction currency', RTCUR: 'Transaction currency',
  WAERS: 'Currency', DMBTR: 'Amount in local currency', WRBTR: 'Amount in document currency',
  PRCTR: 'Profit center', KOSTL: 'Cost center', RCNTR: 'Cost center', KOKRS: 'Controlling area',
  LIFNR: 'Supplier account', KUNNR: 'Customer account', ANLN1: 'Main asset number', ANLN2: 'Asset subnumber',
  AFABE: 'Depreciation area', ANLKL: 'Asset class', AUFNR: 'Order number', OBJNR: 'Object number',
  BUDAT: 'Posting date', BLDAT: 'Document date', AUGDT: 'Clearing date', AUGBL: 'Clearing document',
  ZFBDT: 'Payment baseline date', ZTERM: 'Payment terms', SHKZG: 'Debit/credit indicator',
  DATAB: 'Valid from', DATBI: 'Valid to', SPRAS: 'Language', NAME1: 'Name', TXT20: 'Short description',
  KTEXT: 'Short description', LTEXT: 'Long description', VBUND: 'Trading partner', RASSC: 'Trading partner',
  MWSKZ: 'Tax code', HKONT: 'General ledger account', VERSN: 'Plan version', RYEAR: 'Fiscal year',
  POPER: 'Fiscal period', RCNTR_PLAN: 'Planning cost center', KSTAR: 'Cost element', WTG001: 'Period 1 amount in transaction currency',
  EBELN: 'Purchasing document', EBELP: 'Purchasing document item', MATNR: 'Material', WERKS: 'Plant',
  PSPNR: 'Internal project/WBS number', POSID: 'External WBS identifier', PSPHI: 'Project definition reference',
  HBKID: 'House bank', HKTID: 'House bank account', BANKS: 'Bank country', BANKL: 'Bank key',
  FISCYEARPER: 'Fiscal year and period', FISCPER: 'Fiscal period', CATEGORY: 'Planning category',
};
const field = (name: string, isKey = false): Field => ({ name, isKey, dataType: /^(HSL|TSL|DMBTR|WRBTR|W[TKOG][GBK]?\d{3})$/.test(name) ? 'DECIMAL' : /^(BUDAT|BLDAT|AUGDT|ZFBDT|DATAB|DATBI)$/.test(name) ? 'DATS' : 'CHAR', description: labels[name] || name.replaceAll('_', ' ').toLowerCase() });
function table(id: string, name: string, module: string, system: string, keys: string, fields: string, description: string): Table {
  const keySet = new Set(keys.split(' '));
  return { id, name, module, system, description, sourceUrl: help, fields: [...new Set([...keySet, ...fields.split(' ')])].filter(Boolean).map(n => field(n, keySet.has(n))) };
}

/** 42 curated records, representative fields only; not a version-complete data dictionary. */
export const catalog: Table[] = [
  table('ACDOCA', 'Universal Journal line items', 'FI/CO', 'S4HANA', 'RCLNT RLDNR RBUKRS GJAHR BELNR DOCLN', 'RACCT PRCTR RCNTR KOKRS HSL RHCUR TSL RTCUR BUDAT POPER RASSC', 'Ledger-specific actual accounting line items. Preserve full grain and currency semantics.'),
  table('ACDOCP', 'Financial planning line items', 'FI/CO', 'S4HANA', '', 'RCLNT RLDNR RBUKRS RYEAR POPER RACCT PRCTR RCNTR HSL RHCUR CATEGORY', 'Candidate planning persistence when the landscape uses financial planning integration; confirm category, fields and key in the target release.'),
  table('BKPF', 'Accounting document header', 'FI', 'Both', 'MANDT BUKRS BELNR GJAHR', 'BUDAT BLDAT WAERS BLART', 'Header context shared by accounting entry lines; document numbers repeat across companies and years.'),
  table('BSEG', 'Accounting entry-view lines', 'FI', 'Both', 'MANDT BUKRS BELNR GJAHR BUZEI', 'HKONT LIFNR KUNNR DMBTR WRBTR SHKZG ZFBDT ZTERM AUGDT AUGBL MWSKZ', 'Operational accounting entry view. It remains distinct from Universal Journal and is relevant to open-item processes.'),
  table('SKA1', 'G/L account chart data', 'FI-GL', 'Both', 'MANDT KTOPL SAKNR', 'XBILK KTOKS', 'Chart-of-accounts level account classification.'),
  table('SKB1', 'G/L account company data', 'FI-GL', 'Both', 'MANDT BUKRS SAKNR', 'WAERS XOPVW', 'Company-code settings for a G/L account.'),
  table('SKAT', 'G/L account texts', 'FI-GL', 'Both', 'MANDT SPRAS KTOPL SAKNR', 'TXT20 TXT50', 'Language-dependent account descriptions; select one language before enrichment.'),
  table('T001', 'Company codes', 'FI', 'Both', 'MANDT BUKRS', 'BUTXT WAERS KTOPL PERIV', 'Company configuration including currency, chart of accounts and fiscal-year variant.'),
  table('T004', 'Charts of accounts', 'FI-GL', 'Both', 'MANDT KTOPL', 'SPRAS', 'Chart-of-accounts configuration.'),
  table('T009', 'Fiscal-year variants', 'FI', 'Both', 'MANDT PERIV', 'ANZBP ANZSP', 'Fiscal-year structure; calendar months cannot always be treated as fiscal periods.'),
  table('T009B', 'Fiscal-year period boundaries', 'FI', 'Both', 'MANDT PERIV BDATJ BUMON BUTAG', 'POPER RELJR', 'Date-to-period configuration for fiscal-year variants; confirm target dictionary fields.'),
  table('LFA1', 'Supplier general data', 'FI-AP', 'Both', 'MANDT LIFNR', 'NAME1 LAND1', 'General supplier attributes; business partner is the leading master-data approach in S/4HANA.'),
  table('LFB1', 'Supplier company data', 'FI-AP', 'Both', 'MANDT LIFNR BUKRS', 'AKONT ZTERM', 'Company-level supplier reconciliation account and payment settings.'),
  table('LFM1', 'Supplier purchasing data', 'MM/FI', 'Both', 'MANDT LIFNR EKORG', 'WAERS ZTERM', 'Purchasing-organization supplier context; useful for spend analysis, not a financial fact.'),
  table('KNA1', 'Customer general data', 'FI-AR', 'Both', 'MANDT KUNNR', 'NAME1 LAND1', 'General customer attributes; align customer identifiers with business partners in S/4HANA.'),
  table('KNB1', 'Customer company data', 'FI-AR', 'Both', 'MANDT KUNNR BUKRS', 'AKONT ZTERM', 'Company-level customer account and payment settings.'),
  table('BUT000', 'Business partner general data', 'Master Data', 'Both', 'CLIENT PARTNER', 'TYPE NAME_ORG1', 'Business partner identity where business partner functionality is installed; do not equate PARTNER with customer/supplier number without mapping.'),
  table('BSIK', 'Supplier open-item index', 'FI-AP', 'ECC', '', 'MANDT BUKRS LIFNR GJAHR BELNR BUZEI ZFBDT ZTERM DMBTR WRBTR WAERS', 'ECC candidate index of supplier open items; exact key includes additional index fields and must be inspected in source.'),
  table('BSAK', 'Supplier cleared-item index', 'FI-AP', 'ECC', '', 'MANDT BUKRS LIFNR GJAHR BELNR BUZEI AUGDT AUGBL DMBTR WAERS', 'ECC cleared supplier items required to reconstruct historical open-item positions.'),
  table('BSID', 'Customer open-item index', 'FI-AR', 'ECC', '', 'MANDT BUKRS KUNNR GJAHR BELNR BUZEI ZFBDT ZTERM DMBTR WAERS', 'ECC candidate index of customer open items; inspect full dictionary key.'),
  table('BSAD', 'Customer cleared-item index', 'FI-AR', 'ECC', '', 'MANDT BUKRS KUNNR GJAHR BELNR BUZEI AUGDT AUGBL DMBTR WAERS', 'ECC cleared customer items for key-date receivables.'),
  table('CSKS', 'Cost center master data', 'CO', 'Both', 'MANDT KOKRS KOSTL DATBI', 'DATAB BUKRS PRCTR', 'Time-dependent cost center attributes; match controlling area and posting date.'),
  table('CSKT', 'Cost center texts', 'CO', 'Both', 'MANDT SPRAS KOKRS KOSTL DATBI', 'KTEXT LTEXT', 'Language- and validity-dependent cost center descriptions.'),
  table('CEPC', 'Profit center master data', 'CO', 'Both', 'MANDT KOKRS PRCTR DATBI', 'DATAB', 'Time-dependent profit center attributes scoped by controlling area.'),
  table('CEPCT', 'Profit center texts', 'CO', 'Both', 'MANDT SPRAS KOKRS PRCTR DATBI', 'KTEXT LTEXT', 'Language- and validity-dependent profit center descriptions.'),
  table('TKA01', 'Controlling areas', 'CO', 'Both', 'MANDT KOKRS', 'BEZEI WAERS KTOPL', 'Controlling-area organizational and currency settings.'),
  table('COEP', 'Controlling line items', 'CO', 'ECC', 'MANDT KOKRS BELNR BUZEI', 'OBJNR GJAHR KSTAR WRTTP VERSN', 'ECC controlling line-item candidate; actual/plan value types must be selected explicitly.'),
  table('COSP', 'External-posting CO totals', 'CO', 'ECC', '', 'MANDT OBJNR GJAHR WRTTP VERSN KSTAR WTG001', 'ECC periodized cost totals; inspect full key, value type and currency fields before joining.'),
  table('COSS', 'Internal-posting CO totals', 'CO', 'ECC', '', 'MANDT OBJNR GJAHR WRTTP VERSN KSTAR WTG001', 'ECC internal allocation totals; do not add to COSP without a defined reporting model.'),
  table('ANLA', 'Asset master data', 'FI-AA', 'Both', 'MANDT BUKRS ANLN1 ANLN2', 'ANLKL TXT50 AKTIV', 'Asset identity and capitalization context; values belong to separate accounting/depreciation records.'),
  table('ANLB', 'Asset depreciation terms', 'FI-AA', 'Both', 'MANDT BUKRS ANLN1 ANLN2 AFABE', 'AFASL NDJAR', 'Depreciation-area terms, not a stand-alone measure of accumulated depreciation.'),
  table('ANLZ', 'Asset time-dependent assignments', 'FI-AA', 'Both', 'MANDT BUKRS ANLN1 ANLN2 BDATU', 'ADATU KOSTL WERKS', 'Time-dependent organizational assignments for assets; select assignment valid on the reporting date.'),
  table('ANLC', 'Asset annual values', 'FI-AA', 'ECC', 'MANDT BUKRS ANLN1 ANLN2 GJAHR AFABE', 'KANSW KNAFA', 'ECC asset-year/depreciation-area values. Validate sign and movement interpretation for schedules.'),
  table('AUFK', 'Order master data', 'CO', 'Both', 'MANDT AUFNR', 'OBJNR KOKRS BUKRS KTEXT AUART', 'Order identity and organizational assignment; filter order category for internal-order analysis.'),
  table('PROJ', 'Project definitions', 'PS/FI', 'Both', 'MANDT PSPNR', 'PSPID POST1', 'Project definition context; this catalog only supports financial project costs.'),
  table('PRPS', 'WBS elements', 'PS/FI', 'Both', 'MANDT PSPNR', 'POSID PSPHI OBJNR POST1', 'Work breakdown structure context for financial postings, not project scheduling.'),
  table('BSET', 'Accounting tax data', 'FI-Tax', 'Both', 'MANDT BUKRS BELNR GJAHR BUZEI', 'MWSKZ HWBAS HWSTE', 'Tax bases and amounts; tax-line grain must be reconciled separately from journal-line grain.'),
  table('T007A', 'Tax codes', 'FI-Tax', 'Both', 'MANDT KALSM MWSKZ', 'MWART', 'Tax-code properties scoped by calculation procedure; country and localization rules still apply.'),
  table('T012', 'House banks', 'FI-Bank', 'Both', 'MANDT BUKRS HBKID', 'BANKS BANKL', 'House-bank configuration; balances must come from posted transactions or an approved cash source.'),
  table('T012K', 'House-bank accounts', 'FI-Bank', 'Both', 'MANDT BUKRS HBKID HKTID', 'HKONT WAERS', 'House-bank account-to-ledger account context; access depends on release and cash-management design.'),
  table('EKKO', 'Purchasing document header', 'MM/FI', 'Both', 'MANDT EBELN', 'LIFNR BUKRS WAERS EKORG', 'Purchasing commitments are not the same as invoiced supplier spend.'),
  table('EKPO', 'Purchasing document items', 'MM/FI', 'Both', 'MANDT EBELN EBELP', 'MATNR WERKS NETWR', 'Item-level purchasing context; distinguish net order value from FI actual expenditure.'),
];

type Family = { id: string; title: string; description: string; query: string; match: RegExp; s4: string[]; ecc: string[]; objective: string; measures: string[] };
const families: Family[] = [
  { id: 'pnl', title: 'Profit & loss', description: 'Financial performance by account and profit center', query: 'Monthly P&L with profit center breakdown and cost center drill-down', match: /\bp\s*&\s*l\b|profit\s*(?:and|&)\s*loss|income statement/, s4: ['ACDOCA','BKPF','SKA1','SKAT','T001','CEPC','CSKS'], ecc: ['BSEG','BKPF','SKA1','SKAT','T001','CEPC','CSKS'], objective: 'Map revenue and expense accounts to a governed financial statement hierarchy.', measures: ['Actual amount in a selected reporting currency','Revenue','Expense','Net result'] },
  { id: 'ap-aging', title: 'Payables aging', description: 'Supplier open items at a reporting key date', query: 'Vendor accounts payable aging by due date and company code', match: /payable|\bap\b|vendor.*aging|supplier.*aging/, s4: ['BSEG','BKPF','LFA1','LFB1','T001'], ecc: ['BSIK','BSAK','BKPF','LFA1','LFB1','T001'], objective: 'Reconstruct supplier items open at the key date and classify them by contractual due date.', measures: ['Open balance','Not yet due','1–30 days overdue','31–60 days overdue','61–90 days overdue','Over 90 days overdue'] },
  { id: 'ar-aging', title: 'Receivables aging', description: 'Customer open items and overdue exposure', query: 'Accounts receivable aging by customer and company code', match: /receivable|\bar\b|customer.*aging/, s4: ['BSEG','BKPF','KNA1','KNB1','T001'], ecc: ['BSID','BSAD','BKPF','KNA1','KNB1','T001'], objective: 'Reconstruct customer items open at the key date and preserve credit-item handling.', measures: ['Open receivables','Overdue amount','Aging bucket balance'] },
  { id: 'vendor-spend', title: 'Supplier spend', description: 'Invoiced supplier expenditure with purchasing context', query: 'Vendor spend analysis by supplier and purchasing organization', match: /vendor|supplier|procure|purchas.*spend/, s4: ['BSEG','BKPF','LFA1','LFB1','EKKO','EKPO','T001'], ecc: ['BSEG','BKPF','LFA1','LFB1','EKKO','EKPO','T001'], objective: 'Measure posted supplier invoices and credits without counting purchase orders as additional spend.', measures: ['Invoiced expenditure','Credit adjustments','Supplier concentration'] },
  { id: 'cost-center', title: 'Cost center actuals', description: 'Cost allocation and responsibility analysis', query: 'Cost center actual costs by period and cost element', match: /cost cent(?:er|re)/, s4: ['ACDOCA','CSKS','CSKT','TKA01','T001','SKA1'], ecc: ['COEP','CSKS','CSKT','TKA01','T001'], objective: 'Analyze cost responsibility with controlling-area and valid-on-date master data.', measures: ['Actual costs','Cost by account','Period movement'] },
  { id: 'profit-center', title: 'Profit center performance', description: 'Ledger reporting by responsibility center', query: 'Profit center performance and company-code drill-down', match: /profit cent(?:er|re)/, s4: ['ACDOCA','CEPC','CEPCT','TKA01','T001','SKA1'], ecc: ['BSEG','BKPF','CEPC','CEPCT','T001','SKA1'], objective: 'Analyze profit-center performance; confirm source assignment coverage for ECC.', measures: ['Revenue','Expense','Net contribution'] },
  { id: 'balance-sheet', title: 'Balance sheet', description: 'Closing balances and financial statement mapping', query: 'Balance sheet by company code and ledger with closing balances', match: /balance sheet/, s4: ['ACDOCA','SKA1','SKAT','T001','T009'], ecc: ['BSEG','BKPF','SKA1','SKAT','T001','T009'], objective: 'Include opening balances and movements, and map accounts to a governed statement version.', measures: ['Opening balance','Period movements','Closing balance'] },
  { id: 'trial-balance', title: 'Trial balance', description: 'Debit, credit and closing-balance reconciliation', query: 'General ledger trial balance by account and company code', match: /trial balance|general ledger|\bgl\b/, s4: ['ACDOCA','BKPF','SKA1','SKAT','T001'], ecc: ['BSEG','BKPF','SKA1','SKAT','T001'], objective: 'Reconcile ledger balances by account, fiscal period and currency.', measures: ['Debit movement','Credit movement','Closing balance'] },
  { id: 'assets', title: 'Fixed asset schedule', description: 'Asset register, values and depreciation', query: 'Fixed asset register with depreciation and asset aging by capitalization date', match: /asset|depreciation/, s4: ['ANLA','ANLB','ANLZ','ACDOCA','T001'], ecc: ['ANLA','ANLB','ANLZ','ANLC','T001'], objective: 'Build a depreciation-area-aware asset schedule with capitalization and disposal rules.', measures: ['Acquisition value','Accumulated depreciation','Net book value','Asset age'] },
  { id: 'budget', title: 'Actual versus plan', description: 'Aligned plan and actual comparisons', query: 'Budget versus actual variance by cost center and fiscal period', match: /budget|forecast|actual.*(?:plan|variance)|plan.*actual/, s4: ['ACDOCA','ACDOCP','CSKS','CEPC','T001','T009'], ecc: ['COEP','COSP','COSS','CSKS','T001','T009'], objective: 'Align actuals and the approved plan source at identical period, account, currency and responsibility grain.', measures: ['Actual amount','Plan amount','Absolute variance','Variance percent with zero-plan handling'] },
  { id: 'intercompany', title: 'Intercompany reconciliation', description: 'Trading-partner balances and differences', query: 'Intercompany reconciliation by trading partner and company code', match: /intercompany|inter-company|trading partner/, s4: ['ACDOCA','BKPF','T001','SKA1'], ecc: ['BSEG','BKPF','T001','SKA1'], objective: 'Match reciprocal trading-partner positions using agreed sign, scope and common-currency rules.', measures: ['Partner receivable','Partner payable','Unmatched difference'] },
  { id: 'tax', title: 'Tax reporting', description: 'Tax base and amount reconciliation', query: 'Tax report by tax code and company code', match: /\btax\b|\bvat\b|\bgst\b/, s4: ['BSET','BKPF','T007A','T001'], ecc: ['BSET','BKPF','T007A','T001'], objective: 'Reconcile tax amounts and taxable bases under the selected jurisdiction and reporting rules.', measures: ['Taxable base','Tax amount','Document count'] },
  { id: 'orders', title: 'Internal order costs', description: 'Financial postings and settlement context', query: 'Internal order actual costs and settlement analysis', match: /internal order|order cost|settlement/, s4: ['ACDOCA','AUFK','TKA01','T001'], ecc: ['COEP','AUFK','TKA01','T001'], objective: 'Track internal-order financial postings while identifying settlement and allocation effects.', measures: ['Posted costs','Settlement movement','Remaining balance'] },
  { id: 'cash', title: 'Cash position', description: 'Posted bank balances with house-bank context', query: 'Cash position by house bank and company code', match: /\bcash\b|bank balance|house bank/, s4: ['ACDOCA','T012','T012K','T001'], ecc: ['BSEG','BKPF','T012','T012K','T001'], objective: 'Present posted bank-account balances; this template does not predict liquidity or implement treasury.', measures: ['Opening bank balance','Posted inflow','Posted outflow','Closing bank balance'] },
  { id: 'project', title: 'Project financial costs', description: 'WBS-linked financial actuals', query: 'WBS project costs by project definition and fiscal period', match: /\bwbs\b|project cost|project financial/, s4: ['ACDOCA','PRPS','PROJ','T001'], ecc: ['COEP','PRPS','PROJ','T001'], objective: 'Analyze WBS-related financial postings; scheduling and project execution remain outside scope.', measures: ['Actual project cost','Cost by WBS element','Period movement'] },
];
export const templates = families.map(({ id, title, description, query }) => ({ id, title, description, query }));

const sources = ['S4HANA', 'ECC'] as const;
const warehouses = ['Datasphere', 'BW4HANA', 'Embedded'] as const;
const reports = ['SAC', 'Fiori', 'AFO', 'PowerBI'] as const;
const identifiers = /^[A-Z][A-Z0-9_.]{0,39}$/;
const fieldIdentifiers = /^[A-Z][A-Z0-9_]{0,39}$/;
const dataTypePattern = /^[A-Z][A-Z0-9_]*(?:\(\d{1,5}(?:,\d{1,3})?\))?$/;

function fail(message: string): never { throw new Error(message); }
function text(value: unknown, name: string, max = 2000, empty = false): string {
  if (typeof value !== 'string' || value.length > max || (!empty && !value.trim()) || /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(value)) fail(`Invalid ${name}.`);
  return value;
}
function record(value: unknown, name: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(`Invalid ${name}.`);
  return value as Record<string, unknown>;
}
function array(value: unknown, name: string, max: number, min = 0): unknown[] {
  if (!Array.isArray(value) || value.length > max || value.length < min) fail(`Invalid ${name}.`);
  return value;
}
function strings(value: unknown, name: string, max = 40, itemMax = 2000, min = 0): string[] {
  return array(value, name, max, min).map(v => text(v, name, itemMax));
}
function landscape(value: unknown): Landscape {
  const x = record(value, 'landscape');
  if (!sources.includes(x.source as Landscape['source']) || !warehouses.includes(x.warehouse as Landscape['warehouse']) || !reports.includes(x.reporting as Landscape['reporting'])) fail('Invalid landscape selection.');
  return { source: x.source as Landscape['source'], warehouse: x.warehouse as Landscape['warehouse'], reporting: x.reporting as Landscape['reporting'], version: text(x.version, 'version', 80) };
}
function validatedField(value: unknown): Field {
  const x = record(value, 'field');
  const name = text(x.name, 'field name', 40);
  const dataType = text(x.dataType, 'field type', 40);
  if (!fieldIdentifiers.test(name) || !dataTypePattern.test(dataType) || typeof x.isKey !== 'boolean') fail('Invalid field name, type or key flag.');
  return { name, dataType, isKey: x.isKey, description: text(x.description, 'field description', 1000, true) };
}
function validatedTable(value: unknown): Table {
  const x = record(value, 'table');
  const id = text(x.id, 'source identifier', 40);
  if (!identifiers.test(id)) fail('Invalid source identifier.');
  const fields = array(x.fields, 'fields', 200, 1).map(validatedField);
  if (new Set(fields.map(f => f.name)).size !== fields.length) fail(`Duplicate fields in ${id}.`);
  const result: Table = { id, name: text(x.name, 'source name', 160), description: text(x.description, 'source description', 2000, true), module: text(x.module, 'source module', 80), system: text(x.system, 'source system', 80), fields };
  if (x.custom !== undefined) { if (typeof x.custom !== 'boolean') fail('Invalid custom source flag.'); result.custom = x.custom; }
  if (x.sourceUrl !== undefined) {
    const url = text(x.sourceUrl, 'source URL', 2000);
    let parsed: URL; try { parsed = new URL(url); } catch { return fail('Invalid source URL.'); }
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) fail('Source URL must be a credential-free HTTPS URL.');
    result.sourceUrl = parsed.href;
  }
  return result;
}

/** Accept CSV field names, or lines NAME TYPE description. Optional * marks a key. */
export function parseFields(input: string): Field[] {
  text(input, 'field input', 24000);
  const lines = input.trim().split(/\r?\n/).filter(s => s.trim());
  const fields: Field[] = [];
  if (lines.length === 1 && lines[0].includes(',') && !/\b(?:DECIMAL|NUMERIC)\s*\(/i.test(lines[0])) {
    // A deliberately small CSV-header parser supports quoted names, not multi-row CSV data.
    const tokens = lines[0].match(/(?:"(?:[^"]|"")*"|[^,]+)(?=,|$)/g) || [];
    if (tokens.length !== lines[0].split(',').length) fail('Use a CSV header with non-empty field names.');
    for (const token of tokens) {
      const name = token.trim().replace(/^"|"$/g, '').trim().toUpperCase();
      fields.push({ name, dataType: 'CHAR', isKey: false, description: labels[name] || '' });
    }
  } else {
    for (const line of lines) {
      const match = line.trim().match(/^(\*?[A-Za-z][A-Za-z0-9_]*)(?:\s+([A-Za-z][A-Za-z0-9_]*(?:\(\d+(?:,\d+)?\))?))?(?:\s+(.+))?$/);
      if (!match) fail('Use one field per line: NAME TYPE description.');
      const isKey = match[1].startsWith('*');
      const name = match[1].replace(/^\*/, '').toUpperCase();
      fields.push({ name, dataType: (match[2] || 'CHAR').toUpperCase(), isKey, description: match[3] || labels[name] || '' });
    }
  }
  if (fields.length > 200 || !fields.length) fail('Provide between 1 and 200 fields.');
  fields.forEach(validatedField);
  if (new Set(fields.map(f => f.name)).size !== fields.length) fail('Duplicate field names are not allowed.');
  return fields;
}

export function validateCustomSource(value: unknown): string[] {
  try {
    const t = validatedTable(value);
    if (catalog.some(c => c.id === t.id)) return ['This identifier is reserved by the curated catalog. Use a distinct custom source identifier.'];
    return [];
  } catch (e) { return [e instanceof Error ? e.message : 'Invalid custom source.']; }
}

function uuid(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (!globalThis.crypto?.getRandomValues) fail('Secure random identifiers are unavailable in this browser.');
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
const titleForReport: Record<Landscape['reporting'], string> = { SAC: 'SAP Analytics Cloud', Fiori: 'SAP Fiori', AFO: 'SAP Analysis for Microsoft Office', PowerBI: 'Microsoft Power BI' };
const titleForWarehouse: Record<Landscape['warehouse'], string> = { Datasphere: 'SAP Datasphere', BW4HANA: 'SAP BW/4HANA', Embedded: 'S/4HANA embedded analytics' };

function relationshipCandidates(selected: Table[]): Blueprint['relationships'] {
  const edges: Blueprint['relationships'] = [
    { from: 'ACDOCA', to: 'BKPF', keys: ['ACDOCA.RCLNT = BKPF.MANDT','ACDOCA.RBUKRS = BKPF.BUKRS','ACDOCA.GJAHR = BKPF.GJAHR','ACDOCA.BELNR = BKPF.BELNR'], cardinality: 'many-to-one (verify header coverage)' },
    { from: 'BSEG', to: 'BKPF', keys: ['BSEG.MANDT = BKPF.MANDT','BSEG.BUKRS = BKPF.BUKRS','BSEG.GJAHR = BKPF.GJAHR','BSEG.BELNR = BKPF.BELNR'], cardinality: 'many-to-one' },
    { from: 'BSET', to: 'BKPF', keys: ['BSET.MANDT = BKPF.MANDT','BSET.BUKRS = BKPF.BUKRS','BSET.GJAHR = BKPF.GJAHR','BSET.BELNR = BKPF.BELNR'], cardinality: 'many-to-one' },
    { from: 'ACDOCA', to: 'T001', keys: ['ACDOCA.RCLNT = T001.MANDT','ACDOCA.RBUKRS = T001.BUKRS'], cardinality: 'many-to-one' },
    { from: 'BKPF', to: 'T001', keys: ['BKPF.MANDT = T001.MANDT','BKPF.BUKRS = T001.BUKRS'], cardinality: 'many-to-one' },
    { from: 'BSEG', to: 'LFA1', keys: ['BSEG.MANDT = LFA1.MANDT','BSEG.LIFNR = LFA1.LIFNR'], cardinality: 'many-to-one (supplier lines only)' },
    { from: 'BSEG', to: 'KNA1', keys: ['BSEG.MANDT = KNA1.MANDT','BSEG.KUNNR = KNA1.KUNNR'], cardinality: 'many-to-one (customer lines only)' },
    { from: 'LFB1', to: 'LFA1', keys: ['LFB1.MANDT = LFA1.MANDT','LFB1.LIFNR = LFA1.LIFNR'], cardinality: 'many-to-one' },
    { from: 'KNB1', to: 'KNA1', keys: ['KNB1.MANDT = KNA1.MANDT','KNB1.KUNNR = KNA1.KUNNR'], cardinality: 'many-to-one' },
    { from: 'ANLB', to: 'ANLA', keys: ['ANLB.MANDT = ANLA.MANDT','ANLB.BUKRS = ANLA.BUKRS','ANLB.ANLN1 = ANLA.ANLN1','ANLB.ANLN2 = ANLA.ANLN2'], cardinality: 'many-to-one' },
    { from: 'ANLC', to: 'ANLA', keys: ['ANLC.MANDT = ANLA.MANDT','ANLC.BUKRS = ANLA.BUKRS','ANLC.ANLN1 = ANLA.ANLN1','ANLC.ANLN2 = ANLA.ANLN2'], cardinality: 'many-to-one' },
    { from: 'EKPO', to: 'EKKO', keys: ['EKPO.MANDT = EKKO.MANDT','EKPO.EBELN = EKKO.EBELN'], cardinality: 'many-to-one' },
    { from: 'EKKO', to: 'LFA1', keys: ['EKKO.MANDT = LFA1.MANDT','EKKO.LIFNR = LFA1.LIFNR'], cardinality: 'many-to-one' },
    { from: 'PRPS', to: 'PROJ', keys: ['PRPS.MANDT = PROJ.MANDT','PRPS.PSPHI = PROJ.PSPNR'], cardinality: 'many-to-one' },
    { from: 'T012K', to: 'T012', keys: ['T012K.MANDT = T012.MANDT','T012K.BUKRS = T012.BUKRS','T012K.HBKID = T012.HBKID'], cardinality: 'many-to-one' },
  ];
  const ids = new Set(selected.map(t => t.id));
  return edges.filter(e => ids.has(e.from) && ids.has(e.to));
}

function extractionFor(l: Landscape): Blueprint['extraction'] {
  if (l.warehouse === 'Embedded') return { method: 'Released CDS analytical model in the source', rationale: 'Keep computation in S/4HANA and expose an authorized analytical query. No separate warehouse extraction is implied.' };
  if (l.warehouse === 'BW4HANA') return { method: l.source === 'S4HANA' ? 'Validated extraction-enabled CDS / ODP into BW/4HANA' : 'Validated ECC DataSources / ODP into BW/4HANA', rationale: 'Confirm extractor availability, initialization and delta behavior. Model staging, transformations, ADSOs and a governed query; table names are lineage only.' };
  return l.source === 'S4HANA'
    ? { method: 'SAP Datasphere replication flows with released extraction-enabled CDS', rationale: 'Prefer supported extraction interfaces and validate C1 release, extraction annotations, delta capability and Cloud Connector prerequisites. Direct table access is not assumed.' }
    : { method: 'SAP ABAP connection / validated ECC extraction route to Datasphere', rationale: 'Check ECC support packages, ABAP Pipeline Engine or relevant add-ons, connector and DataSource capabilities. Choose the supported replication or legacy acquisition route for that system.' };
}
function consumptionFor(l: Landscape): Blueprint['consumption'] {
  const type = titleForReport[l.reporting];
  const model = l.warehouse === 'Datasphere' ? 'a semantic analytic model in SAP Datasphere' : l.warehouse === 'BW4HANA' ? 'a governed BW query' : 'a released S/4HANA analytical query';
  const routes = {
    SAC: `Consume ${model} through a supported live or acquired connection; verify tenant, authentication and feature restrictions.`,
    Fiori: l.warehouse === 'Embedded' ? 'Use a supported Fiori analytical application/query with assigned catalogs and business roles.' : `A custom Fiori application requires a separately designed supported service/API for ${model}; no direct out-of-box warehouse-to-Fiori connector is assumed.`,
    AFO: l.warehouse === 'BW4HANA' ? 'Use SAP Analysis for Microsoft Office with the approved BW query and authorizations.' : `Validate the exact Analysis for Office edition, version and supported connection to ${model}; do not assume all live analytical features are available.`,
    PowerBI: `Design a supported connection to ${model}; for Datasphere consider exposed SQL views with scoped database access, and for BW validate the supported SAP BW connector. Verify gateway, licensing and semantic limitations.`,
  };
  return { type, details: routes[l.reporting] };
}

function codeFor(f: Family, l: Landscape, plan: boolean, tables: Table[]): CodeBlock[] {
  const primary = tables[0];
  const keyFields = primary.fields.filter(x => x.isKey).map(x => x.name);
  // Pseudocode deliberately names modeled entities instead of inventing executable extractor/CDS names.
  const requirements = [
    `REPORT ${f.id.toUpperCase().replaceAll('-', '_')}`,
    `SOURCE ${l.source}; WAREHOUSE ${l.warehouse}; CONSUMPTION ${l.reporting}`,
    `CANDIDATE_LINEAGE ${tables.map(t => t.id).join(', ')}`,
    `DEFINE_GRAIN ${keyFields.length ? keyFields.join(' + ') : 'Confirm complete source key in target dictionary'}`,
    'REQUIRE client_policy, fiscal_calendar, reporting_currency, authorization_scope',
    ...(tables.some(t => t.id === 'ACDOCA') ? ['REQUIRE ledger_policy_including_extension_ledger_behavior'] : []),
    ...(f.id.includes('aging') ? ['DEFINE key_date, baseline_date_and_payment_terms, due_date, credit_policy', 'SELECT items_posted_on_or_before(key_date)', 'KEEP items_uncleared_at(key_date)', 'BUCKET by_days_overdue_with_no_overlap'] : []),
    ...(f.id === 'assets' ? ['DEFINE depreciation_area, capitalization_date, reporting_key_date, disposal_policy', 'ALIGN asset_values_to_asset_year_and_depreciation_area'] : []),
    ...(f.id === 'tax' ? ['DEFINE jurisdiction, tax_procedure, tax_line_grain', 'RECONCILE tax_base_and_amount_against_accounting_documents'] : []),
    ...(f.id === 'intercompany' ? ['ALIGN partner_company_mapping, common_currency, reciprocal_signs', 'MATCH reciprocal_positions_at_agreed_grain'] : []),
    ...(f.id === 'cash' ? ['SELECT approved_bank_accounts', 'INCLUDE opening_balance_and_posted_movements', 'EXCLUDE unimplemented_liquidity_forecasts'] : []),
    ...(plan ? ['REQUIRE approved_plan_source, plan_category_or_version', 'AGGREGATE actual_and_plan_separately_to_same_grain', 'COMPARE actual_minus_plan; DEFINE zero_plan_percent_behavior'] : []),
    `MEASURES ${f.measures.join(' | ')}`,
    'CHECK unique_dimension_keys BEFORE enrichment',
    'CHECK fact_count_and_amounts BEFORE_AND_AFTER each_join',
    'RECONCILE totals_to_approved_source_report BEFORE publish',
  ].join('\n');
  const sql = keyFields.length ? `-- Illustrative duplicate-key check for a validated staging object.\n-- Replace STAGED_${primary.id} with your authorized, correctly typed model.\n-- This is not an extraction query or deployable SAP view.\nSELECT ${keyFields.join(', ')}, COUNT(*) AS duplicate_count\nFROM STAGED_${primary.id}\nGROUP BY ${keyFields.join(', ')}\nHAVING COUNT(*) > 1;` : `-- ${primary.id} has no complete key asserted in this catalog.\n-- Inspect source metadata, define the business grain, then implement\n-- duplicate-key and reconciliation checks before writing joins.`;
  return [
    { title: `${f.title} transformation specification`, language: 'text', code: requirements, notes: ['Design pseudocode, not executable SAP SQL or ABAP.', 'Resolve released interfaces and exact field semantics in the target system.', 'Custom source relationships require explicit user-supplied key mappings.'] },
    { title: `${primary.id} grain validation example`, language: 'sql', code: sql, notes: ['Run only against a prepared, authorized staging model after adapting object and field names.', 'A passing duplicate check alone does not prove financial correctness.'] },
  ];
}

export function makeBlueprint(query: string, selection: Landscape = defaultLandscape, customSources: Table[] = []): Blueprint {
  text(query, 'requirement', 6000);
  const l = landscape(selection);
  if (l.source === 'ECC' && l.warehouse === 'Embedded') fail('This embedded-analytics design requires S/4HANA. Choose Datasphere or BW/4HANA for ECC.');
  if (l.source === 'S4HANA' && /\bECC\b/i.test(l.version)) fail('Choose an S/4HANA release for the selected source.');
  if (l.source === 'ECC' && /S\/?4HANA/i.test(l.version)) fail('Choose an ECC release for the selected source.');
  const q = query.toLowerCase();
  // Refuse clear out-of-scope domains before keyword routing; do not imply demo general intelligence.
  if (/payroll|successfactors|warehouse management|\bewm\b|production scheduling|travel expense|real estate|crypto|weather|stock price|recipe/.test(q)) fail('This deterministic demo covers FI/CO reporting templates. That requirement is outside the supported demo scope.');
  const plan = /budget|forecast|actual.*plan|plan.*actual/.test(q);
  // Specific families outrank incidental dimensions such as cost center or profit center.
  const priority = ['pnl','assets','ap-aging','ar-aging','budget','intercompany','tax','orders','cash','project','balance-sheet','trial-balance','vendor-spend','cost-center','profit-center'];
  const f = priority.map(id => families.find(fam => fam.id === id)!).find(fam => fam.match.test(q));
  if (!f) fail('No supported demo template matches this requirement. Choose a template or use the owner-authorized AI generator for a new FI/CO requirement.');
  if (!Array.isArray(customSources) || customSources.length > 20) fail('At most 20 custom sources are supported.');
  const custom = customSources.map(s => {
    const errors = validateCustomSource(s); if (errors.length) fail(errors[0]);
    return { ...validatedTable(s), custom: true, system: 'Custom' };
  });
  if (new Set(custom.map(s => s.id)).size !== custom.length) fail('Duplicate custom source identifiers are not allowed.');
  const ids = [...(l.source === 'S4HANA' ? f.s4 : f.ecc)];
  if (plan && l.source === 'S4HANA') ids.push('ACDOCP');
  if (plan && l.source === 'ECC') ids.push('COSP','COSS');
  const tables = [...new Set(ids)].map(id => structuredClone(catalog.find(t => t.id === id)!)).concat(custom);
  const extraction = extractionFor(l);
  const consumption = consumptionFor(l);
  const warnings = [
    'Deterministic reference design, not AI validation or a connection to your SAP system. Confirm every source, field and interface against your release.',
    'Catalog fields are representative, not complete dictionary definitions. A listed table is not automatically a supported extraction object.',
    'Code is illustrative; no SAP query, deployment, reconciliation or authorization check has been executed.',
    ...(l.source === 'ECC' ? ['ECC financial models and available extractors vary by configuration. No Universal Journal compatibility is assumed.'] : []),
    ...(l.version !== 'Any' ? [`Selected release ${l.version} is recorded for review; this catalog does not certify release-level availability.`] : ['Source release is unspecified; extraction compatibility remains unverified.']),
    ...(plan ? ['Plan source and category/version must be confirmed; plan records must not be joined directly to actual journal lines.'] : []),
    ...(custom.length ? ['Custom sources are included as declared metadata. Their contents, completeness and relationships have not been verified.'] : []),
    ...(l.reporting === 'Fiori' && l.warehouse !== 'Embedded' ? ['Fiori consumption requires an additional service/application design for the selected external warehouse.'] : []),
    ...(l.reporting === 'AFO' && l.warehouse !== 'BW4HANA' ? ['Analysis for Office connectivity depends on edition, version and supported provider; verify before implementation.'] : []),
  ];
  const assumptions = [
    'Agree the SAP client, company-code scope and access policy before extraction.',
    'Select the fiscal-year variant and key date; calendar months may differ from fiscal periods.',
    'Select a reporting-currency basis and conversion policy; never add unlike currencies.',
    'Define the fact grain and require one valid dimension row per fact at the reporting date.',
    'Choose language and valid-on-date master records to avoid duplicate joins.',
    ...(tables.some(t => t.id === 'ACDOCA') ? ['Choose ledger scope explicitly; extension-ledger reporting can require base-ledger treatment.'] : []),
    ...(plan ? ['Use approved plan source/category/version and align plan and actuals at the same grain.'] : []),
    ...(f.id.includes('aging') ? ['Define contractual due-date logic and reconstruct items open at the reporting key date, including later-cleared items.'] : []),
    ...(f.id === 'assets' ? ['Choose depreciation area and financial valuation rules; asset aging uses a defined capitalization or acquisition date.'] : []),
  ];
  const bp: Blueprint = {
    schemaVersion: 1, id: uuid(), createdAt: new Date().toISOString(), mode: 'demo', title: f.title,
    query: query.trim(), landscape: l, customSources: custom, tables, relationships: relationshipCandidates(tables),
    summary: `${f.objective} This design maps ${l.source === 'S4HANA' ? 'SAP S/4HANA' : 'SAP ECC'} through ${titleForWarehouse[l.warehouse]} to ${consumption.type}.`,
    extraction, consumption, assumptions, warnings,
    checks: ['Verify released source objects and exact metadata in the source system.', 'Test source-key uniqueness and row counts at each stage.', 'Prove dimension joins do not multiply facts or amounts.', 'Reconcile totals by company, period, ledger where relevant, and currency.', 'Test delta initialization, updates, deletions and recovery where replication is used.', 'Test authorized and unauthorized users before publishing.', ...f.measures.map(m => `Document and test measure: ${m}.`)],
    security: ['Use least-privilege technical accounts and approved connector access; keep credentials out of browser code.', 'Apply company-code and organizational restrictions in both semantic models and consumption roles.', 'Test row-level access and export permissions; a live connection does not remove the need for authorization design.', 'Assign concrete SAP authorization objects only after verifying the selected interface and target release.'],
    benefits: ['Traceable source-to-report lineage', 'Explicit modeling assumptions and reconciliation criteria', 'Reusable design record for implementation review'],
    steps: [
      { title: 'Define scope', description: f.objective, actions: [f.query, ...assumptions.slice(0, 4)] },
      { title: l.warehouse === 'Embedded' ? 'Validate analytical sources' : 'Acquire source data', description: extraction.method, actions: [extraction.rationale, `Inspect candidate lineage: ${tables.map(t => t.id).join(', ')}.`, `Review ${extractionHelp}`, 'Choose load type and failure-recovery policy; record latency targets.'] },
      { title: 'Model and reconcile', description: `Build the ${f.title.toLowerCase()} semantic model in ${titleForWarehouse[l.warehouse]}.`, actions: ['Define grain and validate master-data uniqueness before enrichment.', ...f.measures.map(m => `Define measure: ${m}.`), ...(plan ? ['Aggregate actual and plan separately, then compare at common dimensions.'] : []), 'Reconcile against an approved accounting report.'] },
      { title: 'Secure and consume', description: consumption.type, actions: [consumption.details, 'Apply and test organizational restrictions.', 'Define filters, drill paths, currency labels and fiscal-period selection.'] },
      { title: 'Review and release', description: 'Obtain functional and technical acceptance before production deployment.', actions: ['Run representative-period reconciliation and negative authorization tests.', 'Document exceptions, data freshness and operating ownership.', 'Promote through the organization’s approved transport and change process.'] },
    ],
    code: codeFor(f, l, plan, tables),
  };
  return validateBlueprint(bp);
}

/** Reconstruct a bounded plain-data object; unknown properties are discarded. */
export function validateBlueprint(input: unknown): Blueprint {
  const x = record(input, 'blueprint');
  if (x.schemaVersion !== 1 || (x.mode !== 'demo' && x.mode !== 'ai')) fail('Unsupported blueprint schema or mode.');
  const tables = array(x.tables, 'tables', 120, 1).map(validatedTable);
  const customSources = array(x.customSources, 'custom sources', 20).map(validatedTable);
  const ids = new Set(tables.map(t => t.id));
  if (ids.size !== tables.length || new Set(customSources.map(t => t.id)).size !== customSources.length) fail('Duplicate source identifiers.');
  for (const t of customSources) {
    if (!t.custom || !ids.has(t.id) || !tables.find(s => s.id === t.id)?.custom) fail('Custom sources must also be present as custom tables.');
    const duplicate = tables.find(s => s.id === t.id)!;
    if (JSON.stringify(duplicate) !== JSON.stringify(t)) fail('Custom source metadata must match the table catalog entry.');
  }
  if (tables.some(t => t.custom && !customSources.some(s => s.id === t.id))) fail('Custom table missing from customSources.');
  const relationships = array(x.relationships, 'relationships', 300).map(value => {
    const r = record(value, 'relationship');
    const from = text(r.from, 'relationship source', 40), to = text(r.to, 'relationship target', 40);
    if (!ids.has(from) || !ids.has(to) || from === to) fail('Relationship endpoints must reference distinct selected tables.');
    return { from, to, keys: strings(r.keys, 'join keys', 20, 500, 1), cardinality: text(r.cardinality, 'cardinality', 160) };
  });
  const steps = array(x.steps, 'steps', 20, 1).map(v => { const s = record(v, 'step'); return { title: text(s.title, 'step title', 160), description: text(s.description, 'step description', 3000), actions: strings(s.actions, 'step actions', 40, 2000, 1) }; });
  const code = array(x.code, 'code blocks', 20).map(v => { const c = record(v, 'code'); const language = text(c.language, 'code language', 24); if (!/^[a-zA-Z0-9+#.-]+$/.test(language)) fail('Invalid code language.'); return { title: text(c.title, 'code title', 160), language, code: text(c.code, 'code text', 40000), notes: strings(c.notes, 'code notes', 20) }; });
  const extraction = record(x.extraction, 'extraction'), consumption = record(x.consumption, 'consumption');
  const id = text(x.id, 'identifier', 100);
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) fail('Invalid blueprint identifier.');
  const createdAt = text(x.createdAt, 'creation date', 40);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(createdAt) || !Number.isFinite(Date.parse(createdAt))) fail('Invalid creation date.');
  const result: Blueprint = { schemaVersion: 1, id, title: text(x.title, 'title', 200), query: text(x.query, 'requirement', 6000), landscape: landscape(x.landscape), customSources, tables, relationships, summary: text(x.summary, 'summary', 6000), steps, code, assumptions: strings(x.assumptions, 'assumptions'), checks: strings(x.checks, 'checks', 60), warnings: strings(x.warnings, 'warnings'), extraction: { method: text(extraction.method, 'extraction method', 500), rationale: text(extraction.rationale, 'extraction rationale', 5000) }, consumption: { type: text(consumption.type, 'consumption type', 160), details: text(consumption.details, 'consumption details', 5000) }, security: strings(x.security, 'security'), benefits: strings(x.benefits, 'benefits'), createdAt, mode: x.mode };
  if (JSON.stringify(result).length > 500000) fail('Blueprint exceeds the supported size.');
  return result;
}

const md = (value: string): string => value.replaceAll('\\', '\\\\').replace(/([`*_{}\[\]<>|])/g, '\\$1').replace(/\r?\n/g, ' ');
export function toMarkdown(input: Blueprint): string {
  const b = validateBlueprint(input);
  const lines = [`# ${md(b.title)}`, '', `Requirement: ${md(b.query)}`, '', `Created: ${b.createdAt} · Mode: ${b.mode} · Schema: ${b.schemaVersion}`, '', `Landscape: ${b.landscape.source} → ${b.landscape.warehouse} → ${b.landscape.reporting} (${md(b.landscape.version)})`, '', md(b.summary), '', '## Sources', ''];
  for (const t of b.tables) {
    lines.push(`### ${md(t.id)} — ${md(t.name)}`, '', md(t.description), '', '| Field | Type | Key | Meaning |', '| --- | --- | --- | --- |', ...t.fields.map(f => `| ${md(f.name)} | ${md(f.dataType)} | ${f.isKey ? 'Yes' : ''} | ${md(f.description)} |`), '');
  }
  lines.push('## Relationships', '', ...b.relationships.map(r => `- ${md(r.from)} → ${md(r.to)} (${md(r.cardinality)}): ${r.keys.map(md).join('; ')}`), '', '## Extraction', '', md(b.extraction.method), '', md(b.extraction.rationale), '', '## Consumption', '', md(b.consumption.type), '', md(b.consumption.details), '');
  for (const s of b.steps) lines.push(`## ${md(s.title)}`, '', md(s.description), '', ...s.actions.map(a => `- ${md(a)}`), '');
  for (const [name, items] of [['Assumptions', b.assumptions], ['Validation checks', b.checks], ['Security', b.security], ['Benefits', b.benefits], ['Warnings', b.warnings]] as const) lines.push(`## ${name}`, '', ...items.map(i => `- ${md(i)}`), '');
  for (const c of b.code) {
    const fence = '`'.repeat(Math.max(3, ...Array.from(c.code.matchAll(/`+/g), m => m[0].length + 1)));
    lines.push(`## ${md(c.title)}`, '', `${fence}${c.language}`, c.code, fence, '', ...c.notes.map(n => `- ${md(n)}`), '');
  }
  lines.push('Independent educational design. SAP and other product names belong to their respective owners. Generated examples require target-system validation.', '');
  return lines.join('\n');
}

/** Portable payload, not a localStorage pointer. Contains design text: do not share secrets. */
export function encodeShare(input: Blueprint): string {
  const json = JSON.stringify(validateBlueprint(input));
  const bytes = new TextEncoder().encode(json);
  if (bytes.length > 250000) fail('This blueprint is too large for a share link. Use JSON export instead.');
  let binary = '';
  for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function decodeShare(payload: string): Blueprint {
  if (typeof payload !== 'string' || payload.length > 340000 || !/^[A-Za-z0-9_-]+$/.test(payload)) fail('Invalid or oversized share link.');
  try {
    const base64 = payload.replaceAll('-', '+').replaceAll('_', '/');
    const binary = atob(base64 + '='.repeat((4 - base64.length % 4) % 4));
    if (binary.length > 250000) fail('Share link exceeds the size limit.');
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const json = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return validateBlueprint(JSON.parse(json));
  } catch (error) { return fail(`Unable to read blueprint share link: ${error instanceof Error ? error.message : 'invalid data'}`); }
}
