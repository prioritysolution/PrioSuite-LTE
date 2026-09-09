import { UseFormReturn } from "react-hook-form";

export interface DetailedListForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branch: string | number;
  scheme: string | number;
}

export interface DetailedListState {
  branchList: any[];
  schemeList: any[];
  detailedList: any[] | null;
}

export interface DetailedListProps {
  form: UseFormReturn<DetailedListForm>;
  onSubmit: (values: DetailedListForm) => void;
  resetForm: () => void;
  loading?: boolean;
}
