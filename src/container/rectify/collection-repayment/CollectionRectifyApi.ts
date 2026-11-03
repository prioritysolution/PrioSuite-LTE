/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, isValid } from "date-fns";
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  KeyValue,
  RectifyChange,
  RectifyCollection,
  RectifyHistoryRow,
  RectifyLogChange,
  RectifyLogDetails,
  RectifyLogRow,
  RectifyResult,
  TargetLoan,
  VoucherLine,
} from "./CollectionRectifyType";

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export const getGroupListAPI = (orgId: number, branchId: number) =>
  doGetApiCall({ url: endPoints.getAllGroupList(orgId, branchId) });

export const getSahayikaListAPI = (orgId: number, branchId: number) =>
  doGetApiCall({ url: endPoints.getSahayikaList(orgId, branchId) });

export const getCollectionListAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  group_id?: number;
  voucher_no?: string;
  page?: number;
  per_page?: number;
}) =>
  doGetApiCall({ url: endPoints.getCollRectifyList(buildQuery(params)) });

export const getCollectionDetailsAPI = (
  orgId: number,
  branchId: number,
  collId: number,
) =>
  doGetApiCall({
    url: endPoints.getCollRectifyDetails(
      buildQuery({ org_id: orgId, branch_id: branchId, coll_id: collId }),
    ),
  });

export const getTargetLoansAPI = (params: {
  org_id: number;
  branch_id: number;
  coll_id: number;
  group_id?: number;
  search?: string;
  coll_date?: string;
}) =>
  doGetApiCall({ url: endPoints.getCollRectifyLoans(buildQuery(params)) });

export const postCollectionRectifyAPI = (body: {
  org_id: number;
  branch_id: number;
  coll_id: number;
  reason: string;
  account_id?: number;
  coll_amount?: number;
  penal_amount?: number;
  coll_date?: string;
  co_id?: number;
}) => doPostApiCall({ url: endPoints.postCollRectify, bodyData: body });

export const deleteCollectionAPI = (body: {
  org_id: number;
  branch_id: number;
  coll_id: number;
}) => doPostApiCall({ url: endPoints.deleteCollRectify, bodyData: body });

export const getRectifyHistoryAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  coll_id?: number;
}) =>
  doGetApiCall({ url: endPoints.getRectifyHistory(buildQuery(params)) });

export const getRectifyLogAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  result?: number;
  coll_id?: number;
  log_id?: number;
}) => doGetApiCall({ url: endPoints.getRectifyLog(buildQuery(params)) });

export const getRectifyLogDetailsAPI = (
  orgId: number,
  branchId: number,
  logId: number,
) =>
  doGetApiCall({
    url: endPoints.getRectifyLogDetails(
      buildQuery({ org_id: orgId, branch_id: branchId, log_id: logId }),
    ),
  });

export const extractList = (res: any): any[] => {
  const candidates = [res?.Data, res?.data?.Data, res?.data, res];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

export const flattenDetails = (details: unknown): string => {
  if (details === null || details === undefined || details === "") return "";
  if (typeof details === "string") return details;
  if (Array.isArray(details)) {
    return details.map((item) => flattenDetails(item)).filter(Boolean).join(", ");
  }
  if (typeof details === "object") {
    return Object.values(details as Record<string, unknown>)
      .map((item) => flattenDetails(item))
      .filter(Boolean)
      .join(" ");
  }
  return String(details);
};

export const toAmount = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

export const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value).trim();

export const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const toApiDate = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

export const todayNoon = () => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date;
};

export const formatDisplayDate = (value: string) => {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  const date = new Date(value);
  return isValid(date) ? format(date, "dd-MM-yyyy") : value;
};

export const formatDisplayDateTime = (value: string) => {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (match) return `${match[3]}-${match[2]}-${match[1]} ${match[4]}:${match[5]}`;
  return formatDisplayDate(value);
};

const accountLabel = (accountNo: unknown, accountId: unknown) =>
  text(accountNo) || (toAmount(accountId) ? `#${toAmount(accountId)}` : "");

export const mapCollection = (item: any): RectifyCollection => ({
  collId: toAmount(item?.Coll_Id),
  collDate: text(item?.Coll_Date),
  voucherId: toAmount(item?.Voucher_Id),
  voucherNo: text(item?.Voucher_No),
  refVouNo: text(item?.Ref_Vou_No),
  isBulkVoucher: Number(item?.Is_Bulk_Voucher) === 1,
  canChangeDate: Number(item?.Can_Change_Date) === 1,
  batchId: toAmount(item?.Batch_Id),
  accountId: toAmount(item?.Account_Id),
  accountLabel: accountLabel(item?.Account_No, item?.Account_Id),
  loanCycle: text(item?.Loan_Cycle),
  memberId: toAmount(item?.Member_Id),
  memberNo: text(item?.Member_No),
  memberName: text(item?.Member_Name),
  guardianName: text(item?.Guardian_Name),
  groupId: toAmount(item?.Group_Id),
  groupNo: text(item?.Group_No),
  groupName: text(item?.Group_Name),
  coId:
    item?.CO_Id === null || item?.CO_Id === undefined || item?.CO_Id === ""
      ? null
      : toAmount(item.CO_Id),
  coName: text(item?.CO_Name),
  branchName: text(item?.Branch_Name),
  collAmount: toAmount(item?.Coll_Amount),
  prnAmount: toAmount(item?.Prn_Amount),
  inttAmount: toAmount(item?.Intt_Amount),
  penalAmount: toAmount(item?.Penal_Amount),
  outsAfterColl: toAmount(item?.Outs_After_Coll),
  rectifyCount: toAmount(item?.Rectify_Count),
  lastRectifiedOn: text(item?.Last_Rectified_On),
});

