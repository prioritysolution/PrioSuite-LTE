import { UseFormReturn } from "react-hook-form";

export interface SelectOption {
  label: string;
  value: number;
}

export interface CollectionSearchForm {
  fromDate: string | Date | null;
  toDate: string | Date | null;
  group_id: number | "";
  voucher_no: string;
}

export interface RectifyForm {
  group_id: number | "";
  account_id: number | "";
  coll_date: string | Date | null;
  coll_amount: string;
  penal_amount: string;
  co_id: number | "";
  reason: string;
}

export interface RectifyCollection {
  collId: number;
  collDate: string;
  voucherId: number;
  voucherNo: string;
  refVouNo: string;
  isBulkVoucher: boolean;
  canChangeDate: boolean;
  batchId: number;
  accountId: number;
  accountLabel: string;
  loanCycle: string;
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
  collAmount: number;
  prnAmount: number;
  inttAmount: number;
  penalAmount: number;
  outsAfterColl: number;
  rectifyCount: number;
  lastRectifiedOn: string;
}

export interface VoucherLine {
  voucherNo: string;
  transType: string;
  glAccountName: string;
  drAmount: number;
  crAmount: number;
  remarks: string;
}

export interface RectifyChange {
  label: string;
  oldValue: string;
  newValue: string;
}

export interface RectifyHistoryBase {
  rectifyId: number;
  rectifiedOn: string;
  rectifiedBy: string;
  reason: string;
  changes: RectifyChange[];
}

export interface RectifyHistoryRow extends RectifyHistoryBase {
  collId: number;
  voucherNo: string;
}

export type RectifyTab = "collections" | "history" | "log";

export interface DateRangeForm {
  fromDate: string | Date | null;
  toDate: string | Date | null;
}

export interface LogSearchForm extends DateRangeForm {
  result: number | "";
}

export interface KeyValue {
  key: string;
  value: string;
}

export interface RectifyLogBase {
  logId: number;
  result: number;
  resultName: string;
  errorNo: number;
  message: string;
  createdOn: string;
  durationMs: number;
  userName: string;
  branchName: string;
  ipAddress: string;
  userAgent: string;
  voucherNo: string;
  rectifyId: number;
  reason: string;
  changeCount: number;
}

export interface RectifyLogRow extends RectifyLogBase {
  collId: number;
  batchId: number;
  oldAccount: string;
  oldMemberName: string;
  newAccount: string;
  newMemberName: string;
}

export interface RectifyLogChange {
  seqNo: number;
  title: string;
  tableName: string;
  recordId: string;
  diffs: RectifyChange[];
}

export interface RectifyLogDetailsOf<T extends RectifyLogBase> {
  log: T;
  request: KeyValue[];
  response: KeyValue[];
  changes: RectifyLogChange[];
}

export type RectifyLogDetails = RectifyLogDetailsOf<RectifyLogRow>;

export interface RectifyHistoryProps {
  form: UseFormReturn<DateRangeForm>;
  rows: RectifyHistoryRow[];
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
}

export interface RectifyLogProps {
  form: UseFormReturn<LogSearchForm>;
  rows: RectifyLogRow[];
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
  onView: (logId: number) => void;
  detailsOpen: boolean;
  detailsLoading: boolean;
  details: RectifyLogDetails | null;
  onCloseDetails: () => void;
}

export interface TargetLoan {
  accountId: number;
  accountLabel: string;
  loanCycle: string;
  loanDate: string;
  loanAmount: number;
  installmentAmt: number;
  memberId: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  groupId: number;
  groupNo: string;
  groupName: string;
  coName: string;
  isCurrent: boolean;
  balanceOnDate: number;
  demandOnDate: number;
  maxCollAmount: number;
}

export interface SplitPreview {
  pending: boolean;
  prnAmount: number | null;
  inttAmount: number | null;
  error: string;
}

export interface RectifyResult {
  message: string;
  voucherNo: string;
  collDate: string;
  collAmount: number;
  prnAmount: number;
  inttAmount: number;
  penalAmount: number;
  oldAccountOuts: number;
  newAccountOuts: number;
  accountChanged: boolean;
  voucher: VoucherLine[];
}

export interface CollectionRectifyProps {
  searchForm: UseFormReturn<CollectionSearchForm>;
  rectifyForm: UseFormReturn<RectifyForm>;
  groupOptions: SelectOption[];
  coOptions: SelectOption[];
  groupLoading: boolean;
  coLoading: boolean;
  collections: RectifyCollection[];
  listLoading: boolean;
  onSearch: () => void;
  onResetSearch: () => void;
  onEdit: (collId: number) => void;
  dialogOpen: boolean;
  onCloseDialog: () => void;
  detailsLoading: boolean;
  collection: RectifyCollection | null;
  voucher: VoucherLine[];
  history: RectifyHistoryRow[];
  loanOptions: SelectOption[];
  loansLoading: boolean;
  loanSearch: string;
  onLoanSearchChange: (value: string) => void;
  onTargetGroupChange: () => void;
  selectedLoan: TargetLoan | null;
  split: SplitPreview;
  saving: boolean;
  onSave: () => void;
  result: RectifyResult | null;
}
