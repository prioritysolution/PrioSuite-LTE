export type ReportView = "branch" | "sahayika" | "group" | "member" | "date";

export interface DemandVsCollectionForm {
  fromDate: Date | null;
  toDate: Date | null;
  reportBranchId: number | "";
  coId: number;
  groupId: number;
}

export interface AmountBlock {
  arrearDemand: number;
  currentDemand: number;
  currentPrnDemand: number;
  currentIntDemand: number;
  totalDemand: number;
  openingAdvance: number;
  netDemand: number;
  collArrear: number;
  collCurrent: number;
  collAdvance: number;
  collAmount: number;
  collPrn: number;
  collIntt: number;
  collPenal: number;
  overdueAmount: number;
  closingAdvance: number;
  outstanding: number;
  demandAccountCount: number;
  collectedAccountCount: number;
  overdueAccountCount: number;
  collPct: number | null;
  accountCount: number;
  memberCount: number;
  groupCount: number;
}

export interface ReportSummary extends AmountBlock {
  fromDate: string;
  toDate: string;
  branchId: number;
  branchName: string;
}

export interface GroupRow extends AmountBlock {
  keyId: number;
  keyName: string;
  keyCode: string;
  branchId: number;
  coId: number | null;
}

export interface MemberRow extends AmountBlock {
  accountId: number;
  accountNo: string;
  memberId: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  groupName: string;
  groupNo: string;
  coName: string;
  loanDate: string;
  loanAmount: number;
  installmentAmt: number;
  instlCount: number;
  collCount: number;
  lastCollDate: string;
  collStatus: string;
}

export interface DateRow {
  transDate: string;
  demandAmount: number;
  demandCount: number;
  collAmount: number;
  collCount: number;
  cumDemand: number;
  cumCollection: number;
}

export interface DemandVsCollectionData {
  message: string;
  view: ReportView;
  summary: ReportSummary;
  rows: GroupRow[];
  memberRows: MemberRow[];
  dateRows: DateRow[];
}

export interface SelectOption {
  label: string;
  value: number;
}

export interface Crumb {
  label: string;
  level: "all" | "branch" | "sahayika" | "group";
}

export interface DemandVsCollectionProps {
  form: import("react-hook-form").UseFormReturn<DemandVsCollectionForm>;
  loading: boolean;
  isHead: boolean;
  branchName: string;
  branchOptions: SelectOption[];
  sahayikaOptions: SelectOption[];
  groupOptions: SelectOption[];
  branchLoading: boolean;
  sahayikaLoading: boolean;
  groupLoading: boolean;
  sahayikaDisabled: boolean;
  groupDisabled: boolean;
  report: DemandVsCollectionData | null;
  view: ReportView;
  crumbs: Crumb[];
  onShow: (values: DemandVsCollectionForm) => void;
  onPreset: (preset: "month" | "lastMonth" | "fy") => void;
  onViewChange: (view: ReportView) => void;
  onDrill: (row: GroupRow) => void;
  onCrumb: (level: Crumb["level"]) => void;
  onBranchChange: (value: number) => void;
  onSahayikaChange: (value: number) => void;
}
