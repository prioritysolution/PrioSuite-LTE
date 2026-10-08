import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  CoPerformanceData,
  DataView,
  MonthRow,
  PerfMetrics,
  PerfRow,
  PerfSummary,
} from "./CoPerformanceType";

const toNumber = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toText = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const toNullable = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : null;
};

export const formatAmount = (value: number) => {
  const amount = Number(value) || 0;
  if (!amount) return "-";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatApiDate = (value: string) => {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return value || "-";
  return `${day}-${month}-${year}`;
};

export const formatPct = (value: number | null) =>
  value === null ? "–" : `${value.toFixed(2)}%`;

const mapMetrics = (row: any): PerfMetrics => ({
  activeGroupCount: toNumber(row?.Active_Group_Count),
  activeMemberCount: toNumber(row?.Active_Member_Count),
  activeLoanCount: toNumber(row?.Active_Loan_Count),
  newGroupCount: toNumber(row?.New_Group_Count),
  newMemberCount: toNumber(row?.New_Member_Count),
  disbCount: toNumber(row?.Disb_Count),
  disbAmount: toNumber(row?.Disb_Amount),
  avgLoanSize: toNullable(row?.Avg_Loan_Size),
  openingOutstanding: toNumber(row?.Opening_Outstanding),
  outstanding: toNumber(row?.Outstanding),
  closedLoanCount: toNumber(row?.Closed_Loan_Count),
  arrearDemand: toNumber(row?.Arrear_Demand),
  currentDemand: toNumber(row?.Current_Demand),
  netDemand: toNumber(row?.Net_Demand),
  collAgainstDemand: toNumber(row?.Coll_Against_Demand),
  collAdvance: toNumber(row?.Coll_Advance),
  collAmount: toNumber(row?.Coll_Amount),
  collPct: toNullable(row?.Coll_Pct),
  overdueAmount: toNumber(row?.Overdue_Amount),
  overdueAccountCount: toNumber(row?.Overdue_Account_Count),
  parAmount: toNumber(row?.PAR_Amount),
  parPct: toNullable(row?.PAR_Pct),
  par0_30: toNumber(row?.PAR_0_30),
  par31_60: toNumber(row?.PAR_31_60),
  par61_90: toNumber(row?.PAR_61_90),
  parAbove90: toNumber(row?.PAR_Above_90),
  grade: row?.Grade ? String(row.Grade) : null,
});

const mapRow = (row: any): PerfRow => ({
  ...mapMetrics(row),
  branchId: toNumber(row?.Branch_Id),
  branchName: toText(row?.Branch_Name),
  keyId: toNumber(row?.Key_Id),
  keyName: toText(row?.Key_Name) || "—",
  keyCode: toText(row?.Key_Code),
  contactNumber: toText(row?.Contact_Number),
  isActive:
    row?.Is_Active === null || row?.Is_Active === undefined
      ? null
      : toNumber(row?.Is_Active),
  perfRank: toNullable(row?.Perf_Rank),
  coId: row?.CO_Id === null || row?.CO_Id === undefined ? null : toNumber(row?.CO_Id),
  collectionDay: toText(row?.Collection_Day),
});

const mapMonth = (row: any): MonthRow => ({
  monthKey: toText(row?.Month_Key),
  monthName: toText(row?.Month_Name),
  disbCount: toNumber(row?.Disb_Count),
  disbAmount: toNumber(row?.Disb_Amount),
  demandAmount: toNumber(row?.Demand_Amount),
  collAmount: toNumber(row?.Coll_Amount),
  collVsDuePct: toNullable(row?.Coll_Vs_Due_Pct),
});

export const mapCoPerformance = (res: any, view: DataView): CoPerformanceData | null => {
  const details = res?.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;
  const rows = Array.isArray(details.Rows) ? details.Rows : [];
  const summary = details.Summary || {};
  return {
    message: toText(res?.message),
    view,
    summary: {
      ...mapMetrics(summary),
      fromDate: toText(summary.From_Date),
      toDate: toText(summary.To_Date),
      branchId: toNumber(summary.Branch_Id),
      branchName: toText(summary.Branch_Name) || "Branch",
      sahayikaCount: toNumber(summary.Sahayika_Count),
    } satisfies PerfSummary,
    rows: view === "month" ? [] : rows.map(mapRow),
    monthRows: view === "month" ? rows.map(mapMonth) : [],
  };
};

export const getCoPerformanceAPI = (query: {
  orgId: number;
  branchId: number;
  fromDate: string;
  toDate: string;
  view: DataView;
  reportBranchId?: number | null;
  coId?: number | null;
}) => doGetApiCall({ url: endPoints.getCoPerformance(query) });
