/* eslint-disable @typescript-eslint/no-explicit-any */
import { doGetApiCall, doPostApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  DemandAmounts,
  DemandCoRow,
  DemandEmiRow,
  DemandGroupRow,
  DemandLevel,
  DemandMemberRow,
  DemandReportData,
  DemandSummary,
  GenerateResult,
} from "./DemandGenerationType";

type QueryParams = Record<string, string | number | null | undefined>;

const toQuery = (params: QueryParams) =>
  new URLSearchParams(
    Object.entries(params)
      .filter(([, value]) => value !== null && value !== undefined && value !== "")
      .map(([key, value]) => [key, String(value)]),
  ).toString();

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
  co_id?: number;
  regenerate: boolean;
}) => doPostApiCall({ url: endPoints.generateDemand, bodyData: body });

/** Must never insert: returns the same totals as GenerateDemand without saving. */
export const previewDemandAPI = (body: {
  org_id: number;
  branch_id: number;
  demand_date: string;
  co_id?: number;
}) => doPostApiCall({ url: endPoints.previewDemand, bodyData: body });

export interface DemandReportParams {
  org_id: number;
  branch_id: number;
  demand_date: string;
  co_id?: number | null;
  group_id?: number | null;
  account_id?: number | null;
}

const reportUrl: Record<DemandLevel, (query: string) => string> = {
  co: endPoints.getDemandCoWise,
  group: endPoints.getDemandGroupWise,
  member: endPoints.getDemandMemberWise,
  emi: endPoints.getDemandInstallments,
};

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

const text = (item: any, keys: string[]) => String(pick(item, keys) ?? "");
const num = (item: any, keys: string[]) => toAmount(pick(item, keys));

export const formatApiDate = (value: unknown) => {
  const raw = String(value ?? "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return raw;
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

export const mapGenerateResult = (res: any): GenerateResult => {
  const data = res?.Data ?? res?.data?.Data ?? {};
  return {
    message: flattenDetails(res?.details) || String(data?.Message || ""),
    demandDate: String(data?.Demand_Date || ""),
    accountCount: toAmount(data?.Account_Count),
    installmentCount: toAmount(data?.Installment_Count),
    groupCount: toAmount(data?.Group_Count),
    collDayGroupCount: toAmount(data?.Coll_Day_Group_Count),
    currentDemand: toAmount(data?.Current_Demand),
    arrearDemand: toAmount(data?.Arrear_Demand),
    totalDemand: toAmount(data?.Total_Demand),
  };
};

const mapAmounts = (item: any): DemandAmounts => ({
  currentDemand: num(item, ["Current_Demand"]),
  arrearDemand: num(item, ["Arrear_Demand"]),
  totalDemand: num(item, ["Total_Demand"]),
  prnDue: num(item, ["Prn_Due"]),
  intDue: num(item, ["Int_Due"]),
  outstanding: num(item, ["Outstanding"]),
  prnOutstanding: num(item, ["Prn_Outstanding"]),
  intOutstanding: num(item, ["Int_Outstanding"]),
});

const mapSummary = (res: any): DemandSummary | null => {
  const summary = res?.Summary ?? res?.data?.Summary;
  if (!summary || typeof summary !== "object") return null;
  return {
    currentDemand: toAmount(summary.Current_Demand),
    arrearDemand: toAmount(summary.Arrear_Demand),
    totalDemand: toAmount(summary.Total_Demand),
    outstanding: toAmount(summary.Outstanding),
    prnOutstanding: toAmount(summary.Prn_Outstanding),
    intOutstanding: toAmount(summary.Int_Outstanding),
  };
};

const mapCoRow = (item: any): DemandCoRow => ({
  ...mapAmounts(item),
  coId: num(item, ["CO_Id", "Co_Id"]),
  coName: text(item, ["CO_Name", "Co_Name"]) || "Not Assigned",
  groupCount: num(item, ["Group_Count"]),
  memberCount: num(item, ["Member_Count"]),
  accountCount: num(item, ["Account_Count"]),
});

const mapGroupRow = (item: any): DemandGroupRow => ({
  ...mapAmounts(item),
  coId: num(item, ["CO_Id", "Co_Id"]),
  coName: text(item, ["CO_Name", "Co_Name"]),
  groupId: num(item, ["Group_Id"]),
  groupNo: text(item, ["Group_No"]),
  groupName: text(item, ["Group_Name"]),
  collectionDay: text(item, ["Collection_Day"]),
  collDayDate: formatApiDate(pick(item, ["Coll_Day_Date"])),
  memberCount: num(item, ["Member_Count"]),
  accountCount: num(item, ["Account_Count"]),
});

const mapMemberRow = (item: any): DemandMemberRow => {
  const accountId = num(item, ["Account_Id"]);
  return {
    ...mapAmounts(item),
    groupNo: text(item, ["Group_No"]),
    groupName: text(item, ["Group_Name"]),
    memberId: num(item, ["Member_Id"]),
    memberNo: text(item, ["Member_No", "Mem_No"]),
    memberName: text(item, ["Member_Name", "Mem_Name"]),
    guardianName: text(item, ["Guardian_Name", "FatHusb_Name", "Gurdain_Name"]),
    accountId,
    accountLabel: text(item, ["Account_No"]) || (accountId ? String(accountId) : ""),
    loanCycle: text(item, ["Loan_Cycle"]),
    instlAmount: num(item, ["Instl_Amount", "EMI_Amount"]),
    emiPrincipal: num(item, ["EMI_Principal"]),
    emiInterest: num(item, ["EMI_Interest"]),
    totalEmi: num(item, ["Total_EMI"]),
    paidEmi: num(item, ["Paid_EMI"]),
    remainingEmi: num(item, ["Remaining_EMI"]),
    dueEmi: num(item, ["Due_EMI", "Overdue_Instl"]),
    instlNo: text(item, ["Instl_No"]),
    dueDate: formatApiDate(pick(item, ["Due_Date"])),
    collectionDay: text(item, ["Collection_Day"]),
    collDayDate: formatApiDate(pick(item, ["Coll_Day_Date"])),
  };
};

const mapEmiRow = (item: any): DemandEmiRow => ({
  emiNo: text(item, ["EMI_No", "Instl_No"]),
  dueDate: formatApiDate(pick(item, ["Due_Date"])),
  openingPrincipal: num(item, ["Opening_Principal"]),
  emiAmount: num(item, ["EMI_Amount", "Instl_Amount"]),
  emiPrincipal: num(item, ["EMI_Principal"]),
  emiInterest: num(item, ["EMI_Interest"]),
  paidAmount: num(item, ["Paid_Amount"]),
  prnDue: num(item, ["Prn_Due"]),
  intDue: num(item, ["Int_Due"]),
  emiDue: num(item, ["EMI_Due", "Total_Demand"]),
  closingPrincipal: num(item, ["Closing_Principal"]),
  demandType: text(item, ["Demand_Type_Name"]),
});

export const getDemandReportAPI = async (
  level: DemandLevel,
  params: DemandReportParams,
): Promise<DemandReportData> => {
  const res = await doGetApiCall({ url: reportUrl[level](toQuery({ ...params })) });
  const noData = /no data found/i.test(String(res?.message || ""));
  const list = noData ? [] : extractList(res);
  const summary = noData ? null : mapSummary(res);

  switch (level) {
    case "co":
      return { level, rows: list.map(mapCoRow), summary };
    case "group":
      return { level, rows: list.map(mapGroupRow), summary };
    case "member":
      return { level, rows: list.map(mapMemberRow), summary };
    case "emi":
      return { level, rows: list.map(mapEmiRow), summary };
  }
};
