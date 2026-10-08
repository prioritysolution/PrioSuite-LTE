import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import {
  DailySheetData,
  DailySheetDetailRow,
  DailySheetLedgerRow,
  DailySheetSideRow,
  DailySheetSummary,
} from "./DailySheetType";

const toNumber = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const toText = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

export const formatSheetAmount = (value: number) => {
  const amount = Number(value) || 0;
  if (!amount) return "-";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatSheetMoney = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatApiDate = (value: string) => {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return value || "-";
  return `${day}-${month}-${year}`;
};

const mapSideRow = (row: any): DailySheetSideRow => ({
  accountId: toNumber(row?.Account_Id),
  accountCode: toText(row?.Account_Code),
  ledgerName:
    toNumber(row?.Account_Id) === 0
      ? "Unbalanced Voucher Difference"
      : toText(row?.Ledger_Name) || "Ledger",
  cateDesc: toText(row?.Cate_Desc),
  count: toNumber(row?.Count),
  cash: toNumber(row?.Cash),
  transfer: toNumber(row?.Transfer),
  total: toNumber(row?.Total),
});

const mapLedger = (row: any): DailySheetLedgerRow => ({
  accountId: toNumber(row?.Account_Id),
  accountCode: toText(row?.Account_Code),
  ledgerName:
    toNumber(row?.Account_Id) === 0
      ? "Unbalanced Voucher Difference"
      : toText(row?.Ledger_Name) || "Ledger",
  cateDesc: toText(row?.Cate_Desc),
  recCount: toNumber(row?.Rec_Count),
  recCash: toNumber(row?.Rec_Cash),
  recTrf: toNumber(row?.Rec_Trf),
  recTotal: toNumber(row?.Rec_Total),
  payCount: toNumber(row?.Pay_Count),
  payCash: toNumber(row?.Pay_Cash),
  payTrf: toNumber(row?.Pay_Trf),
  payTotal: toNumber(row?.Pay_Total),
});

const mapSummary = (row: any): DailySheetSummary => ({
  fromDate: toText(row?.From_Date),
  toDate: toText(row?.To_Date),
  branchId: toNumber(row?.Branch_Id),
  branchName: toText(row?.Branch_Name) || "Branch",
  openingCash: toNumber(row?.Opening_Cash),
  recCash: toNumber(row?.Rec_Cash),
  recTrf: toNumber(row?.Rec_Trf),
  recTotal: toNumber(row?.Rec_Total),
  payCash: toNumber(row?.Pay_Cash),
  payTrf: toNumber(row?.Pay_Trf),
  payTotal: toNumber(row?.Pay_Total),
  closingCash: toNumber(row?.Closing_Cash),
  grandRecTotal: toNumber(row?.Grand_Rec_Total),
  grandPayTotal: toNumber(row?.Grand_Pay_Total),
  voucherCount: toNumber(row?.Voucher_Count),
  unbalancedVoucherCount: toNumber(row?.Unbalanced_Voucher_Count),
  unbalancedAmount: toNumber(row?.Unbalanced_Amount),
  isTallied: toNumber(row?.Is_Tallied) === 1,
});

export const mapDailySheet = (res: any): DailySheetData | null => {
  const details = res?.details;
  if (!details || typeof details !== "object" || Array.isArray(details)) {
    return null;
  }
  const receipts = Array.isArray(details.Receipts)
    ? details.Receipts.map(mapSideRow)
    : [];
  const payments = Array.isArray(details.Payments)
    ? details.Payments.map(mapSideRow)
    : [];
  const ledgers = Array.isArray(details.Ledgers)
    ? details.Ledgers.map(mapLedger)
    : [];
  return {
    message: toText(res?.message),
    summary: mapSummary(details.Summary),
    receipts,
    payments,
    ledgers,
  };
};

export const mapDailySheetDetails = (res: any): DailySheetDetailRow[] => {
  const rows = Array.isArray(res?.details) ? res.details : [];
  return rows.map((row: any) => ({
    voucherId: toNumber(row?.Voucher_Id),
    vouDate: toText(row?.Vou_Date),
    voucherNo: toText(row?.Voucher_No),
    vouTypeName: toText(row?.Vou_Type_Name),
    particulars: toText(row?.Particulars),
    branchName: toText(row?.Branch_Name),
    ledgerName: toText(row?.Ledger_Name),
    mode: toText(row?.Mode),
    receiptAmount: toNumber(row?.Receipt_Amount),
    paymentAmount: toNumber(row?.Payment_Amount),
    remarks: toText(row?.Remarks),
  }));
};

export const getDailySheetAPI = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
  reportBranchId?: number | null,
) =>
  doGetApiCall({
    url: endPoints.getDailySheet(
      orgId,
      branchId,
      fromDate,
      toDate,
      reportBranchId,
    ),
  });

export const getDailySheetDetailsAPI = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
  reportBranchId?: number | null,
  accountId?: number | null,
) =>
  doGetApiCall({
    url: endPoints.getDailySheetDetails(
      orgId,
      branchId,
      fromDate,
      toDate,
      reportBranchId,
      accountId,
    ),
  });
