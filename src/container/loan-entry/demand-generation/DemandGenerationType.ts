import { UseFormReturn } from "react-hook-form";

export const ALL_SAHAYIKA = "all";

export interface DemandGenerationForm {
  demand_date: Date | null;
  co_id: number | typeof ALL_SAHAYIKA | "";
}

export interface SelectOption {
  label: string;
  value: number | string;
}

export interface GenerateResult {
  message: string;
  demandDate: string;
  accountCount: number;
  installmentCount: number;
  groupCount: number;
  collDayGroupCount: number;
  currentDemand: number;
  arrearDemand: number;
  totalDemand: number;
}

export type DemandLevel = "co" | "group" | "member" | "emi";

export interface DemandAmounts {
  currentDemand: number;
  arrearDemand: number;
  totalDemand: number;
  prnDue: number;
  intDue: number;
  outstanding: number;
  prnOutstanding: number;
  intOutstanding: number;
}

export interface DemandCoRow extends DemandAmounts {
  coId: number;
  coName: string;
  groupCount: number;
  memberCount: number;
  accountCount: number;
}

export interface DemandGroupRow extends DemandAmounts {
  coId: number;
  coName: string;
  groupId: number;
  groupNo: string;
  groupName: string;
  collectionDay: string;
  collDayDate: string;
  memberCount: number;
  accountCount: number;
}

export interface DemandMemberRow extends DemandAmounts {
  groupNo: string;
  groupName: string;
  memberId: number;
  memberNo: string;
  memberName: string;
  guardianName: string;
  accountId: number;
  accountLabel: string;
  loanCycle: string;
  instlAmount: number;
  emiPrincipal: number;
  emiInterest: number;
  totalEmi: number;
  paidEmi: number;
  remainingEmi: number;
  dueEmi: number;
  instlNo: string;
  dueDate: string;
  collectionDay: string;
  collDayDate: string;
}

export interface DemandEmiRow {
  emiNo: string;
  dueDate: string;
  openingPrincipal: number;
  emiAmount: number;
  emiPrincipal: number;
  emiInterest: number;
  paidAmount: number;
  prnDue: number;
  intDue: number;
  emiDue: number;
  closingPrincipal: number;
  demandType: string;
}

export interface DemandSummary {
  currentDemand: number;
  arrearDemand: number;
  totalDemand: number;
  outstanding: number;
  prnOutstanding: number;
  intOutstanding: number;
}

export type DemandReportData =
  | { level: "co"; rows: DemandCoRow[]; summary: DemandSummary | null }
  | { level: "group"; rows: DemandGroupRow[]; summary: DemandSummary | null }
  | { level: "member"; rows: DemandMemberRow[]; summary: DemandSummary | null }
  | { level: "emi"; rows: DemandEmiRow[]; summary: DemandSummary | null };

export interface DemandReportScope {
  demandDate: string;
  coId: number | null;
  version: number;
}

export interface DemandDrill {
  co: { id: number; name: string } | null;
  group: { id: number; name: string } | null;
  account: { id: number; label: string; memberName: string } | null;
}

export interface DemandGenerationState {
  result: GenerateResult | null;
  loading: boolean;
}

export interface DemandGenerationProps {
  form: UseFormReturn<DemandGenerationForm>;
  coOptions: SelectOption[];
  coLoading: boolean;
  generating: boolean;
  result: GenerateResult | null;
  preview: GenerateResult | null;
  previewReady: boolean;
  previewing: boolean;
  onSave: () => void;
  scope: DemandReportScope | null;
  drill: DemandDrill;
  level: DemandLevel;
  report: DemandReportData | null;
  reportLoading: boolean;
  reportError: string;
  onSelectCo: (row: DemandCoRow) => void;
  onSelectGroup: (row: DemandGroupRow) => void;
  onSelectAccount: (row: DemandMemberRow) => void;
  onNavigate: (level: DemandLevel) => void;
  onGenerate: (values: DemandGenerationForm) => void;
  onReset: () => void;
  onSelectionChange: () => void;
  regenerateOpen: boolean;
  onConfirmRegenerate: () => void;
  onCancelRegenerate: () => void;
  onViewExisting: () => void;
}
