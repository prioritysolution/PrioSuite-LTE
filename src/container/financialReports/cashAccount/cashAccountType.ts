import { UseFormReturn } from "react-hook-form";

export interface CashAccountForm {
  fromDate: Date | string | null;
  toDate: Date | string | null;
  branch: string | number;
}

export interface PaymentItem {
  Account_Code: string | null;
  Payment_Amount: number;
  Payment_Ledger_Name: string;
}

export interface ReceiptItem {
  Account_Code: string | null;
  Receipt_Amount: number;
  Receipt_Ledger_Name: string;
}

export interface CashAccountReportData {
  Payments: PaymentItem[];
  Receipts: ReceiptItem[];
  Closing_Cash_Balance: number;
  Opening_Cash_Balance: number;
}

export interface CashAccountProps {
  form: UseFormReturn<CashAccountForm>;
  onSubmit: (data: CashAccountForm) => void;
  branchList: any[];
  cashAccountReport: CashAccountReportData | null;
  resetForm: () => void;
  loading: boolean;
}
