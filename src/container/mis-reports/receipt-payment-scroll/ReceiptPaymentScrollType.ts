import type { UseFormReturn } from "react-hook-form";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

export type ScrollType = "all" | "receipt" | "payment";
export type ScrollView = "transactions" | "daily";

export interface SahayikaOptionItem {
  label: string;
  value: number | "";
  coCode?: string | null;
}

export interface ReceiptPaymentScrollForm {
  fromDate: Date | null;
  toDate: Date | null;
  reportBranchId: number | "";
  sahayikaId: number | "";
  scrollType: ScrollType;
  view: ScrollView;
  page: number;
  perPage: number;
}

export interface ReceiptPaymentColumnTotals {
  Receipt_Loan_Principal: number;
  Receipt_Interest: number;
  Receipt_Processing_Charge: number;
  Receipt_HO: number;
  Receipt_Misc: number;
  Payment_Loan: number;
  Payment_House_Rent: number;
  Payment_Electric_Bill: number;
  Payment_Salary: number;
  Payment_Travelling: number;
  Payment_Loan_Loss: number;
  Payment_HO: number;
  Payment_Misc: number;
}

export interface ReceiptPaymentScrollTotals {
  loanPrincipal: number;
  loanInterest: number;
  proceCharge: number;
  hoReceipt: number;
  miscReceipt: number;
  receiptTotal: number;
  loanPayment: number;
  houserent: number;
  electricBill: number;
  salary: number;
  travelling: number;
  loanLoss: number;
  hoPayment: number;
  miscPayment: number;
  paymentTotal: number;
  closingCashInHand: number;
  openingCash: number;
}

export interface ReceiptPaymentScrollSummary {
  companyName: string;
  corporateOffice: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  monthName: string;
  year: string;
  managerCoName: string;
  fromDate: string;
  toDate: string;
  cashLedgerId: number;
  openingCash: number;
  closingCash: number;
  cashReceipts: number;
  cashPayments: number;
  totalReceipts: number;
  totalPayments: number;
  filteredCashReceipts: number;
  filteredCashPayments: number;
  voucherCount: number;
  unbalancedVoucherCount: number;
  unbalancedAmount: number;
  columnTotals: ReceiptPaymentColumnTotals;
  // Compatibility aliases
  openingBalance: number;
  closingBalance: number;
  receiptCount: number;
  paymentCount: number;
}

export interface ReceiptPaymentTransactionRow {
  rowNo: number;
  voucherId: number;
  vouDate: string;
  voucherNo: string;
  vouType: number;
  type: string;
  refVouNo: string | null;
  branchId: number;
  branchName: string;
  coId: number | null;
  coName: string | null;
  coCount: number;
  coIds: string | null;
  particulars: string | null;
  accountName: string | null;
  mode: string;
  receiptAmount: number;
  paymentAmount: number;
  cashReceipt: number;
  cashPayment: number;
  balance: number;
  differenceAmount: number;
  createdBy: number;
  createdByName: string | null;

  // Compatibility fields
  id: number;
  date: string;
  voucherType: string;
  sahayikaId: number;
  sahayikaName: string;
  runningBalance: number;
  remarks: string;
}

export type ReceiptPaymentScrollRow = ReceiptPaymentTransactionRow;

export interface ReceiptPaymentDailyRow {
  rowNo: number;
  vouDate: string;
  dayNo: number;
  voucherCount: number;
  openingCash: number;
  receiptAmount: number;
  paymentAmount: number;
  cashReceipt: number;
  cashPayment: number;
  balance: number;
  receiptLoanPrincipal: number;
  receiptInterest: number;
  receiptProcessingCharge: number;
  receiptHO: number;
  receiptMisc: number;
  paymentLoan: number;
  paymentHouseRent: number;
  paymentElectricBill: number;
  paymentSalary: number;
  paymentTravelling: number;
  paymentLoanLoss: number;
  paymentHO: number;
  paymentMisc: number;

  // Compatibility fields for monthly ledger print
  day: number;
  date: string;
  loanPrincipal: number;
  loanInterest: number;
  proceCharge: number;
  hoReceipt: number;
  miscReceipt: number;
  receiptTotal: number;
  loanPayment: number;
  houserent: number;
  electricBill: number;
  salary: number;
  travelling: number;
  loanLoss: number;
  hoPayment: number;
  miscPayment: number;
  paymentTotal: number;
  cashInHand: number;
}

export interface ReceiptPaymentPagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number | null;
  to: number | null;
  hasMorePages: boolean;
}

export interface MonthReportGroup {
  monthKey: string;
  monthName: string;
  year: string;
  daysCount: number;
  days: ReceiptPaymentDailyRow[];
  totals: ReceiptPaymentScrollTotals;
}

export interface ReceiptPaymentScrollData {
  message: string;
  view: ScrollView;
  summary: ReceiptPaymentScrollSummary;
  columnTotals: ReceiptPaymentColumnTotals;
  totals: ReceiptPaymentScrollTotals;
  rows: ReceiptPaymentTransactionRow[];
  dailyRows: ReceiptPaymentDailyRow[];
  monthGroups: MonthReportGroup[];
  pagination: ReceiptPaymentPagination;
}

export interface ReceiptPaymentScrollProps {
  form: UseFormReturn<ReceiptPaymentScrollForm>;
  loading: boolean;
  isHead: boolean;
  branchName: string;
  branchOptions: { label: string; value: number }[];
  branchLoading: boolean;
  sahayikaOptions: { label: string; value: number | "" }[];
  sahayikaLoading: boolean;
  report: ReceiptPaymentScrollData | null;
  error: string | null;
  onShow: (values: ReceiptPaymentScrollForm) => void;
  onPreset: (preset: DatePreset) => void;
  activePreset: DatePreset | null;
  view: ScrollView;
  onViewChange: (view: ScrollView) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
}
