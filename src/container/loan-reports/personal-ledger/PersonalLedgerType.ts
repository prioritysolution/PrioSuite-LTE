import { UseFormReturn } from "react-hook-form";

export interface PersonalLedgerForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  groupId: string;
  memberId: string;
  loanDate: Date | string | null;
  loanAmount: string;
  reliasableAmount: string;
  installmentAmount: string;
  personalledger: string;
  loanCycleId: string;
}

export interface PersonalLedgerProps {
  form: UseFormReturn<PersonalLedgerForm>;
  onSubmit: (data: PersonalLedgerForm) => void;
  groupListData: any[];
  memberListData: any[];
  loanCycleListData: any[];
  personalLedgerData: any[] | null;
  resetForm: () => void;
  isMemberListLoading?: boolean;
  isLoanCycleListLoading?: boolean;
  loading?: boolean;
}
