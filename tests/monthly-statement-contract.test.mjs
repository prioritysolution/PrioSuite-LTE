import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadModule(path, modules = {}, globals = {}) {
  const source = fs.readFileSync(path, 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: (name) => {
    if (!(name in modules)) throw new Error(`Unexpected import ${name}`);
    return modules[name];
  }, process, URLSearchParams, Intl, Date, ...globals });
  return exports;
}

const endpoints = loadModule('src/services/apiEndpoints.ts').endPoints;
let requestedUrl;
const { mapMonthlyStatement, getMonthlyStatementAPI, formatStatementAmountWithZero } = loadModule(
  'src/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementApi.ts',
  { '@/lib/axios': { doGetApiCall: ({ url }) => { requestedUrl = url; } }, '@/services/apiEndpoints': { endPoints: endpoints } },
);

const makeStatement = () => ({
  message: 'Data Found',
  details: {
    Filters: { from_date: '2026-05-01', to_date: '2026-05-31' },
    Organisation: { Org_Name: 'Test Organisation', Org_Address: 'Test Address' },
    Financial_Year: { Start_Date: '2026-04-01', End_Date: '2027-03-31' },
    Columns: {
      Previous: { From_Date: '2026-04-01', To_Date: '2026-04-30' },
      Period: { From_Date: '2026-05-01', To_Date: '2026-05-31' },
      Cumulative: { From_Date: '2026-04-01', To_Date: '2026-05-31' },
    },
    Summary: { Branch_Name: 'Test Branch', Branch_Code: '02', Is_Reconciled: false, Status: 'Configuration Review Required', Difference: 0, Closing_Cash: 12.34, Closing_Bank: 5.67, Voucher_Count: 3, Unbalanced_Voucher_Count: 0, Unbalanced_Amount: 0, Invalid_Line_Count: 0 },
    Receipts: [
      { Code: 'opening', Particulars: 'Opening Balance', Section: 'Opening Balance', Row_Type: 'header', Previous_Amount: null, Period_Amount: null, Cumulative_Amount: null },
      { Code: 'cash', Particulars: 'Cash in Hand', Section: 'Opening Balance', Row_Type: 'balance', Previous_Amount: 10, Period_Amount: 20.25, Cumulative_Amount: 10 },
      { Code: 'recovery', Particulars: 'Loan Recovery', Section: 'Loan Recovery', Row_Type: 'movement', Previous_Amount: 5, Period_Amount: 7, Cumulative_Amount: 12 },
    ],
    Payments: [{ Code: 'cash', Particulars: 'Cash in Hand', Section: 'Closing Balance', Row_Type: 'balance', Previous_Amount: 15, Period_Amount: 27.25, Cumulative_Amount: 22 }],
    Totals: { Receipts: { Previous_Amount: 15, Period_Amount: 27.25, Cumulative_Amount: 22 }, Payments: { Previous_Amount: 15, Period_Amount: 27.25, Cumulative_Amount: 22 } },
    Configuration_Warnings: ['Check bank ledger'],
    Ledger_Breakdown: [{ Account_Id: 10, Account_Name: 'Cash', Period_Amount: 7 }],
  },
});

test('maps snapshot rows and each independent server total without fabricating reconciliation', () => {
  const report = mapMonthlyStatement(makeStatement());
  assert.ok(report);
  assert.equal(report.receiptsRows[0].isHeader, true);
  assert.equal(report.receiptsRows[1].previousMonth, 10);
  assert.equal(report.receiptsRows[1].currentMonth, 20.25);
  assert.equal(report.receiptsRows[1].cumulative, 10);
  assert.equal(report.summary.totalReceiptsCumulative, 22);
  assert.equal(report.summary.totalReceiptsCurrent, 27.25);
  assert.equal(report.summary.reconciled, false);
  assert.equal(report.summary.status, 'Configuration Review Required');
  assert.equal(report.summary.closingCash, 12.34);
  assert.equal(report.warnings[0], 'Check bank ledger');
  assert.equal(report.ledgerBreakdown[0].Account_Name, 'Cash');
  assert.equal(formatStatementAmountWithZero(12.34), '12.34');
});

test('rejects incomplete payloads instead of producing a sample or false zero amount', () => {
  const response = makeStatement();
  delete response.details.Totals.Receipts.Period_Amount;
  assert.equal(mapMonthlyStatement(response), null);
  assert.equal(mapMonthlyStatement({ message: 'No Data Found' }), null);
});

test('sends required scope and period and omits the all-branches filter', () => {
  getMonthlyStatementAPI(1, 2, '2026-05-01', '2026-05-31', 0);
  let query = new URL(requestedUrl, 'http://localhost').searchParams;
  assert.equal(query.get('org_id'), '1');
  assert.equal(query.get('branch_id'), '2');
  assert.equal(query.get('from_date'), '2026-05-01');
  assert.equal(query.get('to_date'), '2026-05-31');
  assert.equal(query.has('report_branch_id'), false);
  getMonthlyStatementAPI(1, 2, '2026-05-01', '2026-05-31', 3);
  query = new URL(requestedUrl, 'http://localhost').searchParams;
  assert.equal(query.get('branch_id'), '2');
  assert.equal(query.get('report_branch_id'), '3');
});

test('Excel and CSV include the complete statement, server totals, decimals and warnings', () => {
  let content = '';
  class FakeBlob { constructor(parts) { content = parts.join(''); } }
  const document = { body: { appendChild() {}, removeChild() {} }, createElement: () => ({ click() {} }) };
  const { exportMonthlyStatementToExcel, exportMonthlyStatementToCsv } = loadModule(
    'src/components/mis-reports/monthly-statement-of-accounts/exportMonthlyStatementExcel.ts', {},
    { Blob: FakeBlob, document, URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} } },
  );
  const report = mapMonthlyStatement(makeStatement());
  exportMonthlyStatementToExcel(report);
  assert.match(content, /Loan Recovery/);
  assert.match(content, /27\.25/);
  assert.match(content, /Configuration Review Required/);
  assert.match(content, /Check bank ledger/);
  exportMonthlyStatementToCsv(report);
  assert.match(content, /Loan Recovery/);
  assert.match(content, /27\.25/);
  assert.match(content, /Check bank ledger/);
});
