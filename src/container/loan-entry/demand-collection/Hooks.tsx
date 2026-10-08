"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "sonner";
import * as yup from "yup";
import {
  DemandCollectionForm,
  DemandCollectionMember,
  SelectOption,
} from "./DemandCollectionType";
import { dummySahayikaList } from "./DemandCollectionApi";

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

export const useDemandCollection = () => {
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
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    setSelectedMemberIds([]);
    setShowMembers(false);
  }, [selectedCoId, selectedGroupId, collectionDate]);

  const coOptions: SelectOption[] = useMemo(
    () =>
      dummySahayikaList.map((item) => ({
        label: `${item.CO_Name} (${item.CO_Code})`,
        value: item.CO_Id,
      })),
    [],
  );

  const groupOptions: SelectOption[] = useMemo(() => {
    if (!selectedCoId) return [];
    const sahayika = dummySahayikaList.find(
      (item) => String(item.CO_Id) === String(selectedCoId),
    );
    return (sahayika?.groups ?? []).map((group) => ({
      label: [group.Group_No, group.Group_Name].filter(Boolean).join(" - "),
      value: group.Group_Id,
    }));
  }, [selectedCoId]);

  const members: DemandCollectionMember[] = useMemo(() => {
    if (!showMembers || !selectedCoId || !selectedGroupId) return [];
    const sahayika = dummySahayikaList.find(
      (item) => String(item.CO_Id) === String(selectedCoId),
    );
    const group = sahayika?.groups.find(
      (item) => String(item.Group_Id) === String(selectedGroupId),
    );
    return group?.members ?? [];
  }, [selectedCoId, selectedGroupId, showMembers]);

  const onToggleMember = useCallback((memberId: number, checked: boolean) => {
    setSelectedMemberIds((current) =>
      checked
        ? current.includes(memberId)
          ? current
          : [...current, memberId]
        : current.filter((id) => id !== memberId),
    );
  }, []);

  const onCollectionDetails = methods.handleSubmit(() => {
    setSelectedMemberIds([]);
    setShowMembers(true);
  });

  const onSend = useCallback(() => {
    if (!selectedMemberIds.length) {
      toast.message("Select at least one member.");
      return;
    }
    toast.success(
      `${selectedMemberIds.length} ${selectedMemberIds.length === 1 ? "member" : "members"} sent.`,
    );
  }, [selectedMemberIds.length]);

  const onSahayikaChange = useCallback(() => {
    methods.setValue("group_id", "");
    setSelectedMemberIds([]);
  }, [methods]);

  const onReset = useCallback(() => {
    methods.reset({
      collectionDate: "",
      co_id: "",
      group_id: "",
    });
    setSelectedMemberIds([]);
    setShowMembers(false);
  }, [methods]);

  return {
    methods,
    coOptions,
    groupOptions,
    members,
    showMembers,
    selectedMemberIds,
    onCollectionDetails,
    onSend,
    onToggleMember,
    onReset,
    onSahayikaChange,
  };
};
