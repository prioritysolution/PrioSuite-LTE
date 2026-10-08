/* eslint-disable @typescript-eslint/no-explicit-any */
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import { DemandRow } from "./DemandGenerationType";

export const getSahayikaListAPI = (orgId: number, branchId: number) =>
  doGetApiCall({ url: endPoints.getSahayikaList(orgId, branchId) });

export const getSahayikaGroupListAPI = (
  orgId: number,
  branchId: number,
  coId: number,
) => doGetApiCall({ url: endPoints.getSahayikaGroupList(orgId, branchId, coId) });

export const generateDemandAPI = (body: {
  org_id: number;
  branch_id: number;
  demand_date: string;
  co_id: number;
  regenerate: boolean;
}) => doPostApiCall({ url: endPoints.generateDemand, bodyData: body });

export const getDemandMemberWiseAPI = (
  orgId: number,
  branchId: number,
  demandDate: string,
  groupId: number,
) =>
  doGetApiCall({
    url: endPoints.getDemandMemberWise(orgId, branchId, demandDate, groupId),
  });

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
  if (nonEmpty) return nonEmpty;
  const list = candidates.find((item) => Array.isArray(item));
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

export const formatApiDate = (value: unknown) => {
  const text = String(value ?? "").trim();
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return text;
  return `${match[3]}-${match[2]}-${match[1]}`;
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

export const mapDemandRows = (list: any[]): DemandRow[] =>
  list.map((item, index) => {
    const accountNo = pick(item, ["Account_No", "account_no"]);
    const accountId = pick(item, ["Account_Id", "account_id"]);
    return {
      sl: index + 1,
      memberNo: String(pick(item, ["Member_No", "Mem_No", "mem_no"]) || ""),
      memberName: String(pick(item, ["Member_Name", "Mem_Name", "mem_name"]) || ""),
      guardianName: String(
        pick(item, ["Guardian_Name", "FatHusb_Name", "Gurdain_Name"]) || "",
      ),
      accountLabel: String(accountNo || accountId || ""),
      installmentNo: String(pick(item, ["Instl_No", "Installment_No"]) || ""),
      installmentAmount: pick(item, ["Instl_Amount", "Installment_Amt"]) || 0,
      dueDate: formatApiDate(pick(item, ["Due_Date", "due_date"])),
      currentDemand: pick(item, ["Current_Demand"]) || 0,
      arrearDemand: pick(item, ["Arrear_Demand"]) || 0,
      totalDemand:
        pick(item, ["Total_Demand", "Demand", "Demand_Amt", "Demand_Amount"]) ||
        0,
      outstanding:
        pick(item, ["Outstanding", "Outs_Amount", "Outstanding_Balance"]) || 0,
    };
  });
