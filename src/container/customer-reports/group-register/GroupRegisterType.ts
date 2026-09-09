import { UseFormReturn } from "react-hook-form";

export interface GroupRegisterForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branch: string | number;
}

export interface GroupRegisterState {
  branchList: any[];
  groupRegisterList: any[] | null;
}

export interface GroupRegisterProps {
  form: UseFormReturn<GroupRegisterForm>;
  onSubmit: (values: GroupRegisterForm) => void;
  resetForm: () => void;
  loading?: boolean;
}

export interface GroupRegisterRow {
  sl: number;
  groupNo: string;
  groupName: string;
  area: string;
  memberCount: string | number;
  admissionDate: string;
  underCo: string;
}
