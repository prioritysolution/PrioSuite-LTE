import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, modules = {}, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => { if (!(name in modules)) throw new Error(`Unexpected import: ${name}`); return modules[name]; }, process, URLSearchParams, Intl, Date, ...globals });
  return exports;
}
const fields = ['Sl_No', 'CO_Name', 'Village_Count', 'Borrower_Count', 'Loan_Amount', 'Outstanding', 'Outstanding_1_30', 'Outstanding_31_60', 'Outstanding_61_90', 'Outstanding_91_180', 'Outstanding_181_364', 'Outstanding_365_Plus', 'PAR_Amount', 'PAR_Pct'];
const columns = fields.map((field, i) => ({ Number: i + 1, Field: field, Label: field, Format: '' }));
const codes = ['Current', 'Due_Today', '1_30', '31_60', '61_90', '91_180', '181_364', '365_Plus', 'Unknown'];
const buckets = codes.map((code, i) => ({ Code: code, Label: code, Min_Days: null, Max_Days: null, Included_In_PAR: i >= 3 && i <= 7, Outstanding_Field: `Outstanding_${code}`, Overdue_Field: `Overdue_${code}`, Loan_Count_Field: `Loan_Count_${code}` }));
const metrics = { Village_Count: 1, Borrower_Count: 1, Loan_Count: 1, Loan_Amount: 500, Outstanding: 1000, Overdue_Amount: 100, PAR_Amount: 1000, PAR_Pct: 100, Overdue_Pct: 10 };
for (const bucket of buckets) { metrics[bucket.Outstanding_Field] = 0; metrics[bucket.Overdue_Field] = 0; metrics[bucket.Loan_Count_Field] = 0; }
Object.assign(metrics, { Outstanding_31_60: 1000, Overdue_31_60: 100, Loan_Count_31_60: 1 });
const query = { orgId: 1, branchId: 2, fromDate: '2026-11-01', toDate: '2026-11-05', view: 'branch', page: 1, perPage: 10 };
const endpoints = load('src/services/apiEndpoints.ts').endPoints;
let changed = false; let totalRecords = 501; let requests = [];
function fixture(params) {
  const page = Number(params.get('page')); const perPage = Number(params.get('per_page'));
  const start = (page - 1) * perPage; const count = Math.min(perPage, Math.max(0, totalRecords - start));
  const values = totalRecords ? metrics : { ...Object.fromEntries(Object.keys(metrics).map((key) => [key, 0])), PAR_Pct: null, Overdue_Pct: null };
  return { message: totalRecords ? 'Data Found' : 'No Data Found', details: {
    View: params.get('view'), Organisation: { Org_Name: 'Test Org', Org_Address: 'Test Address' },
    Calculation: { As_Of_Date: query.toDate, PAR_Threshold_Days: 30, Threshold_Operator: '>', PAR_Basis: 'full_outstanding_of_loans_over_30_days_past_due', Outstanding_Basis: 'principal_plus_contractual_interest', Overdue_Basis: 'unpaid_installment_amount', Borrower_Basis: 'distinct_member_id', Aging_Basis: 'oldest_unpaid_installment_fifo' },
    Summary: { ...values, Branch_Name: 'Branch A', Record_Count: totalRecords },
    Totals: { ...values, ...(changed && page > 1 ? { PAR_Amount: 999 } : {}) },
    Rows: Array.from({ length: count }, (_, i) => ({ ...values, Sl_No: start + i + 1, CO_Name: `CO ${start + i + 1}`, Branch_Name: 'Branch A', Oldest_Due_Date: '2026-10-05', Days_Overdue: 31, Aging_Bucket: '31_60' })),
    Print_Columns: columns.map((col) => ({ ...col })), Aging_Buckets: buckets.map((bucket) => ({ ...bucket })), Data_Quality_Warnings: ['Check missing village assignments'],
    Pagination: { current_page: page, per_page: perPage, total: totalRecords, last_page: Math.max(1, Math.ceil(totalRecords / perPage)), from: count ? start + 1 : null, to: count ? start + count : null, has_more_pages: start + count < totalRecords },
  } };
}
const portfolio = load('src/container/mis-reports/loan-portfolio/LoanPortfolioApi.ts', { '@/services/apiEndpoints': { endPoints: endpoints }, '@/lib/axios': { doGetApiCall() {} } });
const api = load('src/container/mis-reports/default-par-calculation/DefaultParCalculationApi.ts', {
  '@/services/apiEndpoints': { endPoints: endpoints }, '@/container/mis-reports/loan-portfolio/LoanPortfolioApi': portfolio,
  '@/lib/axios': { doGetApiCall: async ({ url }) => { const params = new URL(url, 'http://localhost').searchParams; requests.push(params); return fixture(params); } },
});

