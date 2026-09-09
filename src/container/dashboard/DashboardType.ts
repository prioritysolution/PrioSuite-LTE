import type { LucideIcon } from "lucide-react";

export interface DashboardStats {
  totalLoanIssue: number;
  totalCollection: number;
  totalOutstanding: number;
  totalActiveBorrowers: number;
}

export interface DashboardBranchItem {
  branchId: number;
  branchCode: string;
  branchName: string;
  isHead: boolean;
  stats: DashboardStats;
}

/** Full dashboard payload from GetDashboard / GetDashboard_item */
export interface DashboardPayload {
  /** true when logged-in branch Is_Head == 1 */
  isHeadView: boolean;
  summary: DashboardStats;
  branches: DashboardBranchItem[];
}

export interface DashboardState {
  loading: boolean;
  error: string | null;
  isHeadView: boolean;
  stats: DashboardStats;
  branches: DashboardBranchItem[];
}

export type DashboardCardTheme = "blue" | "green" | "yellow" | "purple";

export interface DashboardStatCard {
  key: string;
  title: string;
  value: string;
  /** Amount / count spelled out (Indian numbering); shown under the value */
  valueInWords: string;
  Icon: LucideIcon;
  theme: DashboardCardTheme;
}

export interface DashboardBranchSection {
  branchId: number;
  branchName: string;
  isHead: boolean;
  cards: DashboardStatCard[];
}

export interface DashboardUIProps {
  branchName: string;
  fromDate: Date | null;
  toDate: Date | null;
  onFromDateChange: (date: Date | undefined) => void;
  onToDateChange: (date: Date | undefined) => void;
  onSearch: () => void;
  /** Reset date range to financial year and reload */
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
  /** Overall / current-branch KPI cards */
  statCards: DashboardStatCard[];
  /** When head office: loop of same KPI cards per branch */
  isHeadView: boolean;
  branchSections: DashboardBranchSection[];
  finStartDate: Date | null;
  finEndDate: Date | null;
}
