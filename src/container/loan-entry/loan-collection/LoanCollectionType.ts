import { UseFormReturn } from "react-hook-form";

export interface LoanCollectionForm {
  collectionDate: Date | string | null;
  branchId: string | number | "";
  groupId: string | number;
  refVoucherNo: string;
}

/** One loan account row from GetLoanCycleList (a member with two loans has two rows). */
export interface CollectionLoanRow {
  accountId: number;
  accountNo: string;
  memberId: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  areaName: string;
  loanCycle: string;
  loanDate: string;
  loanAmount: number;
  installmentAmt: number;
  balance: number;
  currentDemand: number;
  collAmount: number;
  prnAmount: number;
  inttAmount: number;
  penalAmount: number;
}

export interface PaymentEntryRow {
  accountId: number;
  accountNo: string;
  memberId: number;
  memberNo: string;
  memberName: string;
  balance: number;
  /** Raw input text so partially typed numbers are kept. */
  amount: string;
  penal: string;
  principal: number;
  interest: number;
  /** Split is outdated and a CalcCollectionSplit call is pending. */
  splitPending: boolean;
  /** Message from CalcCollectionSplit when it is not "OK". */
  splitError: string;
  /** Server-side error for this row from PostCollection. */
  serverError: string;
}

export type PaymentEntryField = "amount" | "penal";

export interface CollectionTotals {
  count: number;
  memberCount: number;
  collAmount: number;
  prnAmount: number;
  inttAmount: number;
  penalAmount: number;
}

export interface CollectionReceipt {
  accountId: number;
  memberId: number;
  memberNo: string;
  memberName: string;
  collId: number | null;
  voucherId: number | null;
  voucherNo: string;
  collAmount: number;
  prnAmount: number;
  inttAmount: number;
  penalAmount: number;
  outsAmount: number;
}

export interface CollectionResult {
  message: string;
  voucherNo: string;
  postedCount: number;
  totals: CollectionTotals;
  rows: CollectionReceipt[];
}

export interface CalcSplitRequestRow {
  account_id: number;
  member_id: number;
  coll_amount: number;
  penal_amount?: number;
}

export interface PostCollectionRow extends CalcSplitRequestRow {
  prn_amount: number;
  intt_amount: number;
  penal_amount: number;
}

export interface PostCollectionPayload {
  org_id: number;
  branch_id: number;
  coll_date: string;
  co_id: number | null;
  ref_vouch: string | null;
  fin_id: number | null;
  coll_data: PostCollectionRow[];
}

export interface LoanCollectionProps {
  form: UseFormReturn<LoanCollectionForm>;
  onSubmit: (values: LoanCollectionForm) => void;
  resetForm: () => void;
  groupList: any[];
  loanRows: CollectionLoanRow[];
  isGroupLoading: boolean;
  isLoanListLoading: boolean;
  loading: boolean;
  entries: PaymentEntryRow[];
  rowErrors: Record<number, string>;
  totals: CollectionTotals;
  canSave: boolean;
  isSplitting: boolean;
  onToggleLoan: (row: CollectionLoanRow, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onEntryChange: (
    accountId: number,
    field: PaymentEntryField,
    value: string,
  ) => void;
  onRemoveEntry: (accountId: number) => void;
  onClearEntries: () => void;
  collectionResult: CollectionResult | null;
  onReceiptClose: () => void;
}
