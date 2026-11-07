import { UseFormReturn } from "react-hook-form";
import {
  LogSearchForm,
  RectifyLogBase,
  RectifyLogDetailsOf,
} from "../collection-repayment/CollectionRectifyType";

export const OPENING_ENTRY_DATE = "2026-03-31";
export const OPENING_ENTRY_DATE_LABEL = "31-03-2026";
export const REASON_MAX_LENGTH = 200;

export type OpeningEntryTab = "edit" | "log";

export interface OpeningSearchForm {
  groupId: number | "";
  memberId: number | "";
  loanKey: string | number | "";
}

export interface SelectOption {
  label: string;
  value: number | string;
}

export interface LoanChoice {
  key: string;
  label: string;
  accountId: number;
  loanCycle: string;
  accountNo: string;
  loanDate: string;
}

/** Pending repayment schedule snapshot returned with the opening entry. */
export interface OpeningScheduleSummary {
  pendingInstCount: number;
  pendingPrincipal: number;
  pendingInterest: number;
  pendingDemand: number;
  instAmount: number;
  nextDueDate: string;
  scheduleUpdated: boolean;
  rowsUpdated: number;
}

export interface OpeningEntry {
  accountId: number;
  loanCycle: string;
  accountNo: string;
  loanDate: string;
  groupId: number;
  groupName: string;
  groupNo: string;
  memberId: number;
  memberName: string;
  memberNo: string;
  openingBalance: number;
  currentBalance: number;
  schedule: OpeningScheduleSummary;
}

export interface OpeningEditForm {
  openingBalance: string;
  reason: string;
}

export interface OpeningSearchParams {
  groupId: number;
  memberId: number;
  accountId: number;
  loanCycle: string;
  accountNo: string;
  groupLabel: string;
  memberLabel: string;
}

export interface OpeningSaveResult {
  message: string;
  accountId: number;
  accountNo: string;
  loanCycle: string;
  oldOpeningBalance: number;
  newOpeningBalance: number;
  oldCurrentBalance: number;
  newCurrentBalance: number;
  schedule: OpeningScheduleSummary;
}

export interface OpeningEntryLogRow extends RectifyLogBase {
  accountId: number;
  accountLabel: string;
  memberName: string;
  groupName: string;
  loanCycle: string;
  oldOpeningBalance: number;
  newOpeningBalance: number;
  oldCurrentBalance: number;
  newCurrentBalance: number;
  scheduleRowsUpdated: number;
}

export type OpeningEntryLogDetails = RectifyLogDetailsOf<OpeningEntryLogRow>;

export interface OpeningEntryPageProps {
  searchForm: UseFormReturn<OpeningSearchForm>;
  editForm: UseFormReturn<OpeningEditForm>;
  groupOptions: SelectOption[];
  memberOptions: SelectOption[];
  loanOptions: SelectOption[];
  groupLoading: boolean;
  memberLoading: boolean;
  loanLoading: boolean;
  groupSelected: boolean;
  memberSelected: boolean;
  searching: boolean;
  entry: OpeningEntry | null;
  entryError: string;
  hasSearched: boolean;
  openingText: string;
  reasonText: string;
  projectedCurrent: number | null;
  projectedSchedule: OpeningScheduleSummary | null;
  minOpening: number;
  currentIsNegative: boolean;
  saving: boolean;
  saveResult: OpeningSaveResult | null;
  onDismissResult: () => void;
  onSearch: () => void;
  onResetSearch: () => void;
  onSave: () => void;
}

export interface OpeningEntryLogProps {
  form: UseFormReturn<LogSearchForm>;
  rows: OpeningEntryLogRow[];
  loading: boolean;
  onSearch: () => void;
  onReset: () => void;
  onView: (logId: number) => void;
  detailsOpen: boolean;
  detailsLoading: boolean;
  details: OpeningEntryLogDetails | null;
  onCloseDetails: () => void;
}
