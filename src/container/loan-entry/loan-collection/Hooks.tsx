"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format, isValid as isValidDate } from "date-fns";
import { toast } from "sonner";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch, RootState } from "@/redux/store";
import {
  CollectionLoanRow,
  CollectionReceipt,
  CollectionResult,
  CollectionTotals,
  LoanCollectionForm,
  PaymentEntryField,
  PaymentEntryRow,
  PostCollectionPayload,
} from "./LoanCollectionType";
import {
  setGroupList,
  setMemberList,
  resetLoanCollection,
} from "./LoanCollectionReducer";
import {
  calcCollectionSplitAPI,
  getCollectionLoanListAPI,
  getGroupListAPI,
  postCollectionAPI,
} from "./LoanCollectionApi";

const SPLIT_DEBOUNCE_MS = 400;

const emptyForm: LoanCollectionForm = {
  collectionDate: "",
  branchId: "",
  groupId: "",
  refVoucherNo: "",
};

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

const pick = (row: any, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const round2 = (value: number) => Math.round(value * 100) / 100;

const toApiDate = (value: unknown) => {
  if (value instanceof Date) {
    return isValidDate(value) ? format(value, "yyyy-MM-dd") : "";
  }
  return typeof value === "string" ? value.trim() : "";
};

/** Keeps digits and a single decimal point with at most 2 decimals. */
const sanitizeAmountInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) return whole;
  return `${whole}.${rest.join("").slice(0, 2)}`;
};

const normalizeLoanRow = (item: any): CollectionLoanRow | null => {
  const accountId = toNumber(
    pick(item, ["Account_Id", "Acc_Id", "account_id", "Loan_Acc_Id"]),
  );
  if (!accountId) return null;
  return {
    accountId,
    accountNo: String(
      pick(item, [
        "Account_No",
        "Acc_No",
        "account_no",
        "Loan_Acc_No",
        "Loan_Account_No",
      ]) || "",
    ).trim(),
    memberId: toNumber(pick(item, ["Member_Id", "Mem_Id", "member_id"])),
    memberNo: String(pick(item, ["Member_No", "Mem_No", "member_no"]) || ""),
    memberName: String(pick(item, ["Member_Name", "Mem_Name", "member_name"]) || ""),
    guardianName: String(pick(item, ["FatHusb_Name", "Guardian_Name", "Gurdain_Name"]) || ""),
    areaName: String(pick(item, ["Area_Name", "Area", "Vill_Name"]) || ""),
    loanCycle: String(pick(item, ["Loan_Cycle", "Ln_Cycle", "loan_cycle"]) || ""),
    loanDate: String(pick(item, ["Loan_Date", "loan_date", "Disb_Date"]) || ""),
    loanAmount: toNumber(pick(item, ["Loan_Amount", "Sanc_Amount", "Disb_Amount"])),
    installmentAmt: toNumber(pick(item, ["Installment_Amt", "Inst_Amount", "Inst_Amt"])),
    balance: toNumber(pick(item, ["Balance", "Outs_Amount", "Outstanding_Balance"])),
    currentDemand: toNumber(item?.Current_Demand),
    collAmount: toNumber(item?.Coll_Amount),
    prnAmount: toNumber(item?.Prn_Amount),
    inttAmount: toNumber(item?.Intt_Amount),
    penalAmount: toNumber(item?.Penal_Amount),
  };
};

const toPaymentEntry = (row: CollectionLoanRow): PaymentEntryRow => ({
  accountId: row.accountId,
  accountNo: row.accountNo,
  memberId: row.memberId,
  memberNo: row.memberNo,
  memberName: row.memberName,
  balance: row.balance,
  amount: row.collAmount > 0 ? String(row.collAmount) : "",
  penal: row.penalAmount > 0 ? String(row.penalAmount) : "0",
  principal: row.prnAmount,
  interest: row.inttAmount,
  splitPending: false,
  splitError: "",
  serverError: "",
});

const mapReceipt = (row: any): CollectionReceipt => ({
  accountId: toNumber(row?.Account_Id),
  memberId: toNumber(row?.Member_Id),
  memberNo: String(row?.Member_No ?? ""),
  memberName: String(row?.Member_Name ?? ""),
  collId: row?.Coll_Id != null ? toNumber(row.Coll_Id) : null,
  voucherId: row?.Voucher_Id != null ? toNumber(row.Voucher_Id) : null,
  voucherNo: String(row?.Voucher_No ?? ""),
  collAmount: toNumber(row?.Coll_Amount),
  prnAmount: toNumber(row?.Prn_Amount),
  inttAmount: toNumber(row?.Intt_Amount),
  penalAmount: toNumber(row?.Penal_Amount),
  outsAmount: toNumber(row?.Outs_Amount),
});

