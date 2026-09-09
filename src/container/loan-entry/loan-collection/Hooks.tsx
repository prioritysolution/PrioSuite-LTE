"use client";

import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import { toast } from "sonner";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch, RootState } from "@/redux/store";
import { LoanCollectionForm } from "./LoanCollectionType";
import {
  setGroupList,
  setMemberList,
  resetLoanCollection,
} from "./LoanCollectionReducer";
import {
  getGroupListAPI,
  getAllMemberListAPI,
  getGroupMemberAPI,
  getLoanCycleListAPI,
  getLoanCollectionReportAPI,
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
  return pickAmount(
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
    source.Loan_Amount,
    source.Sanc_Amount,
  );
};

/** Period demand / amount due — never use Realisable_Amt. */
const pickDemand = (source: Record<string, any> | null | undefined) => {
  if (!source) return "";
  return pickAmount(
    source.Demand,
    source.Demand_Amt,
    source.Demand_Amount,
    source.Due_Amount,
    source.Due_Amt,
    source.Coll_Demand,
    source.Inst_Demand,
    source.Installment_Amt,
    source.Inst_Amount,
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
  );
  const inttRaw = pickAmount(
    scheme.Intt_1000,
    scheme.intt_1000,
    scheme.Intt1000,
    scheme.INTT_1000,
  );
  if (prnRaw === "" && inttRaw === "") return null;
  return {
    prn1000: prnRaw === "" ? 0 : Number(prnRaw),
    intt1000: inttRaw === "" ? 0 : Number(inttRaw),
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
  const finId = getCookieData<string | number>("priobank-lite-financial_Id");

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
    transMode: yup.string().required("Transaction Mode is Required"),
    bankId: yup.mixed().when("transMode", {
      is: "2",
      then: (s: any) => s.required("Bank Account is required"),
      otherwise: (s: any) => s.optional(),
    }),
    bankRef: yup.string().when("transMode", {
      is: "2",
      then: (s: any) => s.optional(),
      otherwise: (s: any) => s.optional(),
    }),
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
    setIsSplitLoading(false);
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
    setIsSplitLoading(false);
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

  const enrichMemberLoanDetails = useCallback(
    async (
      org_Id: number,
      branch_Id: number,
      group_Id: string,
      member: any,
    ) => {
      const memberId = String(
        member?.Member_Id ?? member?.Mem_Id ?? member?.mem_id ?? "",
      );
      if (!memberId) return member;

      try {
        const cycleRes = await getLoanCycleListAPI(
          org_Id,
          branch_Id,
          group_Id,
          memberId,
        );
        const cycles =
          cycleRes?.Data ||
          cycleRes?.data?.Data ||
          extractList(cycleRes);
        if (!Array.isArray(cycles) || cycles.length === 0) return member;

        const latest = [...cycles].sort(
          (a, b) => Number(b.Loan_Cycle || 0) - Number(a.Loan_Cycle || 0),
        )[0];
        const loanCycle = String(latest?.Loan_Cycle ?? "");

        let loanInfo: any = null;
        let lastCollection: any = null;

        if (loanCycle) {
          const reportRes = await getLoanCollectionReportAPI(
            org_Id,
            group_Id,
            memberId,
            "",
            "",
            String(branch_Id),
            loanCycle,
          );
          const data = reportRes?.Data || reportRes?.data?.Data;
          if (data) {
            loanInfo = data.loan_info?.[0] || data.Loan_Info?.[0] || null;
            const report =
              data.collection_report || data.Collection_Report || [];
            if (Array.isArray(report) && report.length > 0) {
              lastCollection = report[report.length - 1];
            }
          }
        }

        return {
          ...member,
          Loan_Date:
            loanInfo?.Loan_Date ||
            latest?.Loan_Date ||
            member.Loan_Date ||
            member.loan_date ||
            "",
          Sanc_Amount:
            loanInfo?.Loan_Amount ||
            loanInfo?.Sanc_Amount ||
            latest?.Loan_Amount ||
            latest?.Sanc_Amount ||
            member.Sanc_Amount ||
            member.Loan_Amount ||
            "",
          Loan_Amount:
            loanInfo?.Loan_Amount ||
            loanInfo?.Sanc_Amount ||
            latest?.Loan_Amount ||
            member.Loan_Amount ||
            member.Sanc_Amount ||
            "",
          Installment_Amt:
            loanInfo?.Installment_Amt ||
            latest?.Installment_Amt ||
            member.Installment_Amt ||
            member.Inst_Amount ||
            "",
          Realisable_Amt:
            loanInfo?.Realisable_Amt ||
            member.Realisable_Amt ||
            member.Resilable_Amt ||
            "",
          Outs_Amount:
            lastCollection?.Outs_Amount ||
            lastCollection?.Balance ||
            loanInfo?.Outs_Amount ||
            loanInfo?.Outstanding_Balance ||
            loanInfo?.Realisable_Amt ||
            member.Outs_Amount ||
            member.Curr_Balance ||
            member.Realisable_Amt ||
            "",
          Account_Id:
            latest?.Account_Id ||
            loanInfo?.Account_Id ||
            member.Account_Id ||
            null,
          Scheme_Id:
            latest?.Scheme_Id ||
            latest?.Schem_Id ||
            loanInfo?.Scheme_Id ||
            loanInfo?.Schem_Id ||
            member.Scheme_Id ||
            member.Schem_Id ||
            null,
          Loan_Cycle: loanCycle || member.Loan_Cycle || "",
        };
      } catch {
        return member;
      }
    },
    [],
  );

  const getMemberListAPICall = useCallback(
    async (org_Id: number, group_Id: string, branch_Id?: number) => {
      try {
        setIsMemberLoading(true);

        const [allMembersRes, groupMembersRes] = await Promise.all([
          getAllMemberListAPI(org_Id, group_Id).catch(() => null),
          getGroupMemberAPI(org_Id, group_Id).catch(() => null),
        ]);

        const allMembers = extractList(allMembersRes);
        const groupMembers = extractList(groupMembersRes);

        // Prefer GetAllMemberList (loan fields); merge Member_No / name from GetGroupMember
        const groupMap = new Map<string, any>();
        groupMembers.forEach((gm: any) => {
          const id = String(gm.Member_Id ?? gm.Mem_Id ?? gm.mem_id ?? "");
          if (id) groupMap.set(id, gm);
        });

        let baseList =
          allMembers.length > 0
            ? allMembers
            : groupMembers.length > 0
              ? groupMembers
              : [];

        // If GetAllMemberList returned rows without ids matching group members, merge both
        if (allMembers.length > 0 && groupMembers.length > 0) {
          baseList = allMembers.map((m: any) => {
            const id = String(m.Member_Id ?? m.Mem_Id ?? m.mem_id ?? "");
            const gm = groupMap.get(id);
            if (!gm) return m;
            return {
              ...gm,
              ...m,
              Member_Id: m.Member_Id ?? gm.Member_Id ?? gm.Mem_Id,
              Member_No:
                m.Member_No ||
                m.Mem_No ||
                m.mem_no ||
                m.Member_Code ||
                m.Mem_Code ||
                gm.Member_No ||
                gm.Mem_No ||
                "",
              Member_Name:
                m.Member_Name ||
                m.Mem_Name ||
                gm.Member_Name ||
                gm.Mem_Name ||
                "",
              FatHusb_Name:
                m.FatHusb_Name ||
                gm.FatHusb_Name ||
                gm.Guardian_Name ||
                "",
              Area_Name: m.Area_Name || gm.Area_Name || gm.Area || "",
            };
          });

          // Include any group members missing from all-members list
          groupMembers.forEach((gm: any) => {
            const id = String(gm.Member_Id ?? gm.Mem_Id ?? gm.mem_id ?? "");
            if (
              id &&
              !baseList.some(
                (m: any) =>
                  String(m.Member_Id ?? m.Mem_Id ?? m.mem_id ?? "") === id,
              )
            ) {
              baseList.push(gm);
            }
          });
        } else if (groupMembers.length > 0 && allMembers.length === 0) {
          baseList = groupMembers;
        }

        // Normalize member no / name on every row
        baseList = baseList.map((m: any) => ({
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
        }));

        const branch = Number(branch_Id || branchId || 0);
        const enriched =
          branch > 0
            ? await Promise.all(
                baseList.map((member: any) =>
                  enrichMemberLoanDetails(
                    org_Id,
                    branch,
                    group_Id,
                    member,
                  ),
                ),
              )
            : baseList;

        dispatch(setMemberList(enriched));
      } catch {
        dispatch(setMemberList([]));
        toast.error("Failed to load members");
      } finally {
        setIsMemberLoading(false);
      }
    },
    [dispatch, branchId, enrichMemberLoanDetails],
  );

  const applyMemberLoanInfo = useCallback(
    (member: any) => {
      if (!member) {
        clearLoanInfo();
        return;
      }

      applyLoanInfoFields(
        (name, value) => methods.setValue(name, value),
        [member],
      );
      setActiveAccountId(
        member.Account_Id ? Number(member.Account_Id) : null,
      );
      const schemeId = pickSchemeId(member);
      if (schemeId) setActiveSchemeId(schemeId);
    },
    [clearLoanInfo, methods],
  );

  const loadLoanInfoAPICall = useCallback(
    async (
      org_Id: number,
      branch_Id: number,
      group_Id: string,
      member_Id: string,
      member: any,
    ) => {
      try {
        setIsLoanInfoLoading(true);
        applyMemberLoanInfo(member);

        const cycleRes = await getLoanCycleListAPI(
          org_Id,
          branch_Id,
          group_Id,
          member_Id,
        );
        const cycles =
          cycleRes?.Data ||
          cycleRes?.data?.Data ||
          extractList(cycleRes);
        if (!Array.isArray(cycles) || cycles.length === 0) return;

        const latest = [...cycles].sort(
          (a, b) => Number(b.Loan_Cycle || 0) - Number(a.Loan_Cycle || 0),
        )[0];
        const loanCycle = String(latest?.Loan_Cycle ?? "");
        setActiveLoanCycle(loanCycle);

        if (latest?.Account_Id) {
          setActiveAccountId(Number(latest.Account_Id));
        }

        const schemeFromCycle = pickSchemeId(member, latest);
        if (schemeFromCycle) setActiveSchemeId(schemeFromCycle);

        // Cycle row often has loan date / amounts for the active account
        applyLoanInfoFields(
          (name, value) => methods.setValue(name, value),
          [member, latest],
        );

        const reportRes = await getLoanCollectionReportAPI(
          org_Id,
          group_Id,
          member_Id,
          "",
          "",
          String(branch_Id),
          loanCycle,
        );

        if (
          (reportRes?.message === "Data Found" ||
            reportRes?.data?.message === "Data Found") &&
          (reportRes?.Data || reportRes?.data?.Data)
        ) {
          const data = reportRes.Data || reportRes.data.Data;
          const info = data.loan_info?.[0] || data.Loan_Info?.[0] || null;
          const report =
            data.collection_report || data.Collection_Report || [];

          // Prefer loan_info; if collections exist, outstanding comes from last Outs_Amount
          const lastCollection =
            Array.isArray(report) && report.length > 0
              ? report[report.length - 1]
              : null;

          applyLoanInfoFields(
            (name, value) => methods.setValue(name, value),
            [member, latest, info, lastCollection],
          );

          const schemeId = pickSchemeId(info, lastCollection, latest, member);
          if (schemeId) setActiveSchemeId(schemeId);

          // Explicit outstanding from ledger when collections exist
          if (lastCollection) {
            const outs = pickAmount(
              lastCollection.Outs_Amount,
              lastCollection.Outstanding_Balance,
              lastCollection.Balance,
            );
            if (outs !== "") {
              methods.setValue("currentBalance", formatMoney2(outs));
            }
          } else if (info) {
            const outs = pickCurrentBalance(info);
            if (outs !== "") {
              methods.setValue("currentBalance", formatMoney2(outs));
            }
          }

          if (info) {
            const demand = pickDemand(info);
            if (demand !== "") {
              methods.setValue("demand", formatMoney2(demand));
            }
          }
        }
      } catch {
        // Member-level fields already applied as fallback
      } finally {
        setIsLoanInfoLoading(false);
      }
    },
    [applyMemberLoanInfo, methods],
  );

  const onSubmit = async (data: LoanCollectionForm) => {
    try {
      setLoading(true);
      const formattedDate =
        data.collectionDate instanceof Date
          ? format(data.collectionDate, "yyyy-MM-dd")
          : data.collectionDate || "";

      const payload = {
        org_id: Number(orgId),
        branch_id: Number(data.branchId || cookieBranchId),
        fin_id: Number(finId),
        group_id: Number(data.groupId),
        member_id: Number(data.memberId),
        account_id: activeAccountId,
        loan_cycle: activeLoanCycle || null,
        coll_date: formattedDate,
        amount: Number(data.amount),
        prn_amt: Number(data.principalAmount) || 0,
        intt_amt: Number(data.interestAmount) || 0,
        penal_amt: Number(data.penalAmount) || 0,
        ref_vouch: data.refVoucherNo || "",
        trans_mode: Number(data.transMode),
        bank_id:
          Number(data.transMode) === 2 && data.bankId
            ? Number(data.bankId)
            : null,
        bank_ref:
          Number(data.transMode) === 2 ? data.bankRef || "" : "",
      };

      const res = await postCollectionAPI(payload);
      const dataBlock = res?.Data || res?.data?.Data || res?.data || res;
      const message =
        dataBlock?.Message ||
        dataBlock?.message ||
        res?.Message ||
        res?.message ||
        res?.massage ||
        res?.data?.message ||
        "";
      const voucherNo =
        dataBlock?.Voucher_No ||
        dataBlock?.voucher_no ||
        dataBlock?.VoucherNo ||
        res?.Voucher_No ||
        res?.voucher_no ||
        res?.data?.Voucher_No ||
        "";

      const isSuccess =
        message === "Success" ||
        res?.status === "Success" ||
        res?.data?.status === "Success" ||
        String(message).toLowerCase().includes("success") ||
        !!voucherNo ||
        !!res?.Data;

      if (isSuccess) {
        const lines = [
          message || "Loan Collection Posted Successfully !!",
          voucherNo ? `Voucher No: ${voucherNo}` : "",
        ].filter(Boolean);
        setSuccessMessage(lines.join("\n"));
        setShowSuccessMessage(true);
      } else {
        toast.error(message || "Failed to save collection.");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Something went wrong while saving!",
      );
    } finally {
      setLoading(false);
    }
  };

  const watchedGroupId = methods.watch("groupId");
  const watchedMemberId = methods.watch("memberId");
  const watchedTransMode = methods.watch("transMode");
  const watchedAmount = methods.watch("amount");

  useEffect(() => {
    if (watchedTransMode !== "2") {
      methods.setValue("bankId", "");
      methods.setValue("bankRef", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- clear bank fields on mode switch
  }, [watchedTransMode]);

  // After user types Amount: fetch mst_scheme Prn_1000 / Intt_1000 and split
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

    if (!watchedMemberId || !orgId) {
      methods.setValue("principalAmount", "");
      methods.setValue("interestAmount", "");
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setIsSplitLoading(true);
        methods.setValue("principalAmount", "");
        methods.setValue("interestAmount", "");

        const res = await getSchemeListAPI(Number(orgId));
        if (cancelled) return;

        const schemes = extractList(res);
        const member = memberList.find(
          (m) =>
            String(m.Member_Id ?? m.Mem_Id) === String(watchedMemberId),
        );
        const schemeId =
          activeSchemeId ||
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
              Number(s.Scheme_Id ?? s.Schem_Id ?? s.scheme_id) ===
              Number(schemeId),
          );
        }

        // If loan row had no scheme id, try match by scheme name on member/loan
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

        const rates = pickSchemeRates(scheme);
        if (!rates) {
          toast.error(
            "Scheme Prn_1000 / Intt_1000 not found for selected member",
          );
          methods.setValue("principalAmount", "");
          methods.setValue("interestAmount", "");
          return;
        }

        if (scheme?.Scheme_Id || scheme?.Schem_Id) {
          setActiveSchemeId(
            Number(scheme.Scheme_Id ?? scheme.Schem_Id ?? scheme.scheme_id),
          );
        }

        const split = splitBySchemePer1000(
          watchedAmount,
          rates.prn1000,
          rates.intt1000,
        );
        if (cancelled) return;
        methods.setValue("principalAmount", split.principal);
        methods.setValue("interestAmount", split.interest);
      } catch {
        if (!cancelled) {
          toast.error("Failed to calculate principal / interest");
          methods.setValue("principalAmount", "");
          methods.setValue("interestAmount", "");
        }
      } finally {
        if (!cancelled) setIsSplitLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedAmount, watchedMemberId, orgId, activeSchemeId, memberList]);

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
      return;
    }

    if (!orgId || !branchId || !watchedGroupId) return;

    const member = memberList.find(
      (m) =>
        String(m.Member_Id ?? m.Mem_Id) === String(watchedMemberId),
    );

    loadLoanInfoAPICall(
      Number(orgId),
      Number(branchId),
      String(watchedGroupId),
      String(watchedMemberId),
      member,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when member/list ready
  }, [watchedMemberId, watchedGroupId, orgId, branchId, memberList]);

  useEffect(() => {
    return () => {
      dispatch(resetLoanCollection());
    };
  }, [dispatch]);

  const onToggleCollection = useCallback(
    (memberId: string | number, checked: boolean) => {
      if (
        memberId === "" ||
        memberId === null ||
        memberId === undefined
      ) {
        toast.error("Invalid member selection");
        return;
      }

      const currentId = methods.getValues("memberId");

      // Uncheck only the currently selected member
      if (!checked) {
        if (String(currentId) !== String(memberId)) return;
        methods.setValue("memberId", "", { shouldValidate: true });
        methods.setValue("amount", "");
        methods.setValue("principalAmount", "");
        methods.setValue("interestAmount", "");
        clearLoanInfo();
        return;
      }

      // Already selected — no-op
      if (String(currentId) === String(memberId)) return;

      // Switch to this member (exclusive: only one at a time)
      clearLoanInfo();
      methods.setValue("amount", "");
      methods.setValue("principalAmount", "");
      methods.setValue("interestAmount", "");
      methods.setValue("memberId", memberId, { shouldValidate: true });
    },
    [methods, clearLoanInfo],
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
    showSuccessMessage,
    successMessage,
    handleSuccessClose,
  };
};
