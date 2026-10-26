import type { Blueprint } from './blueprint.ts';
import { validateBlueprint } from './blueprint.ts';

const DRAFT = 'Architecture draft. Validate source release, dictionary fields, extraction capability, joins, currency and authorizations in your SAP landscape before implementation.';
const FOOTER = 'Blueprint Studio | Independent project by Saumitra Mishra';
const chunks = (value: string, length: number): string[] => value.length ? Array.from({ length: Math.ceil(value.length / length) }, (_, i) => value.slice(i * length, (i + 1) * length)) : [''];

/** A native OOXML workbook. User strings are literal cell values, never formulas or hyperlinks. */
export async function exportWorkbook(input: Blueprint): Promise<Uint8Array> {
  const b = validateBlueprint(input);
  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Blueprint Studio';
  wb.subject = 'Reporting architecture for SAP software';
  wb.title = b.title;
  wb.created = new Date(b.createdAt);
  wb.modified = new Date(b.createdAt);
  const sheet = (name: string, headings: string[], widths: number[]) => {
    const s = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }], pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    s.columns = headings.map((header, i) => ({ header, width: widths[i] ?? 30 }));
    s.getRow(1).height = 28;
    s.getRow(1).eachCell(cell => {
      cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF413671' } };
      cell.alignment = { vertical: 'middle', wrapText: true };
    });
    return s;
  };
  const overview = sheet('Overview', ['Item', 'Value'], [25, 110]);
  overview.addRows([
    ['Title', b.title], ['Requirement', b.query], ['Summary', b.summary], ['Status', DRAFT],
    ['Source', b.landscape.source], ['Warehouse', b.landscape.warehouse], ['Reporting', b.landscape.reporting], ['Release', b.landscape.version],
    ['Created', new Date(b.createdAt)], ['Mode', b.mode], ['Schema version', b.schemaVersion], ['Blueprint ID', b.id],
    ['Extraction', b.extraction.method], ['Extraction rationale', b.extraction.rationale], ['Consumption', b.consumption.type], ['Consumption details', b.consumption.details],
    ['Source table count', b.tables.length], ['Custom source count', b.customSources.length], ['Author', FOOTER],
  ]);
  overview.getCell('B10').numFmt = 'yyyy-mm-dd hh:mm:ss';
  const sources = sheet('Sources', ['Kind', 'ID', 'Name', 'Module', 'System', 'Description', 'Documentation'], [18, 22, 42, 18, 18, 90, 80]);
  const fields = sheet('Fields', ['Kind', 'Source', 'Field', 'Data type', 'Key', 'Meaning'], [18, 24, 28, 20, 10, 95]);
  const seen = new Set<string>();
  for (const [kind, tables] of [['Selected', b.tables], ['Custom', b.customSources]] as const) for (const t of tables) {
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    const category = t.custom || b.customSources.some(c => c.id === t.id) ? 'Custom' : kind;
    sources.addRow([category, t.id, t.name, t.module, t.system, t.description, t.sourceUrl || 'User-declared source; validate in target system']);
    for (const f of t.fields) fields.addRow([category, t.id, f.name, f.dataType, f.isKey, f.description]);
  }
  const joins = sheet('Relationships', ['From', 'To', 'Cardinality', 'Key mapping', 'Validation'], [25, 25, 25, 85, 70]);
  for (const r of b.relationships) joins.addRow([r.from, r.to, r.cardinality, r.keys.join('\n'), 'Confirm client, full grain, validity and uniqueness before applying.']);
  const phases = sheet('Pipeline', ['Step', 'Phase', 'Description', 'Action'], [10, 35, 80, 90]);
  b.steps.forEach((s, i) => { if (!s.actions.length) phases.addRow([i + 1, s.title, s.description, '']); else s.actions.forEach((action, j) => phases.addRow([i + 1, s.title, j === 0 ? s.description : '', action])); });
  const review = sheet('Review', ['Category', 'Item'], [25, 120]);
  review.addRow(['Status', DRAFT]);
  for (const [category, values] of [['Assumption', b.assumptions], ['Validation check', b.checks], ['Warning', b.warnings], ['Security', b.security], ['Business benefit', b.benefits]] as const) values.forEach(value => review.addRow([category, value]));
  const code = sheet('Code', ['Block', 'Language', 'Line', 'Part', 'Code or note'], [35, 18, 10, 10, 125]);
  for (const c of b.code) {
    c.code.split(/\r?\n/).forEach((line, i) => chunks(line, 160).forEach((part, k) => code.addRow([c.title, c.language, i + 1, k + 1, part])));
    c.notes.forEach(note => code.addRow([c.title, c.language, '', 'Note', note]));
  }
  for (const s of wb.worksheets) {
    // Excel caps row height at 409 points. Split unusually long text into visible continuation rows.
    for (let i = s.rowCount; i >= 2; i--) {
      const row = s.getRow(i);
      const values = Array.from({ length: s.columnCount }, (_, c) => row.getCell(c + 1).value);
      const parts = values.map((v, c) => typeof v === 'string' ? chunks(v, Math.max(120, Math.floor((s.getColumn(c + 1).width || 30) * 16))) : [v]);
      const count = Math.max(...parts.map(p => p.length));
      if (count > 1) {
        const expanded = Array.from({ length: count }, (_, n) => parts.map(p => p[n] ?? ''));
        s.spliceRows(i, 1, ...expanded);
      }
    }
    s.autoFilter = { from: { row: 1, column: 1 }, to: { row: Math.max(1, s.rowCount), column: s.columnCount } };
    s.pageSetup.printTitlesRow = '1:1';
    s.headerFooter.oddFooter = '&LBlueprint Studio - architecture draft&RPage &P of &N';
    s.eachRow((r, i) => {
      if (i === 1) return;
      let lines = 1;
      r.eachCell((c, j) => {
        c.font = { name: s.name === 'Code' && j === 5 ? 'Consolas' : 'Calibri', size: 11, color: { argb: 'FF202938' } };
        c.alignment = { vertical: 'top', wrapText: true };
        // Assigning a string to ExcelJS never makes it a formula. Explicit string types survive re-import.
        if (typeof c.value === 'string') {
          c.numFmt = '@';
          lines = Math.max(lines, c.value.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / ((s.getColumn(j).width || 30) * .92))), 0));
        }
        if (i % 2 === 0) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F9' } };
      });
      r.height = Math.min(409, Math.max(24, 15 * lines + 8));
    });
  }
  return new Uint8Array(await wb.xlsx.writeBuffer());
}

