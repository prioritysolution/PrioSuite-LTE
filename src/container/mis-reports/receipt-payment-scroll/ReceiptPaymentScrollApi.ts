import { doGetApiCall } from "@/lib/axios";
import { endPoints } from "@/services/apiEndpoints";
import { addMonths, format, getDaysInMonth, startOfMonth } from "date-fns";
import type {
  MonthReportGroup,
  ReceiptPaymentColumnTotals,
  ReceiptPaymentDailyRow,
  ReceiptPaymentPagination,
  ReceiptPaymentScrollData,
  ReceiptPaymentScrollSummary,
  ReceiptPaymentScrollTotals,
  ReceiptPaymentTransactionRow,
  ScrollView,
} from "./ReceiptPaymentScrollType";

const num = (v: unknown): number => {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
};

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

export const getReceiptPaymentScrollAPI = (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
  options?: {
    reportBranchId?: number | string | null;
    coId?: number | string | null;
    scrollType?: string | null;
    view?: string | null;
    page?: number | null;
    perPage?: number | null;
  },
) =>
  doGetApiCall({
    url: endPoints.getReceiptPaymentScroll(orgId, branchId, fromDate, toDate, options),
  });

export const getSahayikaListAPI = (orgId: number, branchId: number) =>
  doGetApiCall({
    url: endPoints.getSahayikaList(orgId, branchId),
  });

export const getBranchListAPI = (orgId: number) =>
  doGetApiCall({
    url: endPoints.getBranchList(orgId),
  });

export const extractApiList = (res: unknown): Record<string, unknown>[] => {
  if (!res || typeof res !== "object") return [];
  if (Array.isArray(res)) return res as Record<string, unknown>[];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.Data)) return r.Data as Record<string, unknown>[];
  if (Array.isArray(r.data)) return r.data as Record<string, unknown>[];
  if (Array.isArray(r.details)) return r.details as Record<string, unknown>[];
  if (Array.isArray(r.Details)) return r.Details as Record<string, unknown>[];
  if (r.data && typeof r.data === "object") {
    const d = r.data as Record<string, unknown>;
    if (Array.isArray(d.Data)) return d.Data as Record<string, unknown>[];
    if (Array.isArray(d.details)) return d.details as Record<string, unknown>[];
    if (Array.isArray(d.data)) return d.data as Record<string, unknown>[];
  }
  return [];
};

export interface SahayikaOptionItem {
  label: string;
  value: number | "";
  coCode?: string | null;
}

export const resolveSahayikaDropdown = (res: unknown): SahayikaOptionItem[] => {
  const list = extractApiList(res);
  if (!list.length) return [];

  const mapped: SahayikaOptionItem[] = [];
  for (const item of list) {
    const idVal = item.CO_Id ?? item.co_id ?? item.id ?? item.Co_Id;
    const id = Number(idVal);
    const code = item.CO_Code ? String(item.CO_Code) : null;
    const displayName = item.Display_Name ? String(item.Display_Name) : "";
    const name = String(item.CO_Name || item.co_name || item.name || "");

    let label = displayName;
    if (!label) {
      if (id === 0 || name.toLowerCase().includes("not assigned")) {
        label = "Not Assigned";
      } else if (code && name && !name.includes(`(${code})`)) {
        label = `${name} (${code})`;
      } else {
        label = name || `Sahayika ${id}`;
      }
    }

    mapped.push({
      label,
      value: id,
      coCode: code,
    });
  }

  // Filter out any duplicate 0 values, put "All Sahayika" and "Not Assigned" at the top
  const assigned = mapped.filter((m) => m.value !== 0 && m.value !== "");
  return [
    { label: "All Sahayika", value: "" },
    { label: "Not Assigned", value: 0 },
    ...assigned,
  ];
};

export const parseAnyDate = (val: unknown): Date | null => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val !== "string") return null;

  const s = val.trim();
  if (!s) return null;

  // Handle ISO like 2026-11-01 or 2026-11-01T...
  const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    const m = Number(isoMatch[2]) - 1;
    const d = Number(isoMatch[3]);
    const dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) return dt;
  }

  // Handle DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (ddmmyyyyMatch) {
    const d = Number(ddmmyyyyMatch[1]);
    const m = Number(ddmmyyyyMatch[2]) - 1;
    const y = Number(ddmmyyyyMatch[3]);
    const dt = new Date(y, m, d);
    if (!isNaN(dt.getTime())) return dt;
  }

  const parsed = new Date(s);
  return !isNaN(parsed.getTime()) ? parsed : null;
};

export const normalizeDateString = (val: unknown): string => {
  const dt = parseAnyDate(val);
  return dt ? format(dt, "yyyy-MM-dd") : "";
};

