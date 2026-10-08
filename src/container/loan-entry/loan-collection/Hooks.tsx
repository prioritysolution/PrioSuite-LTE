"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import { toast } from "sonner";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch, RootState } from "@/redux/store";
import { LoanCollectionForm, LoanRowMeta } from "./LoanCollectionType";
import {
  setGroupList,
  setMemberList,
  resetLoanCollection,
} from "./LoanCollectionReducer";
import {
  getGroupListAPI,
  getAllMemberListAPI,
  getLoanCycleListAPI,
  getSchemeListAPI,
  postCollectionAPI,
} from "./LoanCollectionApi";

const emptyLoanInfo = {
  loanDate: "",
  loanAmount: "",
  installmentAmount: "",
  currentBalance: "",
  demand: "",
  realisableAmount: "",
  principalAmount: "",
  interestAmount: "",
  penalAmount: "0",
};

const formatDisplayDate = (value: unknown) => {
  if (!value) return "";
  try {
    const date = value instanceof Date ? value : new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value);
    return format(date, "dd-MM-yyyy");
  } catch {
    return String(value);
  }
};

const pickAmount = (...values: unknown[]) => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const num = Number(value);
    // Keep "0" as a valid balance/demand
    if (typeof value === "string" && value.trim() === "") continue;
    if (Number.isNaN(num) && typeof value !== "string") continue;
    return value as string | number;
  }
  return "";
};

/** Prefer a positive amount; keep 0 only when every candidate is empty/zero. */
const pickPositiveAmount = (...values: unknown[]) => {
  let zeroFallback: string | number | "" = "";
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    if (typeof value === "string" && value.trim() === "") continue;
    const num = Number(value);
    if (Number.isNaN(num)) {
      if (typeof value === "string") return value;
      continue;
    }
    if (num !== 0) return value as string | number;
    if (zeroFallback === "") zeroFallback = value as string | number;
  }
  return zeroFallback;
};

/** Prefer API value when present and meaningful; otherwise keep list-row value. */
const preferFilled = (preferred: unknown, fallback: unknown) => {
  if (preferred === null || preferred === undefined || preferred === "") {
    return fallback;
  }
  if (typeof preferred === "string" && preferred.trim() === "") {
    return fallback;
  }
  const prefNum = Number(preferred);
  const fallNum = Number(fallback);
  if (
    !Number.isNaN(prefNum) &&
    prefNum === 0 &&
    !Number.isNaN(fallNum) &&
    fallNum > 0
  ) {
    return fallback;
  }
  return preferred;
};

const formatMoney2 = (value: unknown) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value as any;
  // Always show 2 decimal places as per UI expectation
  return num.toFixed(2);
};

/** Whole-number money display for Principal / Interest / Penal. */
const formatRoundMoney = (value: unknown) => {
  const num = Number(value);
  if (Number.isNaN(num)) return "";
  return String(Math.round(num));
};

/** Outstanding / current balance — never confuse with Demand. */
const pickCurrentBalance = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  // Prefer positive outstanding; GetLoanCycleList often returns Outs_Amount=0
  // while Realisable_Amt / list row still holds the true balance.
  return pickPositiveAmount(
    source.Outs_Amount,
    source.Outstanding_Balance,
    source.outstanding_balance,
    source.Curr_Balance,
    source.Current_Balance,
    source.Curr_Bal,
    source.Balance,
    source.Os_Bal,
    source.OS_Amount,
    // Opening outstanding when no collection rows exist yet
    source.Realisable_Amt,
    source.Resilable_Amt,
  );
};

/** Period demand / amount due — never use Realisable_Amt. */
const pickDemand = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  // Skip Demand=0 from cycle API when installment is the real period demand.
  return pickPositiveAmount(
    source.Demand,
    source.Demand_Amt,
    source.Demand_Amount,
    source.Due_Amount,
    source.Due_Amt,
    source.Coll_Demand,
    source.Inst_Demand,
    source.Installment_Amt,
    source.Inst_Amount,
    source.Inst_Amt,
  );
};

const pickLoanAmount = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  return pickAmount(source.Loan_Amount, source.Sanc_Amount, source.Disb_Amount);
};

const pickInstallment = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  return pickAmount(source.Installment_Amt, source.Inst_Amount, source.Inst_Amt);
};

const pickPenal = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  return pickAmount(
    source.Penal_Amount,
    source.Penal_Amt,
    source.Penal,
    source.penal_amt,
    source.penal_amount,
    source.Od_Amount,
    source.OD_Amount,
    source.Od_Amt,
    source.Overdue_Penal,
  );
};

const pickRealisable = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  return pickAmount(
    source.Realisable_Amt,
    source.Resilable_Amt,
    source.Tot_Repay_Amt,
    source.Total_Repay_Amt,
  );
};

const pickSchemeId = (...sources: Array<Record<string, any> | null | undefined>) => {
  for (const source of sources) {
    if (!source) continue;
    const id =
      source.Scheme_Id ??
      source.Schem_Id ??
      source.scheme_id ??
      source.SchemeId ??
      source.schem_id;
    if (id !== undefined && id !== null && String(id).trim() !== "") {
      return Number(id);
    }
  }
  return null;
};

