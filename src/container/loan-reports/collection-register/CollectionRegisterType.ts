import { UseFormReturn } from "react-hook-form";

export interface CollectionRegisterForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branch: string | number;
}

export interface CollectionRegisterState {
  branchList: any[];
  collectionRegisterList: any[] | null;
  loading: boolean;
  error: string | null;
}

export interface CollectionRegisterProps {
  form: UseFormReturn<CollectionRegisterForm>;
  onSubmit: (values: CollectionRegisterForm) => void;
  resetForm: () => void;
  loading?: boolean;
}

export interface CollectionRegisterRow {
  sl: number;
  issueDate: string;
  groupName: string;
  memberName: string;
  principal: string | number;
  interest: string | number;
  collectionAmount: string | number;
  outstandingBalance: string | number;
  underCo: string;
}

export interface FetchCollectionRegisterArgs {
  orgId: number;
  branchId: number;
  fromDate: string;
  toDate: string;
}
