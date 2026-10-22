/* eslint-disable @typescript-eslint/no-explicit-any */
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  flattenDetails,
  formatDisplayDate,
  formatMoney,
  LOG_RESULT_NAMES,
  mapLogChanges,
  mapVoucherLines,
  text,
  toAmount,
  toKeyValues,
} from "../collection-repayment/CollectionRectifyApi";
import { RectifyChange } from "../collection-repayment/CollectionRectifyType";
import {
  ListPagination,
  LoanRectifyHistoryRow,
  LoanRectifyLogDetails,
  LoanRectifyLogRow,
  LoanRectifyResult,
  LoanTerms,
  RectifyLoan,
} from "./LoanRectifyType";

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  return query.toString();
};

export const getSchemeListAPI = (orgId: number) =>
  doGetApiCall({ url: endPoints.getScheme(orgId) });

export const getPurposeListAPI = (orgId: number) =>
  doGetApiCall({ url: endPoints.getLoanPurpose(orgId) });

export const getLoanListAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  group_id?: number;
  search?: string;
  page?: number;
}) => doGetApiCall({ url: endPoints.getLoanRectifyList(buildQuery(params)) });

export const mapPagination = (res: any): ListPagination | null => {
  const raw = res?.Pagination ?? res?.data?.Pagination;
  if (!raw || typeof raw !== "object") return null;
  const currentPage = Math.max(1, toAmount(raw.current_page));
  return {
    currentPage,
    perPage: toAmount(raw.per_page),
    total: toAmount(raw.total),
    lastPage: Math.max(currentPage, toAmount(raw.last_page)),
    from: toAmount(raw.from),
    to: toAmount(raw.to),
  };
};

export const getLoanDetailsAPI = (
  orgId: number,
  branchId: number,
  accountId: number,
) =>
  doGetApiCall({
    url: endPoints.getLoanRectifyDetails(
      buildQuery({ org_id: orgId, branch_id: branchId, account_id: accountId }),
    ),
  });

export const calcLoanTermsAPI = (params: {
  org_id: number;
  branch_id: number;
  account_id: number;
  loan_date: string;
  loan_amount: number;
  scheme_id: number;
}) =>
  doGetApiCall({ url: endPoints.calcLoanRectifyTerms(buildQuery(params)) });

export const postLoanRectifyAPI = (body: {
  org_id: number;
  branch_id: number;
  account_id: number;
  reason: string;
  loan_date?: string;
  loan_amount?: number;
  scheme_id?: number;
  purpose_id?: number;
  guarantor_name?: string;
  co_id?: number;
}) => doPostApiCall({ url: endPoints.postLoanRectify, bodyData: body });

export const getLoanHistoryAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  account_id?: number;
}) => doGetApiCall({ url: endPoints.getLoanRectifyHistory(buildQuery(params)) });

export const getLoanLogAPI = (params: {
  org_id: number;
  branch_id: number;
  from_date?: string;
  to_date?: string;
  result?: number;
  account_id?: number;
}) => doGetApiCall({ url: endPoints.getLoanRectifyLog(buildQuery(params)) });

export const getLoanLogDetailsAPI = (
  orgId: number,
  branchId: number,
  logId: number,
) =>
  doGetApiCall({
    url: endPoints.getLoanRectifyLogDetails(
      buildQuery({ org_id: orgId, branch_id: branchId, log_id: logId }),
    ),
  });

const optionalId = (value: unknown) =>
  value === null || value === undefined || value === "" || toAmount(value) === 0
    ? null
    : toAmount(value);

const accountLabel = (accountNo: unknown, accountId: unknown) =>
  text(accountNo) || (toAmount(accountId) ? `#${toAmount(accountId)}` : "");

export const mapLoan = (item: any): RectifyLoan => ({
  accountId: toAmount(item?.Account_Id),
  accountLabel: accountLabel(item?.Account_No, item?.Account_Id),
  loanCycle: text(item?.Loan_Cycle),
  loanDate: text(item?.Loan_Date),
  loanAmount: toAmount(item?.Loan_Amount),
  schemeId: toAmount(item?.Scheme_Id),
  schemeName: text(item?.Scheme_Name),
  roi: toAmount(item?.RoI),
  repayName: text(item?.Repay_Name),
  instNo: toAmount(item?.Inst_No),
  instAmount: toAmount(item?.Inst_Amt),
  realisableAmt: toAmount(item?.Realisable_Amt),
  finalDate: text(item?.Final_Date),
  purposeId: optionalId(item?.Purpose_Id),
  purposeName: text(item?.Purpose_Name),
  guarantorName: text(item?.Guarantor_Name),
  memberId: toAmount(item?.Member_Id),
  memberNo: text(item?.Member_No),
  memberName: text(item?.Member_Name),
  guardianName: text(item?.Guardian_Name),
  groupId: toAmount(item?.Group_Id),
  groupNo: text(item?.Group_No),
  groupName: text(item?.Group_Name),
  coId: optionalId(item?.CO_Id),
  coName: text(item?.CO_Name),
  branchName: text(item?.Branch_Name),
  voucherNo: text(item?.Voucher_No),
  refVouNo: text(item?.Ref_Vou_No),
  transModeName: text(item?.Trans_Mode_Name),
  voucherLoanCount: toAmount(item?.Voucher_Loan_Count),
  collCount: toAmount(item?.Coll_Count),
  firstCollDate: text(item?.First_Coll_Date),
  prnCollected: toAmount(item?.Prn_Collected),
  outstanding: toAmount(item?.Outstanding),
  canChangeTerms: Number(item?.Can_Change_Terms) === 1,
  canChangeScheme: Number(item?.Can_Change_Scheme) === 1,
  lockReason: text(item?.Lock_Reason),
  rectifyCount: toAmount(item?.Rectify_Count),
  lastRectifiedOn: text(item?.Last_Rectified_On),
});

