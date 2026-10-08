/* eslint-disable @typescript-eslint/no-explicit-any */
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  DemandCollectionMember,
  DemandCollectionSummary,
} from "./DemandCollectionType";

export const getSahayikaListAPI = (orgId: number, branchId: number) =>
  doGetApiCall({ url: endPoints.getSahayikaList(orgId, branchId) });

export const getSahayikaGroupListAPI = (
  orgId: number,
  branchId: number,
  coId: number,
) => doGetApiCall({ url: endPoints.getSahayikaGroupList(orgId, branchId, coId) });

export const getDemandCollectionDetailsAPI = (
  orgId: number,
  branchId: number,
  collDate: string,
  groupId: number,
) =>
  doGetApiCall({
    url: endPoints.getDemandCollectionDetails(orgId, branchId, collDate, groupId),
  });

export const postDemandCollectionAPI = (body: {
  org_id: number;
  branch_id: number;
  coll_date: string;
  co_id: number;
  group_id: number;
  coll_data: {
    account_id: number;
    member_id: number;
    coll_amount: number;
  }[];
}) => doPostApiCall({ url: endPoints.postDemandCollection, bodyData: body });

export const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.data?.Data,
    res?.details,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const nonEmpty = candidates.find(
    (item) => Array.isArray(item) && item.length > 0,
  );
  if (Array.isArray(nonEmpty) && typeof nonEmpty[0] === "object") return nonEmpty;
  const list = candidates.find(
    (item) => Array.isArray(item) && (item.length === 0 || typeof item[0] === "object"),
  );
  return Array.isArray(list) ? list : [];
};

const pick = (item: any, keys: string[]) => {
  if (!item) return "";
  for (const key of keys) {
    const value = item[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

export const toAmount = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return 0;
  const amount = Number(value);
  return Number.isNaN(amount) ? 0 : amount;
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

export const mapSummary = (summary: any): DemandCollectionSummary | null => {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return null;
  }
  return {
    groupNo: String(pick(summary, ["Group_No"]) || ""),
    groupName: String(pick(summary, ["Group_Name"]) || ""),
    collectionDay: String(pick(summary, ["Collection_Day"]) || ""),
    totalDemand: toAmount(summary.Total_Demand),
    collAmount: toAmount(summary.Coll_Amount),
    pendingDemand: toAmount(summary.Pending_Demand),
    collectedCount: toAmount(summary.Collected_Count),
    accountCount: toAmount(summary.Account_Count),
    isFullyCollected: Boolean(summary.Is_Fully_Collected),
    demandGenerated: Boolean(summary.Demand_Generated),
  };
};

export const mapCollectionMembers = (list: any[]): DemandCollectionMember[] =>
  list.map((item) => {
    const isCollected = Number(item?.Is_Collected) === 1;
    const pending = toAmount(pick(item, ["Pending_Demand", "Total_Demand"]));
    const installment = toAmount(pick(item, ["Instl_Amount", "Installment_Amt"]));
    const accountNo = pick(item, ["Account_No"]);
    const accountId = toAmount(pick(item, ["Account_Id"]));
    return {
      accountId,
      memberId: toAmount(pick(item, ["Member_Id"])),
      memberNo: String(pick(item, ["Member_No"]) || ""),
      memberName: String(pick(item, ["Member_Name"]) || ""),
      guardianName: String(pick(item, ["Guardian_Name", "FatHusb_Name"]) || ""),
      accountLabel: String(accountNo || accountId || ""),
      loanDate: String(pick(item, ["Loan_Date"]) || ""),
      totalDemand: toAmount(pick(item, ["Total_Demand"])),
      pendingDemand: pending,
      outstanding: toAmount(pick(item, ["Outstanding", "Outs_Amount"])),
      collAmount: toAmount(pick(item, ["Coll_Amount"])),
      isCollected,
      voucherNo: String(pick(item, ["Voucher_No"]) || ""),
      payAmount: isCollected
        ? String(toAmount(pick(item, ["Coll_Amount"])))
        : String(pending > 0 ? pending : installment),
    };
  });
