export const OPENING_ENTRY_DATE = "2026-03-31";
export const OPENING_ENTRY_DATE_LABEL = "31-03-2026";
export const REASON_MAX_LENGTH = 200;

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
