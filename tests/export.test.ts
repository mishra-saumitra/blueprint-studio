import test from 'node:test';
import assert from 'node:assert/strict';
import { exportPdf, exportWorkbook } from '../lib/export-blueprint.ts';
import { defaultLandscape, makeBlueprint } from '../lib/blueprint.ts';

function sample() {
  return makeBlueprint('Monthly P&L actual versus plan by profit center', defaultLandscape, [{
    id: 'Z_BUDGET', name: 'Custom budget', description: 'Planning values supplied by the user', module: 'Custom', system: 'Custom', custom: true,
    fields: [{ name: 'BUKRS', dataType: 'CHAR', isKey: true, description: 'Company code' }, { name: 'AMOUNT', dataType: 'DECIMAL', isKey: false, description: 'Budget amount' }],
  }]);
}

test('native XLSX reopens with all architecture sections and typed values', async () => {
  const { default: ExcelJS } = await import('exceljs');
  const b = sample();
  b.query = '=HYPERLINK("https://example.test", "do not execute")';
  b.customSources[0].description = '+SUM(1,2)';
  b.tables.find(t => t.id === b.customSources[0].id)!.description = '+SUM(1,2)';
  const bytes = await exportWorkbook(b);
  assert.equal(new TextDecoder().decode(bytes.subarray(0, 2)), 'PK');
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes as never);
  assert.deepEqual(workbook.worksheets.map(s => s.name), ['Overview', 'Sources', 'Fields', 'Relationships', 'Pipeline', 'Review', 'Code']);
  assert.equal(workbook.getWorksheet('Overview')!.getCell('B3').value, b.query);
  assert.ok(workbook.getWorksheet('Overview')!.getCell('B10').value instanceof Date);
  assert.equal(workbook.getWorksheet('Overview')!.getCell('B12').value, 1);
  const selectedIds = new Set([...b.tables, ...b.customSources].map(t => t.id));
  assert.equal(workbook.getWorksheet('Sources')!.rowCount - 1, selectedIds.size);
  assert.equal(workbook.getWorksheet('Relationships')!.rowCount - 1, b.relationships.length);
  const values: unknown[] = [];
  workbook.eachSheet(s => s.eachRow(r => r.eachCell(c => {
    values.push(c.value);
    assert.equal(c.formula, undefined, 'user content must not become formulas');
  })));
  assert.ok(values.includes('+SUM(1,2)'));
  assert.ok(values.includes('Z_BUDGET'));
  assert.ok(values.includes('BUKRS'));
  assert.ok(values.includes(true), 'key flags should be typed booleans');
  for (const s of b.steps) assert.ok(values.includes(s.title));
  for (const warning of b.warnings) assert.ok(values.includes(warning));
});

test('long single-line code is retained completely in native XLSX', async () => {
  const { default: ExcelJS } = await import('exceljs');
  const b = sample();
  const original = 'SELECT '.padEnd(35000, 'x');
  b.code = [{ title: 'Long example', language: 'sql', code: original, notes: ['Long-line fixture'] }];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await exportWorkbook(b) as never);
  const parts: string[] = [];
  workbook.getWorksheet('Code')!.eachRow((r, index) => { if (index > 1 && r.getCell(4).value !== 'Note') parts.push(String(r.getCell(5).value)); });
  assert.equal(parts.join(''), original);
});

test('PDF is a direct valid PDF with multiple numbered pages', async () => {
  const b = sample();
  b.assumptions.push('Unicode currency ₹ and Japanese 日 are explicitly escaped if not supported by the PDF font.');
  const bytes = await exportPdf(b);
  const raw = new TextDecoder('latin1').decode(bytes);
  assert.ok(raw.startsWith('%PDF-'));
  assert.ok(raw.includes('%%EOF'));
  assert.ok((raw.match(/\/Type \/Page\b/g) || []).length > 1);
  assert.ok(bytes.byteLength > 5000);
});

test('export rejects invalid imported data before writing files', async () => {
  await assert.rejects(() => exportWorkbook({} as never), /./);
  await assert.rejects(() => exportPdf({} as never), /./);
});
