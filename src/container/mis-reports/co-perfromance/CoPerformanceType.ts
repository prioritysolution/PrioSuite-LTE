export type DataView = "sahayika" | "group" | "month";
export type LayoutView = "table" | "cards" | "trend";

export interface CoPerformanceForm {
  fromDate: Date | null;
  toDate: Date | null;
  reportBranchId: number | "";
  coId: number;
}

export interface PerfMetrics {
  activeGroupCount: number;
  activeMemberCount: number;
  activeLoanCount: number;
  newGroupCount: number;
  newMemberCount: number;
  disbCount: number;
  disbAmount: number;
  avgLoanSize: number | null;
  openingOutstanding: number;
  outstanding: number;
  closedLoanCount: number;
  arrearDemand: number;
  currentDemand: number;
  netDemand: number;
  collAgainstDemand: number;
  collAdvance: number;
  collAmount: number;
  collPct: number | null;
  overdueAmount: number;
  overdueAccountCount: number;
  parAmount: number;
  parPct: number | null;
  par0_30: number;
  par31_60: number;
  par61_90: number;
  parAbove90: number;
  grade: string | null;
}

export interface PerfSummary extends PerfMetrics {
  fromDate: string;
  toDate: string;
  branchId: number;
  branchName: string;
  sahayikaCount: number;
}

export interface PerfRow extends PerfMetrics {
  branchId: number;
  branchName: string;
  keyId: number;
  keyName: string;
  keyCode: string;
  contactNumber: string;
  isActive: number | null;
  perfRank: number | null;
  coId: number | null;
  collectionDay: string;
}

export interface MonthRow {
  monthKey: string;
  monthName: string;
  disbCount: number;
  disbAmount: number;
  demandAmount: number;
  collAmount: number;
  collVsDuePct: number | null;
}

export interface CoPerformanceData {
  message: string;
  view: DataView;
  summary: PerfSummary;
  rows: PerfRow[];
  monthRows: MonthRow[];
}

export interface SelectOption {
  label: string;
  value: number;
}

export interface Crumb {
  label: string;
  level: "branch" | "sahayika";
}

export interface CoPerformanceProps {
  form: import("react-hook-form").UseFormReturn<CoPerformanceForm>;
  loading: boolean;
  isHead: boolean;
  branchName: string;
  branchOptions: SelectOption[];
  sahayikaOptions: SelectOption[];
  branchLoading: boolean;
  sahayikaLoading: boolean;
  sahayikaDisabled: boolean;
  report: CoPerformanceData | null;
  layout: LayoutView;
  crumbs: Crumb[];
  onShow: (values: CoPerformanceForm) => void;
  onPreset: (preset: "month" | "lastMonth" | "quarter" | "fy") => void;
  onLayout: (layout: LayoutView) => void;
  onDrill: (row: PerfRow) => void;
  onCrumb: (level: Crumb["level"]) => void;
  onBranchChange: (value: number) => void;
}
