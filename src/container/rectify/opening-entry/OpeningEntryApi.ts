/* eslint-disable @typescript-eslint/no-explicit-any */
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  extractList,
  flattenDetails,
  LOG_RESULT_NAMES,
  mapLogChanges,
  text,
  toAmount,
  toKeyValues,
} from "../collection-repayment/CollectionRectifyApi";
import {
  LoanChoice,
  OpeningEntry,
  OpeningEntryLogDetails,
  OpeningEntryLogRow,
  OpeningSaveResult,
  OpeningScheduleSummary,
} from "./OpeningEntryType";

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

const pick = (item: any, keys: string[]) => {
  if (!item || typeof item !== "object") return undefined;
  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return undefined;
};

const accountLabel = (accountNo: unknown, accountId: unknown) =>
  text(accountNo) || (toAmount(accountId) ? `#${toAmount(accountId)}` : "");

export const emptySchedule = (): OpeningScheduleSummary => ({
  pendingInstCount: 0,
  pendingPrincipal: 0,
  pendingInterest: 0,
  pendingDemand: 0,
  instAmount: 0,
  nextDueDate: "",
  scheduleUpdated: false,
  rowsUpdated: 0,
});

export const mapSchedule = (item: any): OpeningScheduleSummary => ({
  pendingInstCount: toAmount(
    pick(item, [
      "Pending_Inst_Count",
      "pending_inst_count",
      "Pending_Count",
      "Schedule_Pending_Count",
    ]),
  ),
  pendingPrincipal: toAmount(
    pick(item, [
      "Pending_Principal",
      "pending_principal",
      "Pending_Prn",
      "Schedule_Pending_Principal",
    ]),
  ),
  pendingInterest: toAmount(
    pick(item, [
      "Pending_Interest",
      "pending_interest",
      "Pending_Intt",
      "Schedule_Pending_Interest",
    ]),
  ),
  pendingDemand: toAmount(
    pick(item, [
      "Pending_Demand",
      "pending_demand",
      "Schedule_Pending_Demand",
      "Pending_Amount",
    ]),
  ),
  instAmount: toAmount(
    pick(item, ["Inst_Amt", "Inst_Amount", "inst_amount", "Emi_Amount"]),
  ),
  nextDueDate: text(
    pick(item, ["Next_Due_Date", "next_due_date", "Next_Inst_Date"]),
  ),
  scheduleUpdated:
    Number(
      pick(item, ["Schedule_Updated", "schedule_updated", "Schedule_Changed"]) ??
        0,
    ) === 1,
  rowsUpdated: toAmount(
    pick(item, [
      "Schedule_Rows_Updated",
      "schedule_rows_updated",
      "Rows_Updated",
      "Pending_Rows_Updated",
    ]),
  ),
});

/** Keep principal/demand in step with the opening-balance delta for UI preview. */
export const projectSchedule = (
  schedule: OpeningScheduleSummary,
  openingDelta: number,
): OpeningScheduleSummary => {
  const pendingPrincipal = Math.max(
    0,
    Math.round((schedule.pendingPrincipal + openingDelta) * 100) / 100,
  );
  const pendingDemand = Math.max(
    0,
    Math.round(
      (schedule.pendingDemand -
        schedule.pendingPrincipal +
        pendingPrincipal) *
        100,
    ) / 100,
  );
  return {
    ...schedule,
    pendingPrincipal,
    pendingDemand,
    scheduleUpdated: openingDelta !== 0,
  };
};

export const getOpeningGroupsAPI = (orgId: number, branchId: number) =>
  doGetApiCall({ url: endPoints.getAllGroupList(orgId, branchId) });

export const getOpeningMembersAPI = (orgId: number, groupId: number) =>
  doGetApiCall({ url: endPoints.getGroupMemberList(orgId, groupId) });

export const getOpeningLoansAPI = (
  orgId: number,
  branchId: number,
  groupId: number,
  memberId: number,
) =>
  doGetApiCall({
    url: endPoints.getLoanCycleList(orgId, branchId, groupId, memberId),
  });

export const getOpeningEntryAPI = (params: {
  org_id: number;
  branch_id: number;
  group_id: number;
  member_id: number;
  account_id?: number;
  loan_cycle?: string;
}) => doGetApiCall({ url: endPoints.getOpeningEntry(buildQuery(params)) });