const sumTotals = (
  items: Array<{
    memberId: number;
    collAmount: number;
    prnAmount: number;
    inttAmount: number;
    penalAmount: number;
  }>,
): CollectionTotals => ({
  count: items.length,
  memberCount: new Set(items.map((item) => item.memberId)).size,
  collAmount: round2(items.reduce((sum, item) => sum + item.collAmount, 0)),
  prnAmount: round2(items.reduce((sum, item) => sum + item.prnAmount, 0)),
  inttAmount: round2(items.reduce((sum, item) => sum + item.inttAmount, 0)),
  penalAmount: round2(items.reduce((sum, item) => sum + item.penalAmount, 0)),
});

const mapTotals = (totals: any, fallback: CollectionTotals): CollectionTotals =>
  totals && typeof totals === "object"
    ? {
        count: toNumber(totals.Count),
        memberCount: toNumber(totals.Member_Count),
        collAmount: toNumber(totals.Coll_Amount),
        prnAmount: toNumber(totals.Prn_Amount),
        inttAmount: toNumber(totals.Intt_Amount),
        penalAmount: toNumber(totals.Penal_Amount),
      }
    : fallback;

const entryAmount = (entry: PaymentEntryRow) => Number(entry.amount);
const entryPenal = (entry: PaymentEntryRow) =>
  entry.penal.trim() === "" ? 0 : Number(entry.penal);

/** Amount and penal are usable for a split request. */
const isSplittable = (entry: PaymentEntryRow) => {
  const amount = entryAmount(entry);
  const penal = entryPenal(entry);
  return (
    entry.amount.trim() !== "" &&
    Number.isFinite(amount) &&
    amount > 0 &&
    Number.isFinite(penal) &&
    penal >= 0 &&
    penal <= amount
  );
};

const validateEntry = (entry: PaymentEntryRow) => {
  const amount = entryAmount(entry);
  const penal = entryPenal(entry);
  if (entry.amount.trim() === "" || !Number.isFinite(amount) || amount <= 0) {
    return "Amount must be greater than 0.";
  }
  if (Math.round(amount * 100) > Math.round(entry.balance * 100)) {
    return `Amount cannot be more than the balance (${entry.balance.toFixed(2)}).`;
  }
  if (!Number.isFinite(penal) || penal < 0) {
    return "Penal must be 0 or more.";
  }
  if (penal > amount) {
    return "Penal cannot be more than the amount.";
  }
  if (entry.splitError) return entry.splitError;
  if (entry.serverError) return entry.serverError;
  return "";
};

const flattenDetails = (details: unknown): string => {
  if (!details) return "";
  if (typeof details === "string") return details;
  if (Array.isArray(details)) return details.map(String).join(" ");
  if (typeof details === "object") {
    return Object.values(details as Record<string, unknown>)
      .map(flattenDetails)
      .filter(Boolean)
      .join(" ");
  }
  return String(details);
};