/** Direct downloadable, paginated PDF. Unsupported glyphs are represented as explicit Unicode codes. */
export async function exportPdf(input: Blueprint): Promise<Uint8Array> {
  const b = validateBlueprint(input);
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const left = 18, width = 174, bottom = 277;
  let y = 24;
  let escapedGlyphs = false;
  const printable = (s: string) => s.replace(/[\u2010-\u2015\u2212]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/→/g, ' -> ').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/gu, c => { escapedGlyphs = true; return `[U+${c.codePointAt(0)!.toString(16).toUpperCase()}]`; });
  const page = () => { pdf.addPage(); y = 24; };
  const space = (height: number) => { if (y + height > bottom) page(); };
  const heading = (title: string, level = 1) => {
    const fontSize = level === 1 ? 15 : 11;
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(fontSize); pdf.setTextColor(68, 52, 112);
    const lines = pdf.splitTextToSize(printable(title), width) as string[];
    space(lines.length * 6 + 10);
    y += 5;
    for (const line of lines) { pdf.text(line, left, y); y += 6; }
    y += 2;
  };
  const paragraph = (text: string, code = false) => {
    pdf.setFont(code ? 'courier' : 'helvetica', 'normal'); pdf.setFontSize(code ? 8 : 9.5); pdf.setTextColor(35, 43, 57);
    const lineHeight = code ? 4 : 4.8;
    // Split and emit one line at a time so very long code/notes cannot overrun a page.
    for (const originalLine of printable(text).split('\n')) {
      const lines = pdf.splitTextToSize(originalLine || ' ', width) as string[];
      for (const line of lines) { space(lineHeight); pdf.text(line, left, y); y += lineHeight; }
    }
    y += code ? 1.5 : 3;
  };
  const list = (title: string, items: string[]) => { heading(title); if (items.length) items.forEach((item, i) => paragraph(`${i + 1}. ${item}`)); else paragraph('None specified.'); };
  pdf.setProperties({ title: b.title, subject: 'SAP reporting architecture draft', author: 'Blueprint Studio', creator: 'Blueprint Studio' });
  heading(b.title); paragraph(`${b.landscape.source} -> ${b.landscape.warehouse} -> ${b.landscape.reporting} | Release: ${b.landscape.version}`);
  paragraph(`Created: ${b.createdAt} | Mode: ${b.mode} | Schema: ${b.schemaVersion} | ID: ${b.id}`);
  paragraph(DRAFT);
  heading('Requirement'); paragraph(b.query); heading('Summary'); paragraph(b.summary);
  heading('Source tables and fields');
  const seen = new Set<string>();
  for (const t of [...b.tables, ...b.customSources]) {
    if (seen.has(t.id)) continue; seen.add(t.id);
    heading(`${t.id} - ${t.name}`, 2);
    paragraph(`${t.module} | ${t.system}${t.custom ? ' | Custom source' : ''}`); paragraph(t.description);
    for (const f of t.fields) paragraph(`${f.isKey ? '[KEY] ' : ''}${f.name} (${f.dataType}): ${f.description}`);
    if (t.sourceUrl) paragraph(`Documentation: ${t.sourceUrl}`);
  }
  heading('Relationships');
  if (!b.relationships.length) paragraph('No joins declared. Validate source grain before adding relationships.');
  for (const r of b.relationships) { heading(`${r.from} -> ${r.to} (${r.cardinality})`, 2); r.keys.forEach(key => paragraph(key, true)); }
  heading('Extraction'); paragraph(b.extraction.method); paragraph(b.extraction.rationale);
  heading('Consumption'); paragraph(b.consumption.type); paragraph(b.consumption.details);
  heading('Implementation pipeline');
  b.steps.forEach((s, i) => { heading(`${i + 1}. ${s.title}`, 2); paragraph(s.description); s.actions.forEach((a, n) => paragraph(`${n + 1}. ${a}`)); });
  list('Assumptions', b.assumptions); list('Validation checks', b.checks); list('Warnings', b.warnings); list('Security', b.security); list('Business benefits', b.benefits);
  heading('Code examples');
  b.code.forEach(c => { heading(`${c.title} (${c.language})`, 2); paragraph(c.code, true); c.notes.forEach(n => paragraph(`Note: ${n}`)); });
  if (escapedGlyphs) { heading('Text encoding note', 2); paragraph('Characters outside the PDF standard-font character set are represented by their Unicode code points, for example [U+20B9]. The native workbook, Markdown and JSON exports preserve the original Unicode text.'); }
  const total = pdf.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    pdf.setPage(i); pdf.setDrawColor(218, 220, 229); pdf.line(left, 14, 192, 14); pdf.line(left, 283, 192, 283);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(103, 109, 125);
    pdf.text('BLUEPRINT STUDIO / ARCHITECTURE DRAFT', left, 10); pdf.text(FOOTER, left, 289); pdf.text(`${i} / ${total}`, 192, 289, { align: 'right' });
  }
  return new Uint8Array(pdf.output('arraybuffer'));
}
