"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { startOfMonth } from "date-fns";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  extractList,
  flattenDetails,
  formatDisplayDate,
  formatMoney,
  getGroupListAPI,
  getSahayikaListAPI,
  mapVoucherLines,
  toAmount,
  toApiDate,
  todayNoon,
} from "../collection-repayment/CollectionRectifyApi";
import { SelectOption } from "../collection-repayment/CollectionRectifyType";
import {
  LoanRectifyForm,
  LoanRectifyResult,
  LoanSearchForm,
  LoanTerms,
  LoanTermsPreview,
  SchemeOption,
} from "./LoanRectifyType";
import {
  calcLoanTermsAPI,
  getLoanDetailsAPI,
  getLoanListAPI,
  getPurposeListAPI,
  getSchemeListAPI,
  mapLoan,
  mapLoanHistory,
  mapLoanResult,
  mapPagination,
  mapTerms,
  postLoanRectifyAPI,
} from "./LoanRectifyApi";

const TERMS_DEBOUNCE_MS = 400;
const REASON_MAX_LENGTH = 200;

interface ListParams {
  from_date?: string;
  to_date?: string;
  group_id?: number;
  search?: string;
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

const monthStartNoon = () => {
  const date = startOfMonth(todayNoon());
  date.setHours(12, 0, 0, 0);
  return date;
};

const defaultSearch = (): LoanSearchForm => ({
  fromDate: monthStartNoon(),
  toDate: todayNoon(),
  group_id: "",
  search: "",
});

const defaultListParams = (): ListParams => ({
  from_date: toApiDate(monthStartNoon()),
  to_date: toApiDate(todayNoon()),
});

const emptyRectifyForm: LoanRectifyForm = {
  loan_date: null,
  loan_amount: "",
  scheme_id: "",
  purpose_id: "",
  guarantor_name: "",
  co_id: "",
  reason: "",
};

const emptyTerms: LoanTerms = {
  roi: null,
  instNo: null,
  instAmount: null,
  realisableAmt: null,
  finalDate: "",
};

const errorBody = (error: unknown) =>
  (
    error as {
      response?: { data?: { details?: unknown; message?: string } };
    }
  )?.response?.data;

/** Schemes come back under `details` on some backends. */
const schemeRows = (res: unknown): ReturnType<typeof extractList> => {
  const data = res as { details?: unknown } | undefined;
  return Array.isArray(data?.details) ? data.details : extractList(res);
};

/** Keeps the saved value selectable even when it is no longer in the master list. */
const withSaved = <T extends SelectOption>(
  options: T[],
  saved: T | null,
): T[] =>
  saved && saved.value > 0 && !options.some((item) => item.value === saved.value)
    ? [saved, ...options]
    : options;

export const useLoanRectify = () => {
  const { user } = useGlobalContext();
  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);
  const queryClient = useQueryClient();

  const searchForm = useForm<LoanSearchForm>({ defaultValues: defaultSearch() });
  const rectifyForm = useForm<LoanRectifyForm>({ defaultValues: emptyRectifyForm });

  const [listParams, setListParams] = useState<ListParams>(defaultListParams);
  const [searchNonce, setSearchNonce] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [editSession, setEditSession] = useState(0);
  const [termsResult, setTermsResult] = useState<
    (LoanTerms & { key: string; error: string }) | null
  >(null);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<LoanRectifyResult | null>(null);
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

  const schemeQuery = useQuery({
    queryKey: ["schemeList", orgId],
    queryFn: () => getSchemeListAPI(orgId),
    enabled: orgId > 0,
  });

  const purposeQuery = useQuery({
    queryKey: ["rectifyPurposeList", orgId],
    queryFn: () => getPurposeListAPI(orgId),
    enabled: orgId > 0,
  });

  const groupOptions: SelectOption[] = useMemo(
    () =>
      extractList(groupQuery.data)
        .map((item) => {
          const label = [item?.Group_Name, item?.Group_No ? `(${item.Group_No})` : ""]
            .filter(Boolean)
            .join(" ")
            .trim();
          return { label, value: Number(item?.Group_Id ?? item?.group_id) };
        })
        .filter((item) => item.label !== "" && item.value > 0),
    [groupQuery.data],
  );

  const baseCoOptions: SelectOption[] = useMemo(
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
        .filter((item) => item.label !== "" && item.value > 0),
    [sahayikaQuery.data],
  );

