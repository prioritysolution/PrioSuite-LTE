/* eslint-disable @typescript-eslint/no-explicit-any */
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  extractList,
  flattenDetails,
  text,
  toAmount,
} from "../collection-repayment/CollectionRectifyApi";
import { LoanChoice, OpeningEntry } from "./OpeningEntryType";

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