const pickSchemeRates = (scheme: Record<string, any> | null | undefined) => {
  if (!scheme) return null;
  const prnRaw = pickAmount(
    scheme.Prn_1000,
    scheme.prn_1000,
    scheme.Prn1000,
    scheme.PRN_1000,
    scheme.Principal_1000,
    scheme.Prin_1000,
    scheme.Prn_Per_1000,
    scheme.prn_amt_1000,
  );
  const inttRaw = pickAmount(
    scheme.Intt_1000,
    scheme.intt_1000,
    scheme.Intt1000,
    scheme.INTT_1000,
    scheme.Interest_1000,
    scheme.Int_1000,
    scheme.Intt_Per_1000,
    scheme.intt_amt_1000,
  );
  if (prnRaw === "" && inttRaw === "") return null;
  return {
    prn1000: prnRaw === "" ? 0 : Number(prnRaw),
    intt1000: inttRaw === "" ? 0 : Number(inttRaw),
  };
};

/** Resolve scheme + Prn_1000/Intt_1000 from member row and scheme master list. */
const resolveSchemeRates = (
  schemes: any[],
  member: Record<string, any> | null | undefined,
  preferredSchemeId?: number | null,
) => {
  // 1) Rates already present on the selected loan/member row
  const fromMember = pickSchemeRates(member);
  if (fromMember) {
    return { rates: fromMember, scheme: member || null };
  }

  const schemeId =
    preferredSchemeId ||
    pickSchemeId(member) ||
    (schemes.length === 1
      ? Number(
          schemes[0]?.Scheme_Id ??
            schemes[0]?.Schem_Id ??
            schemes[0]?.scheme_id,
        )
      : null);

  let scheme: any = null;
  if (schemeId) {
    scheme = schemes.find(
      (s: any) =>
        Number(s.Scheme_Id ?? s.Schem_Id ?? s.scheme_id) === Number(schemeId),
    );
  }

  // 2) Match by scheme name
  if (!scheme && member) {
    const schemeName = String(
      member.Scheme_Name || member.scheme_name || "",
    ).trim();
    if (schemeName) {
      scheme = schemes.find(
        (s: any) =>
          String(s.Scheme_Name || s.scheme_name || "")
            .trim()
            .toLowerCase() === schemeName.toLowerCase(),
      );
    }
  }

  // 3) Match by ROI when available
  if (!scheme && member) {
    const roi = Number(member.RoI ?? member.ROI ?? member.roi);
    if (!Number.isNaN(roi) && roi > 0) {
      scheme = schemes.find(
        (s: any) => Number(s.RoI ?? s.ROI ?? s.roi) === roi,
      );
    }
  }

  let rates = pickSchemeRates(scheme);
  if (rates) return { rates, scheme };

  // 4) First scheme in master that has Prn/Intt rates
  for (const s of schemes) {
    const candidate = pickSchemeRates(s);
    if (candidate) return { rates: candidate, scheme: s };
  }

  // 5) Last resort — allow save (full amount as principal)
  return {
    rates: { prn1000: 1000, intt1000: 0 },
    scheme: scheme || schemes[0] || null,
    fallback: true as const,
  };
};

/** Split amount using mst_scheme Prn_1000 / Intt_1000 (per ₹1000). */
const splitBySchemePer1000 = (
  amountValue: unknown,
  prn1000: number,
  intt1000: number,
) => {
  const amount = Number(amountValue);
  if (!amountValue || Number.isNaN(amount) || amount <= 0) {
    return { principal: "", interest: "" };
  }

  const totalPer1000 = prn1000 + intt1000;
  if (totalPer1000 <= 0) {
    return {
      principal: formatRoundMoney(amount),
      interest: formatRoundMoney(0),
    };
  }

  // Standard per-1000: (amount/1000)*Prn_1000 when rates sum to 1000;
  // otherwise allocate by Prn_1000 : Intt_1000 ratio so totals match Amount.
  let principal = (amount / 1000) * prn1000;
  let interest = (amount / 1000) * intt1000;
  const composed = principal + interest;
  if (Math.abs(composed - amount) > 0.009) {
    principal = (amount * prn1000) / totalPer1000;
    interest = amount - principal;
  } else {
    interest = amount - principal;
  }

  // Round for display; keep Principal + Interest aligned to Amount
  const roundedPrincipal = Math.round(Math.max(principal, 0));
  const roundedInterest = Math.round(amount) - roundedPrincipal;

  return {
    principal: formatRoundMoney(roundedPrincipal),
    interest: formatRoundMoney(Math.max(roundedInterest, 0)),
  };
};

