import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, templates, defaultLandscape, makeBlueprint, parseFields, validateCustomSource, validateBlueprint, toMarkdown, encodeShare, decodeShare } from '../lib/blueprint.ts';
import type { Landscape, Table } from '../lib/blueprint.ts';

const custom: Table = { id: 'Z_FORECAST', name: 'Forecast input', description: 'User-declared data', module: 'Z', system: 'Custom', custom: true, fields: [{ name: 'COST_CENTER', dataType: 'CHAR', isKey: true, description: 'Cost center' }, { name: 'AMOUNT', dataType: 'DECIMAL(18,2)', isKey: false, description: 'Forecast amount' }] };

test('catalog has unique source identifiers and valid field definitions', () => {
  assert.equal(catalog.length, 42);
  assert.equal(new Set(catalog.map(t => t.id)).size, catalog.length);
  for (const t of catalog) {
    assert.equal(new Set(t.fields.map(f => f.name)).size, t.fields.length);
    assert.ok(t.fields.length > 0);
    assert.ok(t.description.length > 20);
  }
});

for (const template of templates) {
  test(`template ${template.id} creates the correct report`, () => {
    const bp = makeBlueprint(template.query, defaultLandscape);
    assert.equal(bp.title, template.title);
    assert.ok(bp.code[0].code.includes(template.id.toUpperCase().replaceAll('-', '_')));
    assert.ok(bp.steps.length >= 4);
    assert.ok(bp.warnings.some(w => w.includes('not executable') || w.includes('illustrative')));
    assert.equal(bp.mode, 'demo');
    assert.equal(bp.schemaVersion, 1);
  });
}

test('all valid source/warehouse/report combinations reflect chosen landscape', () => {
  let supported = 0;
  for (const source of ['S4HANA','ECC'] as const) for (const warehouse of ['Datasphere','BW4HANA','Embedded'] as const) for (const reporting of ['SAC','Fiori','AFO','PowerBI'] as const) {
    const landscape: Landscape = { source, warehouse, reporting, version: 'Any' };
    if (source === 'ECC' && warehouse === 'Embedded') {
      assert.throws(() => makeBlueprint(templates[0].query, landscape), /requires S\/4HANA/);
      continue;
    }
    const bp = makeBlueprint(templates[0].query, landscape);
    assert.deepEqual(bp.landscape, landscape);
    assert.ok(bp.code[0].code.includes(`WAREHOUSE ${warehouse}`));
    assert.ok(bp.code[0].code.includes(`CONSUMPTION ${reporting}`));
    if (source === 'ECC') assert.ok(!bp.tables.some(t => ['ACDOCA','ACDOCP'].includes(t.id)));
    supported++;
  }
  assert.equal(supported, 20);
});

test('each template supports ECC without leaking S/4HANA-only catalog objects', () => {
  for (const template of templates) {
    const bp = makeBlueprint(template.query, { ...defaultLandscape, source: 'ECC', version: 'ECC 6.0' });
    assert.ok(bp.tables.every(t => t.system !== 'S4HANA'));
    assert.equal(bp.title, template.title);
  }
});

test('P&L actual-versus-plan adds actual and plan sources without fact-to-fact join', () => {
  const bp = makeBlueprint('P&L actual versus plan variance by profit center', defaultLandscape);
  assert.ok(bp.tables.some(t => t.id === 'ACDOCA'));
  assert.ok(bp.tables.some(t => t.id === 'ACDOCP'));
  assert.ok(!bp.relationships.some(r => r.from === 'ACDOCP' || r.to === 'ACDOCP'));
  assert.ok(bp.code[0].code.includes('AGGREGATE actual_and_plan_separately'));
});

test('family routing prioritizes report purpose over incidental dimensions', () => {
  assert.equal(makeBlueprint('Budget vs actual by cost center').title, 'Actual versus plan');
  assert.equal(makeBlueprint('Asset depreciation by profit center').title, 'Fixed asset schedule');
  assert.equal(makeBlueprint('Intercompany reconciliation by cost center').title, 'Intercompany reconciliation');
  assert.equal(makeBlueprint('WBS project costs by cost center').title, 'Project financial costs');
});

test('unknown and out-of-scope requirements do not silently become P&L', () => {
  assert.throws(() => makeBlueprint('A completely novel requirement'), /No supported demo template/);
  assert.throws(() => makeBlueprint('Payroll costs by cost center'), /outside the supported demo scope/);
  assert.throws(() => makeBlueprint(''), /Invalid requirement/);
  assert.throws(() => makeBlueprint('x'.repeat(6001)), /Invalid requirement/);
});

test('source and release mismatch is rejected', () => {
  assert.throws(() => makeBlueprint('P&L', { ...defaultLandscape, version: 'ECC 6.0' }), /S\/4HANA release/);
  assert.throws(() => makeBlueprint('P&L', { ...defaultLandscape, source: 'ECC', version: 'S4HANA 2023' }), /ECC release/);
});

test('CSV headers and typed field lines parse without inventing descriptions', () => {
  assert.deepEqual(parseFields('MANDT, BUKRS,AMOUNT').map(f => f.name), ['MANDT','BUKRS','AMOUNT']);
  assert.equal(parseFields('"MANDT","BUKRS"')[0].name, 'MANDT');
  const fields = parseFields('*CLIENT CHAR Client scope\nAMOUNT DECIMAL(18,2) Forecast amount');
  assert.equal(fields[0].isKey, true);
  assert.equal(fields[1].dataType, 'DECIMAL(18,2)');
  assert.equal(fields[1].description, 'Forecast amount');
  assert.throws(() => parseFields('ID,ID'), /Duplicate/);
  assert.throws(() => parseFields('ID,,AMOUNT'), /non-empty/);
  assert.throws(() => parseFields('1BAD CHAR'), /one field per line/);
  assert.throws(() => parseFields('A'.repeat(41)), /Invalid field name/);
});

