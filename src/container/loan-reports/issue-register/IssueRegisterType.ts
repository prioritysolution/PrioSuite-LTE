import { UseFormReturn } from "react-hook-form";

export interface IssueRegisterForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branch: string | number;
  group: string | number;
}

export interface IssueRegisterGroupOption {
  label: string;
  value: number;
}

export interface IssueRegisterState {
  branchList: any[];
  issueRegisterList: any[] | null;
}

export interface IssueRegisterProps {
  form: UseFormReturn<IssueRegisterForm>;
  onSubmit: (values: IssueRegisterForm) => void;
  resetForm: () => void;
  loading?: boolean;
  groupOptions: IssueRegisterGroupOption[];
  groupLoading: boolean;
}

export interface IssueRegisterRow {
  sl: number;
  issueDate: string;
  groupName: string;
  memberNo: string;
  memberName: string;
  guardianName: string;
  area: string;
  schemeName: string;
  realisableAmt: string | number;
  guarantorName: string;
  loanAmount: string | number;
  installmentAmt: string | number;
  underCo: string;
}
