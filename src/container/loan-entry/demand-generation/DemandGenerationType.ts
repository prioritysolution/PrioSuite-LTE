import { UseFormReturn } from "react-hook-form";

export interface DemandGenerationForm {
  co_id: number | "";
  group_id: number | "";
}

export interface DemandRow {
  sl: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  loanAmount: string | number;
  outstanding: string | number;
  demand: string | number;
}

export interface SelectOption {
  label: string;
  value: number;
}

export interface DemandGenerationState {
  rows: DemandRow[] | null;
  loading: boolean;
}

export interface DemandGenerationProps {
  form: UseFormReturn<DemandGenerationForm>;
  coOptions: SelectOption[];
  groupOptions: SelectOption[];
  coLoading: boolean;
  groupLoading: boolean;
  generating: boolean;
  rows: DemandRow[] | null;
  onGenerate: (values: DemandGenerationForm) => void;
  onReset: () => void;
  onSelectionChange: () => void;
}