  const baseSchemeOptions: SchemeOption[] = useMemo(
    () =>
      schemeRows(schemeQuery.data)
        .map((item) => ({
          label: String(item?.Scheme_Name ?? "").trim(),
          value: Number(item?.Scheme_Id),
          sanctionLimit: toAmount(item?.Sanction_Limit),
        }))
        .filter((item) => item.label !== "" && item.value > 0),
    [schemeQuery.data],
  );

  const basePurposeOptions: SelectOption[] = useMemo(
    () =>
      extractList(purposeQuery.data)
        .map((item) => ({
          label: String(item?.Purp_Desc ?? "").trim(),
          value: Number(item?.Purp_Id),
        }))
        .filter((item) => item.label !== "" && item.value > 0),
    [purposeQuery.data],
  );

  const listQuery = useQuery({
    queryKey: ["loanRectifyList", orgId, branchId, listParams, page, searchNonce],
    queryFn: () =>
      getLoanListAPI({ org_id: orgId, branch_id: branchId, ...listParams, page }),
    enabled: orgId > 0 && branchId > 0,
    placeholderData: keepPreviousData,
  });

  const loans = useMemo(
    () =>
      extractList(listQuery.data)
        .map(mapLoan)
        .filter((loan) => loan.accountId > 0),
    [listQuery.data],
  );
  const pagination = useMemo(() => mapPagination(listQuery.data), [listQuery.data]);

  const onPageChange = useCallback((next: number) => {
    setPage(Math.max(1, next));
  }, []);

  const detailsQuery = useQuery({
    queryKey: ["loanRectifyDetails", orgId, branchId, selectedAccountId],
    queryFn: () => getLoanDetailsAPI(orgId, branchId, Number(selectedAccountId)),
    enabled: orgId > 0 && branchId > 0 && selectedAccountId !== null,
  });

  const details = detailsQuery.data;
  const loan = useMemo(() => {
    const data = Array.isArray(details?.Data) ? details.Data[0] : details?.Data;
    if (!data || typeof data !== "object") return null;
    const mapped = mapLoan(data);
    return mapped.accountId === selectedAccountId ? mapped : null;
  }, [details, selectedAccountId]);
  const voucher = useMemo(
    () => (loan ? mapVoucherLines(details?.Voucher) : []),
    [loan, details],
  );
  const history = useMemo(
    () => (loan ? mapLoanHistory(details?.History) : []),
    [loan, details],
  );

  const schemeOptions = useMemo(
    () =>
      withSaved(
        baseSchemeOptions,
        loan ? { label: loan.schemeName, value: loan.schemeId, sanctionLimit: 0 } : null,
      ),
    [baseSchemeOptions, loan],
  );
  const purposeOptions = useMemo(
    () =>
      withSaved(
        basePurposeOptions,
        loan?.purposeId ? { label: loan.purposeName, value: loan.purposeId } : null,
      ),
    [basePurposeOptions, loan],
  );
  const coOptions = useMemo(
    () =>
      withSaved(
        baseCoOptions,
        loan?.coId ? { label: loan.coName, value: loan.coId } : null,
      ),
    [baseCoOptions, loan],
  );

  useEffect(() => {
    if (!details || selectedAccountId === null) return;
    if (/no data found/i.test(String(details?.message || ""))) {
      toast.error(flattenDetails(details?.details) || "Loan Not Found !!");
    }
  }, [details, selectedAccountId]);

  useEffect(() => {
    if (!loan) return;
    rectifyForm.reset({
      loan_date: fromApiDate(loan.loanDate),
      loan_amount: String(loan.loanAmount),
      scheme_id: loan.schemeId || "",
      purpose_id: loan.purposeId ?? "",
      guarantor_name: loan.guarantorName,
      co_id: loan.coId ?? "",
      reason: "",
    });
  }, [loan, editSession, rectifyForm]);

  const dateValue = rectifyForm.watch("loan_date");
  const amountText = rectifyForm.watch("loan_amount");
  const schemeValue = rectifyForm.watch("scheme_id");

  const nextDate = toApiDate(dateValue);
  const nextAmount = parseAmount(amountText ?? "");
  const nextSchemeId = isChosen(schemeValue) ? Number(schemeValue) : 0;
  const termsKey = `${nextDate}|${nextAmount}|${nextSchemeId}`;
  const termsSameAsSaved =
    !!loan &&
    nextDate === loan.loanDate.slice(0, 10) &&
    nextAmount === loan.loanAmount &&
    nextSchemeId === loan.schemeId;
  const termsInputValid =
    !!nextDate && Number.isFinite(nextAmount) && nextAmount > 0 && nextSchemeId > 0;