test('custom metadata survives output, save validation and Unicode sharing', () => {
  assert.deepEqual(validateCustomSource(custom), []);
  const bp = makeBlueprint('Budget vs actual — 日本語 ₹ café', defaultLandscape, [custom]);
  assert.equal(bp.customSources.length, 1);
  assert.ok(bp.tables.some(t => t.id === custom.id));
  assert.deepEqual(decodeShare(encodeShare(bp)), bp);
  assert.ok(toMarkdown(bp).includes('日本語 ₹ café'));
  assert.ok(toMarkdown(bp).includes('Z\_FORECAST'));
  assert.equal(bp.customSources[0].fields[0].isKey, true);
  const second = makeBlueprint('Budget vs actual — 日本語 ₹ café', defaultLandscape, [custom]);
  assert.notEqual(bp.id, second.id);
});

test('custom source validation rejects duplicates, catalog collisions and unsafe URLs', () => {
  assert.ok(validateCustomSource({ ...custom, id: 'ACDOCA' }).length);
  assert.ok(validateCustomSource({ ...custom, fields: [custom.fields[0], custom.fields[0]] }).length);
  assert.ok(validateCustomSource({ ...custom, sourceUrl: 'javascript:alert(1)' }).length);
  assert.ok(validateCustomSource({ ...custom, sourceUrl: 'https://user:secret@example.com' }).length);
  assert.throws(() => makeBlueprint('P&L', defaultLandscape, [custom, custom]), /Duplicate custom/);
});

test('relationships have explicit client-aware field mappings and selected endpoints', () => {
  const bp = makeBlueprint('P&L');
  const header = bp.relationships.find(r => r.from === 'ACDOCA' && r.to === 'BKPF');
  assert.ok(header);
  assert.ok(header.keys.includes('ACDOCA.RCLNT = BKPF.MANDT'));
  assert.ok(header.keys.includes('ACDOCA.RBUKRS = BKPF.BUKRS'));
  assert.ok(header.keys.includes('ACDOCA.GJAHR = BKPF.GJAHR'));
  for (const edge of bp.relationships) assert.ok(bp.tables.some(t => t.id === edge.from) && bp.tables.some(t => t.id === edge.to));
});

test('strict validation drops unknown attributes and rejects malformed data', () => {
  const bp = makeBlueprint('P&L');
  assert.equal((validateBlueprint({ ...bp, injected: 'ignored' }) as unknown as Record<string, unknown>).injected, undefined);
  assert.throws(() => validateBlueprint({ ...bp, mode: 'official' }), /schema or mode/);
  assert.throws(() => validateBlueprint({ ...bp, tables: [] }), /Invalid tables/);
  assert.throws(() => validateBlueprint({ ...bp, tables: [bp.tables[0], bp.tables[0]] }), /Duplicate/);
  assert.throws(() => validateBlueprint({ ...bp, steps: [{ title: 'x', description: 'x', actions: 'wrong' }] }), /step actions/);
  assert.throws(() => validateBlueprint({ ...bp, relationships: [{ from: 'EVIL', to: 'BKPF', keys: ['x'], cardinality: '1:1' }] }), /endpoints/);
  assert.throws(() => validateBlueprint({ ...bp, createdAt: 'yesterday' }), /creation date/);
  assert.throws(() => validateBlueprint({ ...bp, landscape: { ...defaultLandscape, warehouse: 'Anything' } }), /landscape/);
  assert.throws(() => validateBlueprint({ ...bp, id: '../../evil' }), /identifier/);
  assert.throws(() => validateBlueprint({ ...bp, code: [{ title: 'x', language: 'sql\n```', code: 'x', notes: [] }] }), /language/);
});

test('custom sources must match the custom table metadata exactly', () => {
  const bp = makeBlueprint('Budget vs actual', defaultLandscape, [custom]);
  assert.throws(() => validateBlueprint({ ...bp, customSources: [{ ...bp.customSources[0], name: 'different' }] }), /must match/);
  assert.throws(() => validateBlueprint({ ...bp, customSources: [] }), /missing from customSources/);
});

test('share input is bounded and rejects non-JSON, invalid encoding and invalid schema', () => {
  assert.throws(() => decodeShare('%broken'), /Invalid or oversized/);
  assert.throws(() => decodeShare('x'.repeat(340001)), /oversized/);
  assert.throws(() => decodeShare(btoa('not json').replaceAll('=', '')), /Unable to read/);
  assert.throws(() => decodeShare(btoa('{}').replaceAll('=', '')), /schema or mode/);
  assert.throws(() => decodeShare('_w'), /Unable to read/);
});

test('Markdown escapes text cells and prevents generated code from ending its fence', () => {
  const bp = makeBlueprint('P&L <script> | **test**');
  bp.code[0].code = '```\nmalicious-looking fenced content\n```';
  const md = toMarkdown(bp);
  assert.ok(md.includes('\\<script\\> \\| \\*\\*test\\*\\*'));
  assert.ok(md.includes('````text'));
});

test('mutation of one generated result does not alter catalog or another result', () => {
  const a = makeBlueprint('P&L');
  const original = catalog.find(t => t.id === 'ACDOCA')!.fields[0].description;
  a.tables[0].fields[0].description = 'changed';
  assert.equal(catalog.find(t => t.id === 'ACDOCA')!.fields[0].description, original);
  assert.equal(makeBlueprint('P&L').tables[0].fields[0].description, original);
});
