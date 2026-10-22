"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import * as yup from "yup";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  DemandCollectionForm,
  DemandCollectionGroup,
  DemandCollectionMember,
  DemandCollectionSummary,
  SelectOption,
} from "./DemandCollectionType";
import {
  extractList,
  flattenDetails,
  getDemandCollectionDetailsAPI,
  getDemandListAPI,
  getSahayikaListAPI,
  mapCollectionGroups,
  mapCollectionMembers,
  mapSummary,
  postDemandCollectionAPI,
  toAmount,
} from "./DemandCollectionApi";

const schema = yup.object().shape({
  collectionDate: yup.mixed().required("Collection date is required"),
});

const ALL_DEMANDS = 0;

const formatMoney = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const isChosen = (value: number | "" | null | undefined) =>
  value !== "" &&
  value !== null &&
  value !== undefined &&
  !Number.isNaN(Number(value));

const toGroupId = (value: number | "" | null | undefined) =>
  isChosen(value) && Number(value) > 0 ? Number(value) : undefined;

const toCoId = (value: number | "" | null | undefined) =>
  isChosen(value) ? Number(value) : undefined;

const toApiDate = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

export const useDemandCollection = () => {
  const { user } = useGlobalContext();
  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);

  const methods = useForm<DemandCollectionForm>({
    defaultValues: {
      collectionDate: "",
      co_id: "",
      group_id: "",
    },
    resolver: yupResolver(schema) as never,
  });

  const selectedCoId = methods.watch("co_id");
  const selectedGroupId = methods.watch("group_id");
  const collectionDate = methods.watch("collectionDate");

  const [members, setMembers] = useState<DemandCollectionMember[]>([]);
  const [summary, setSummary] = useState<DemandCollectionSummary | null>(null);
  const [groups, setGroups] = useState<DemandCollectionGroup[]>([]);
  const [groupWise, setGroupWise] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestRef = useRef(0);

  const sahayikaQuery = useQuery({
    queryKey: ["demandSahayikaList", orgId, branchId],
    queryFn: () => getSahayikaListAPI(orgId, branchId),
    enabled: orgId > 0 && branchId > 0,
  });

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

  const demandDate = toApiDate(collectionDate);
  const demandCoId = toCoId(selectedCoId);

  const demandQuery = useQuery({
    queryKey: ["demandCollectionDemandList", orgId, branchId, demandDate, demandCoId],
    queryFn: () =>
      getDemandListAPI({ orgId, branchId, demandDate, coId: demandCoId }),
    enabled: orgId > 0 && branchId > 0 && demandDate !== "",
  });

  const demandOptions: SelectOption[] = useMemo(() => {
    const noData = /no data found/i.test(String(demandQuery.data?.message || ""));
    const list = (noData ? [] : extractList(demandQuery.data))
      .map((item) => {
        const id = item?.Group_Id ?? item?.group_id;
        const label = `Demand ₹${formatMoney(toAmount(item?.Total_Demand))}`;
        return { label, value: Number(id) };
      })
      .filter((item) => item.label !== "" && item.value > 0);
    return [{ label: "All Demands", value: ALL_DEMANDS }, ...list];
  }, [demandQuery.data]);

  useEffect(() => {
    methods.setValue("group_id", "");
  }, [demandDate, methods]);

  const clearSheet = useCallback(() => {
    setMembers([]);
    setSummary(null);
    setGroups([]);
    setGroupWise(false);
    setShowMembers(false);
  }, []);

  useEffect(() => {
    requestRef.current += 1;
    clearSheet();
  }, [selectedCoId, selectedGroupId, collectionDate, clearSheet]);

  const loadDetails = useCallback(async () => {
    const collDate = toApiDate(collectionDate);
    if (!orgId || !branchId || !collDate) return;
    const groupId = toGroupId(selectedGroupId);
    const requestId = requestRef.current;
    setDetailsLoading(true);
    try {
      const res = await getDemandCollectionDetailsAPI({
        orgId,
        branchId,
        collDate,
        coId: toCoId(selectedCoId),
        groupId,
      });
      if (requestRef.current !== requestId) return;
      const message = String(res?.message || "");
      if (/no data found/i.test(message)) {
        setMembers([]);
        setSummary(null);
        setGroups([]);
        setGroupWise(!groupId);
        setShowMembers(true);
        toast.message(
          flattenDetails(res?.details) || "No demand found on this date.",
        );
        return;
      }
      const nextSummary = mapSummary(res?.Summary ?? res?.data?.Summary);
      setSummary(nextSummary);
      setGroups(mapCollectionGroups(res?.Groups ?? res?.data?.Groups));
      setGroupWise(!groupId);
      setMembers(mapCollectionMembers(extractList(res)));
      setShowMembers(true);
      if (nextSummary?.demandGenerated) {
        toast.message("Demand generated for this date.");
      }
    } catch (error: unknown) {
      const body = (
        error as { response?: { data?: { details?: unknown; message?: string } } }
      )?.response?.data;
      toast.error(
        flattenDetails(body?.details) ||
          body?.message ||
          "Unable to load collection details.",
      );
    } finally {
      if (requestRef.current === requestId) setDetailsLoading(false);
    }
  }, [branchId, collectionDate, orgId, selectedCoId, selectedGroupId]);

  const onCollectionDetails = methods.handleSubmit(() => {
    void loadDetails();
  });

  const onAmountChange = useCallback((accountId: number, amount: string) => {
    setMembers((current) =>
      current.map((member) =>
        member.accountId === accountId && !member.isCollected
          ? { ...member, payAmount: amount }
          : member,
      ),
    );
  }, []);

  const onSave = useCallback(async () => {
    const collDate = toApiDate(methods.getValues("collectionDate"));
    const coId = toCoId(methods.getValues("co_id"));
    const groupId = toGroupId(methods.getValues("group_id"));
    if (!orgId || !branchId || !collDate) return;

    const collData = members
      .filter((member) => !member.isCollected && Number(member.payAmount) > 0)
      .map((member) => ({
        account_id: member.accountId,
        member_id: member.memberId,
        coll_amount: Number(member.payAmount),
      }));

    if (!collData.length) {
      toast.message("Enter collection amount for at least one member.");
      return;
    }

    setSaving(true);
    try {
      const res = await postDemandCollectionAPI({
        org_id: orgId,
        branch_id: branchId,
        coll_date: collDate,
        ...(coId !== undefined ? { co_id: coId } : {}),
        ...(groupId ? { group_id: groupId } : {}),
        coll_data: collData,
      });
      const errorNo = Number(res?.Data?.Error_No ?? res?.data?.Error_No);
      const message =
        flattenDetails(res?.details) ||
        flattenDetails(res?.Data?.Message) ||
        String(res?.message || "");
      if (errorNo < 0 || /error found/i.test(String(res?.message || ""))) {
        toast.error(message || "Unable to save collection.");
        return;
      }
      const voucherNo = String(
        res?.Data?.Voucher_No || res?.data?.Voucher_No || "",
      );
      toast.success(
        voucherNo
          ? `${message || "Demand collection posted."} Receipt ${voucherNo}`
          : message || "Demand collection posted.",
      );
      await loadDetails();
    } catch (error: unknown) {
      const body = (
        error as { response?: { data?: { details?: unknown; message?: string } } }
      )?.response?.data;
      toast.error(
        flattenDetails(body?.details) ||
          body?.message ||
          "Unable to save collection.",
      );
    } finally {
      setSaving(false);
    }
  }, [branchId, loadDetails, members, methods, orgId]);

  const onSahayikaChange = useCallback(() => {
    methods.setValue("group_id", "");
    clearSheet();
  }, [clearSheet, methods]);

  const onReset = useCallback(() => {
    methods.reset({
      collectionDate: "",
      co_id: "",
      group_id: "",
    });
    clearSheet();
  }, [clearSheet, methods]);

  return {
    methods,
    coOptions,
    demandOptions,
    coLoading: sahayikaQuery.isLoading,
    demandLoading: demandQuery.isFetching,
    detailsLoading,
    saving,
    members,
    summary,
    groups,
    groupWise,
    showMembers,
    onAmountChange,
    onCollectionDetails,
    onSave,
    onReset,
    onSahayikaChange,
  };
};
