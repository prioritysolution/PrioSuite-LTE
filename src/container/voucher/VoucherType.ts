import { UseFormReturn } from "react-hook-form";

export interface VoucherForm {
  voucherDate: Date | string;
  voucherType: string | number;
  particulars: string;
  refVouchNo?: string;
  ledger: string | number;
  amount: string | number;
  mode: string | number;
}

export interface VoucherProps {
  form: UseFormReturn<VoucherForm>;
  onSubmit: (values: VoucherForm) => void;
  resetForm: () => void;
  ledgerList: any[];
  loading: boolean;
}
