import { UseFormReturn } from "react-hook-form";
import {
  DateRangeForm,
  LogSearchForm,
  RectifyHistoryBase,
  RectifyLogBase,
  RectifyLogDetailsOf,
  SelectOption,
  VoucherLine,
} from "../collection-repayment/CollectionRectifyType";

export type LoanRectifyTab = "loans" | "history" | "log";

export interface LoanSearchForm {
  fromDate: string | Date | null;
  toDate: string | Date | null;
  group_id: number | "";
  search: string;
}

export interface LoanRectifyForm {
  loan_date: string | Date | null;
  loan_amount: string;
  scheme_id: number | "";
  purpose_id: number | "";
  guarantor_name: string;
  co_id: number | "";
  reason: string;
}

export interface ListPagination {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
  from: number;
  to: number;
}

export interface SchemeOption extends SelectOption {
  sanctionLimit: number;
}

export interface RectifyLoan {
  accountId: number;
  accountLabel: string;
  loanCycle: string;
  loanDate: string;
  loanAmount: number;
  schemeId: number;
  schemeName: string;
  roi: number;
  repayName: string;
  instNo: number;
  instAmount: number;
  realisableAmt: number;
  finalDate: string;
  purposeId: number | null;
  purposeName: string;
  guarantorName: string;
  memberId: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  groupId: number;
  groupNo: string;
  groupName: string;
  coId: number | null;
  coName: string;
  branchName: string;
  voucherNo: string;
  refVouNo: string;
  transModeName: string;
  voucherLoanCount: number;
  collCount: number;
  firstCollDate: string;
  prnCollected: number;
  outstanding: number;
  canChangeTerms: boolean;
  canChangeScheme: boolean;
  lockReason: string;
  rectifyCount: number;
  lastRectifiedOn: string;
}

export interface LoanTerms {
  roi: number | null;
  instNo: number | null;
  instAmount: number | null;
  realisableAmt: number | null;
  finalDate: string;
}

export interface LoanTermsPreview extends LoanTerms {
  pending: boolean;
  error: string;
}

export interface LoanRectifyResult extends LoanTerms {
  message: string;
  voucherNo: string;
  loanDate: string;
  loanAmount: number;
  schemeName: string;
  outstanding: number;
  affectedLoans: number;
  voucher: VoucherLine[];
}

export interface LoanRectifyHistoryRow extends RectifyHistoryBase {
  accountId: number;
  accountLabel: string;
  memberName: string;
  voucherNo: string;
}

export interface LoanRectifyLogRow extends RectifyLogBase {
  accountId: number;
  accountLabel: string;
  memberName: string;
  groupName: string;
}

export type LoanRectifyLogDetails = RectifyLogDetailsOf<LoanRectifyLogRow>;

export interface LoanRectifyProps {
  searchForm: UseFormReturn<LoanSearchForm>;
  rectifyForm: UseFormReturn<LoanRectifyForm>;
  groupOptions: SelectOption[];
  coOptions: SelectOption[];
  schemeOptions: SchemeOption[];
  purposeOptions: SelectOption[];
  groupLoading: boolean;
  coLoading: boolean;
  schemeLoading: boolean;
  purposeLoading: boolean;
  loans: RectifyLoan[];
  listLoading: boolean;
  pagination: ListPagination | null;
  onPageChange: (page: number) => void;
  onSearch: () => void;
  onResetSearch: () => void;
  onEdit: (accountId: number) => void;
  deleteTarget: RectifyLoan | null;
  deleting: boolean;
  onDelete: (loan: RectifyLoan) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  dialogOpen: boolean;
  onCloseDialog: () => void;
  detailsLoading: boolean;
  loan: RectifyLoan | null;
  voucher: VoucherLine[];
  history: LoanRectifyHistoryRow[];
  terms: LoanTermsPreview;
  saving: boolean;
  onSave: () => void;
  result: LoanRectifyResult | null;
}

export interface LoanRectifyHistoryProps {
  form: UseFormReturn<DateRangeForm>;
  rows: LoanRectifyHistoryRow[];
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
}

export interface LoanRectifyLogProps {
  form: UseFormReturn<LogSearchForm>;
  rows: LoanRectifyLogRow[];
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
  onView: (logId: number) => void;
  detailsOpen: boolean;
  detailsLoading: boolean;
  details: LoanRectifyLogDetails | null;
  onCloseDetails: () => void;
}