export const postOpeningEntryAPI = (body: {
  org_id: number;
  branch_id: number;
  group_id: number;
  member_id: number;
  account_id: number;
  loan_cycle: string;
  opening_date: string;
  opening_balance: number;
  reason: string;
}) => doPostApiCall({ url: endPoints.postOpeningEntry, bodyData: body });

export const getOpeningEntryLogAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  result?: number;
  account_id?: number;
}) => doGetApiCall({ url: endPoints.getOpeningEntryLog(buildQuery(params)) });

export const getOpeningEntryLogDetailsAPI = (
  orgId: number,
  branchId: number,
  logId: number,
) =>
  doGetApiCall({
    url: endPoints.getOpeningEntryLogDetails(
      buildQuery({ org_id: orgId, branch_id: branchId, log_id: logId }),
    ),
  });

export const mapMembers = (res: unknown) => {
  const seen = new Set<string>();
  return extractList(res)
    .map((item) => {
      const value = toAmount(
        pick(item, ["Member_Id", "Mem_Id", "member_id"]),
      );
      const name = text(pick(item, ["Member_Name", "Mem_Name", "member_name"]));
      const memberNo = text(pick(item, ["Member_No", "Mem_No", "member_no"]));
      const label = [name, memberNo ? `(${memberNo})` : ""].filter(Boolean).join(" ");
      return { label, value };
    })
    .filter((item) => {
      if (!item.label || item.value <= 0 || seen.has(String(item.value))) return false;
      seen.add(String(item.value));
      return true;
    });
};