export const mapTerms = (item: any): LoanTerms => ({
  roi: toAmount(item?.RoI),
  instNo: toAmount(item?.Inst_No),
  instAmount: toAmount(item?.Inst_Amt),
  realisableAmt: toAmount(item?.Realisable_Amt),
  finalDate: text(item?.Final_Date),
});

const historyChange = (
  label: string,
  oldValue: string,
  newValue: string,
): RectifyChange | null =>
  oldValue === newValue
    ? null
    : { label, oldValue: oldValue || "—", newValue: newValue || "—" };

const moneyText = (value: unknown) => formatMoney(toAmount(value));

export const mapLoanHistory = (list: unknown): LoanRectifyHistoryRow[] =>
  (Array.isArray(list) ? list : []).map((item: any) => ({
    rectifyId: toAmount(item?.Rectify_Id),
    accountId: toAmount(item?.Account_Id),
    accountLabel: accountLabel(item?.Account_No, item?.Account_Id),
    memberName: text(item?.Member_Name),
    voucherNo: text(item?.Voucher_No),
    rectifiedOn: text(item?.Rectified_On),
    rectifiedBy: text(item?.Rectified_By),
    reason: text(item?.Reason),
    changes: [
      historyChange(
        "Loan Date",
        formatDisplayDate(text(item?.Old_Loan_Date)),
        formatDisplayDate(text(item?.New_Loan_Date)),
      ),
      historyChange(
        "Loan Amount",
        moneyText(item?.Old_Loan_Amount),
        moneyText(item?.New_Loan_Amount),
      ),
      historyChange("Scheme", text(item?.Old_Scheme_Name), text(item?.New_Scheme_Name)),
      historyChange("RoI", text(item?.Old_RoI), text(item?.New_RoI)),
      historyChange("Installments", text(item?.Old_Inst_No), text(item?.New_Inst_No)),
      historyChange(
        "Installment Amount",
        moneyText(item?.Old_Inst_Amt),
        moneyText(item?.New_Inst_Amt),
      ),
      historyChange(
        "Realisable",
        moneyText(item?.Old_Realisable_Amt),
        moneyText(item?.New_Realisable_Amt),
      ),
      historyChange(
        "Final Date",
        formatDisplayDate(text(item?.Old_Final_Date)),
        formatDisplayDate(text(item?.New_Final_Date)),
      ),
      historyChange(
        "Purpose",
        text(item?.Old_Purpose_Name),
        text(item?.New_Purpose_Name),
      ),
      historyChange(
        "Guarantor",
        text(item?.Old_Guarantor_Name),
        text(item?.New_Guarantor_Name),
      ),
      historyChange("Sahayika", text(item?.Old_CO_Name), text(item?.New_CO_Name)),
    ].filter((change): change is RectifyChange => change !== null),
  }));

export const mapLoanLogRow = (item: any): LoanRectifyLogRow => {
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
  };
};

export const mapLoanLogDetails = (res: any): LoanRectifyLogDetails | null => {
  const raw = Array.isArray(res?.Data) ? res.Data[0] : res?.Data;
  if (!raw || typeof raw !== "object") return null;
  return {
    log: mapLoanLogRow(raw),
    request: toKeyValues(raw?.Request_Data),
    response: toKeyValues(raw?.Response_Data),
    changes: mapLogChanges(res?.Changes ?? raw?.Change_Data),
  };
};

export const mapLoanResult = (res: any): LoanRectifyResult => {
  const data = res?.Data ?? {};
  return {
    message:
      flattenDetails(res?.details) ||
      text(data?.Message) ||
      "Loan Issue Rectified Successfully !!",
    voucherNo: text(data?.Voucher_No),
    loanDate: text(data?.Loan_Date),
    loanAmount: toAmount(data?.Loan_Amount),
    schemeName: text(data?.Scheme_Name),
    outstanding: toAmount(data?.Outstanding),
    affectedLoans: toAmount(data?.Affected_Loans),
    ...mapTerms(data),
    voucher: mapVoucherLines(res?.Voucher),
  };
};
