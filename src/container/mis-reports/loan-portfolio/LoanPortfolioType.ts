import type { UseFormReturn } from "react-hook-form";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

export type PortfolioView = "branch" | "branch_summary" | "sahayika" | "group" | "village" | "member";
export interface LoanPortfolioForm {
  fromDate: Date | null;
  toDate: Date | null;
  reportBranchId: number | "";
  sahayikaId: number | "all" | "";
  view: PortfolioView;
}
export interface PortfolioQuery {
  orgId: number;
  branchId: number;
  fromDate: string;
  toDate: string;
  reportBranchId?: number;
  coId?: number;
  view: PortfolioView;
  page: number;
  perPage: number;
}
export type PortfolioRecord = Record<string, string | number | null>;
export interface PrintColumn { Number: number; Field: string; Label: string; Group: string; Format: string }
export interface PortfolioPagination { current_page: number; per_page: number; total: number; last_page: number; from: number | null; to: number | null; has_more_pages: boolean }
export interface LoanPortfolioData {
  view: PortfolioView;
  query: PortfolioQuery;
  organisation: { name: string; address: string };
  summary: PortfolioRecord;
  totals: PortfolioRecord;
  rows: PortfolioRecord[];
  columns: PrintColumn[];
  warnings: string[];
  pagination: PortfolioPagination;
}
export interface LoanPortfolioProps {
  form: UseFormReturn<LoanPortfolioForm>;
  loading: boolean;
  exporting: boolean;
  isHead: boolean;
  branchName: string;
  branchOptions: { label: string; value: number }[];
  branchLoading: boolean;
  sahayikaOptions: { label: string; value: number | "all" }[];
  sahayikaLoading: boolean;
  report: LoanPortfolioData | null;
  error: string | null;
  dropdownError: string | null;
  onShow: (values: LoanPortfolioForm) => void;
  onBranchChange: (value: number) => void;
  onPreset: (preset: DatePreset) => void;
  activePreset: DatePreset | null;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  prepareExport: () => Promise<LoanPortfolioData | null>;
}