export const aggregateTransactionsToDaily = (
  transactions: ReceiptPaymentTransactionRow[],
  openingCash: number = 0,
): ReceiptPaymentDailyRow[] => {
  const byDate = new Map<string, ReceiptPaymentDailyRow>();
  let runningCash = openingCash;

  for (const tx of transactions) {
    const rawDate = tx.vouDate || tx.date;
    if (!rawDate) continue;
    const dStr = normalizeDateString(rawDate);
    if (!dStr) continue;

    const existing = byDate.get(dStr);
    const isReceipt = tx.vouType === 1 || String(tx.type).toLowerCase() === "receipt";
    const isPayment = tx.vouType === 2 || String(tx.type).toLowerCase() === "payment";

    const rAmt = isReceipt ? tx.receiptAmount : 0;
    const pAmt = isPayment ? tx.paymentAmount : 0;

    if (tx.balance) {
      runningCash = tx.balance;
    } else {
      runningCash = runningCash + rAmt - pAmt;
    }

    if (!existing) {
      const dObj = parseAnyDate(dStr);
      const dayNo = dObj ? dObj.getDate() : 1;

      byDate.set(dStr, {
        rowNo: dayNo,
        vouDate: dStr,
        dayNo,
        day: dayNo,
        date: dStr,
        voucherCount: 1,
        openingCash: runningCash - rAmt + pAmt,
        receiptAmount: rAmt,
        paymentAmount: pAmt,
        cashReceipt: tx.cashReceipt || rAmt,
        cashPayment: tx.cashPayment || pAmt,
        balance: runningCash,
        receiptLoanPrincipal: isReceipt ? rAmt : 0,
        receiptInterest: 0,
        receiptProcessingCharge: 0,
        receiptHO: 0,
        receiptMisc: 0,
        paymentLoan: isPayment ? pAmt : 0,
        paymentHouseRent: 0,
        paymentElectricBill: 0,
        paymentSalary: 0,
        paymentTravelling: 0,
        paymentLoanLoss: 0,
        paymentHO: 0,
        paymentMisc: 0,
        loanPrincipal: isReceipt ? rAmt : 0,
        loanInterest: 0,
        proceCharge: 0,
        hoReceipt: 0,
        miscReceipt: 0,
        receiptTotal: rAmt,
        loanPayment: isPayment ? pAmt : 0,
        houserent: 0,
        electricBill: 0,
        salary: 0,
        travelling: 0,
        loanLoss: 0,
        hoPayment: 0,
        miscPayment: 0,
        paymentTotal: pAmt,
        cashInHand: runningCash,
      });
    } else {
      existing.voucherCount += 1;
      existing.receiptAmount += rAmt;
      existing.paymentAmount += pAmt;
      existing.cashReceipt += tx.cashReceipt || rAmt;
      existing.cashPayment += tx.cashPayment || pAmt;
      existing.balance = runningCash;
      existing.receiptTotal += rAmt;
      existing.paymentTotal += pAmt;
      existing.cashInHand = runningCash;
      if (isReceipt) {
        existing.receiptLoanPrincipal += rAmt;
        existing.loanPrincipal += rAmt;
      }
      if (isPayment) {
        existing.paymentLoan += pAmt;
        existing.loanPayment += pAmt;
      }
    }
  }

  return Array.from(byDate.values()).sort((a, b) => a.vouDate.localeCompare(b.vouDate));
};

