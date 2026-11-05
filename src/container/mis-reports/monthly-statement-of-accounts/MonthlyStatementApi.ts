import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import type { MonthlyStatementData, MonthlyStatementRow, MonthlyStatementSide, StatementPeriod, StatementSidePairRow } from "./MonthlyStatementType";

const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid statement response");
  return value as Record<string, unknown>;
};
const text = (value: unknown) => value == null ? "" : String(value);
const amount = (value: unknown): number => {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) throw new Error("Invalid statement amount");
  return Number(value);
};
const period = (value: unknown): StatementPeriod => {
  const range = object(value);
  return { from: range.From_Date == null ? null : text(range.From_Date), to: range.To_Date == null ? null : text(range.To_Date) };
};

export const pairStatementRows = (receipts: MonthlyStatementRow[], payments: MonthlyStatementRow[]): StatementSidePairRow[] =>
  Array.from({ length: Math.max(receipts.length, payments.length) }, (_, index) => ({ receipt: receipts[index], payment: payments[index] }));

const mapRows = (value: unknown, side: MonthlyStatementSide): MonthlyStatementRow[] => {
  if (!Array.isArray(value)) throw new Error("Invalid statement rows");
  return value.map((entry, index) => {
    const row = object(entry);
    const isHeader = row.Row_Type === "header";
    if (!text(row.Particulars) || !["header", "movement", "balance"].includes(text(row.Row_Type))) throw new Error("Invalid statement row");
    return {
      id: `${side}-${text(row.Code) || index}`,
      side,
      category: text(row.Section),
      label: text(row.Particulars),
      isHeader,
      isSubItem: !isHeader && !!row.Section && row.Section !== row.Particulars,
      previousMonth: isHeader ? 0 : amount(row.Previous_Amount),
      currentMonth: isHeader ? 0 : amount(row.Period_Amount),
      cumulative: isHeader ? 0 : amount(row.Cumulative_Amount),
    };
  });
};

export const mapMonthlyStatement = (response: unknown): MonthlyStatementData | null => {
  try {
    const body = object(response);
    const details = object(body.details);
    const rawSummary = object(details.Summary);
    const totals = object(details.Totals);
    const receipts = object(totals.Receipts);
    const payments = object(totals.Payments);
    const filters = object(details.Filters);
    const organisation = object(details.Organisation);
    const financialYear = object(details.Financial_Year);
    const columns = object(details.Columns);
    const receiptsRows = mapRows(details.Receipts, "receipts");
    const paymentsRows = mapRows(details.Payments, "payments");
    if (!receiptsRows.length || !paymentsRows.length || typeof rawSummary.Is_Reconciled !== "boolean" || !text(filters.from_date) || !text(filters.to_date)) throw new Error("Incomplete statement response");
    if (!Array.isArray(details.Configuration_Warnings) || !Array.isArray(details.Ledger_Breakdown)) throw new Error("Incomplete statement diagnostics");
    return {
      message: text(body.message),
      organizationName: text(organisation.Org_Name),
      organizationAddress: text(organisation.Org_Address),
      financialYear: { from: text(financialYear.Start_Date) || null, to: text(financialYear.End_Date) || null },
      columns: { previous: period(columns.Previous), period: period(columns.Period), cumulative: period(columns.Cumulative) },
      warnings: details.Configuration_Warnings.map(text),
      ledgerBreakdown: details.Ledger_Breakdown.map(object),
      generatedAt: new Date().toISOString(),
      summary: {
        fromDate: text(filters.from_date), toDate: text(filters.to_date),
        branchName: text(rawSummary.Branch_Name) || "All branches",
        branchCode: text(rawSummary.Branch_Code),
        totalReceiptsPrevious: amount(receipts.Previous_Amount),
        totalReceiptsCurrent: amount(receipts.Period_Amount),
        totalReceiptsCumulative: amount(receipts.Cumulative_Amount),
        totalPaymentsPrevious: amount(payments.Previous_Amount),
        totalPaymentsCurrent: amount(payments.Period_Amount),
        totalPaymentsCumulative: amount(payments.Cumulative_Amount),
        reconciliationDifference: amount(rawSummary.Difference),
        reconciled: rawSummary.Is_Reconciled,
        status: text(rawSummary.Status),
        closingCash: amount(rawSummary.Closing_Cash),
        closingBank: amount(rawSummary.Closing_Bank),
        voucherCount: amount(rawSummary.Voucher_Count),
        unbalancedVoucherCount: amount(rawSummary.Unbalanced_Voucher_Count),
        unbalancedAmount: amount(rawSummary.Unbalanced_Amount),
        invalidLineCount: amount(rawSummary.Invalid_Line_Count),
      },
      rows: [...receiptsRows, ...paymentsRows], receiptsRows, paymentsRows,
      pairedRows: pairStatementRows(receiptsRows, paymentsRows),
    };
  } catch {
    return null;
  }
};

export const getMonthlyStatementAPI = (orgId: number, branchId: number, fromDate: string, toDate: string, reportBranchId?: number | null) =>
  doGetApiCall({ url: endPoints.getMonthlyStatementOfAccounts(orgId, branchId, fromDate, toDate, reportBranchId) });

export const formatStatementAmountWithZero = (value: number | undefined | null) =>
  value == null ? "-" : new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
export const formatStatementAmount = (value: number | undefined | null) =>
  value == null || value === 0 ? "-" : formatStatementAmountWithZero(value);
export const formatStatementDate = (value: string) => {
  const [year, month, day] = String(value || "").split("-");
  return year && month && day ? `${day}-${month}-${year}` : value || "-";
};
