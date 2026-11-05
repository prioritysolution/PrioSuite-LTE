import type { UseFormReturn } from "react-hook-form";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";
import type { PortfolioQuery, PortfolioRecord, PortfolioPagination, PortfolioView } from "@/container/mis-reports/loan-portfolio/LoanPortfolioType";

export type ParView = PortfolioView;
export type ParQuery = PortfolioQuery;
export type ParRecord = PortfolioRecord;
export interface DefaultParCalculationForm {
  fromDate: Date | null; toDate: Date | null; reportBranchId: number | ""; sahayikaId: number | "all" | ""; view: ParView;
}
export interface ParPrintColumn { Number: number; Field: string; Label: string; Format: string }
export interface ParAgingBucket { Code: string; Label: string; Min_Days: number | null; Max_Days: number | null; Included_In_PAR: boolean; Outstanding_Field: string; Overdue_Field: string; Loan_Count_Field: string }
export interface DefaultParCalculationData {
  view: ParView; query: ParQuery; organisation: { name: string; address: string }; summary: ParRecord; totals: ParRecord;
  rows: ParRecord[]; columns: ParPrintColumn[]; buckets: ParAgingBucket[]; warnings: string[]; pagination: PortfolioPagination;
  calculation: { asOf: string; thresholdDays: number; thresholdOperator: string; parBasis: string; outstandingBasis: string; overdueBasis: string; borrowerBasis: string; agingBasis: string };
}
export interface DefaultParCalculationProps {
  form: UseFormReturn<DefaultParCalculationForm>; loading: boolean; exporting: boolean; isHead: boolean; branchName: string;
  branchOptions: { label: string; value: number }[]; branchLoading: boolean;
  sahayikaOptions: { label: string; value: number | "all" }[]; sahayikaLoading: boolean;
  report: DefaultParCalculationData | null; error: string | null; dropdownError: string | null;
  onShow: (values: DefaultParCalculationForm) => void; onBranchChange: (value: number) => void;
  onPreset: (preset: DatePreset) => void; activePreset: DatePreset | null;
  onPageChange: (page: number) => void; onPerPageChange: (perPage: number) => void;
  prepareExport: () => Promise<DefaultParCalculationData | null>;
}