const applyLoanInfoFields = (
  setValue: (name: keyof typeof emptyLoanInfo, value: any) => void,
  sources: Array<Record<string, any> | null | undefined>,
) => {
  const merged: Record<string, any> = {};
  for (const source of sources) {
    if (!source) continue;
    Object.assign(merged, source);
  }

  const loanDate = pickAmount(
    ...sources.map((s) => s?.Loan_Date).filter((v) => v !== undefined),
  );
  if (loanDate) {
    setValue("loanDate", formatDisplayDate(loanDate));
  }

  const loanAmount = pickLoanAmount(merged);
  if (loanAmount !== "") setValue("loanAmount", formatMoney2(loanAmount));

  const installment = pickInstallment(merged);
  if (installment !== "")
    setValue("installmentAmount", formatMoney2(installment));

  const balance = pickCurrentBalance(merged);
  if (balance !== "") setValue("currentBalance", formatMoney2(balance));

  const demand = pickDemand(merged);
  if (demand !== "") setValue("demand", formatMoney2(demand));

  const realisable = pickRealisable(merged);
  if (realisable !== "") setValue("realisableAmount", formatMoney2(realisable));

  const penal = pickPenal(merged);
  if (penal !== "") setValue("penalAmount", formatRoundMoney(penal));
  else setValue("penalAmount", "0");

  // Payment Entry (amount / principal / interest) stays blank —
  // user enters those manually for member-wise collection.
};