export const useLoanCollection = () => {
  const dispatch = useDispatch<AppDispatch>();

  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const cookieBranchId = getCookieData<string | number>("priobank-lite-branch_id");
  const groupList = useSelector(
    (state: RootState) => state.loanCollection.groupList,
  );
  const loanRows = useSelector(
    (state: RootState) => state.loanCollection.memberList,
  ) as CollectionLoanRow[];

  const [isGroupLoading, setIsGroupLoading] = useState(false);
  const [isLoanListLoading, setIsLoanListLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<PaymentEntryRow[]>([]);
  const [splitInFlight, setSplitInFlight] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [collectionResult, setCollectionResult] =
    useState<CollectionResult | null>(null);

  const entriesRef = useRef(entries);
  const splitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadTokenRef = useRef(0);
  const savingRef = useRef(false);

  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const schema = yup.object().shape({
    collectionDate: yup
      .mixed()
      .test(
        "required",
        "Collection Date is Required",
        (value) => toApiDate(value) !== "",
      ),
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
    groupId: yup
      .mixed()
      .test(
        "required",
        "Group is Required",
        (value) => value !== "" && value !== null && value !== undefined,
      ),
    refVoucherNo: yup.string().optional(),
  });

  const methods = useForm<LoanCollectionForm>({
    mode: "onChange",
    defaultValues: emptyForm,
    resolver: yupResolver(schema) as any,
  });

  const watchedBranchId = methods.watch("branchId");
  const watchedGroupId = methods.watch("groupId");
  const watchedCollectionDate = methods.watch("collectionDate");
  const branchId = Number(watchedBranchId || cookieBranchId || 0);
  const collDateKey = toApiDate(watchedCollectionDate);

  const cancelPendingSplit = useCallback(() => {
    if (splitTimerRef.current) {
      clearTimeout(splitTimerRef.current);
      splitTimerRef.current = null;
    }
  }, []);

  const clearEntries = useCallback(() => {
    cancelPendingSplit();
    entriesRef.current = [];
    setEntries([]);
  }, [cancelPendingSplit]);

  const resetForm = useCallback(() => {
    methods.reset(emptyForm);
    dispatch(setMemberList([]));
    clearEntries();
    setCollectionResult(null);
  }, [methods, dispatch, clearEntries]);

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

  const runSplit = useCallback(async () => {
    splitTimerRef.current = null;
    const pending = entriesRef.current.filter((entry) => entry.splitPending);
    if (pending.length === 0 || !orgId) return;

    const sendable = pending.filter(isSplittable);
    const sendableIds = new Set(sendable.map((entry) => entry.accountId));
    const unsendableIds = new Set(
      pending
        .filter((entry) => !sendableIds.has(entry.accountId))
        .map((entry) => entry.accountId),
    );

    if (unsendableIds.size > 0) {
      setEntries((prev) =>
        prev.map((entry) =>
          unsendableIds.has(entry.accountId)
            ? { ...entry, principal: 0, interest: 0, splitPending: false }
            : entry,
        ),
      );
    }
    if (sendable.length === 0) return;

    const snapshot = sendable.map((entry) => ({
      accountId: entry.accountId,
      amount: entry.amount,
      penal: entry.penal,
    }));
    const isUnchanged = (entry: PaymentEntryRow, index: number) =>
      entry.amount === snapshot[index].amount &&
      entry.penal === snapshot[index].penal;

    setSplitInFlight((count) => count + 1);
    try {
      const res = await calcCollectionSplitAPI(
        Number(orgId),
        sendable.map((entry) => ({
          account_id: entry.accountId,
          member_id: entry.memberId,
          coll_amount: entryAmount(entry),
          penal_amount: entryPenal(entry),
        })),
      );
      const data = extractList(res);
      const byIndex = new Map(
        data.map((row: any) => [toNumber(row?.Row_Index), row]),
      );

      setEntries((prev) =>
        prev.map((entry) => {
          const index = snapshot.findIndex(
            (item) => item.accountId === entry.accountId,
          );
          // Edited again while the request was running — a newer split is queued.
          if (index < 0 || !isUnchanged(entry, index)) return entry;

          const row =
            byIndex.get(index) ??
            data.find((item: any) => toNumber(item?.Account_Id) === entry.accountId);
          if (!row) {
            return {
              ...entry,
              principal: 0,
              interest: 0,
              splitPending: false,
              splitError: "Split was not returned for this loan.",
            };
          }
          const message = String(row?.Message ?? "OK");
          const ok = message.trim().toUpperCase() === "OK";
          return {
            ...entry,
            principal: ok ? toNumber(row?.Prn_Amount) : 0,
            interest: ok ? toNumber(row?.Intt_Amount) : 0,
            splitPending: false,
            splitError: ok ? "" : message,
          };
        }),
      );
    } catch (error: any) {
      const detail =
        flattenDetails(error?.response?.data?.details) ||
        "Could not calculate principal / interest.";
      setEntries((prev) =>
        prev.map((entry) => {
          const index = snapshot.findIndex(
            (item) => item.accountId === entry.accountId,
          );
          if (index < 0 || !isUnchanged(entry, index)) return entry;
          return { ...entry, splitPending: false, splitError: detail };
        }),
      );
      toast.error(detail);
    } finally {
      setSplitInFlight((count) => Math.max(0, count - 1));
    }
  }, [orgId]);

  const scheduleSplit = useCallback(() => {
    cancelPendingSplit();
    splitTimerRef.current = setTimeout(() => {
      void runSplit();
    }, SPLIT_DEBOUNCE_MS);
  }, [cancelPendingSplit, runSplit]);

  const onToggleLoan = useCallback(
    (row: CollectionLoanRow, checked: boolean) => {
      setEntries((prev) => {
        const exists = prev.some((entry) => entry.accountId === row.accountId);
        if (!checked) {
          return prev.filter((entry) => entry.accountId !== row.accountId);
        }
        if (exists) return prev;
        const byAccount = new Map(prev.map((entry) => [entry.accountId, entry]));
        byAccount.set(row.accountId, toPaymentEntry(row));
        // Keep Payment Entry in the same order as the grid.
        return loanRows
          .filter((item) => byAccount.has(item.accountId))
          .map((item) => byAccount.get(item.accountId)!);
      });
    },
    [loanRows],
  );

  const onToggleAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        clearEntries();
        return;
      }
      setEntries((prev) => {
        const byAccount = new Map(prev.map((entry) => [entry.accountId, entry]));
        return loanRows.map(
          (row) => byAccount.get(row.accountId) ?? toPaymentEntry(row),
        );
      });
    },
    [clearEntries, loanRows],
  );

  const onEntryChange = useCallback(
    (accountId: number, field: PaymentEntryField, value: string) => {
      const sanitized = sanitizeAmountInput(value);
      setEntries((prev) =>
        prev.map((entry) =>
          entry.accountId === accountId
            ? {
                ...entry,
                [field]: sanitized,
                splitPending: true,
                splitError: "",
                serverError: "",
              }
            : entry,
        ),
      );
      scheduleSplit();
    },
    [scheduleSplit],
  );

  const onRemoveEntry = useCallback((accountId: number) => {
    setEntries((prev) => prev.filter((entry) => entry.accountId !== accountId));
  }, []);

  const onClearEntries = useCallback(() => {
    clearEntries();
    methods.setValue("refVoucherNo", "");
  }, [clearEntries, methods]);

  const rowErrors = useMemo(() => {
    const errors: Record<number, string> = {};
    for (const entry of entries) {
      const message = validateEntry(entry);
      if (message) errors[entry.accountId] = message;
    }
    return errors;
  }, [entries]);

  const totals = useMemo(
    () =>
      sumTotals(
        entries.map((entry) => ({
          memberId: entry.memberId,
          collAmount: toNumber(entry.amount),
          prnAmount: entry.principal,
          inttAmount: entry.interest,
          penalAmount: toNumber(entry.penal),
        })),
      ),
    [entries],
  );

  const isSplitting =
    splitInFlight > 0 || entries.some((entry) => entry.splitPending);
  const canSave =
    entries.length > 0 &&
    Object.keys(rowErrors).length === 0 &&
    !isSplitting &&
    !loading;

  /** Marks the row named in "... For Account X" business errors. */
  const flagAccountError = useCallback((details: string) => {
    const match = details.match(/Account\s+(\d+)/i);
    if (!match) return;
    const accountId = Number(match[1]);
    setEntries((prev) =>
      prev.map((entry) =>
        entry.accountId === accountId || entry.accountNo === match[1]
          ? { ...entry, serverError: details }
          : entry,
      ),
    );
  }, []);

  const onSubmit = async (data: LoanCollectionForm) => {
    if (savingRef.current) return;

    const current = entriesRef.current;
    if (current.length === 0) {
      toast.error("Select at least one member loan for collection.");
      return;
    }
    if (current.some((entry) => entry.splitPending) || splitInFlight > 0) {
      toast.error("Please wait for principal / interest to finish calculating.");
      return;
    }
    const firstError = current.map(validateEntry).find(Boolean);
    if (firstError) {
      toast.error(firstError);
      return;
    }
    const collDate = toApiDate(data.collectionDate);
    if (!collDate) {
      toast.error("Collection Date is Required");
      return;
    }

    const payload: PostCollectionPayload = {
      org_id: Number(orgId),
      branch_id: Number(data.branchId || cookieBranchId),
      coll_date: collDate,
      co_id: null,
      ref_vouch: data.refVoucherNo?.trim() || null,
      fin_id: null,
      coll_data: current.map((entry) => ({
        account_id: entry.accountId,
        member_id: entry.memberId,
        coll_amount: entryAmount(entry),
        prn_amount: entry.principal,
        intt_amount: entry.interest,
        penal_amount: entryPenal(entry),
      })),
    };

    savingRef.current = true;
    setLoading(true);
    try {
      const res = await postCollectionAPI(payload);
      const message = String(res?.message || "");
      const block = res?.Data && !Array.isArray(res.Data) ? res.Data : null;
      const receipts: CollectionReceipt[] = Array.isArray(block?.Rows)
        ? block.Rows.map(mapReceipt)
        : [];
      const voucherNo = String(block?.Voucher_No || "");

      if (/error/i.test(message) || (receipts.length === 0 && !voucherNo)) {
        const details =
          (typeof res?.details === "string" && res.details) ||
          (typeof block?.Message === "string" && block.Message) ||
          message ||
          "Failed to save collection.";
        flagAccountError(details);
        toast.error(details);
        return;
      }

      const fallbackTotals = sumTotals(
        receipts.length > 0
          ? receipts
          : payload.coll_data.map((row) => ({
              memberId: row.member_id,
              collAmount: row.coll_amount,
              prnAmount: row.prn_amount,
              inttAmount: row.intt_amount,
              penalAmount: row.penal_amount,
            })),
      );
      setCollectionResult({
        message:
          (typeof res?.details === "string" && res.details) ||
          String(block?.Message || "Loan Collection Posted Successfully !!"),
        voucherNo,
        postedCount: toNumber(block?.Posted_Count) || receipts.length || payload.coll_data.length,
        totals: mapTotals(block?.Totals, fallbackTotals),
        rows: receipts,
      });
      clearEntries();
      methods.setValue("refVoucherNo", "");
      setReloadKey((key) => key + 1);
    } catch (error: any) {
      const body = error?.response?.data;
      const details = body?.details;

      if (details && typeof details === "object" && !Array.isArray(details)) {
        const rowMessages = new Map<number, string[]>();
        const otherMessages: string[] = [];
        for (const [key, value] of Object.entries(details)) {
          const text = flattenDetails(value);
          const match = key.match(/^coll_data\.(\d+)\./);
          if (match) {
            const index = Number(match[1]);
            rowMessages.set(index, [...(rowMessages.get(index) || []), text]);
          } else if (text) {
            otherMessages.push(text);
          }
        }
        if (rowMessages.size > 0) {
          const sentIds = payload.coll_data.map((row) => row.account_id);
          setEntries((prev) =>
            prev.map((entry) => {
              const index = sentIds.indexOf(entry.accountId);
              const messages = index >= 0 ? rowMessages.get(index) : undefined;
              return messages
                ? { ...entry, serverError: messages.join(" ") }
                : entry;
            }),
          );
        }
        toast.error(
          otherMessages.join(" ") ||
            (rowMessages.size > 0
              ? "Some collection rows are invalid. Please check the highlighted rows."
              : body?.message || "Something went wrong while saving!"),
        );
      } else {
        const text =
          flattenDetails(details) ||
          body?.message ||
          "Something went wrong while saving!";
        flagAccountError(text);
        toast.error(text);
      }
    } finally {
      savingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    methods.setValue("groupId", "");
    clearEntries();
    dispatch(setMemberList([]));

    if (orgId && watchedBranchId) {
      getGroupListAPICall(Number(orgId), Number(watchedBranchId));
    } else {
      dispatch(setGroupList([]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload groups when branch changes
  }, [watchedBranchId, orgId]);

  useEffect(() => {
    clearEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- new group starts with an empty Payment Entry
  }, [watchedGroupId]);

  useEffect(() => {
    if (!orgId || !branchId || !watchedGroupId) {
      dispatch(setMemberList([]));
      setIsLoanListLoading(false);
      return;
    }

    const token = ++loadTokenRef.current;
    setIsLoanListLoading(true);
    getCollectionLoanListAPI({
      orgId: Number(orgId),
      branchId,
      groupId: String(watchedGroupId),
      collDate: collDateKey || undefined,
    })
      .then((res) => {
        if (loadTokenRef.current !== token) return;
        const rows = extractList(res)
          .map(normalizeLoanRow)
          .filter((row): row is CollectionLoanRow => row !== null);
        dispatch(setMemberList(rows));

        // Balance is "as on" the collection date — refresh rows already in Payment Entry.
        const byAccount = new Map(rows.map((row) => [row.accountId, row]));
        setEntries((prev) =>
          prev
            .filter((entry) => byAccount.has(entry.accountId))
            .map((entry) => ({
              ...entry,
              balance: byAccount.get(entry.accountId)!.balance,
            })),
        );
      })
      .catch(() => {
        if (loadTokenRef.current !== token) return;
        dispatch(setMemberList([]));
        toast.error("Failed to load member loans");
      })
      .finally(() => {
        if (loadTokenRef.current === token) setIsLoanListLoading(false);
      });
  }, [orgId, branchId, watchedGroupId, collDateKey, reloadKey, dispatch]);

  useEffect(() => {
    return () => {
      cancelPendingSplit();
      dispatch(resetLoanCollection());
    };
  }, [dispatch, cancelPendingSplit]);

  const onReceiptClose = useCallback(() => {
    setCollectionResult(null);
  }, []);

  return {
    methods,
    onSubmit,
    resetForm,
    groupList,
    loanRows,
    isGroupLoading,
    isLoanListLoading,
    loading,
    entries,
    rowErrors,
    totals,
    canSave,
    isSplitting,
    onToggleLoan,
    onToggleAll,
    onEntryChange,
    onRemoveEntry,
    onClearEntries,
    collectionResult,
    onReceiptClose,
  };
};
