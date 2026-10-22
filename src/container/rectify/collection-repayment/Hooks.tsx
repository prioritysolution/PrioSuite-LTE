"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/GlobalContext";
import { calcCollectionSplitAPI } from "@/container/loan-entry/loan-collection/LoanCollectionApi";
import {
  CollectionSearchForm,
  RectifyForm,
  RectifyResult,
  SelectOption,
  SplitPreview,
} from "./CollectionRectifyType";
import {
  extractList,
  flattenDetails,
  formatMoney,
  getCollectionDetailsAPI,
  getCollectionListAPI,
  getGroupListAPI,
  getSahayikaListAPI,
  getTargetLoansAPI,
  mapCollection,
  mapHistory,
  mapResult,
  mapTargetLoan,
  mapVoucherLines,
  postCollectionRectifyAPI,
  toAmount,
  toApiDate,
  todayNoon,
} from "./CollectionRectifyApi";

const SPLIT_DEBOUNCE_MS = 400;
const LOAN_SEARCH_DEBOUNCE_MS = 400;
const REASON_MAX_LENGTH = 200;

interface ListParams {
  from_date?: string;
  to_date?: string;
  group_id?: number;
  voucher_no?: string;
}

const isChosen = (value: number | "" | null | undefined) =>
  value !== "" &&
  value !== null &&
  value !== undefined &&
  !Number.isNaN(Number(value));

const fromApiDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
};

const parseAmount = (value: string) =>
  value.trim() === "" ? Number.NaN : Number(value);

const parsePenal = (value: string) =>
  value.trim() === "" ? 0 : Number(value);

const emptyRectifyForm: RectifyForm = {
  group_id: "",
  account_id: "",
  coll_date: null,
  coll_amount: "",
  penal_amount: "",
  co_id: "",
  reason: "",
};

const errorBody = (error: unknown) =>
  (
    error as {
      response?: { data?: { details?: unknown; message?: string } };
    }
  )?.response?.data;

