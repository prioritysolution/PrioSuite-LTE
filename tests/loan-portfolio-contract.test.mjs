import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, modules = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => {
    if (!(name in modules)) throw new Error(`Unexpected import: ${name}`);
    return modules[name];
  }, process, URLSearchParams, Intl, Date, ...globals });
  return exports;
}

const fields = ['Sl_No', 'CO_Name', 'Village_Count', 'Previous_Loanee_Count', 'Disbursed_Loanee_Count', 'Final_Paid_Loanee_Count', 'Active_Loanee_Count', 'Opening_Disbursement', 'Period_Disbursement', 'Final_Paid_Disbursement', 'Existing_Disbursement', 'Opening_Outstanding', 'Period_Outstanding', 'Total_Outstanding', 'Previous_Default_Amount', 'Previous_Default_Loanee_Count', 'Cumulative_Realisable', 'Period_Realisable', 'Period_Realised', 'Default_Collection', 'Advance_Collection', 'Total_Collection', 'Default_Amount', 'Default_Loanee_Count', 'Closing_Outstanding'];
const columns = fields.map((field, index) => ({ Number: index + 1, Field: field, Label: field, Group: '', Format: '' }));
const query = { orgId: 1, branchId: 2, fromDate: '2026-11-01', toDate: '2026-11-05', view: 'branch', page: 1, perPage: 10 };
const metrics = Object.fromEntries(fields.slice(2).map((field) => [field, 0]));
Object.assign(metrics, { Village_Count: 1, Cumulative_Realisable: 100, Total_Collection: 150, Collection_Pct: 100, Active_Loanee_Count: 2, Closing_Outstanding: 55.25 });
const endpoints = load('src/services/apiEndpoints.ts').endPoints;
let mutatePage = false;
let requested = [];
function fixture(params) {
  const page = Number(params.get('page'));
  const perPage = Number(params.get('per_page'));
  const total = 501;
  const start = (page - 1) * perPage;
  const count = Math.min(perPage, Math.max(0, total - start));
  const rows = Array.from({ length: count }, (_, i) => ({ ...metrics, Sl_No: start + i + 1, CO_Name: `CO ${start + i + 1}`, Branch_Name: 'Branch A' }));
  const totals = { ...metrics, ...(mutatePage && page > 1 ? { Closing_Outstanding: 99 } : {}) };
  return { message: 'Data Found', details: {
    View: params.get('view'), Organisation: { Org_Name: 'Test Org', Org_Address: 'Test Address' },
    Summary: { ...metrics, Branch_Name: 'Branch A', From_Date: query.fromDate, To_Date: query.toDate, Record_Count: total },
    Totals: totals, Rows: rows, Print_Columns: columns.map((column) => ({ ...column })), Data_Quality_Warnings: ['Check missing loan dates'],
    Pagination: { current_page: page, per_page: perPage, total, last_page: Math.ceil(total / perPage), from: count ? start + 1 : null, to: count ? start + count : null, has_more_pages: start + count < total },
  } };
}
const api = load('src/container/mis-reports/loan-portfolio/LoanPortfolioApi.ts', {
  '@/services/apiEndpoints': { endPoints: endpoints },
  '@/lib/axios': { doGetApiCall: async ({ url }) => { const params = new URL(url, 'http://localhost').searchParams; requested.push(params); return fixture(params); } },
});

test('uses server demand, collection rate and distinct totals without calculating row sums', async () => {
  const report = await api.getLoanPortfolio(query);
  assert.equal(report.rows.length, 10);
  assert.equal(report.summary.Cumulative_Realisable, 100);
  assert.equal(report.summary.Total_Collection, 150);
  assert.equal(report.summary.Collection_Pct, 100);
  assert.equal(report.totals.Village_Count, 1);
  assert.equal(report.warnings[0], 'Check missing loan dates');
  assert.equal(api.formatPortfolioValue(null, 'Collection_Pct'), '–');
  assert.equal(api.formatPortfolioValue(55.25, 'Closing_Outstanding'), '55.25');
});

test('sends CO zero for Not Assigned and omits All, retaining logged-in branch', async () => {
  requested = [];
  await api.getLoanPortfolio({ ...query, coId: 0, reportBranchId: 3 });
  assert.equal(requested[0].get('co_id'), '0');
  assert.equal(requested[0].get('branch_id'), '2');
  assert.equal(requested[0].get('report_branch_id'), '3');
  await api.getLoanPortfolio(query);
  assert.equal(requested[1].has('co_id'), false);
});

test('normalizes numeric strings from the running backend and preserves a null percentage', () => {
  const response = fixture(new URLSearchParams({ view: 'branch', page: '1', per_page: '10' }));
  response.details.Print_Columns[0].Number = '1';
  response.details.Summary.Closing_Outstanding = '55.25';
  response.details.Summary.Collection_Pct = null;
  response.details.Totals.Closing_Outstanding = '55.25';
  response.details.Rows[0].Closing_Outstanding = '55.25';
  response.details.Rows[0].Collection_Pct = null;
  const report = api.mapLoanPortfolio(response, query);
  assert.equal(report.summary.Closing_Outstanding, 55.25);
  assert.equal(report.totals.Closing_Outstanding, 55.25);
  assert.equal(report.rows[0].Closing_Outstanding, 55.25);
  assert.equal(report.rows[0].Collection_Pct, null);
});

test('retrieves all 501 rows for export and retains full-scope totals', async () => {
  const report = await api.getLoanPortfolio(query);
  requested = [];
  const all = await api.fetchAllPortfolioRows(query, report);
  assert.equal(all.rows.length, 501);
  assert.equal(all.rows[500].Sl_No, 501);
  assert.equal(all.totals.Village_Count, 1);
  assert.equal(requested.length, 2);
  assert.equal(requested[0].get('per_page'), '500');
  assert.equal(requested[1].get('page'), '2');
});

test('rejects changing totals during export and incomplete data', async () => {
  const report = await api.getLoanPortfolio(query);
  mutatePage = true;
  await assert.rejects(api.fetchAllPortfolioRows(query, report), /changed while exporting/);
  mutatePage = false;
  const response = fixture(new URLSearchParams({ view: 'branch', page: '1', per_page: '10' }));
  response.details.Print_Columns.pop();
  assert.throws(() => api.mapLoanPortfolio(response, query), /complete print columns/);
});

test('CSV export includes every row, all columns, server footer and warnings', async () => {
  let output = '';
  class BlobStub { constructor(parts) { output = parts.join(''); } }
  const doc = { body: { appendChild() {}, removeChild() {} }, createElement: () => ({ click() {} }) };
  const exporter = load('src/components/mis-reports/loan-portfolio/exportLoanPortfolioExcel.ts',
    { '@/container/mis-reports/loan-portfolio/LoanPortfolioApi': api },
    { Blob: BlobStub, document: doc, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} } });
  const report = await api.getLoanPortfolio(query);
  const all = await api.fetchAllPortfolioRows(query, report);
  exporter.exportLoanPortfolioCsv(all);
  assert.match(output, /CO 501/);
  assert.match(output, /25\. Closing_Outstanding/);
  assert.match(output, /Check missing loan dates/);
  assert.match(output, /"Total"/);
  exporter.exportLoanPortfolioExcel(all);
  assert.match(output, /CO 501/);
  assert.match(output, /55\.25/);
});