export const buildMonthGroups = (
  dailyRows: ReceiptPaymentDailyRow[],
  fromDateStr: string,
  toDateStr: string,
  initialCash: number = 0,
): MonthReportGroup[] => {
  if (!fromDateStr || !toDateStr) return [];

  const start = parseAnyDate(fromDateStr);
  const end = parseAnyDate(toDateStr);
  if (!start || !end) return [];

  const rowByDate = new Map<string, ReceiptPaymentDailyRow>();
  for (const row of dailyRows) {
    const rawDate = row.vouDate || row.date;
    if (rawDate) {
      const dKey = normalizeDateString(rawDate);
      if (dKey) {
        rowByDate.set(dKey, row);
      }
    }
  }

  const groups: MonthReportGroup[] = [];
  let curMonth = startOfMonth(start);
  const lastMonth = startOfMonth(end);

  let runningCash = initialCash;

  while (curMonth <= lastMonth) {
    const yearStr = format(curMonth, "yyyy");
    const monthName = format(curMonth, "MMMM");
    const monthKey = format(curMonth, "yyyy-MM");
    const daysInMonth = getDaysInMonth(curMonth);

    const monthDays: ReceiptPaymentDailyRow[] = [];
    let mPrinc = 0;
    let mIntt = 0;
    let mProc = 0;
    let mHoRec = 0;
    let mMiscRec = 0;
    let mRecTot = 0;
    let mLoanPay = 0;
    let mRent = 0;
    let mElec = 0;
    let mSal = 0;
    let mTrav = 0;
    let mLoss = 0;
    let mHoPay = 0;
    let mMiscPay = 0;
    let mPayTot = 0;

    const monthOpeningCash = runningCash;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${yearStr}-${String(curMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const existing = rowByDate.get(dateStr);

      if (existing) {
        const pPrinc = existing.receiptLoanPrincipal || existing.loanPrincipal || 0;
        const pIntt = existing.receiptInterest || existing.loanInterest || 0;
        const pProc = existing.receiptProcessingCharge || existing.proceCharge || 0;
        const pHoRec = existing.receiptHO || existing.hoReceipt || 0;
        const pMiscRec = existing.receiptMisc || existing.miscReceipt || 0;
        const pRecTot =
          existing.receiptAmount || existing.receiptTotal || pPrinc + pIntt + pProc + pHoRec + pMiscRec;

        const pLoan = existing.paymentLoan || existing.loanPayment || 0;
        const pRent = existing.paymentHouseRent || existing.houserent || 0;
        const pElec = existing.paymentElectricBill || existing.electricBill || 0;
        const pSal = existing.paymentSalary || existing.salary || 0;
        const pTrav = existing.paymentTravelling || existing.travelling || 0;
        const pLoss = existing.paymentLoanLoss || existing.loanLoss || 0;
        const pHoPay = existing.paymentHO || existing.hoPayment || 0;
        const pMiscPay = existing.paymentMisc || existing.miscPayment || 0;
        const pPayTot =
          existing.paymentAmount ||
          existing.paymentTotal ||
          pLoan + pRent + pElec + pSal + pTrav + pLoss + pHoPay + pMiscPay;

        if (existing.balance) {
          runningCash = existing.balance;
        } else if (pRecTot > 0 || pPayTot > 0) {
          runningCash = runningCash + pRecTot - pPayTot;
        }

        mPrinc += pPrinc;
        mIntt += pIntt;
        mProc += pProc;
        mHoRec += pHoRec;
        mMiscRec += pMiscRec;
        mRecTot += pRecTot;
        mLoanPay += pLoan;
        mRent += pRent;
        mElec += pElec;
        mSal += pSal;
        mTrav += pTrav;
        mLoss += pLoss;
        mHoPay += pHoPay;
        mMiscPay += pMiscPay;
        mPayTot += pPayTot;

        monthDays.push({
          ...existing,
          day,
          dayNo: day,
          date: dateStr,
          vouDate: dateStr,
          loanPrincipal: pPrinc,
          loanInterest: pIntt,
          proceCharge: pProc,
          hoReceipt: pHoRec,
          miscReceipt: pMiscRec,
          receiptTotal: pRecTot,
          loanPayment: pLoan,
          houserent: pRent,
          electricBill: pElec,
          salary: pSal,
          travelling: pTrav,
          loanLoss: pLoss,
          hoPayment: pHoPay,
          miscPayment: pMiscPay,
          paymentTotal: pPayTot,
          cashInHand: runningCash,
        });
      } else {
        monthDays.push({
          rowNo: day,
          vouDate: dateStr,
          dayNo: day,
          voucherCount: 0,
          openingCash: runningCash,
          receiptAmount: 0,
          paymentAmount: 0,
          cashReceipt: 0,
          cashPayment: 0,
          balance: runningCash,
          receiptLoanPrincipal: 0,
          receiptInterest: 0,
          receiptProcessingCharge: 0,
          receiptHO: 0,
          receiptMisc: 0,
          paymentLoan: 0,
          paymentHouseRent: 0,
          paymentElectricBill: 0,
          paymentSalary: 0,
          paymentTravelling: 0,
          paymentLoanLoss: 0,
          paymentHO: 0,
          paymentMisc: 0,
          day,
          date: dateStr,
          loanPrincipal: 0,
          loanInterest: 0,
          proceCharge: 0,
          hoReceipt: 0,
          miscReceipt: 0,
          receiptTotal: 0,
          loanPayment: 0,
          houserent: 0,
          electricBill: 0,
          salary: 0,
          travelling: 0,
          loanLoss: 0,
          hoPayment: 0,
          miscPayment: 0,
          paymentTotal: 0,
          cashInHand: runningCash,
        });
      }
    }

    const monthTotals: ReceiptPaymentScrollTotals = {
      loanPrincipal: mPrinc,
      loanInterest: mIntt,
      proceCharge: mProc,
      hoReceipt: mHoRec,
      miscReceipt: mMiscRec,
      receiptTotal: mRecTot,
      loanPayment: mLoanPay,
      houserent: mRent,
      electricBill: mElec,
      salary: mSal,
      travelling: mTrav,
      loanLoss: mLoss,
      hoPayment: mHoPay,
      miscPayment: mMiscPay,
      paymentTotal: mPayTot,
      closingCashInHand: runningCash,
      openingCash: monthOpeningCash,
    };

    groups.push({
      monthKey,
      monthName,
      year: yearStr,
      daysCount: daysInMonth,
      days: monthDays,
      totals: monthTotals,
    });

    curMonth = addMonths(curMonth, 1);
  }

  return groups;
};

export const mapReceiptPaymentScroll = (
  response: unknown,
  fallbackContext?: {
    fromDate?: string;
    toDate?: string;
    branchName?: string;
    coName?: string;
    view?: ScrollView;
  },
): ReceiptPaymentScrollData | null => {
  const body = (response || {}) as Record<string, unknown>;
  const details = (body.details || body.data) as Record<string, unknown> | null;
  if (!details || typeof details !== "object") return null;

  const view: ScrollView =
    String(details.View || fallbackContext?.view || "transactions").toLowerCase() === "daily"
      ? "daily"
      : "transactions";

  const rawSummary = (details.Summary || {}) as Record<string, unknown>;
  const rawColTotals = (rawSummary.Column_Totals || {}) as Record<string, unknown>;

  const columnTotals: ReceiptPaymentColumnTotals = {
    Receipt_Loan_Principal: num(rawColTotals.Receipt_Loan_Principal),
    Receipt_Interest: num(rawColTotals.Receipt_Interest),
    Receipt_Processing_Charge: num(rawColTotals.Receipt_Processing_Charge),
    Receipt_HO: num(rawColTotals.Receipt_HO),
    Receipt_Misc: num(rawColTotals.Receipt_Misc),
    Payment_Loan: num(rawColTotals.Payment_Loan),
    Payment_House_Rent: num(rawColTotals.Payment_House_Rent),
    Payment_Electric_Bill: num(rawColTotals.Payment_Electric_Bill),
    Payment_Salary: num(rawColTotals.Payment_Salary),
    Payment_Travelling: num(rawColTotals.Payment_Travelling),
    Payment_Loan_Loss: num(rawColTotals.Payment_Loan_Loss),
    Payment_HO: num(rawColTotals.Payment_HO),
    Payment_Misc: num(rawColTotals.Payment_Misc),
  };

  const fromDate = str(rawSummary.From_Date || fallbackContext?.fromDate || "");
  const toDate = str(rawSummary.To_Date || fallbackContext?.toDate || "");
  const fromObj = parseAnyDate(fromDate) || new Date();

  const summary: ReceiptPaymentScrollSummary = {
    companyName: str(body.Organization_Name || "SWANIRVAR FINANCE COMPANY Pvt. Ltd."),
    corporateOffice: str(body.Branch_Address || "4 no. ward , Panskura, Purba Medinipur"),
    branchId: num(rawSummary.Branch_Id),
    branchCode: str(rawSummary.Branch_Code || "01"),
    branchName: str(rawSummary.Branch_Name || fallbackContext?.branchName || "Branch"),
    monthName: format(fromObj, "MMMM"),
    year: format(fromObj, "yyyy"),
    managerCoName: rawSummary.Manager_Name ? str(rawSummary.Manager_Name) : (fallbackContext?.coName || ""),
    fromDate,
    toDate,
    cashLedgerId: num(rawSummary.Cash_Ledger_Id || 10),
    openingCash: num(rawSummary.Opening_Cash),
    closingCash: num(rawSummary.Closing_Cash),
    cashReceipts: num(rawSummary.Cash_Receipts),
    cashPayments: num(rawSummary.Cash_Payments),
    totalReceipts: num(rawSummary.Total_Receipts),
    totalPayments: num(rawSummary.Total_Payments),
    filteredCashReceipts: num(rawSummary.Filtered_Cash_Receipts),
    filteredCashPayments: num(rawSummary.Filtered_Cash_Payments),
    voucherCount: num(rawSummary.Voucher_Count),
    unbalancedVoucherCount: num(rawSummary.Unbalanced_Voucher_Count),
    unbalancedAmount: num(rawSummary.Unbalanced_Amount),
    columnTotals,
    // Aliases
    openingBalance: num(rawSummary.Opening_Cash),
    closingBalance: num(rawSummary.Closing_Cash),
    receiptCount: num(rawSummary.Voucher_Count),
    paymentCount: num(rawSummary.Voucher_Count),
  };

  const totals: ReceiptPaymentScrollTotals = {
    loanPrincipal: columnTotals.Receipt_Loan_Principal,
    loanInterest: columnTotals.Receipt_Interest,
    proceCharge: columnTotals.Receipt_Processing_Charge,
    hoReceipt: columnTotals.Receipt_HO,
    miscReceipt: columnTotals.Receipt_Misc,
    receiptTotal: summary.totalReceipts,
    loanPayment: columnTotals.Payment_Loan,
    houserent: columnTotals.Payment_House_Rent,
    electricBill: columnTotals.Payment_Electric_Bill,
    salary: columnTotals.Payment_Salary,
    travelling: columnTotals.Payment_Travelling,
    loanLoss: columnTotals.Payment_Loan_Loss,
    hoPayment: columnTotals.Payment_HO,
    miscPayment: columnTotals.Payment_Misc,
    paymentTotal: summary.totalPayments,
    closingCashInHand: summary.closingCash,
    openingCash: summary.openingCash,
  };

  const rawPagination = (details.Pagination || {}) as Record<string, unknown>;
  const pagination: ReceiptPaymentPagination = {
    currentPage: num(rawPagination.current_page || 1),
    perPage: num(rawPagination.per_page || 25),
    total: num(rawPagination.total || 0),
    lastPage: num(rawPagination.last_page || 1),
    from: rawPagination.from !== null && rawPagination.from !== undefined ? num(rawPagination.from) : null,
    to: rawPagination.to !== null && rawPagination.to !== undefined ? num(rawPagination.to) : null,
    hasMorePages: Boolean(rawPagination.has_more_pages),
  };

  const rawRows = Array.isArray(details.Rows) ? details.Rows : [];

  let transactionRows: ReceiptPaymentTransactionRow[] = [];
  let dailyRows: ReceiptPaymentDailyRow[] = [];

  if (view === "transactions") {
    transactionRows = rawRows.map((r, index) => {
      const row = (r || {}) as Record<string, unknown>;
      const rowNo = num(row.Row_No || index + 1);
      const voucherId = num(row.Voucher_Id || rowNo);
      const vouDate = str(row.Vou_Date);
      const voucherNo = str(row.Voucher_No || `V-${voucherId}`);
      const vouType = num(row.Vou_Type || 1);
      const type = str(row.Type || (vouType === 2 ? "Payment" : "Receipt"));
      const receiptAmount = num(row.Receipt_Amount);
      const paymentAmount = num(row.Payment_Amount);
      const balance = num(row.Balance);
      const coName = str(row.CO_Name || "-");
      const coId = row.CO_Id !== null && row.CO_Id !== undefined ? num(row.CO_Id) : null;

      return {
        rowNo,
        voucherId,
        vouDate,
        voucherNo,
        vouType,
        type,
        refVouNo: row.Ref_Vou_No ? str(row.Ref_Vou_No) : null,
        branchId: num(row.Branch_Id),
        branchName: str(row.Branch_Name),
        coId,
        coName,
        coCount: num(row.CO_Count || 1),
        coIds: row.CO_Ids ? str(row.CO_Ids) : null,
        particulars: str(row.Particulars || "-"),
        accountName: str(row.Account_Name || "-"),
        mode: str(row.Mode || "Cash"),
        receiptAmount,
        paymentAmount,
        cashReceipt: num(row.Cash_Receipt),
        cashPayment: num(row.Cash_Payment),
        balance,
        differenceAmount: num(row.Difference_Amount),
        createdBy: num(row.Created_By),
        createdByName: str(row.Created_By_Name),
        id: voucherId,
        date: vouDate,
        voucherType: type,
        sahayikaId: coId || 0,
        sahayikaName: coName,
        runningBalance: balance,
        remarks: "",
      };
    });
  } else {
    dailyRows = rawRows.map((r, index) => {
      const row = (r || {}) as Record<string, unknown>;
      const rowNo = num(row.Row_No || index + 1);
      const vouDate = str(row.Vou_Date);
      const dayNo = num(row.Day_No || index + 1);

      const receiptLoanPrincipal = num(row.Receipt_Loan_Principal);
      const receiptInterest = num(row.Receipt_Interest);
      const receiptProcessingCharge = num(row.Receipt_Processing_Charge);
      const receiptHO = num(row.Receipt_HO);
      const receiptMisc = num(row.Receipt_Misc);
      const receiptAmount = num(row.Receipt_Amount);

      const paymentLoan = num(row.Payment_Loan);
      const paymentHouseRent = num(row.Payment_House_Rent);
      const paymentElectricBill = num(row.Payment_Electric_Bill);
      const paymentSalary = num(row.Payment_Salary);
      const paymentTravelling = num(row.Payment_Travelling);
      const paymentLoanLoss = num(row.Payment_Loan_Loss);
      const paymentHO = num(row.Payment_HO);
      const paymentMisc = num(row.Payment_Misc);
      const paymentAmount = num(row.Payment_Amount);

      const balance = num(row.Balance);

      return {
        rowNo,
        vouDate,
        dayNo,
        voucherCount: num(row.Voucher_Count),
        openingCash: num(row.Opening_Cash),
        receiptAmount,
        paymentAmount,
        cashReceipt: num(row.Cash_Receipt),
        cashPayment: num(row.Cash_Payment),
        balance,
        receiptLoanPrincipal,
        receiptInterest,
        receiptProcessingCharge,
        receiptHO,
        receiptMisc,
        paymentLoan,
        paymentHouseRent,
        paymentElectricBill,
        paymentSalary,
        paymentTravelling,
        paymentLoanLoss,
        paymentHO,
        paymentMisc,
        day: dayNo,
        date: vouDate,
        loanPrincipal: receiptLoanPrincipal,
        loanInterest: receiptInterest,
        proceCharge: receiptProcessingCharge,
        hoReceipt: receiptHO,
        miscReceipt: receiptMisc,
        receiptTotal: receiptAmount,
        loanPayment: paymentLoan,
        houserent: paymentHouseRent,
        electricBill: paymentElectricBill,
        salary: paymentSalary,
        travelling: paymentTravelling,
        loanLoss: paymentLoanLoss,
        hoPayment: paymentHO,
        miscPayment: paymentMisc,
        paymentTotal: paymentAmount,
        cashInHand: balance,
      };
    });
  }

  // If dailyRows was not returned (e.g. view=transactions), aggregate from transaction rows
  let effectiveDaily = dailyRows;
  if (effectiveDaily.length === 0 && transactionRows.length > 0) {
    effectiveDaily = aggregateTransactionsToDaily(transactionRows, summary.openingCash);
  }

  // Generate complete month groups for each month in the selected range
  const monthGroups = buildMonthGroups(
    effectiveDaily,
    fromDate,
    toDate,
    summary.openingCash,
  );

  return {
    message: str(body.message || "Data Found"),
    view,
    summary,
    columnTotals,
    totals,
    rows: transactionRows,
    dailyRows: effectiveDaily,
    monthGroups,
    pagination,
  };
};

// Fallback generator matching the physical Panskura 01 ledger sheet (April 2026)
const sampleScrollRecords: Record<number, Partial<ReceiptPaymentDailyRow>> = {
  2: { receiptLoanPrincipal: 50870, receiptInterest: 7630 },
  3: { receiptLoanPrincipal: 15696, receiptInterest: 2354 },
  4: { receiptLoanPrincipal: 31130, receiptInterest: 4670, receiptProcessingCharge: 2750, paymentLoan: 110000 },
  5: { receiptLoanPrincipal: 97696, receiptInterest: 14654, receiptProcessingCharge: 2750 },
  6: { receiptLoanPrincipal: 31435, receiptInterest: 4715 },
  7: { receiptLoanPrincipal: 27478, receiptInterest: 4122 },
  9: { receiptLoanPrincipal: 39043, receiptInterest: 5857 },
  10: { receiptLoanPrincipal: 16696, receiptInterest: 2504 },
  11: {
    receiptLoanPrincipal: 24826,
    receiptInterest: 3724,
    receiptProcessingCharge: 3000,
    paymentLoan: 120000,
    paymentHouseRent: 6000,
    paymentSalary: 29000,
    paymentTravelling: 350,
  },
  12: { receiptLoanPrincipal: 139478, receiptInterest: 20922, receiptProcessingCharge: 3000 },
  13: { receiptLoanPrincipal: 31652, receiptInterest: 4748 },
  16: { receiptLoanPrincipal: 37957, receiptInterest: 5693 },
  17: { receiptLoanPrincipal: 15696, receiptInterest: 2354 },
  18: { receiptLoanPrincipal: 22739, receiptInterest: 3411, receiptProcessingCharge: 3000, paymentLoan: 120000 },
  19: { receiptLoanPrincipal: 108044, receiptInterest: 16206, receiptProcessingCharge: 3000 },
  20: { receiptLoanPrincipal: 29696, receiptInterest: 4454 },
  21: { receiptLoanPrincipal: 29217, receiptInterest: 4383 },
  24: { receiptLoanPrincipal: 16304, receiptInterest: 2446 },
  25: { receiptLoanPrincipal: 23391, receiptInterest: 3509, receiptProcessingCharge: 3000, paymentLoan: 120000 },
  26: { receiptLoanPrincipal: 98608, receiptInterest: 14792, receiptProcessingCharge: 3000 },
  27: { receiptLoanPrincipal: 30348, receiptInterest: 4552 },
  28: { receiptLoanPrincipal: 29870, receiptInterest: 4480 },
  30: {
    receiptLoanPrincipal: 48826,
    receiptInterest: 7324,
    receiptProcessingCharge: 2100,
    paymentLoan: 84000,
    paymentHO: 35000,
  },
  31: { receiptLoanPrincipal: 109044, receiptInterest: 16356, receiptProcessingCharge: 2100 },
};

export const getFallbackScrollReport = (params: {
  fromDate: string;
  toDate: string;
  branchName: string;
  branchCode?: string;
  sahayikaName?: string;
  scrollType?: "all" | "receipt" | "payment";
  view?: ScrollView;
}): ReceiptPaymentScrollData => {
  const fromObj = parseAnyDate(params.fromDate) || new Date();
  const toObj = parseAnyDate(params.toDate) || new Date();

  const openingCash = 2900;
  let runningCash = openingCash;

  const dailyRows: ReceiptPaymentDailyRow[] = [];
  const transactionRows: ReceiptPaymentTransactionRow[] = [];

  let sumPrinc = 0;
  let sumIntt = 0;
  let sumProc = 0;
  let sumLoanPay = 0;
  let sumRent = 0;
  let sumSal = 0;
  let sumTrav = 0;
  let sumHoPay = 0;

  let cur = startOfMonth(fromObj);
  const endLimit = startOfMonth(toObj);

  while (cur <= endLimit) {
    const year = format(cur, "yyyy");
    const mNum = cur.getMonth() + 1;
    const daysCount = getDaysInMonth(cur);

    for (let day = 1; day <= daysCount; day++) {
      const rec = sampleScrollRecords[day] || {};
      let pPrinc = rec.receiptLoanPrincipal || 0;
      let pIntt = rec.receiptInterest || 0;
      let pProc = rec.receiptProcessingCharge || 0;
      let pLoan = rec.paymentLoan || 0;
      let pRent = rec.paymentHouseRent || 0;
      let pSal = rec.paymentSalary || 0;
      let pTrav = rec.paymentTravelling || 0;
      let pHo = rec.paymentHO || 0;

      if (params.scrollType === "receipt") {
        pLoan = 0;
        pRent = 0;
        pSal = 0;
        pTrav = 0;
        pHo = 0;
      } else if (params.scrollType === "payment") {
        pPrinc = 0;
        pIntt = 0;
        pProc = 0;
      }

      const recTotal = pPrinc + pIntt + pProc;
      const payTotal = pLoan + pRent + pSal + pTrav + pHo;

      if (recTotal > 0 || payTotal > 0) {
        runningCash = runningCash + recTotal - payTotal;
      }

      sumPrinc += pPrinc;
      sumIntt += pIntt;
      sumProc += pProc;
      sumLoanPay += pLoan;
      sumRent += pRent;
      sumSal += pSal;
      sumTrav += pTrav;
      sumHoPay += pHo;

      const dateStr = `${year}-${String(mNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      dailyRows.push({
        rowNo: day,
        vouDate: dateStr,
        dayNo: day,
        voucherCount: recTotal > 0 || payTotal > 0 ? 1 : 0,
        openingCash: runningCash,
        receiptAmount: recTotal,
        paymentAmount: payTotal,
        cashReceipt: recTotal,
        cashPayment: payTotal,
        balance: runningCash,
        receiptLoanPrincipal: pPrinc,
        receiptInterest: pIntt,
        receiptProcessingCharge: pProc,
        receiptHO: 0,
        receiptMisc: 0,
        paymentLoan: pLoan,
        paymentHouseRent: pRent,
        paymentElectricBill: 0,
        paymentSalary: pSal,
        paymentTravelling: pTrav,
        paymentLoanLoss: 0,
        paymentHO: pHo,
        paymentMisc: 0,
        day,
        date: dateStr,
        loanPrincipal: pPrinc,
        loanInterest: pIntt,
        proceCharge: pProc,
        hoReceipt: 0,
        miscReceipt: 0,
        receiptTotal: recTotal,
        loanPayment: pLoan,
        houserent: pRent,
        electricBill: 0,
        salary: pSal,
        travelling: pTrav,
        loanLoss: 0,
        hoPayment: pHo,
        miscPayment: 0,
        paymentTotal: payTotal,
        cashInHand: runningCash,
      });

      if (recTotal > 0) {
        transactionRows.push({
          rowNo: transactionRows.length + 1,
          voucherId: transactionRows.length + 1,
          vouDate: dateStr,
          voucherNo: `V-${1000 + day}`,
          vouType: 1,
          type: "Receipt",
          refVouNo: null,
          branchId: 1,
          branchName: params.branchName,
          coId: 101,
          coName: params.sahayikaName || "Compile",
          coCount: 1,
          coIds: "101",
          particulars: "Collection Recovery",
          accountName: "Interest, Principal",
          mode: "Cash",
          receiptAmount: recTotal,
          paymentAmount: 0,
          cashReceipt: recTotal,
          cashPayment: 0,
          balance: runningCash,
          differenceAmount: 0,
          createdBy: 1,
          createdByName: "Admin",
          id: transactionRows.length + 1,
          date: dateStr,
          voucherType: "Receipt",
          sahayikaId: 101,
          sahayikaName: params.sahayikaName || "Compile",
          runningBalance: runningCash,
          remarks: "",
        });
      }

      if (payTotal > 0) {
        transactionRows.push({
          rowNo: transactionRows.length + 1,
          voucherId: transactionRows.length + 1,
          vouDate: dateStr,
          voucherNo: `V-${2000 + day}`,
          vouType: 2,
          type: "Payment",
          refVouNo: null,
          branchId: 1,
          branchName: params.branchName,
          coId: 101,
          coName: params.sahayikaName || "Compile",
          coCount: 1,
          coIds: "101",
          particulars: pLoan > 0 ? "Loan Disbursement" : "Branch Expense",
          accountName: pLoan > 0 ? "Loan Principal" : "Office Expense",
          mode: "Cash",
          receiptAmount: 0,
          paymentAmount: payTotal,
          cashReceipt: 0,
          cashPayment: payTotal,
          balance: runningCash,
          differenceAmount: 0,
          createdBy: 1,
          createdByName: "Admin",
          id: transactionRows.length + 1,
          date: dateStr,
          voucherType: "Payment",
          sahayikaId: 101,
          sahayikaName: params.sahayikaName || "Compile",
          runningBalance: runningCash,
          remarks: "",
        });
      }
    }
    cur = addMonths(cur, 1);
  }

  const totalReceipts = sumPrinc + sumIntt + sumProc;
  const totalPayments = sumLoanPay + sumRent + sumSal + sumTrav + sumHoPay;

  const columnTotals: ReceiptPaymentColumnTotals = {
    Receipt_Loan_Principal: sumPrinc,
    Receipt_Interest: sumIntt,
    Receipt_Processing_Charge: sumProc,
    Receipt_HO: 0,
    Receipt_Misc: 0,
    Payment_Loan: sumLoanPay,
    Payment_House_Rent: sumRent,
    Payment_Electric_Bill: 0,
    Payment_Salary: sumSal,
    Payment_Travelling: sumTrav,
    Payment_Loan_Loss: 0,
    Payment_HO: sumHoPay,
    Payment_Misc: 0,
  };

  const totals: ReceiptPaymentScrollTotals = {
    loanPrincipal: sumPrinc,
    loanInterest: sumIntt,
    proceCharge: sumProc,
    hoReceipt: 0,
    miscReceipt: 0,
    receiptTotal: totalReceipts,
    loanPayment: sumLoanPay,
    houserent: sumRent,
    electricBill: 0,
    salary: sumSal,
    travelling: sumTrav,
    loanLoss: 0,
    hoPayment: sumHoPay,
    miscPayment: 0,
    paymentTotal: totalPayments,
    closingCashInHand: runningCash,
    openingCash,
  };

  const summary: ReceiptPaymentScrollSummary = {
    companyName: "SWANIRVAR FINANCE COMPANY Pvt. Ltd.",
    corporateOffice: "4 no. ward , Panskura, Purba Medinipur",
    branchId: 1,
    branchCode: params.branchCode || "01",
    branchName: params.branchName,
    monthName: format(fromObj, "MMMM"),
    year: format(fromObj, "yyyy"),
    managerCoName: params.sahayikaName || "",
    fromDate: params.fromDate,
    toDate: params.toDate,
    cashLedgerId: 10,
    openingCash,
    closingCash: runningCash,
    cashReceipts: totalReceipts,
    cashPayments: totalPayments,
    totalReceipts,
    totalPayments,
    filteredCashReceipts: totalReceipts,
    filteredCashPayments: totalPayments,
    voucherCount: transactionRows.length,
    unbalancedVoucherCount: 0,
    unbalancedAmount: 0,
    columnTotals,
    openingBalance: openingCash,
    closingBalance: runningCash,
    receiptCount: transactionRows.filter((r) => r.type === "Receipt").length,
    paymentCount: transactionRows.filter((r) => r.type === "Payment").length,
  };

  const monthGroups = buildMonthGroups(dailyRows, params.fromDate, params.toDate, openingCash);
  const activeRows = params.view === "daily" ? [] : transactionRows;

  return {
    message: "Data Found",
    view: params.view || "transactions",
    summary,
    columnTotals,
    totals,
    rows: activeRows,
    dailyRows,
    monthGroups,
    pagination: {
      currentPage: 1,
      perPage: 25,
      total: activeRows.length,
      lastPage: Math.ceil(activeRows.length / 25) || 1,
      from: activeRows.length > 0 ? 1 : null,
      to: activeRows.length > 0 ? activeRows.length : null,
      hasMorePages: false,
    },
  };
};

// Fetch helper to get full daily report for Print or Monthly Excel
export const fetchScrollDailyReport = async (
  orgId: number,
  branchId: number,
  fromDate: string,
  toDate: string,
  options?: {
    reportBranchId?: number | string | null;
    coId?: number | string | null;
    scrollType?: string | null;
  },
): Promise<ReceiptPaymentDailyRow[]> => {
  try {
    const response = await getReceiptPaymentScrollAPI(orgId, branchId, fromDate, toDate, {
      ...options,
      view: "daily",
      page: 1,
      perPage: 500,
    });
    const mapped = mapReceiptPaymentScroll(response, { fromDate, toDate, view: "daily" });
    if (mapped && mapped.dailyRows.length > 0) {
      return mapped.dailyRows;
    }
  } catch {
    // ignore
  }
  return [];
};
