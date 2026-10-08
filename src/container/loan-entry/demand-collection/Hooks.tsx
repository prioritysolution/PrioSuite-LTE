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
  DemandCollectionMember,
  DemandCollectionSummary,
  SelectOption,
} from "./DemandCollectionType";
import {
  extractList,
  flattenDetails,
  getDemandCollectionDetailsAPI,
  getSahayikaGroupListAPI,
  getSahayikaListAPI,
  mapCollectionMembers,
  mapSummary,
  postDemandCollectionAPI,
} from "./DemandCollectionApi";

const schema = yup.object().shape({
  collectionDate: yup.mixed().required("Collection date is required"),
  co_id: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Sahayika is required"),
  group_id: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Group is required"),
});

const isChosen = (value: number | "" | null | undefined) =>
  value !== "" &&
  value !== null &&
  value !== undefined &&
  !Number.isNaN(Number(value));

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
  const sahayikaSelected = isChosen(selectedCoId);

  const [members, setMembers] = useState<DemandCollectionMember[]>([]);
  const [summary, setSummary] = useState<DemandCollectionSummary | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const requestRef = useRef(0);

  const sahayikaQuery = useQuery({
    queryKey: ["demandSahayikaList", orgId, branchId],
    queryFn: () => getSahayikaListAPI(orgId, branchId),
    enabled: orgId > 0 && branchId > 0,
  });

  const groupQuery = useQuery({
    queryKey: ["demandSahayikaGroups", orgId, branchId, selectedCoId],
    queryFn: () =>
      getSahayikaGroupListAPI(orgId, branchId, Number(selectedCoId)),
    enabled: orgId > 0 && branchId > 0 && sahayikaSelected,
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

  const groupOptions: SelectOption[] = useMemo(
    () =>
      extractList(groupQuery.data)
        .map((item) => {
          const id = item?.Group_Id ?? item?.group_id;
          const label = String(
            item?.Display_Name ||
              [item?.Group_Name, item?.Group_No ? `(${item.Group_No})` : ""]
                .filter(Boolean)
                .join(" "),
          ).trim();
          return { label, value: Number(id) };
        })
        .filter((item) => item.label !== "" && item.value > 0),
    [groupQuery.data],
  );

  const clearSheet = useCallback(() => {
    setMembers([]);
    setSummary(null);
    setShowMembers(false);
  }, []);

  useEffect(() => {
    requestRef.current += 1;
    clearSheet();
  }, [selectedCoId, selectedGroupId, collectionDate, clearSheet]);

  const loadDetails = useCallback(async () => {
    const collDate = toApiDate(collectionDate);
    if (!orgId || !branchId || !collDate || !isChosen(selectedGroupId)) return;
    const requestId = requestRef.current;
    setDetailsLoading(true);
    try {
      const res = await getDemandCollectionDetailsAPI(
        orgId,
        branchId,
        collDate,
        Number(selectedGroupId),
      );
      if (requestRef.current !== requestId) return;
      const message = String(res?.message || "");
      if (/no data found/i.test(message)) {
        setMembers([]);
        setSummary(null);
        setShowMembers(true);
        toast.message(
          flattenDetails(res?.details) ||
            "No demand found for the selected group on this date.",
        );
        return;
      }
      const nextSummary = mapSummary(res?.Summary ?? res?.data?.Summary);
      setSummary(nextSummary);
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
  }, [branchId, collectionDate, orgId, selectedGroupId]);

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
    const coId = methods.getValues("co_id");
    const groupId = methods.getValues("group_id");
    if (!orgId || !branchId || !collDate || !isChosen(groupId)) return;

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
        co_id: Number(coId),
        group_id: Number(groupId),
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
    groupOptions,
    coLoading: sahayikaQuery.isLoading,
    groupLoading: groupQuery.isLoading,
    detailsLoading,
    saving,
    members,
    summary,
    showMembers,
    onAmountChange,
    onCollectionDetails,
    onSave,
    onReset,
    onSahayikaChange,
  };
};
