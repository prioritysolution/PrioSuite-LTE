"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  extractList,
  flattenDetails,
  formatMoney,
} from "../collection-repayment/CollectionRectifyApi";
import {
  getOpeningEntryAPI,
  getOpeningGroupsAPI,
  getOpeningLoansAPI,
  getOpeningMembersAPI,
  isFailedResponse,
  mapLoans,
  mapMembers,
  mapOpeningEntry,
  mapOpeningSaveResult,
  postOpeningEntryAPI,
  projectSchedule,
  responseMessage,
} from "./OpeningEntryApi";
import {
  OPENING_ENTRY_DATE,
  OpeningEditForm,
  OpeningSaveResult,
  OpeningSearchForm,
  OpeningSearchParams,
  REASON_MAX_LENGTH,
} from "./OpeningEntryType";

const emptySearch = (): OpeningSearchForm => ({
  groupId: "",
  memberId: "",
  loanKey: "",
});

const emptyEdit = (): OpeningEditForm => ({
  openingBalance: "",
  reason: "",
});

const round2 = (value: number) => Math.round(value * 100) / 100;

const parseAmount = (value: string) =>
  value.trim() === "" ? Number.NaN : Number(value);

const isId = (value: number | string | "" | null | undefined): value is number =>
  value !== "" && value !== null && value !== undefined && Number(value) > 0;

const errorBody = (error: unknown) =>
  (
    error as {
      response?: { data?: { details?: unknown; message?: string } };
    }
  )?.response?.data;

export const minimumOpening = (openingBalance: number, currentBalance: number) =>
  round2(Math.max(0, openingBalance - currentBalance));

export const projectCurrent = (
  openingBalance: number,
  currentBalance: number,
  nextOpening: number,
) => round2(currentBalance + (nextOpening - openingBalance));