export const useLoanCollection = () => {
  const dispatch = useDispatch<AppDispatch>();

  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const cookieBranchId = getCookieData<string | number>("priobank-lite-branch_id");
  const groupList = useSelector(
    (state: RootState) => state.loanCollection.groupList,
  );
  const memberList = useSelector(
    (state: RootState) => state.loanCollection.memberList,
  );

  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [isMemberLoading, setIsMemberLoading] = useState(false);
  const [isLoanInfoLoading, setIsLoanInfoLoading] = useState(false);
  const [isSplitLoading, setIsSplitLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeLoanCycle, setActiveLoanCycle] = useState<string>("");
  const [activeAccountId, setActiveAccountId] = useState<number | null>(null);
  const [activeSchemeId, setActiveSchemeId] = useState<number | null>(null);
  const [selectedLoans, setSelectedLoans] = useState<
    { memberId: string | number } & LoanRowMeta
  >([]);
  const selectedLoansRef = useRef(selectedLoans);
  const [selectedLoanDate, setSelectedLoanDate] = useState<string>("");
  const [selectedLoanAmount, setSelectedLoanAmount] = useState<
    string | number | ""
  >("");
  const selectedMemberRef = useRef<any>(null);
  const selectionTokenRef = useRef(0);
  const schemeListRef = useRef<any[] | null>(null);
  const schemeListPromiseRef = useRef<Promise<any[]> | null>(null);
  const schemeRatesRef = useRef<{ prn1000: number; intt1000: number } | null>(
    null,
  );

  const schema = yup.object().shape({
    collectionDate: yup.mixed().required("Collection Date is Required"),
    branchId: yup
      .mixed()
      .test(
        "required",
        "Select branch is required",
        (value) =>
          value !== "" &&
          value !== null &&
          value !== undefined &&
          !Number.isNaN(Number(value)) &&
          Number(value) !== 0,
      ),
    groupId: yup.mixed().required("Group is Required"),
    memberId: yup
      .mixed()
      .test(
        "required",
        "Please select a member for collection",
        (value) => value !== "" && value !== null && value !== undefined,
      ),
    loanDate: yup.mixed(),
    loanAmount: yup.mixed(),
    installmentAmount: yup.mixed(),
    currentBalance: yup.mixed(),
    demand: yup.mixed(),
    realisableAmount: yup.mixed(),
    amount: yup
      .string()
      .required("Amount is Required")
      .test("is-numeric", "Amount must be a positive number", (val) => {
        if (!val) return false;
        const num = Number(val);
        return !Number.isNaN(num) && num > 0;
      }),
    principalAmount: yup.mixed(),
    interestAmount: yup.mixed(),
    penalAmount: yup.mixed(),
    refVoucherNo: yup.string().optional(),
    transMode: yup.string().optional(),
    bankId: yup.mixed().optional(),
    bankRef: yup.string().optional(),
  });

  const methods = useForm<LoanCollectionForm>({
    mode: "onChange",
    defaultValues: {
      collectionDate: "",
      branchId: "",
      groupId: "",
      memberId: "",
      ...emptyLoanInfo,
      amount: "",
      refVoucherNo: "",
      transMode: "1",
      bankId: "",
      bankRef: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const watchedBranchId = methods.watch("branchId");
  const branchId = Number(watchedBranchId || cookieBranchId || 0);

  const clearLoanInfo = useCallback(() => {
    methods.setValue("loanDate", "");
    methods.setValue("loanAmount", "");
    methods.setValue("installmentAmount", "");
    methods.setValue("currentBalance", "");
    methods.setValue("demand", "");
    methods.setValue("realisableAmount", "");
    methods.setValue("principalAmount", "");
    methods.setValue("interestAmount", "");
    methods.setValue("penalAmount", "0");
    setActiveLoanCycle("");
    setActiveAccountId(null);
    setActiveSchemeId(null);
    setSelectedLoanDate("");
    setSelectedLoanAmount("");
    selectedMemberRef.current = null;
    schemeRatesRef.current = null;
    selectedLoansRef.current = [];
    setSelectedLoans([]);
    setIsSplitLoading(false);
    setIsLoanInfoLoading(false);
  }, [methods]);

  const resetForm = useCallback(() => {
    methods.reset({
      collectionDate: "",
      branchId: "",
      groupId: "",
      memberId: "",
      ...emptyLoanInfo,
      amount: "",
      refVoucherNo: "",
      transMode: "1",
      bankId: "",
      bankRef: "",
    });
    dispatch(setMemberList([]));
    setActiveLoanCycle("");
    setActiveAccountId(null);
    setActiveSchemeId(null);
    setSelectedLoanDate("");
    setSelectedLoanAmount("");
    selectedMemberRef.current = null;
    schemeRatesRef.current = null;
    selectedLoansRef.current = [];
    setSelectedLoans([]);
    setIsSplitLoading(false);
    setIsLoanInfoLoading(false);
  }, [methods, dispatch]);

  const extractList = (res: any): any[] => {
    const candidates = [
      res?.Data,
      res?.details,
      res?.data?.Data,
      res?.data?.details,
      res?.data?.data,
      res?.data,
      res,
    ];
    const list = candidates.find((item) => Array.isArray(item));
    return Array.isArray(list) ? list : [];
  };

  const getGroupListAPICall = useCallback(
    async (org_Id: number, branch_Id: number) => {
      try {
        setIsGroupLoading(true);
        const res = await getGroupListAPI(org_Id, branch_Id);
        dispatch(setGroupList(extractList(res)));
      } catch {
        dispatch(setGroupList([]));
        toast.error("Failed to load groups");
      } finally {
        setIsGroupLoading(false);
      }
    },
    [dispatch],
  );

  const getMemberListAPICall = useCallback(
    async (org_Id: number, group_Id: string, _branch_Id?: number) => {
      try {
        setIsMemberLoading(true);

        // Single group-level call — GetAllMemberList already returns
        // member + active loan application fields (no per-member fan-out).
        const allMembersRes = await getAllMemberListAPI(org_Id, group_Id);
        const allMembers = extractList(allMembersRes);

        const baseList = allMembers.map((m: any) => ({
          ...m,
          Member_Id: m.Member_Id ?? m.Mem_Id ?? m.mem_id,
          Member_No:
            m.Member_No ||
            m.Mem_No ||
            m.mem_no ||
            m.Member_Code ||
            m.Mem_Code ||
            m.Acc_No ||
            "",
          Member_Name: m.Member_Name || m.Mem_Name || m.mem_name || "",
          FatHusb_Name:
            m.FatHusb_Name || m.Guardian_Name || m.Gurdain_Name || "",
          Area_Name: m.Area_Name || m.Area || m.Vill_Name || "",
          Loan_Date: m.Loan_Date || m.loan_date || m.Disb_Date || "",
          Loan_Amount:
            m.Loan_Amount || m.Sanc_Amount || m.Disb_Amount || "",
          Sanc_Amount:
            m.Sanc_Amount || m.Loan_Amount || m.Disb_Amount || "",
          Installment_Amt:
            m.Installment_Amt || m.Inst_Amount || m.Inst_Amt || "",
          Outs_Amount:
            m.Outs_Amount ||
            m.Outstanding_Balance ||
            m.Curr_Balance ||
            m.Current_Balance ||
            m.Curr_Bal ||
            m.Realisable_Amt ||
            m.Resilable_Amt ||
            m.Balance ||
            "",
          Realisable_Amt:
            m.Realisable_Amt || m.Resilable_Amt || m.Outs_Amount || "",
          Account_Id:
            m.Account_Id ??
            m.Acc_Id ??
            m.account_id ??
            m.Loan_Acc_Id ??
            m.Accnt_Id ??
            null,
          Scheme_Id:
            m.Scheme_Id ?? m.Schem_Id ?? m.scheme_id ?? m.SchemeId ?? null,
          Scheme_Name: m.Scheme_Name || m.scheme_name || "",
          RoI: m.RoI ?? m.ROI ?? m.roi ?? "",
          Loan_Cycle: m.Loan_Cycle ?? m.Ln_Cycle ?? m.loan_cycle ?? "",
          Prn_1000: m.Prn_1000 ?? m.prn_1000 ?? null,
          Intt_1000: m.Intt_1000 ?? m.intt_1000 ?? null,
          Demand:
            m.Demand ??
            m.Demand_Amt ??
            m.Demand_Amount ??
            m.Installment_Amt ??
            m.Inst_Amount ??
            m.Inst_Amt ??
            "",
        }));

        dispatch(setMemberList(baseList));
      } catch {
        dispatch(setMemberList([]));
        toast.error("Failed to load members");
      } finally {
        setIsMemberLoading(false);
      }
    },
    [dispatch],
  );

  const applyMemberLoanInfo = useCallback(
    (member: any) => {
      if (!member) {
        clearLoanInfo();
        return;
      }

      selectedMemberRef.current = member;

      applyLoanInfoFields(
        (name, value) => methods.setValue(name, value),
        [member],
      );

      const accountId =
        member.Account_Id ??
        member.Acc_Id ??
        member.account_id ??
        member.Loan_Acc_Id;
      setActiveAccountId(
        accountId !== null && accountId !== undefined && accountId !== ""
          ? Number(accountId)
          : null,
      );

      const cycle = member.Loan_Cycle ?? member.Ln_Cycle ?? member.loan_cycle;
      setActiveLoanCycle(
        cycle !== null && cycle !== undefined && cycle !== ""
          ? String(cycle)
          : "",
      );

      const loanDate = member.Loan_Date || member.loan_date || "";
      setSelectedLoanDate(loanDate ? String(loanDate) : "");
      setSelectedLoanAmount(
        member.Loan_Amount ?? member.Sanc_Amount ?? member.Disb_Amount ?? "",
      );

      const schemeId = pickSchemeId(member);
      if (schemeId) setActiveSchemeId(schemeId);
      else setActiveSchemeId(null);

      // Default collection amount = Demand (or installment)
      const demandVal = pickDemand(member);
      if (demandVal !== "" && Number(demandVal) > 0) {
        methods.setValue("amount", formatMoney2(demandVal), {
          shouldValidate: true,
        });
      }

      // Apply scheme split immediately when rates are already on the row
      const fromMember = pickSchemeRates(member);
      if (fromMember && demandVal !== "" && Number(demandVal) > 0) {
        schemeRatesRef.current = fromMember;
        const split = splitBySchemePer1000(
          demandVal,
          fromMember.prn1000,
          fromMember.intt1000,
        );
        methods.setValue("principalAmount", split.principal, {
          shouldValidate: true,
        });
        methods.setValue("interestAmount", split.interest, {
          shouldValidate: true,
        });
      }
    },
    [clearLoanInfo, methods],
  );

  const ensureSchemeRates = useCallback(
    async (
      member: Record<string, any> | null | undefined,
      preferredSchemeId?: number | null,
    ) => {
      const fromMember = pickSchemeRates(member);
      if (fromMember) {
        schemeRatesRef.current = fromMember;
        return fromMember;
      }

      if (!orgId) return null;

      try {
        if (!schemeListRef.current) {
          if (!schemeListPromiseRef.current) {
            schemeListPromiseRef.current = getSchemeListAPI(Number(orgId))
              .then((res) => {
                const list = extractList(res);
                schemeListRef.current = list;
                return list;
              })
              .catch((err) => {
                schemeListPromiseRef.current = null;
                throw err;
              });
          }
          await schemeListPromiseRef.current;
        }
        const resolved = resolveSchemeRates(
          schemeListRef.current || [],
          member,
          preferredSchemeId,
        );
        schemeRatesRef.current = resolved.rates;
        if (resolved.scheme) {
          const sid = pickSchemeId(resolved.scheme);
          if (sid) setActiveSchemeId(sid);
        }
        return resolved.rates;
      } catch {
        return null;
      }
    },
    [orgId],
  );

  const applyPaymentSplit = useCallback(
    async (
      amountValue: unknown,
      member: Record<string, any> | null | undefined,
      preferredSchemeId?: number | null,
    ) => {
      const amountNum = Number(amountValue);
      if (
        amountValue === "" ||
        amountValue == null ||
        Number.isNaN(amountNum) ||
        amountNum <= 0
      ) {
        methods.setValue("principalAmount", "");
        methods.setValue("interestAmount", "");
        return;
      }

      try {
        setIsSplitLoading(true);
        const rates =
          schemeRatesRef.current ||
          (await ensureSchemeRates(member, preferredSchemeId));
        if (!rates) {
          methods.setValue("principalAmount", "");
          methods.setValue("interestAmount", "");
          return;
        }
        const split = splitBySchemePer1000(
          amountValue,
          rates.prn1000,
          rates.intt1000,
        );
        methods.setValue("principalAmount", split.principal, {
          shouldValidate: true,
        });
        methods.setValue("interestAmount", split.interest, {
          shouldValidate: true,
        });
      } finally {
        setIsSplitLoading(false);
      }
    },
    [ensureSchemeRates, methods],
  );

  const normalizeDateKey = (value: unknown) => {
    if (!value) return "";
    const raw = String(value);
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    try {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) return format(d, "yyyy-MM-dd");
    } catch {
      /* ignore */
    }
    return raw;
  };

  const findMemberRow = useCallback(
    (memberId: string | number, meta?: LoanRowMeta) => {
      const accountId = meta?.accountId;
      const loanDateKey = normalizeDateKey(meta?.loanDate);
      const loanAmt =
        meta?.loanAmount !== undefined && meta?.loanAmount !== null
          ? Number(meta.loanAmount)
          : null;

      const candidates = memberList.filter(
        (m) => String(m.Member_Id ?? m.Mem_Id) === String(memberId),
      );
      if (candidates.length === 0) return undefined;
      if (candidates.length === 1) return candidates[0];

      if (
        accountId !== null &&
        accountId !== undefined &&
        accountId !== ""
      ) {
        const byAccount = candidates.find((m) => {
          const rowAccount =
            m.Account_Id ?? m.Acc_Id ?? m.account_id ?? m.Loan_Acc_Id;
          return String(rowAccount) === String(accountId);
        });
        if (byAccount) return byAccount;
      }

      if (loanDateKey || (loanAmt !== null && !Number.isNaN(loanAmt))) {
        const byLoan = candidates.find((m) => {
          const sameDate =
            !loanDateKey ||
            normalizeDateKey(m.Loan_Date || m.loan_date) === loanDateKey;
          const sameAmt =
            loanAmt === null ||
            Number.isNaN(loanAmt) ||
            Number(m.Loan_Amount ?? m.Sanc_Amount) === loanAmt;
          return sameDate && sameAmt;
        });
        if (byLoan) return byLoan;
      }

      return candidates[0];
    },
    [memberList],
  );

  const isSameLoanSelection = useCallback(
    (memberId: string | number, meta?: LoanRowMeta) => {
      const currentId = methods.getValues("memberId");
      if (String(currentId) !== String(memberId)) return false;

      const accountId = meta?.accountId;
      if (
        accountId !== null &&
        accountId !== undefined &&
        accountId !== "" &&
        activeAccountId != null
      ) {
        return String(activeAccountId) === String(accountId);
      }

      const dateKey = normalizeDateKey(meta?.loanDate);
      const amt =
        meta?.loanAmount !== undefined && meta?.loanAmount !== null
          ? Number(meta.loanAmount)
          : null;

      const sameDate =
        !dateKey ||
        !selectedLoanDate ||
        normalizeDateKey(selectedLoanDate) === dateKey;
      const sameAmt =
        amt === null ||
        Number.isNaN(amt) ||
        selectedLoanAmount === "" ||
        Number(selectedLoanAmount) === amt;
      return sameDate && sameAmt;
    },
    [methods, activeAccountId, selectedLoanDate, selectedLoanAmount],
  );

  /** One GetLoanCycleList call for the checked Collect row — merge without wiping list balances. */
  const loadSelectedLoanDetails = useCallback(
    async (
      org_Id: number,
      branch_Id: number,
      group_Id: string,
      memberId: string | number,
      member: any,
    ) => {
      try {
        const cycleRes = await getLoanCycleListAPI(
          org_Id,
          branch_Id,
          group_Id,
          String(memberId),
        );
        const cycles =
          cycleRes?.Data ||
          cycleRes?.data?.Data ||
          extractList(cycleRes);
        if (!Array.isArray(cycles) || cycles.length === 0) return member;

        const loanDateKey = normalizeDateKey(
          member?.Loan_Date || member?.loan_date,
        );
        const loanAmt = Number(member?.Loan_Amount ?? member?.Sanc_Amount);
        const accountId =
          member?.Account_Id ??
          member?.Acc_Id ??
          member?.account_id ??
          member?.Loan_Acc_Id;

        let matched =
          cycles.find((c: any) => {
            const rowAccount =
              c.Account_Id ?? c.Acc_Id ?? c.account_id ?? c.Loan_Acc_Id;
            if (
              accountId !== null &&
              accountId !== undefined &&
              accountId !== "" &&
              rowAccount !== null &&
              rowAccount !== undefined &&
              rowAccount !== ""
            ) {
              return String(rowAccount) === String(accountId);
            }
            const sameDate =
              !loanDateKey ||
              normalizeDateKey(c.Loan_Date || c.loan_date) === loanDateKey;
            const sameAmt =
              Number.isNaN(loanAmt) ||
              Number(c.Loan_Amount ?? c.Sanc_Amount) === loanAmt;
            return sameDate && sameAmt;
          }) || null;

        if (!matched) {
          matched = [...cycles].sort(
            (a, b) => Number(b.Loan_Cycle || 0) - Number(a.Loan_Cycle || 0),
          )[0];
        }

        return {
          ...member,
          ...matched,
          Account_Id: preferFilled(
            matched?.Account_Id ?? matched?.Acc_Id,
            member.Account_Id ?? member.Acc_Id ?? accountId,
          ),
          Loan_Cycle: preferFilled(
            matched?.Loan_Cycle ?? matched?.Ln_Cycle,
            member.Loan_Cycle ?? member.Ln_Cycle ?? "",
          ),
          Scheme_Id: preferFilled(
            matched?.Scheme_Id ?? matched?.Schem_Id ?? matched?.scheme_id,
            member.Scheme_Id ?? member.Schem_Id ?? null,
          ),
          Scheme_Name: preferFilled(
            matched?.Scheme_Name ?? matched?.scheme_name,
            member.Scheme_Name || "",
          ),
          RoI: preferFilled(
            matched?.RoI ?? matched?.ROI,
            member.RoI ?? member.ROI ?? "",
          ),
          Loan_Date: preferFilled(
            matched?.Loan_Date ?? matched?.loan_date,
            member.Loan_Date || member.loan_date || "",
          ),
          Loan_Amount: preferFilled(
            matched?.Loan_Amount ?? matched?.Sanc_Amount,
            member.Loan_Amount || member.Sanc_Amount || "",
          ),
          Installment_Amt: preferFilled(
            matched?.Installment_Amt ?? matched?.Inst_Amount,
            member.Installment_Amt || "",
          ),
          // Never let cycle Outs_Amount=0 wipe the list-row outstanding
          Outs_Amount: preferFilled(
            matched?.Outs_Amount ??
              matched?.Outstanding_Balance ??
              matched?.Curr_Balance,
            member.Outs_Amount ||
              member.Outstanding_Balance ||
              member.Curr_Balance ||
              member.Realisable_Amt ||
              "",
          ),
          Realisable_Amt: preferFilled(
            matched?.Realisable_Amt ?? matched?.Resilable_Amt,
            member.Realisable_Amt || member.Resilable_Amt || "",
          ),
          Demand: preferFilled(
            matched?.Demand ?? matched?.Demand_Amt ?? matched?.Coll_Demand,
            member.Demand ||
              member.Demand_Amt ||
              member.Installment_Amt ||
              "",
          ),
          Prn_1000: preferFilled(matched?.Prn_1000, member.Prn_1000),
          Intt_1000: preferFilled(matched?.Intt_1000, member.Intt_1000),
          Penal_Amount: preferFilled(
            matched?.Penal_Amount ?? matched?.Penal_Amt,
            member.Penal_Amount ?? member.Penal_Amt ?? 0,
          ),
        };
      } catch {
        return member;
      }
    },
    [],
  );

  const onSubmit = async (data: LoanCollectionForm) => {
    try {
      if (!activeAccountId) {
        toast.error(
          "Loan account not found for selected member. Please re-select Collect.",
        );
        return;
      }

      setLoading(true);
      const formattedDate =
        data.collectionDate instanceof Date
          ? format(data.collectionDate, "yyyy-MM-dd")
          : data.collectionDate || "";

      const payload = {
        org_id: Number(orgId),
        branch_id: Number(data.branchId || cookieBranchId),
        coll_date: formattedDate,
        ref_vouch: data.refVoucherNo?.trim() || null,
        coll_data: [
          {
            account_id: activeAccountId,
            member_id: Number(data.memberId),
            coll_amount: Number(data.amount),
            prn_amount: Number(data.principalAmount) || 0,
            intt_amount: Number(data.interestAmount) || 0,
            penal_amount: Number(data.penalAmount) || 0,
          },
        ],
      };

      const res = await postCollectionAPI(payload);
      const dataBlock = res?.Data && !Array.isArray(res.Data) ? res.Data : {};
      const message = String(res?.message || dataBlock?.Message || "");
      const details =
        typeof res?.details === "string"
          ? res.details
          : typeof dataBlock?.Message === "string"
            ? dataBlock.Message
            : "";
      const voucherNo = String(dataBlock?.Voucher_No || "");

      if (/error/i.test(message) || !voucherNo) {
        toast.error(details || message || "Failed to save collection.");
        return;
      }

      const lines = [
        details || "Loan Collection Posted Successfully !!",
        `Receipt No: ${voucherNo}`,
      ];
      setSuccessMessage(lines.join("\n"));
      setShowSuccessMessage(true);
    } catch (error: any) {
      const body = error?.response?.data;
      const details = body?.details;
      const detailText =
        typeof details === "string"
          ? details
          : details && typeof details === "object"
            ? Object.values(details)
                .flat()
                .map((item) => String(item))
                .filter(Boolean)
                .join(" ")
            : "";
      toast.error(
        detailText || body?.message || "Something went wrong while saving!",
      );
    } finally {
      setLoading(false);
    }
  };

  const watchedGroupId = methods.watch("groupId");
  const watchedMemberId = methods.watch("memberId");
  const watchedAmount = methods.watch("amount");

  // After user types Amount: split using cached scheme rates (no repeat GetScheme)
  useEffect(() => {
    const amountNum = Number(watchedAmount);
    const hasAmount =
      watchedAmount !== "" &&
      watchedAmount != null &&
      !Number.isNaN(amountNum) &&
      amountNum > 0;

    if (!hasAmount) {
      methods.setValue("principalAmount", "");
      methods.setValue("interestAmount", "");
      setIsSplitLoading(false);
      return;
    }

    if (!watchedMemberId) {
      methods.setValue("principalAmount", "");
      methods.setValue("interestAmount", "");
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      const member =
        selectedMemberRef.current ||
        findMemberRow(watchedMemberId, {
          accountId: activeAccountId,
          loanDate: selectedLoanDate,
          loanAmount: selectedLoanAmount,
        });
      await applyPaymentSplit(watchedAmount, member, activeSchemeId);
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAmount, watchedMemberId, activeSchemeId]);

  useEffect(() => {
    methods.setValue("groupId", "");
    methods.setValue("memberId", "");
    clearLoanInfo();
    dispatch(setMemberList([]));

    if (orgId && watchedBranchId) {
      getGroupListAPICall(Number(orgId), Number(watchedBranchId));
    } else {
      dispatch(setGroupList([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload groups when branch changes
  }, [watchedBranchId, orgId]);

  useEffect(() => {
    methods.setValue("memberId", "");
    methods.setValue("amount", "");
    clearLoanInfo();

    if (orgId && watchedGroupId && branchId) {
      getMemberListAPICall(
        Number(orgId),
        String(watchedGroupId),
        Number(branchId),
      );
    } else {
      dispatch(setMemberList([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to group changes
  }, [watchedGroupId, orgId, branchId]);

  useEffect(() => {
    if (!watchedMemberId) {
      clearLoanInfo();
      methods.setValue("amount", "");
      methods.setValue("principalAmount", "");
      methods.setValue("interestAmount", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedMemberId]);

  useEffect(() => {
    return () => {
      dispatch(resetLoanCollection());
    };
  }, [dispatch]);

  const loansMatch = useCallback(
    (
      memberId: string | number,
      meta: LoanRowMeta | undefined,
      other: { memberId: string | number } & LoanRowMeta,
    ) => {
      if (String(memberId) !== String(other.memberId)) return false;
      const accountId = meta?.accountId;
      if (
        accountId !== null &&
        accountId !== undefined &&
        accountId !== "" &&
        other.accountId !== null &&
        other.accountId !== undefined &&
        other.accountId !== ""
      ) {
        return String(accountId) === String(other.accountId);
      }
      const dateKey = normalizeDateKey(meta?.loanDate);
      const otherDate = normalizeDateKey(other.loanDate);
      const amount =
        meta?.loanAmount !== undefined &&
        meta?.loanAmount !== null &&
        meta?.loanAmount !== ""
          ? Number(meta.loanAmount)
          : null;
      const otherAmount =
        other.loanAmount !== undefined &&
        other.loanAmount !== null &&
        other.loanAmount !== ""
          ? Number(other.loanAmount)
          : null;
      const sameDate = !dateKey || !otherDate || dateKey === otherDate;
      const sameAmount =
        amount === null ||
        otherAmount === null ||
        Number.isNaN(amount) ||
        Number.isNaN(otherAmount) ||
        amount === otherAmount;
      return sameDate && sameAmount;
    },
    [],
  );

  const rememberLoan = useCallback(
    (memberId: string | number, meta?: LoanRowMeta) => {
      const entry = {
        memberId,
        accountId: meta?.accountId,
        loanDate: meta?.loanDate,
        loanAmount: meta?.loanAmount,
      };
      if (
        selectedLoansRef.current.some((item) =>
          loansMatch(memberId, meta, item),
        )
      ) {
        return;
      }
      const next = [...selectedLoansRef.current, entry];
      selectedLoansRef.current = next;
      setSelectedLoans(next);
    },
    [loansMatch],
  );

  const activateLoan = useCallback(
    (memberId: string | number, meta?: LoanRowMeta) => {
      const member = findMemberRow(memberId, meta);
      if (!member) {
        toast.error("Selected loan details not found");
        return;
      }

      const token = ++selectionTokenRef.current;
      schemeRatesRef.current = null;
      methods.setValue("principalAmount", "");
      methods.setValue("interestAmount", "");
      applyMemberLoanInfo(member);
      methods.setValue("memberId", memberId, { shouldValidate: true });

      if (!orgId || !branchId || !watchedGroupId) return;

      setIsLoanInfoLoading(true);
      void loadSelectedLoanDetails(
        Number(orgId),
        Number(branchId),
        String(watchedGroupId),
        memberId,
        member,
      )
        .then(async (enriched) => {
          if (selectionTokenRef.current !== token) return;
          applyMemberLoanInfo(enriched);
          const demandVal =
            methods.getValues("amount") || pickDemand(enriched);
          await applyPaymentSplit(
            demandVal,
            enriched,
            pickSchemeId(enriched),
          );
        })
        .finally(() => {
          if (selectionTokenRef.current === token) {
            setIsLoanInfoLoading(false);
          }
        });
    },
    [
      findMemberRow,
      methods,
      applyMemberLoanInfo,
      orgId,
      branchId,
      watchedGroupId,
      loadSelectedLoanDetails,
      applyPaymentSplit,
    ],
  );

  const onToggleCollection = useCallback(
    (
      memberId: string | number,
      checked: boolean,
      meta?: LoanRowMeta,
    ) => {
      if (
        memberId === "" ||
        memberId === null ||
        memberId === undefined
      ) {
        toast.error("Invalid member selection");
        return;
      }

      if (!checked) {
        const next = selectedLoansRef.current.filter(
          (item) => !loansMatch(memberId, meta, item),
        );
        selectedLoansRef.current = next;
        setSelectedLoans(next);
        if (!isSameLoanSelection(memberId, meta)) return;

        selectionTokenRef.current += 1;
        if (next.length === 0) {
          methods.setValue("memberId", "", { shouldValidate: true });
          methods.setValue("amount", "");
          methods.setValue("principalAmount", "");
          methods.setValue("interestAmount", "");
          clearLoanInfo();
          return;
        }

        const last = next[next.length - 1];
        activateLoan(last.memberId, last);
        return;
      }

      rememberLoan(memberId, meta);
      if (isSameLoanSelection(memberId, meta)) return;
      activateLoan(memberId, meta);
    },
    [
      methods,
      clearLoanInfo,
      isSameLoanSelection,
      loansMatch,
      rememberLoan,
      activateLoan,
    ],
  );

  const handleSuccessClose = useCallback(
    (open: boolean) => {
      setShowSuccessMessage(open);
      if (!open) {
        setSuccessMessage("");
        resetForm();
      }
    },
    [resetForm],
  );

  return {
    methods,
    onSubmit,
    resetForm,
    groupList,
    memberList,
    isGroupLoading,
    isMemberLoading,
    isLoanInfoLoading,
    isSplitLoading,
    loading,
    onToggleCollection,
    selectedLoans,
    showSuccessMessage,
    successMessage,
    handleSuccessClose,
    activeAccountId,
    selectedLoanDate,
    selectedLoanAmount,
  };
};