test('preserves full-outstanding PAR separately from overdue installments and uses all aging ranges', async () => {
  const report = await api.getDefaultParCalculation(query);
  assert.equal(report.summary.PAR_Amount, 1000); assert.equal(report.summary.Overdue_Amount, 100);
  assert.equal(report.rows[0].Outstanding_31_60, 1000); assert.equal(report.rows[0].Overdue_31_60, 100);
  assert.equal(report.columns.length, 14); assert.equal(report.buckets.length, 9);
  assert.equal(report.totals.Village_Count, 1); assert.equal(report.warnings[0], 'Check missing village assignments');
  assert.equal(api.formatParValue(31, 'Max_Days_Overdue'), '31');
});

test('handles a zero-outstanding portfolio and numeric strings without inventing percentages', () => {
  totalRecords = 0;
  const response = fixture(new URLSearchParams({ view: 'branch', page: '1', per_page: '10' }));
  response.details.Summary.Outstanding = '0.00';
  const report = api.mapDefaultParCalculation(response, query);
  assert.equal(report.summary.Outstanding, 0); assert.equal(report.summary.PAR_Pct, null);
  assert.equal(api.formatParValue(report.summary.PAR_Pct, 'PAR_Pct'), 'N/A'); assert.equal(report.rows.length, 0);
  totalRecords = 501;
});

test('uses branch context, CO zero, and collects every page for export', async () => {
  requests = [];
  const filtered = { ...query, reportBranchId: 3, coId: 0 };
  const report = await api.getDefaultParCalculation(filtered);
  assert.equal(requests[0].get('co_id'), '0'); assert.equal(requests[0].get('branch_id'), '2'); assert.equal(requests[0].get('report_branch_id'), '3');
  requests = [];
  const all = await api.fetchAllParRows(filtered, report);
  assert.equal(all.rows.length, 501); assert.equal(all.rows[500].Sl_No, 501); assert.equal(all.totals.PAR_Amount, 1000);
  assert.equal(requests.length, 2); assert.equal(requests[0].get('per_page'), '500'); assert.equal(requests[1].get('page'), '2');
});

test('rejects changed totals, incomplete aging, and an unexpected calculation basis', async () => {
  const report = await api.getDefaultParCalculation(query); changed = true;
  await assert.rejects(api.fetchAllParRows(query, report), /changed while exporting/); changed = false;
  const response = fixture(new URLSearchParams({ view: 'branch', page: '1', per_page: '10' }));
  response.details.Aging_Buckets.pop(); assert.throws(() => api.mapDefaultParCalculation(response, query), /aging metadata/);
  const other = fixture(new URLSearchParams({ view: 'branch', page: '1', per_page: '10' }));
  other.details.Calculation.Threshold_Operator = '>='; assert.throws(() => api.mapDefaultParCalculation(other, query), /calculation basis/);
});

test('exports all records, risk and overdue totals, warnings and unclassified aging', async () => {
  let output = ''; class BlobStub { constructor(parts) { output = parts.join(''); } }
  const document = { body: { appendChild() {}, removeChild() {} }, createElement: () => ({ click() {} }) };
  const exporter = load('src/components/mis-reports/default-par-calculation/exportDefaultParCalculationExcel.ts',
    { '@/container/mis-reports/default-par-calculation/DefaultParCalculationApi': api },
    { Blob: BlobStub, document, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} } });
  const report = await api.getDefaultParCalculation(query); const all = await api.fetchAllParRows(query, report);
  exporter.exportDefaultParCalculationCsv(all);
  assert.match(output, /CO 501/); assert.match(output, /14\. PAR_Pct/); assert.match(output, /Check missing village assignments/); assert.match(output, /Unclassified/);
  exporter.exportDefaultParCalculationExcel(all);
  assert.match(output, /CO 501/); assert.match(output, /Overdue installments/); assert.match(output, /Unclassified/);
});