export const useOpeningEntry = () => {
  const { user } = useGlobalContext();
  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);
  const queryClient = useQueryClient();

  const searchForm = useForm<OpeningSearchForm>({ defaultValues: emptySearch() });
  const editForm = useForm<OpeningEditForm>({ defaultValues: emptyEdit() });

  const groupId = searchForm.watch("groupId");
  const memberId = searchForm.watch("memberId");
  const openingText = editForm.watch("openingBalance");
  const reasonText = editForm.watch("reason") || "";

  const [submitted, setSubmitted] = useState<OpeningSearchParams | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<OpeningSaveResult | null>(null);
  const previousGroup = useRef(groupId);
  const previousMember = useRef(memberId);
  const loadedKey = useRef("");

  useEffect(() => {
    if (previousGroup.current === groupId) return;
    previousGroup.current = groupId;
    searchForm.setValue("memberId", "");
    searchForm.setValue("loanKey", "");
    setSubmitted(null);
    setSaveResult(null);
  }, [groupId, searchForm]);

  useEffect(() => {
    if (previousMember.current === memberId) return;
    previousMember.current = memberId;
    searchForm.setValue("loanKey", "");
    setSubmitted(null);
    setSaveResult(null);
  }, [memberId, searchForm]);

  const groupQuery = useQuery({
    queryKey: ["openingEntryGroups", orgId, branchId],
    queryFn: () => getOpeningGroupsAPI(orgId, branchId),
    enabled: orgId > 0 && branchId > 0,
  });

  const memberQuery = useQuery({
    queryKey: ["openingEntryMembers", orgId, groupId],
    queryFn: () => getOpeningMembersAPI(orgId, Number(groupId)),
    enabled: orgId > 0 && isId(groupId),
  });

  const loanQuery = useQuery({
    queryKey: ["openingEntryLoans", orgId, branchId, groupId, memberId],
    queryFn: () =>
      getOpeningLoansAPI(orgId, branchId, Number(groupId), Number(memberId)),
    enabled: orgId > 0 && branchId > 0 && isId(groupId) && isId(memberId),
  });

  const entryQuery = useQuery({
    queryKey: ["openingEntry", orgId, branchId, submitted],
    queryFn: () =>
      getOpeningEntryAPI({
        org_id: orgId,
        branch_id: branchId,
        group_id: submitted!.groupId,
        member_id: submitted!.memberId,
        account_id: submitted!.accountId || undefined,
        loan_cycle: submitted!.loanCycle || undefined,
      }),
    enabled: orgId > 0 && branchId > 0 && submitted !== null,
  });

  const groupOptions = useMemo(
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

  const memberOptions = useMemo(
    () => mapMembers(memberQuery.data),
    [memberQuery.data],
  );

  const loanChoices = useMemo(() => mapLoans(loanQuery.data), [loanQuery.data]);

  const loanOptions = useMemo(
    () => loanChoices.map((item) => ({ label: item.label, value: item.key })),
    [loanChoices],
  );

  const entry = useMemo(() => {
    if (!entryQuery.data || isFailedResponse(entryQuery.data) || !submitted) return null;
    const mapped = mapOpeningEntry(entryQuery.data);
    if (!mapped) return null;
    return {
      ...mapped,
      accountId: mapped.accountId || submitted.accountId,
      loanCycle: mapped.loanCycle || submitted.loanCycle,
      accountNo: mapped.accountNo || submitted.accountNo,
      groupId: mapped.groupId || submitted.groupId,
      groupName: mapped.groupName || submitted.groupLabel,
      memberId: mapped.memberId || submitted.memberId,
      memberName: mapped.memberName || submitted.memberLabel,
    };
  }, [entryQuery.data, submitted]);

  const entryError = useMemo(() => {
    if (entryQuery.isError) {
      return (
        flattenDetails(errorBody(entryQuery.error)?.details) ||
        errorBody(entryQuery.error)?.message ||
        "Unable to load the opening entry."
      );
    }
    if (entryQuery.data && !entry) {
      return responseMessage(entryQuery.data, "No opening entry found for this loan.");
    }
    return "";
  }, [entry, entryQuery.data, entryQuery.error, entryQuery.isError]);

  useEffect(() => {
    if (!entry) {
      loadedKey.current = "";
      return;
    }
    const fingerprint = [
      entry.accountId,
      entry.loanCycle,
      entry.openingBalance,
      entry.currentBalance,
      entry.schedule.pendingInstCount,
      entry.schedule.pendingPrincipal,
    ].join("|");
    if (loadedKey.current === fingerprint) return;
    loadedKey.current = fingerprint;
    editForm.reset({
      openingBalance: entry.openingBalance.toFixed(2),
      reason: "",
    });
    editForm.clearErrors();
  }, [editForm, entry]);

  const parsedOpening = parseAmount(openingText);
  const openingIsNumber = Number.isFinite(parsedOpening);
  const projectedCurrent =
    entry && openingIsNumber
      ? projectCurrent(entry.openingBalance, entry.currentBalance, parsedOpening)
      : entry?.currentBalance ?? null;
  const projectedSchedule =
    entry && openingIsNumber
      ? projectSchedule(
          entry.schedule,
          round2(parsedOpening - entry.openingBalance),
        )
      : entry?.schedule ?? null;
  const minOpening = entry
    ? minimumOpening(entry.openingBalance, entry.currentBalance)
    : 0;
  const currentIsNegative =
    projectedCurrent !== null && round2(projectedCurrent) < 0;

  const onSearch = () => {
    searchForm.clearErrors();
    setSaveResult(null);
    const values = searchForm.getValues();
    let valid = true;
    if (!isId(values.groupId)) {
      searchForm.setError("groupId", { message: "Select a group." });
      valid = false;
    }
    if (!isId(values.memberId)) {
      searchForm.setError("memberId", { message: "Select a member." });
      valid = false;
    }
    const loan = loanChoices.find(
      (item) => String(item.key) === String(values.loanKey),
    );
    if (!loan) {
      searchForm.setError("loanKey", { message: "Select a loan." });
      valid = false;
    }
    if (!valid || !loan || !isId(values.groupId) || !isId(values.memberId)) return;

    const groupLabel =
      groupOptions.find((item) => String(item.value) === String(values.groupId))
        ?.label || "";
    const memberLabel =
      memberOptions.find((item) => String(item.value) === String(values.memberId))
        ?.label || "";

    setSubmitted({
      groupId: Number(values.groupId),
      memberId: Number(values.memberId),
      accountId: loan.accountId,
      loanCycle: loan.loanCycle,
      accountNo: loan.accountNo,
      groupLabel,
      memberLabel,
    });
  };

  const onResetSearch = () => {
    searchForm.reset(emptySearch());
    editForm.reset(emptyEdit());
    setSubmitted(null);
    setSaveResult(null);
    previousGroup.current = "";
    previousMember.current = "";
  };

  const onSave = async () => {
    if (!entry || !submitted || saving) return;
    editForm.clearErrors();
    const values = editForm.getValues();
    const amount = parseAmount(values.openingBalance);
    const reason = values.reason.trim();
    let valid = true;

    if (!Number.isFinite(amount)) {
      editForm.setError("openingBalance", { message: "Enter the opening balance." });
      valid = false;
    } else if (amount < 0) {
      editForm.setError("openingBalance", {
        message: "Opening balance cannot be negative.",
      });
      valid = false;
    } else if (
      projectCurrent(entry.openingBalance, entry.currentBalance, amount) < 0
    ) {
      editForm.setError("openingBalance", {
        message: `Opening balance cannot be below ${formatMoney(minOpening)}. Current balance would become negative.`,
      });
      valid = false;
    }

    if (!reason) {
      editForm.setError("reason", { message: "Reason is required." });
      valid = false;
    } else if (reason.length > REASON_MAX_LENGTH) {
      editForm.setError("reason", {
        message: `Reason cannot be more than ${REASON_MAX_LENGTH} characters.`,
      });
      valid = false;
    }
    if (!valid || !Number.isFinite(amount)) return;

    if (round2(amount) === round2(entry.openingBalance)) {
      toast.message("Nothing to update. Opening balance is unchanged.");
      return;
    }

    setSaving(true);
    setSaveResult(null);
    try {
      const res = await postOpeningEntryAPI({
        org_id: orgId,
        branch_id: branchId,
        group_id: submitted.groupId,
        member_id: submitted.memberId,
        account_id: entry.accountId || submitted.accountId,
        loan_cycle: entry.loanCycle || submitted.loanCycle,
        opening_date: OPENING_ENTRY_DATE,
        opening_balance: round2(amount),
        reason,
      });
      if (isFailedResponse(res)) {
        toast.error(responseMessage(res, "Unable to update the opening balance."));
        return;
      }
      const result = mapOpeningSaveResult(res);
      setSaveResult(result);
      toast.success(
        result.schedule.scheduleUpdated || result.schedule.rowsUpdated > 0
          ? `${result.message} Pending schedule updated.`
          : result.message,
      );
      loadedKey.current = "";
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["openingEntry"] }),
        queryClient.invalidateQueries({ queryKey: ["openingEntryLog"] }),
      ]);
    } catch (error: unknown) {
      const body = errorBody(error);
      const fieldErrors =
        body?.details && typeof body.details === "object" && !Array.isArray(body.details)
          ? (body.details as Record<string, unknown>)
          : {};
      (["opening_balance", "reason"] as const).forEach((field) => {
        const message = flattenDetails(fieldErrors[field]);
        if (!message) return;
        editForm.setError(field === "opening_balance" ? "openingBalance" : "reason", {
          message,
        });
      });
      toast.error(
        flattenDetails(body?.details) ||
          body?.message ||
          "Unable to update the opening balance.",
      );
    } finally {
      setSaving(false);
    }
  };

  return {
    searchForm,
    editForm,
    groupOptions,
    memberOptions,
    loanOptions,
    groupLoading: groupQuery.isFetching,
    memberLoading: memberQuery.isFetching,
    loanLoading: loanQuery.isFetching,
    groupSelected: isId(groupId),
    memberSelected: isId(memberId),
    searching: entryQuery.isFetching,
    entry,
    entryError,
    hasSearched: submitted !== null,
    openingText,
    reasonText,
    projectedCurrent,
    projectedSchedule,
    minOpening,
    currentIsNegative,
    saving,
    saveResult,
    onDismissResult: () => setSaveResult(null),
    onSearch,
    onResetSearch,
    onSave,
  };
};
