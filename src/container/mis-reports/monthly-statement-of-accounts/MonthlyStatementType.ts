import type { UseFormReturn } from "react-hook-form";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

export interface MonthlyStatementForm {
  fromDate: Date | null;
  toDate: Date | null;
  reportBranchId: number | "";
}

export type MonthlyStatementSide = "receipts" | "payments";

export interface MonthlyStatementRow {
  id: string;
  side: MonthlyStatementSide;
  category: string;
  label: string;
  isHeader?: boolean;
  isSubItem?: boolean;
  previousMonth: number;
  currentMonth: number;
  cumulative: number;
}

export interface MonthlyStatementSummary {
  fromDate: string;
  toDate: string;
  branchName: string;
  branchCode?: string;
  periodText?: string;
  year?: string;
  managerName?: string;
  totalReceiptsPrevious: number;
  totalReceiptsCurrent: number;
  totalReceiptsCumulative: number;
  totalPaymentsPrevious: number;
  totalPaymentsCurrent: number;
  totalPaymentsCumulative: number;
  reconciliationDifference: number | null;
  reconciled: boolean | null;
  status: string;
  closingCash: number;
  closingBank: number;
  voucherCount: number;
  unbalancedVoucherCount: number;
  unbalancedAmount: number;
  invalidLineCount: number;
}

export interface StatementPeriod {
  from: string | null;
  to: string | null;
}

export interface StatementSidePairRow {
  receipt?: MonthlyStatementRow;
  payment?: MonthlyStatementRow;
}

export interface MonthlyStatementData {
  message: string;
  summary: MonthlyStatementSummary;
  rows: MonthlyStatementRow[];
  receiptsRows: MonthlyStatementRow[];
  paymentsRows: MonthlyStatementRow[];
  pairedRows: StatementSidePairRow[];
  organizationName: string;
  organizationAddress: string;
  financialYear: StatementPeriod;
  columns: { previous: StatementPeriod; period: StatementPeriod; cumulative: StatementPeriod };
  warnings: string[];
  ledgerBreakdown: Record<string, unknown>[];
  generatedAt: string;
}

export interface MonthlyStatementProps {
  form: UseFormReturn<MonthlyStatementForm>;
  loading: boolean;
  isHead: boolean;
  branchName: string;
  branchOptions: { label: string; value: number }[];
  branchLoading: boolean;
  branchError: string | null;
  report: MonthlyStatementData | null;
  error: string | null;
  onShow: (values: MonthlyStatementForm) => void;
  onPreset: (preset: DatePreset) => void;
  activePreset: DatePreset | null;
}
