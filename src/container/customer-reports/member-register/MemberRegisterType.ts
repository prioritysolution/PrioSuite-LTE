import { UseFormReturn } from "react-hook-form";

export interface MemberRegisterForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branch: string | number;
}

export interface MemberRegisterState {
  branchList: any[];
  memberRegisterList: any[] | null;
}

export interface MemberRegisterProps {
  form: UseFormReturn<MemberRegisterForm>;
  onSubmit: (values: MemberRegisterForm) => void;
  resetForm: () => void;
  loading?: boolean;
}

export interface MemberRegisterRow {
  sl: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  groupName: string;
  area: string;
  admissionDate: string;
  underCo: string;
}