export const mapVoucherLines = (list: unknown): VoucherLine[] =>
  (Array.isArray(list) ? list : [])
    .filter((item) => item && typeof item === "object")
    .map((item: any) => ({
      voucherNo: text(item?.Voucher_No),
      transType: text(item?.Trans_Type).toUpperCase(),
      glAccountName: text(item?.GlAccount_Name),
      drAmount: toAmount(item?.Dr_Amount),
      crAmount: toAmount(item?.Cr_Amount),
      remarks: text(item?.Remarks),
    }));

const historyChange = (
  label: string,
  oldValue: string,
  newValue: string,
): RectifyChange | null =>
  oldValue === newValue ? null : { label, oldValue: oldValue || "—", newValue: newValue || "—" };

const memberText = (item: any, side: "Old" | "New") =>
  [
    text(item?.[`${side}_Member_Name`]),
    text(item?.[`${side}_Member_No`]) ? `(${text(item[`${side}_Member_No`])})` : "",
  ]
    .filter(Boolean)
    .join(" ");

const groupText = (item: any, side: "Old" | "New") =>
  [
    text(item?.[`${side}_Group_Name`]),
    text(item?.[`${side}_Group_No`]) ? `(${text(item[`${side}_Group_No`])})` : "",
  ]
    .filter(Boolean)
    .join(" ");

const moneyText = (value: unknown) => formatMoney(toAmount(value));

export const mapHistory = (list: unknown): RectifyHistoryRow[] =>
  (Array.isArray(list) ? list : []).map((item: any) => ({
    rectifyId: toAmount(item?.Rectify_Id),
    collId: toAmount(item?.Coll_Id),
    voucherNo: text(item?.Voucher_No),
    rectifiedOn: text(item?.Rectified_On),
    rectifiedBy: text(item?.Rectified_By),
    reason: text(item?.Reason),
    changes: [
      historyChange(
        "Date",
        formatDisplayDate(text(item?.Old_Coll_Date)),
        formatDisplayDate(text(item?.New_Coll_Date)),
      ),
      historyChange(
        "Account",
        accountLabel(item?.Old_Account_No, item?.Old_Account_Id),
        accountLabel(item?.New_Account_No, item?.New_Account_Id),
      ),
      historyChange("Member", memberText(item, "Old"), memberText(item, "New")),
      historyChange("Group", groupText(item, "Old"), groupText(item, "New")),
      historyChange("Sahayika", text(item?.Old_CO_Name), text(item?.New_CO_Name)),
      historyChange(
        "Amount",
        moneyText(item?.Old_Coll_Amount),
        moneyText(item?.New_Coll_Amount),
      ),
      historyChange(
        "Principal",
        moneyText(item?.Old_Prn_Amount),
        moneyText(item?.New_Prn_Amount),
      ),
      historyChange(
        "Interest",
        moneyText(item?.Old_Intt_Amount),
        moneyText(item?.New_Intt_Amount),
      ),
      historyChange(
        "Penal",
        moneyText(item?.Old_Penal_Amount),
        moneyText(item?.New_Penal_Amount),
      ),
    ].filter((change): change is RectifyChange => change !== null),
  }));

export const mapTargetLoan = (item: any): TargetLoan => ({
  accountId: toAmount(item?.Account_Id),
  accountLabel: accountLabel(item?.Account_No, item?.Account_Id),
  loanCycle: text(item?.Loan_Cycle),
  loanDate: text(item?.Loan_Date),
  loanAmount: toAmount(item?.Loan_Amount),
  installmentAmt: toAmount(item?.Installment_Amt),
  memberId: toAmount(item?.Member_Id),
  memberNo: text(item?.Member_No),
  memberName: text(item?.Member_Name),
  guardianName: text(item?.Guardian_Name),
  groupId: toAmount(item?.Group_Id),
  groupNo: text(item?.Group_No),
  groupName: text(item?.Group_Name),
  coName: text(item?.CO_Name),
  isCurrent: Number(item?.Is_Current) === 1,
  balanceOnDate: toAmount(item?.Balance_On_Date),
  demandOnDate: toAmount(item?.Demand_On_Date),
  maxCollAmount: toAmount(item?.Max_Coll_Amount),
});