export const mapLoans = (res: unknown): LoanChoice[] => {
  const seen = new Set<string>();
  return extractList(res)
    .map((item) => {
      const accountId = toAmount(
        pick(item, ["Account_Id", "Acc_Id", "account_id", "Loan_Acc_Id"]),
      );
      const loanCycle = text(pick(item, ["Loan_Cycle", "Ln_Cycle", "loan_cycle"]));
      const accountNo = text(
        pick(item, ["Account_No", "Acc_No", "account_no", "Loan_Account_No"]),
      );
      const loanDate = text(pick(item, ["Loan_Date", "loan_date", "Disb_Date"]));
      const key = accountId > 0 ? String(accountId) : loanCycle ? `c:${loanCycle}` : "";
      const label = [
        loanCycle ? `Cycle ${loanCycle}` : "",
        accountNo ? `A/c ${accountNo}` : accountId ? `A/c #${accountId}` : "",
        loanDate ? loanDate.slice(0, 10) : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return { key, label: label || key, accountId, loanCycle, accountNo, loanDate };
    })
    .filter((item) => {
      if (!item.key || seen.has(item.key)) return false;
      seen.add(item.key);
      return true;
    });
};

const looksLikeEntry = (item: any) =>
  item &&
  typeof item === "object" &&
  !Array.isArray(item) &&
  (pick(item, ["Opening_Balance", "opening_balance", "Opn_Balance", "Opn_Bal"]) !==
    undefined ||
    pick(item, [
      "Current_Balance",
      "current_balance",
      "Outstanding",
      "Outs_Amount",
      "Balance",
    ]) !== undefined);

export const unwrapEntry = (res: any) =>
  [res?.Data, res?.data?.Data, res?.details, res?.data, res].find(looksLikeEntry) ??
  null;

export const mapOpeningEntry = (res: any): OpeningEntry | null => {
  const item = unwrapEntry(res);
  if (!item) return null;
  const scheduleSource = res?.Schedule ?? item?.Schedule ?? item;
  return {
    accountId: toAmount(pick(item, ["Account_Id", "Acc_Id", "account_id"])),
    loanCycle: text(pick(item, ["Loan_Cycle", "Ln_Cycle", "loan_cycle"])),
    accountNo: text(pick(item, ["Account_No", "Acc_No", "account_no"])),
    loanDate: text(pick(item, ["Loan_Date", "loan_date"])),
    groupId: toAmount(pick(item, ["Group_Id", "group_id"])),
    groupName: text(pick(item, ["Group_Name", "group_name"])),
    groupNo: text(pick(item, ["Group_No", "group_no"])),
    memberId: toAmount(pick(item, ["Member_Id", "Mem_Id", "member_id"])),
    memberName: text(pick(item, ["Member_Name", "Mem_Name", "member_name"])),
    memberNo: text(pick(item, ["Member_No", "Mem_No", "member_no"])),
    openingBalance: toAmount(
      pick(item, ["Opening_Balance", "opening_balance", "Opn_Balance", "Opn_Bal"]),
    ),
    currentBalance: toAmount(
      pick(item, [
        "Current_Balance",
        "current_balance",
        "Outstanding",
        "Outs_Amount",
        "Balance",
      ]),
    ),
    schedule: mapSchedule(scheduleSource),
  };
};

export const mapOpeningSaveResult = (res: any): OpeningSaveResult => {
  const data = res?.Data ?? {};
  const scheduleSource = res?.Schedule ?? data?.Schedule ?? data;
  return {
    message:
      flattenDetails(res?.details) ||
      text(data?.Message) ||
      "Opening balance updated. Pending loan schedule recalculated.",
    accountId: toAmount(pick(data, ["Account_Id", "account_id"])),
    accountNo: text(pick(data, ["Account_No", "account_no"])),
    loanCycle: text(pick(data, ["Loan_Cycle", "loan_cycle"])),
    oldOpeningBalance: toAmount(
      pick(data, ["Old_Opening_Balance", "old_opening_balance"]),
    ),
    newOpeningBalance: toAmount(
      pick(data, ["New_Opening_Balance", "Opening_Balance", "opening_balance"]),
    ),
    oldCurrentBalance: toAmount(
      pick(data, ["Old_Current_Balance", "old_current_balance"]),
    ),
    newCurrentBalance: toAmount(
      pick(data, [
        "New_Current_Balance",
        "Current_Balance",
        "current_balance",
        "Outstanding",
      ]),
    ),
    schedule: mapSchedule(scheduleSource),
  };
};

export const mapOpeningLogRow = (item: any): OpeningEntryLogRow => {
  const result = toAmount(item?.Result);
  return {
    logId: toAmount(item?.Log_Id),
    result,
    resultName: text(item?.Result_Name) || LOG_RESULT_NAMES[result] || "",
    errorNo: toAmount(item?.Error_No),
    message: text(item?.Message),
    createdOn: text(item?.Created_On),
    durationMs: toAmount(item?.Duration_Ms),
    userName: text(item?.User_Name),
    branchName: text(item?.Branch_Name),
    ipAddress: text(item?.Ip_Address),
    userAgent: text(item?.User_Agent),
    voucherNo: text(item?.Voucher_No),
    rectifyId: toAmount(item?.Rectify_Id),
    reason: text(item?.Reason),
    changeCount: toAmount(item?.Change_Count),
    accountId: toAmount(item?.Account_Id),
    accountLabel: accountLabel(item?.Account_No, item?.Account_Id),
    memberName: text(item?.Member_Name),
    groupName: text(item?.Group_Name),
    loanCycle: text(item?.Loan_Cycle),
    oldOpeningBalance: toAmount(item?.Old_Opening_Balance),
    newOpeningBalance: toAmount(item?.New_Opening_Balance),
    oldCurrentBalance: toAmount(item?.Old_Current_Balance),
    newCurrentBalance: toAmount(item?.New_Current_Balance),
    scheduleRowsUpdated: toAmount(
      item?.Schedule_Rows_Updated ?? item?.Rows_Updated,
    ),
  };
};

/** API / DB field keys → labels shown in Activity Log details. */
const OPENING_LOG_LABELS: Record<string, string> = {
  org_id: "Organization",
  Org_Id: "Organization",
  branch_id: "Branch",
  Branch_Id: "Branch",
  group_id: "Group",
  Group_Id: "Group",
  member_id: "Member",
  Member_Id: "Member",
  account_id: "Loan Account",
  Account_Id: "Loan Account",
  Account_No: "Account No",
  account_no: "Account No",
  loan_cycle: "Loan Cycle",
  Loan_Cycle: "Loan Cycle",
  opening_date: "Opening Date",
  Opening_Date: "Opening Date",
  opening_balance: "Opening Balance",
  Opening_Balance: "Opening Balance",
  reason: "Reason",
  Reason: "Reason",
  Message: "Message",
  message: "Message",
  Old_Opening_Balance: "Old Opening Balance",
  old_opening_balance: "Old Opening Balance",
  New_Opening_Balance: "New Opening Balance",
  new_opening_balance: "New Opening Balance",
  Old_Current_Balance: "Old Current Balance",
  old_current_balance: "Old Current Balance",
  New_Current_Balance: "New Current Balance",
  new_current_balance: "New Current Balance",
  Current_Balance: "Current Balance",
  current_balance: "Current Balance",
  Outstanding: "Outstanding",
  Schedule_Updated: "Schedule Updated",
  schedule_updated: "Schedule Updated",
  Schedule_Changed: "Schedule Updated",
  Schedule_Rows_Updated: "Schedule Rows Updated",
  schedule_rows_updated: "Schedule Rows Updated",
  Rows_Updated: "Schedule Rows Updated",
  Pending_Rows_Updated: "Schedule Rows Updated",
  Pending_Inst_Count: "Pending Installments",
  pending_inst_count: "Pending Installments",
  Pending_Count: "Pending Installments",
  Schedule_Pending_Count: "Pending Installments",
  Pending_Principal: "Pending Principal",
  pending_principal: "Pending Principal",
  Pending_Prn: "Pending Principal",
  Schedule_Pending_Principal: "Pending Principal",
  Pending_Interest: "Pending Interest",
  pending_interest: "Pending Interest",
  Pending_Intt: "Pending Interest",
  Schedule_Pending_Interest: "Pending Interest",
  Pending_Demand: "Pending Demand",
  pending_demand: "Pending Demand",
  Schedule_Pending_Demand: "Pending Demand",
  Pending_Amount: "Pending Demand",
  Inst_Amt: "Installment Amount",
  Inst_Amount: "Installment Amount",
  inst_amount: "Installment Amount",
  Emi_Amount: "Installment Amount",
  Next_Due_Date: "Next Due Date",
  next_due_date: "Next Due Date",
  Next_Inst_Date: "Next Due Date",
  Error_No: "Error No",
  error_no: "Error No",
  Rectify_Id: "Correction",
  rectify_id: "Correction",
  Voucher_No: "Voucher",
  voucher_no: "Voucher",
  Loan_Account: "Loan Account",
  Loan_Schedule: "Loan Schedule",
};

const YES_NO_KEYS = new Set([
  "schedule_updated",
  "schedule_changed",
  "scheduleupdated",
]);

const normalizeLogKey = (key: string) =>
  key
    .split(".")
    .pop()!
    .trim();

const humanizeLogKey = (key: string) =>
  normalizeLogKey(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const openingLogFieldLabel = (key: string) => {
  const leaf = normalizeLogKey(key);
  return (
    OPENING_LOG_LABELS[key] ||
    OPENING_LOG_LABELS[leaf] ||
    OPENING_LOG_LABELS[leaf.toLowerCase()] ||
    humanizeLogKey(key)
  );
};

const openingLogFieldValue = (key: string, value: string) => {
  const leaf = normalizeLogKey(key).replace(/[_-]/g, "").toLowerCase();
  if (YES_NO_KEYS.has(leaf)) {
    if (value === "1" || /^true$/i.test(value)) return "Yes";
    if (value === "0" || /^false$/i.test(value)) return "No";
  }
  return value;
};

const mapOpeningLogKeyValues = (rows: ReturnType<typeof toKeyValues>) =>
  rows.map((row) => ({
    key: openingLogFieldLabel(row.key),
    value: openingLogFieldValue(row.key, row.value),
  }));

const mapOpeningLogChangeLabels = (
  changes: ReturnType<typeof mapLogChanges>,
) =>
  changes.map((change) => ({
    ...change,
    title: openingLogFieldLabel(change.title || change.tableName),
    tableName: openingLogFieldLabel(change.tableName),
    diffs: change.diffs.map((diff) => ({
      ...diff,
      label: openingLogFieldLabel(diff.label),
      oldValue: openingLogFieldValue(diff.label, diff.oldValue),
      newValue: openingLogFieldValue(diff.label, diff.newValue),
    })),
  }));

export const mapOpeningLogDetails = (res: any): OpeningEntryLogDetails | null => {
  const raw = Array.isArray(res?.Data) ? res.Data[0] : res?.Data;
  if (!raw || typeof raw !== "object") return null;
  return {
    log: mapOpeningLogRow(raw),
    request: mapOpeningLogKeyValues(toKeyValues(raw?.Request_Data)),
    response: mapOpeningLogKeyValues(toKeyValues(raw?.Response_Data)),
    changes: mapOpeningLogChangeLabels(
      mapLogChanges(res?.Changes ?? raw?.Change_Data),
    ),
  };
};

export const responseMessage = (res: any, fallback: string) =>
  flattenDetails(res?.details) ||
  text(res?.Data?.Message) ||
  text(res?.message) ||
  fallback;

export const isFailedResponse = (res: any) => {
  const errorNo = Number(res?.Data?.Error_No ?? res?.Error_No ?? 0);
  return /error found/i.test(String(res?.message || "")) || errorNo < 0;
};
