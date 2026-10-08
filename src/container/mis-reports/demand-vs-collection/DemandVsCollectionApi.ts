import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  AmountBlock,
  DateRow,
  DemandVsCollectionData,
  GroupRow,
  MemberRow,
  ReportSummary,
  ReportView,
} from "./DemandVsCollectionType";

const toNumber = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toText = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const toPct = (value: unknown): number | null => {
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

const mapAmounts = (row: any): AmountBlock => ({
  arrearDemand: toNumber(row?.Arrear_Demand),
  currentDemand: toNumber(row?.Current_Demand),
  currentPrnDemand: toNumber(row?.Current_Prn_Demand),
  currentIntDemand: toNumber(row?.Current_Int_Demand),
  totalDemand: toNumber(row?.Total_Demand),
  openingAdvance: toNumber(row?.Opening_Advance),
  netDemand: toNumber(row?.Net_Demand),
  collArrear: toNumber(row?.Coll_Arrear),
  collCurrent: toNumber(row?.Coll_Current),
  collAdvance: toNumber(row?.Coll_Advance),
  collAmount: toNumber(row?.Coll_Amount),
  collPrn: toNumber(row?.Coll_Prn),
  collIntt: toNumber(row?.Coll_Intt),
  collPenal: toNumber(row?.Coll_Penal),
  overdueAmount: toNumber(row?.Overdue_Amount),
  closingAdvance: toNumber(row?.Closing_Advance),
  outstanding: toNumber(row?.Outstanding),
  demandAccountCount: toNumber(row?.Demand_Account_Count),
  collectedAccountCount: toNumber(row?.Collected_Account_Count),
  overdueAccountCount: toNumber(row?.Overdue_Account_Count),
  collPct: toPct(row?.Coll_Pct),
  accountCount: toNumber(row?.Account_Count),
  memberCount: toNumber(row?.Member_Count),
  groupCount: toNumber(row?.Group_Count),
});

const mapSummary = (row: any): ReportSummary => ({
  ...mapAmounts(row),
  fromDate: toText(row?.From_Date),
  toDate: toText(row?.To_Date),
  branchId: toNumber(row?.Branch_Id),
  branchName: toText(row?.Branch_Name) || "Branch",
});

const mapGroupRow = (row: any): GroupRow => ({
  ...mapAmounts(row),
  keyId: toNumber(row?.Key_Id),
  keyName: toText(row?.Key_Name) || "—",
  keyCode: toText(row?.Key_Code),
  branchId: toNumber(row?.Branch_Id),
  coId:
    row?.CO_Id === null || row?.CO_Id === undefined ? null : toNumber(row?.CO_Id),
});

const mapMemberRow = (row: any): MemberRow => ({
  ...mapAmounts(row),
  accountId: toNumber(row?.Account_Id),
  accountNo: toText(row?.Account_No),
  memberId: toNumber(row?.Member_Id),
  memberNo: toText(row?.Member_No),
  memberName: toText(row?.Member_Name),
  guardianName: toText(row?.Guardian_Name),
  groupName: toText(row?.Group_Name),
  groupNo: toText(row?.Group_No),
  coName: toText(row?.CO_Name),
  loanDate: toText(row?.Loan_Date),
  loanAmount: toNumber(row?.Loan_Amount),
  installmentAmt: toNumber(row?.Installment_Amt),
  instlCount: toNumber(row?.Instl_Count),
  collCount: toNumber(row?.Coll_Count),
  lastCollDate: toText(row?.Last_Coll_Date),
  collStatus: toText(row?.Coll_Status),
});

const mapDateRow = (row: any): DateRow => ({
  transDate: toText(row?.Trans_Date),
  demandAmount: toNumber(row?.Demand_Amount),
  demandCount: toNumber(row?.Demand_Count),
  collAmount: toNumber(row?.Coll_Amount),
  collCount: toNumber(row?.Coll_Count),
  cumDemand: toNumber(row?.Cum_Demand),
  cumCollection: toNumber(row?.Cum_Collection),
});

export const mapDemandVsCollection = (
  res: any,
  view: ReportView,
): DemandVsCollectionData | null => {
  const details = res?.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) return null;
  const rows = Array.isArray(details.Rows) ? details.Rows : [];
  return {
    message: toText(res?.message),
    view,
    summary: mapSummary(details.Summary),
    rows: view === "member" || view === "date" ? [] : rows.map(mapGroupRow),
    memberRows: view === "member" ? rows.map(mapMemberRow) : [],
    dateRows: view === "date" ? rows.map(mapDateRow) : [],
  };
};

export const getDemandVsCollectionAPI = (query: {
  orgId: number;
  branchId: number;
  fromDate: string;
  toDate: string;
  view: ReportView;
  reportBranchId?: number | null;
  coId?: number | null;
  groupId?: number | null;
}) => doGetApiCall({ url: endPoints.getDemandVsCollection(query) });
