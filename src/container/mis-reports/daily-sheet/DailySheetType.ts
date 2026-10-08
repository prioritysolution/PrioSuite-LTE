export interface DailySheetForm {
  fromDate: Date | null;
  toDate: Date | null;
  reportBranchId: number | "";
}

export interface DailySheetSummary {
  fromDate: string;
  toDate: string;
  branchId: number;
  branchName: string;
  openingCash: number;
  recCash: number;
  recTrf: number;
  recTotal: number;
  payCash: number;
  payTrf: number;
  payTotal: number;
  closingCash: number;
  grandRecTotal: number;
  grandPayTotal: number;
  voucherCount: number;
  unbalancedVoucherCount: number;
  unbalancedAmount: number;
  isTallied: boolean;
}

export interface DailySheetSideRow {
  accountId: number;
  accountCode: string;
  ledgerName: string;
  cateDesc: string;
  count: number;
  cash: number;
  transfer: number;
  total: number;
}

export interface DailySheetLedgerRow {
  accountId: number;
  accountCode: string;
  ledgerName: string;
  cateDesc: string;
  recCount: number;
  recCash: number;
  recTrf: number;
  recTotal: number;
  payCount: number;
  payCash: number;
  payTrf: number;
  payTotal: number;
}

export interface DailySheetData {
  message: string;
  summary: DailySheetSummary;
  receipts: DailySheetSideRow[];
  payments: DailySheetSideRow[];
  ledgers: DailySheetLedgerRow[];
}

export interface DailySheetDetailRow {
  voucherId: number;
  vouDate: string;
  voucherNo: string;
  vouTypeName: string;
  particulars: string;
  branchName: string;
  ledgerName: string;
  mode: string;
  receiptAmount: number;
  paymentAmount: number;
  remarks: string;
}

export interface BranchOption {
  label: string;
  value: number;
}

export interface DailySheetProps {
  form: import("react-hook-form").UseFormReturn<DailySheetForm>;
  loading: boolean;
  isHead: boolean;
  branchName: string;
  branchOptions: BranchOption[];
  branchLoading: boolean;
  report: DailySheetData | null;
  view: "sheet" | "grid";
  drillAllowed: boolean;
  onShow: (values: DailySheetForm) => void;
  onViewChange: (view: "sheet" | "grid") => void;
  onOpenLedger: (accountId: number, ledgerName: string) => void;
  onOpenAll: () => void;
  detailsOpen: boolean;
  detailsTitle: string;
  detailsLoading: boolean;
  detailsRows: DailySheetDetailRow[];
  showBranchColumn: boolean;
  onDetailsOpenChange: (open: boolean) => void;
}