export const LOG_RESULT_OPTIONS = [
  { label: "Success", value: 1 },
  { label: "Rejected", value: 0 },
  { label: "Invalid data", value: 2 },
  { label: "System error", value: 3 },
];

export const LOG_RESULT_NAMES: Record<number, string> = Object.fromEntries(
  LOG_RESULT_OPTIONS.map((option) => [option.value, option.label]),
);

const parseJson = (value: unknown): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
};

const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const mapLogRow = (item: any): RectifyLogRow => {
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
    collId: toAmount(item?.Coll_Id),
    voucherNo: text(item?.Voucher_No),
    batchId: toAmount(item?.Batch_Id),
    oldAccount: accountLabel(item?.Old_Account_No, item?.Old_Account_Id),
    oldMemberName: text(item?.Old_Member_Name),
    newAccount: accountLabel(item?.New_Account_No, item?.New_Account_Id),
    newMemberName: text(item?.New_Member_Name),
    rectifyId: toAmount(item?.Rectify_Id),
    reason: text(item?.Reason),
    changeCount: toAmount(item?.Change_Count),
  };
};

/** Flattens one level of nesting so `split_used.source` shows as its own row. */
export const toKeyValues = (value: unknown): KeyValue[] => {
  const data = parseJson(value);
  if (!data || typeof data !== "object") {
    return data === null || data === undefined || data === ""
      ? []
      : [{ key: "value", value: displayValue(data) }];
  }
  return Object.entries(data as Record<string, unknown>).flatMap(([key, item]) => {
    const parsed = parseJson(item);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.entries(parsed as Record<string, unknown>).map(
        ([childKey, childValue]) => ({
          key: `${key}.${childKey}`,
          value: displayValue(childValue),
        }),
      );
    }
    return [{ key, value: displayValue(parsed) }];
  });
};

const diffData = (oldValue: unknown, newValue: unknown): RectifyChange[] => {
  const oldData = parseJson(oldValue);
  const newData = parseJson(newValue);

  if (Array.isArray(oldData) || Array.isArray(newData)) {
    const oldList = Array.isArray(oldData) ? oldData : [];
    const newList = Array.isArray(newData) ? newData : [];
    const length = Math.max(oldList.length, newList.length);
    return Array.from({ length }, (_, index) => ({
      label: `#${index + 1}`,
      oldValue: displayValue(oldList[index]),
      newValue: displayValue(newList[index]),
    })).filter((change) => change.oldValue !== change.newValue);
  }

  const oldRecord =
    oldData && typeof oldData === "object" ? (oldData as Record<string, unknown>) : {};
  const newRecord =
    newData && typeof newData === "object" ? (newData as Record<string, unknown>) : {};
  const keys = Array.from(
    new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]),
  );
  return keys
    .map((key) => ({
      label: key,
      oldValue: displayValue(oldRecord[key]),
      newValue: displayValue(newRecord[key]),
    }))
    .filter((change) => change.oldValue !== change.newValue);
};

export const mapLogChanges = (value: unknown): RectifyLogChange[] => {
  const list = parseJson(value);
  return (Array.isArray(list) ? list : [])
    .filter((item) => item && typeof item === "object")
    .map((item: any) => ({
      seqNo: toAmount(item?.Seq_No),
      title: text(item?.Record_Desc) || text(item?.Table_Name),
      tableName: text(item?.Table_Name),
      recordId: text(item?.Record_Id),
      diffs: diffData(item?.Old_Data, item?.New_Data),
    }))
    .sort((a, b) => a.seqNo - b.seqNo);
};

export const mapLogDetails = (res: any): RectifyLogDetails | null => {
  const raw = Array.isArray(res?.Data) ? res.Data[0] : res?.Data;
  if (!raw || typeof raw !== "object") return null;
  return {
    log: mapLogRow(raw),
    request: toKeyValues(raw?.Request_Data),
    response: toKeyValues(raw?.Response_Data),
    changes: mapLogChanges(res?.Changes ?? raw?.Change_Data),
  };
};

export const mapResult = (res: any): RectifyResult => {
  const data = res?.Data ?? {};
  return {
    message:
      flattenDetails(res?.details) ||
      text(data?.Message) ||
      "Loan Collection Rectified Successfully !!",
    voucherNo: text(data?.Voucher_No),
    collDate: text(data?.Coll_Date),
    collAmount: toAmount(data?.Coll_Amount),
    prnAmount: toAmount(data?.Prn_Amount),
    inttAmount: toAmount(data?.Intt_Amount),
    penalAmount: toAmount(data?.Penal_Amount),
    oldAccountOuts: toAmount(data?.Old_Account_Outs),
    newAccountOuts: toAmount(data?.New_Account_Outs),
    accountChanged:
      toAmount(data?.Old_Account_Id) !== toAmount(data?.New_Account_Id),
    voucher: mapVoucherLines(res?.Voucher),
  };
};