export const useCollectionRectify = () => {
  const { user } = useGlobalContext();
  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);
  const queryClient = useQueryClient();

  const searchForm = useForm<CollectionSearchForm>({
    defaultValues: {
      fromDate: todayNoon(),
      toDate: todayNoon(),
      group_id: "",
      voucher_no: "",
    },
  });

  const rectifyForm = useForm<RectifyForm>({
    defaultValues: emptyRectifyForm,
  });

  const [listParams, setListParams] = useState<ListParams>(() => ({
    from_date: toApiDate(todayNoon()),
    to_date: toApiDate(todayNoon()),
  }));
  const [searchNonce, setSearchNonce] = useState(0);
  const [selectedCollId, setSelectedCollId] = useState<number | null>(null);
  const [editSession, setEditSession] = useState(0);
  const [loanSearch, setLoanSearch] = useState("");
  const [debouncedLoanSearch, setDebouncedLoanSearch] = useState("");
  const [splitResult, setSplitResult] = useState<{
    key: string;
    prnAmount: number | null;
    inttAmount: number | null;
    error: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<RectifyResult | null>(null);
  const savingRef = useRef(false);

  const groupQuery = useQuery({
    queryKey: ["rectifyGroupList", orgId, branchId],
    queryFn: () => getGroupListAPI(orgId, branchId),
    enabled: orgId > 0 && branchId > 0,
  });

  const sahayikaQuery = useQuery({
    queryKey: ["rectifySahayikaList", orgId, branchId],
    queryFn: () => getSahayikaListAPI(orgId, branchId),
    enabled: orgId > 0 && branchId > 0,
  });

  const groupOptions: SelectOption[] = useMemo(
    () =>
      extractList(groupQuery.data)
        .map((item) => {
          const label = [
            item?.Group_Name,
            item?.Group_No ? `(${item.Group_No})` : "",
          ]
            .filter(Boolean)
            .join(" ")
            .trim();
          return { label, value: Number(item?.Group_Id ?? item?.group_id) };
        })
        .filter((item) => item.label !== "" && item.value > 0),
    [groupQuery.data],
  );

  const coOptions: SelectOption[] = useMemo(
    () =>
      extractList(sahayikaQuery.data)
        .map((item) => {
          const id = item?.CO_Id ?? item?.Co_Id ?? item?.co_id;
          const label = String(
            item?.Display_Name ||
              [item?.CO_Name, item?.CO_Code ? `(${item.CO_Code})` : ""]
                .filter(Boolean)
                .join(" "),
          ).trim();
          return { label, value: Number(id) };
        })
        .filter((item) => item.label !== "" && !Number.isNaN(item.value)),
    [sahayikaQuery.data],
  );

  const listQuery = useQuery({
    queryKey: ["collRectifyList", orgId, branchId, listParams, searchNonce],
    queryFn: () =>
      getCollectionListAPI({ org_id: orgId, branch_id: branchId, ...listParams }),
    enabled: orgId > 0 && branchId > 0,
  });

  const collections = useMemo(
    () => extractList(listQuery.data).map(mapCollection),
    [listQuery.data],
  );

  const detailsQuery = useQuery({
    queryKey: ["collRectifyDetails", orgId, branchId, selectedCollId],
    queryFn: () =>
      getCollectionDetailsAPI(orgId, branchId, Number(selectedCollId)),
    enabled: orgId > 0 && branchId > 0 && selectedCollId !== null,
  });

  const details = detailsQuery.data;
  const collection = useMemo(() => {
    const data = details?.Data;
    if (!data || typeof data !== "object" || Array.isArray(data)) return null;
    const mapped = mapCollection(data);
    return mapped.collId === selectedCollId ? mapped : null;
  }, [details, selectedCollId]);
  const voucher = useMemo(
    () => (collection ? mapVoucherLines(details?.Voucher) : []),
    [collection, details],
  );
  const history = useMemo(
    () => (collection ? mapHistory(details?.History) : []),
    [collection, details],
  );

  useEffect(() => {
    if (!details || selectedCollId === null) return;
    if (/no data found/i.test(String(details?.message || ""))) {
      toast.error(flattenDetails(details?.details) || "Collection Not Found !!");
    }
  }, [details, selectedCollId]);

  useEffect(() => {
    if (!collection) return;
    rectifyForm.reset({
      group_id: collection.groupId || "",
      account_id: collection.accountId || "",
      coll_date: fromApiDate(collection.collDate),
      coll_amount: String(collection.collAmount),
      penal_amount: String(collection.penalAmount),
      co_id: collection.coId ?? "",
      reason: "",
    });
  }, [collection, editSession, rectifyForm]);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedLoanSearch(loanSearch.trim()),
      LOAN_SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [loanSearch]);

  const targetGroupId = rectifyForm.watch("group_id");
  const targetDate = rectifyForm.watch("coll_date");
  const accountId = rectifyForm.watch("account_id");
  const amountText = rectifyForm.watch("coll_amount");
  const penalText = rectifyForm.watch("penal_amount");

  const targetApiDate = toApiDate(targetDate);
  const dateChanged =
    !!collection && !!targetApiDate && targetApiDate !== collection.collDate.slice(0, 10);
  const loanGroupId = isChosen(targetGroupId) && Number(targetGroupId) > 0
    ? Number(targetGroupId)
    : undefined;
  const loanSearchParam =
    debouncedLoanSearch.length >= 2 ? debouncedLoanSearch : undefined;

  const loansQuery = useQuery({
    queryKey: [
      "collRectifyLoans",
      orgId,
      branchId,
      collection?.collId,
      loanGroupId,
      loanSearchParam,
      dateChanged ? targetApiDate : "",
    ],
    queryFn: () =>
      getTargetLoansAPI({
        org_id: orgId,
        branch_id: branchId,
        coll_id: Number(collection?.collId),
        group_id: loanGroupId,
        search: loanSearchParam,
        coll_date: dateChanged ? targetApiDate : undefined,
      }),
    enabled:
      orgId > 0 &&
      branchId > 0 &&
      !!collection &&
      (loanGroupId !== undefined || loanSearchParam !== undefined),
  });

  const loans = useMemo(
    () =>
      extractList(loansQuery.data)
        .map(mapTargetLoan)
        .filter((loan) => loan.accountId > 0)
        .sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent)),
    [loansQuery.data],
  );

  const loanOptions: SelectOption[] = useMemo(
    () =>
      loans.map((loan) => ({
        value: loan.accountId,
        label: [
          loan.memberName || "—",
          loan.loanCycle ? `Cycle ${loan.loanCycle}` : "",
          loan.accountLabel ? `Acct ${loan.accountLabel}` : "",
          `Max ${formatMoney(loan.maxCollAmount)}`,
        ]
          .filter(Boolean)
          .join(" – ")
          .concat(loan.isCurrent ? " (saved loan)" : ""),
      })),
    [loans],
  );

  const selectedLoan = useMemo(
    () =>
      isChosen(accountId)
        ? (loans.find((loan) => loan.accountId === Number(accountId)) ?? null)
        : null,
    [accountId, loans],
  );

  const amount = parseAmount(amountText);
  const penal = parsePenal(penalText);
  const splitKey = `${accountId}|${amount}|${penal}`;
  const splitSameAsSaved =
    !!collection &&
    Number(accountId) === collection.accountId &&
    amount === collection.collAmount &&
    penal === collection.penalAmount;
  const splitInputValid =
    isChosen(accountId) &&
    Number.isFinite(amount) &&
    amount > 0 &&
    Number.isFinite(penal) &&
    penal >= 0 &&
    penal <= amount;
  const splitMemberId = selectedLoan?.memberId ?? collection?.memberId ?? 0;

  useEffect(() => {
    if (!collection || splitSameAsSaved || !splitInputValid || !orgId) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await calcCollectionSplitAPI(orgId, [
          {
            account_id: Number(accountId),
            member_id: splitMemberId,
            coll_amount: amount,
            penal_amount: penal,
          },
        ]);
        if (cancelled) return;
        const row = extractList(res)[0];
        const message = String(row?.Message ?? (row ? "OK" : ""));
        const ok = message.trim().toUpperCase() === "OK";
        setSplitResult({
          key: splitKey,
          prnAmount: ok ? toAmount(row?.Prn_Amount) : null,
          inttAmount: ok ? toAmount(row?.Intt_Amount) : null,
          error: ok
            ? ""
            : message || flattenDetails(res?.details) || "Split not available.",
        });
      } catch (error: unknown) {
        if (cancelled) return;
        const body = errorBody(error);
        setSplitResult({
          key: splitKey,
          prnAmount: null,
          inttAmount: null,
          error:
            flattenDetails(body?.details) ||
            body?.message ||
            "Could not calculate principal / interest.",
        });
      }
    }, SPLIT_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    accountId,
    amount,
    collection,
    orgId,
    penal,
    splitInputValid,
    splitKey,
    splitMemberId,
    splitSameAsSaved,
  ]);

  const split: SplitPreview = useMemo(() => {
    if (!collection) {
      return { pending: false, prnAmount: null, inttAmount: null, error: "" };
    }
    if (splitSameAsSaved) {
      return {
        pending: false,
        prnAmount: collection.prnAmount,
        inttAmount: collection.inttAmount,
        error: "",
      };
    }
    if (!splitInputValid) {
      return { pending: false, prnAmount: null, inttAmount: null, error: "" };
    }
    if (splitResult?.key === splitKey) {
      return {
        pending: false,
        prnAmount: splitResult.prnAmount,
        inttAmount: splitResult.inttAmount,
        error: splitResult.error,
      };
    }
    return { pending: true, prnAmount: null, inttAmount: null, error: "" };
  }, [collection, splitInputValid, splitKey, splitResult, splitSameAsSaved]);

  const onSearch = searchForm.handleSubmit((values) => {
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    if (fromDate && toDate && fromDate > toDate) {
      toast.error("From date cannot be after To date.");
      return;
    }
    const groupId = isChosen(values.group_id) ? Number(values.group_id) : 0;
    setListParams({
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
      group_id: groupId > 0 ? groupId : undefined,
      voucher_no: values.voucher_no.trim() || undefined,
    });
    setSearchNonce((value) => value + 1);
  });

  const onResetSearch = useCallback(() => {
    searchForm.reset({
      fromDate: todayNoon(),
      toDate: todayNoon(),
      group_id: "",
      voucher_no: "",
    });
    setListParams({
      from_date: toApiDate(todayNoon()),
      to_date: toApiDate(todayNoon()),
    });
    setSearchNonce((value) => value + 1);
  }, [searchForm]);

  const onEdit = useCallback(
    (collId: number) => {
      rectifyForm.reset(emptyRectifyForm);
      setResult(null);
      setSplitResult(null);
      setLoanSearch("");
      setDebouncedLoanSearch("");
      setSelectedCollId(collId);
      setEditSession((value) => value + 1);
    },
    [rectifyForm],
  );

  const onCloseDialog = useCallback(() => {
    if (savingRef.current) return;
    setSelectedCollId(null);
    setResult(null);
    setSplitResult(null);
    setLoanSearch("");
    setDebouncedLoanSearch("");
    rectifyForm.reset(emptyRectifyForm);
  }, [rectifyForm]);

  const onTargetGroupChange = useCallback(() => {
    rectifyForm.setValue("account_id", "");
    setLoanSearch("");
    setDebouncedLoanSearch("");
  }, [rectifyForm]);

  const onSave = useCallback(async () => {
    if (!collection || savingRef.current) return;
    const values = rectifyForm.getValues();
    rectifyForm.clearErrors();

    const nextAmount = parseAmount(values.coll_amount);
    const nextPenal = parsePenal(values.penal_amount);
    const reason = values.reason.trim();
    const nextDate = toApiDate(values.coll_date);
    let valid = true;

    if (!isChosen(values.account_id)) {
      rectifyForm.setError("account_id", {
        message: "Select the correct loan account.",
      });
      valid = false;
    }
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      rectifyForm.setError("coll_amount", {
        message: "Enter an amount greater than 0.",
      });
      valid = false;
    } else if (selectedLoan && nextAmount > selectedLoan.maxCollAmount) {
      rectifyForm.setError("coll_amount", {
        message: `Amount cannot be more than ${formatMoney(selectedLoan.maxCollAmount)}.`,
      });
      valid = false;
    }
    if (!Number.isFinite(nextPenal) || nextPenal < 0) {
      rectifyForm.setError("penal_amount", { message: "Enter a valid penal." });
      valid = false;
    } else if (Number.isFinite(nextAmount) && nextPenal > nextAmount) {
      rectifyForm.setError("penal_amount", {
        message: "Penal cannot be more than the amount.",
      });
      valid = false;
    }
    if (collection.canChangeDate && !nextDate) {
      rectifyForm.setError("coll_date", { message: "Select the collection date." });
      valid = false;
    }
    if (!reason) {
      rectifyForm.setError("reason", { message: "Reason is required." });
      valid = false;
    } else if (reason.length > REASON_MAX_LENGTH) {
      rectifyForm.setError("reason", {
        message: `Reason cannot be more than ${REASON_MAX_LENGTH} characters.`,
      });
      valid = false;
    }
    if (!valid) return;

    const changes: {
      account_id?: number;
      coll_amount?: number;
      penal_amount?: number;
      coll_date?: string;
      co_id?: number;
    } = {};
    if (Number(values.account_id) !== collection.accountId) {
      changes.account_id = Number(values.account_id);
    }
    if (nextAmount !== collection.collAmount) changes.coll_amount = nextAmount;
    if (nextPenal !== collection.penalAmount) changes.penal_amount = nextPenal;
    if (collection.canChangeDate && nextDate !== collection.collDate.slice(0, 10)) {
      changes.coll_date = nextDate;
    }
    if (isChosen(values.co_id) && Number(values.co_id) !== collection.coId) {
      changes.co_id = Number(values.co_id);
    }

    if (Object.keys(changes).length === 0) {
      toast.message("Nothing to rectify. Every value is the same as saved.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const res = await postCollectionRectifyAPI({
        org_id: orgId,
        branch_id: branchId,
        coll_id: collection.collId,
        reason,
        ...changes,
      });
      const errorNo = Number(res?.Data?.Error_No ?? 0);
      const failed =
        /error found/i.test(String(res?.message || "")) || errorNo < 0;
      if (failed) {
        toast.error(
          flattenDetails(res?.details) ||
            String(res?.Data?.Message || "") ||
            "Unable to rectify the collection.",
        );
        return;
      }
      const nextResult = mapResult(res);
      setResult(nextResult);
      toast.success(
        nextResult.voucherNo
          ? `${nextResult.message} Voucher ${nextResult.voucherNo}`
          : nextResult.message,
      );
      void queryClient.invalidateQueries({ queryKey: ["collRectifyList"] });
      void queryClient.invalidateQueries({ queryKey: ["collRectifyDetails"] });
      void queryClient.invalidateQueries({ queryKey: ["collRectifyLoans"] });
      void queryClient.invalidateQueries({ queryKey: ["rectifyHistory"] });
    } catch (error: unknown) {
      const body = errorBody(error);
      const fieldErrors =
        body?.details && typeof body.details === "object" && !Array.isArray(body.details)
          ? (body.details as Record<string, unknown>)
          : {};
      (
        ["account_id", "coll_amount", "penal_amount", "coll_date", "co_id", "reason"] as const
      ).forEach((field) => {
        const message = flattenDetails(fieldErrors[field]);
        if (message) rectifyForm.setError(field, { message });
      });
      toast.error(
        flattenDetails(body?.details) ||
          body?.message ||
          "Unable to rectify the collection.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
      void queryClient.invalidateQueries({ queryKey: ["rectifyLog"] });
    }
  }, [branchId, collection, orgId, queryClient, rectifyForm, selectedLoan]);

  return {
    searchForm,
    rectifyForm,
    groupOptions,
    coOptions,
    groupLoading: groupQuery.isLoading,
    coLoading: sahayikaQuery.isLoading,
    collections,
    listLoading: listQuery.isFetching,
    onSearch,
    onResetSearch,
    onEdit,
    dialogOpen: selectedCollId !== null,
    onCloseDialog,
    detailsLoading: detailsQuery.isLoading || (detailsQuery.isFetching && !collection),
    collection,
    voucher,
    history,
    loanOptions,
    loansLoading: loansQuery.isFetching,
    loanSearch,
    onLoanSearchChange: setLoanSearch,
    onTargetGroupChange,
    selectedLoan,
    split,
    saving,
    onSave,
    result,
  };
};