  useEffect(() => {
    if (!loan || termsSameAsSaved || !termsInputValid || !orgId) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await calcLoanTermsAPI({
          org_id: orgId,
          branch_id: branchId,
          account_id: loan.accountId,
          loan_date: nextDate,
          loan_amount: nextAmount,
          scheme_id: nextSchemeId,
        });
        if (cancelled) return;
        const row = Array.isArray(res?.Data) ? res.Data[0] : res?.Data;
        const failed = /error found/i.test(String(res?.message || "")) || !row;
        setTermsResult({
          key: termsKey,
          ...(failed ? emptyTerms : mapTerms(row)),
          error: failed
            ? flattenDetails(res?.details) || "Installments not available."
            : "",
        });
      } catch (error: unknown) {
        if (cancelled) return;
        const body = errorBody(error);
        setTermsResult({
          key: termsKey,
          ...emptyTerms,
          error:
            flattenDetails(body?.details) ||
            body?.message ||
            "Could not calculate the installments.",
        });
      }
    }, TERMS_DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    branchId,
    loan,
    nextAmount,
    nextDate,
    nextSchemeId,
    orgId,
    termsInputValid,
    termsKey,
    termsSameAsSaved,
  ]);

  const terms: LoanTermsPreview = useMemo(() => {
    if (!loan) return { ...emptyTerms, pending: false, error: "" };
    if (termsSameAsSaved) {
      return {
        roi: loan.roi,
        instNo: loan.instNo,
        instAmount: loan.instAmount,
        realisableAmt: loan.realisableAmt,
        finalDate: loan.finalDate,
        pending: false,
        error: "",
      };
    }
    if (!termsInputValid) return { ...emptyTerms, pending: false, error: "" };
    if (termsResult?.key === termsKey) {
      return {
        roi: termsResult.roi,
        instNo: termsResult.instNo,
        instAmount: termsResult.instAmount,
        realisableAmt: termsResult.realisableAmt,
        finalDate: termsResult.finalDate,
        pending: false,
        error: termsResult.error,
      };
    }
    return { ...emptyTerms, pending: true, error: "" };
  }, [loan, termsInputValid, termsKey, termsResult, termsSameAsSaved]);

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
      search: values.search.trim() || undefined,
    });
    setPage(1);
    setSearchNonce((value) => value + 1);
  });

  const onResetSearch = useCallback(() => {
    searchForm.reset(defaultSearch());
    setListParams(defaultListParams());
    setPage(1);
    setSearchNonce((value) => value + 1);
  }, [searchForm]);

  const onEdit = useCallback(
    (accountId: number) => {
      rectifyForm.reset(emptyRectifyForm);
      setResult(null);
      setTermsResult(null);
      setSelectedAccountId(accountId);
      setEditSession((value) => value + 1);
    },
    [rectifyForm],
  );

  const onCloseDialog = useCallback(() => {
    if (savingRef.current) return;
    setSelectedAccountId(null);
    setResult(null);
    setTermsResult(null);
    rectifyForm.reset(emptyRectifyForm);
  }, [rectifyForm]);

  const onSave = useCallback(async () => {
    if (!loan || savingRef.current) return;
    const values = rectifyForm.getValues();
    rectifyForm.clearErrors();

    const loanDate = toApiDate(values.loan_date);
    const loanAmount = parseAmount(values.loan_amount);
    const schemeId = isChosen(values.scheme_id) ? Number(values.scheme_id) : 0;
    const reason = values.reason.trim();
    const guarantor = values.guarantor_name.trim();
    const scheme = schemeOptions.find((item) => item.value === schemeId);
    let valid = true;

    if (!loanDate) {
      rectifyForm.setError("loan_date", { message: "Select the loan date." });
      valid = false;
    } else if (loan.firstCollDate && loanDate > loan.firstCollDate.slice(0, 10)) {
      rectifyForm.setError("loan_date", {
        message: `Loan date cannot be after the first repayment (${formatDisplayDate(
          loan.firstCollDate,
        )}).`,
      });
      valid = false;
    }
    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      rectifyForm.setError("loan_amount", {
        message: "Enter an amount greater than 0.",
      });
      valid = false;
    } else if (loanAmount < loan.prnCollected) {
      rectifyForm.setError("loan_amount", {
        message: `Amount cannot be less than the principal already repaid (${formatMoney(
          loan.prnCollected,
        )}).`,
      });
      valid = false;
    } else if (
      (loanAmount !== loan.loanAmount || schemeId !== loan.schemeId) &&
      scheme &&
      scheme.sanctionLimit > 0 &&
      loanAmount > scheme.sanctionLimit
    ) {
      rectifyForm.setError("loan_amount", {
        message: `Amount cannot be more than the scheme limit (${formatMoney(
          scheme.sanctionLimit,
        )}).`,
      });
      valid = false;
    }
    if (!schemeId) {
      rectifyForm.setError("scheme_id", { message: "Select the scheme." });
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
      loan_date?: string;
      loan_amount?: number;
      scheme_id?: number;
      purpose_id?: number;
      guarantor_name?: string;
      co_id?: number;
    } = {};
    if (loan.canChangeTerms && loanDate !== loan.loanDate.slice(0, 10)) {
      changes.loan_date = loanDate;
    }
    if (loan.canChangeTerms && loanAmount !== loan.loanAmount) {
      changes.loan_amount = loanAmount;
    }
    if (loan.canChangeScheme && schemeId !== loan.schemeId) {
      changes.scheme_id = schemeId;
    }
    if (isChosen(values.purpose_id) && Number(values.purpose_id) !== loan.purposeId) {
      changes.purpose_id = Number(values.purpose_id);
    }
    if (guarantor !== loan.guarantorName) changes.guarantor_name = guarantor;
    if (isChosen(values.co_id) && Number(values.co_id) !== loan.coId) {
      changes.co_id = Number(values.co_id);
    }

    if (Object.keys(changes).length === 0) {
      toast.message("Nothing to rectify. Every value is the same as saved.");
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const res = await postLoanRectifyAPI({
        org_id: orgId,
        branch_id: branchId,
        account_id: loan.accountId,
        reason,
        ...changes,
      });
      const errorNo = Number(res?.Data?.Error_No ?? 0);
      const failed = /error found/i.test(String(res?.message || "")) || errorNo < 0;
      if (failed) {
        toast.error(
          flattenDetails(res?.details) ||
            String(res?.Data?.Message || "") ||
            "Unable to rectify the loan.",
        );
        return;
      }
      const nextResult = mapLoanResult(res);
      setResult(nextResult);
      toast.success(nextResult.message);
      void queryClient.invalidateQueries({ queryKey: ["loanRectifyList"] });
      void queryClient.invalidateQueries({ queryKey: ["loanRectifyDetails"] });
      void queryClient.invalidateQueries({ queryKey: ["loanRectifyHistory"] });
    } catch (error: unknown) {
      const body = errorBody(error);
      const fieldErrors =
        body?.details && typeof body.details === "object" && !Array.isArray(body.details)
          ? (body.details as Record<string, unknown>)
          : {};
      (
        [
          "loan_date",
          "loan_amount",
          "scheme_id",
          "purpose_id",
          "guarantor_name",
          "co_id",
          "reason",
        ] as const
      ).forEach((field) => {
        const message = flattenDetails(fieldErrors[field]);
        if (message) rectifyForm.setError(field, { message });
      });
      toast.error(
        flattenDetails(body?.details) || body?.message || "Unable to rectify the loan.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
      void queryClient.invalidateQueries({ queryKey: ["loanRectifyLog"] });
    }
  }, [branchId, loan, orgId, queryClient, rectifyForm, schemeOptions]);

  return {
    searchForm,
    rectifyForm,
    groupOptions,
    coOptions,
    schemeOptions,
    purposeOptions,
    groupLoading: groupQuery.isLoading,
    coLoading: sahayikaQuery.isLoading,
    schemeLoading: schemeQuery.isLoading,
    purposeLoading: purposeQuery.isLoading,
    loans,
    listLoading: listQuery.isFetching,
    pagination,
    onPageChange,
    onSearch,
    onResetSearch,
    onEdit,
    dialogOpen: selectedAccountId !== null,
    onCloseDialog,
    detailsLoading: detailsQuery.isLoading || (detailsQuery.isFetching && !loan),
    loan,
    voucher,
    history,
    terms,
    saving,
    onSave,
    result,
  };
};
