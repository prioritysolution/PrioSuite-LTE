import { UseFormReturn } from "react-hook-form";

export interface LoanCollectionForm {
  collectionDate: Date | string;
  branchId: string | number | "";
  groupId: string | number;
  memberId: string | number;
  loanDate: string;
  loanAmount: string | number;
  installmentAmount: string | number;
  currentBalance: string | number;
  demand: string | number;
  realisableAmount: string | number;
  amount: string;
  principalAmount: string;
  interestAmount: string;
  penalAmount: string;
  refVoucherNo: string;
  transMode: string;
  bankId: string | number;
  bankRef: string;
}

/** Identifies one loan application row for the same member. */
export interface LoanRowMeta {
  accountId?: string | number | null;
  loanDate?: string | null;
  loanAmount?: string | number | null;
}

export interface LoanCollectionProps {
  form: UseFormReturn<LoanCollectionForm>;
  onSubmit: (values: LoanCollectionForm) => void;
  resetForm: () => void;
  groupList: any[];
  memberList: any[];
  isGroupLoading: boolean;
  isMemberLoading: boolean;
  isLoanInfoLoading: boolean;
  isSplitLoading?: boolean;
  loading: boolean;
  onToggleCollection: (
    memberId: string | number,
    checked: boolean,
    meta?: LoanRowMeta,
  ) => void;
  selectedAccountId?: string | number | null;
  selectedLoanDate?: string | null;
  selectedLoanAmount?: string | number | null;
  showSuccessMessage?: boolean;
  successMessage?: string;
  onSuccessClose?: (open: boolean) => void;
}
