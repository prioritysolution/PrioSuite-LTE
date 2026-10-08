"use client";

import { useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/redux/store";
import { DemandGenerationForm, SelectOption } from "./DemandGenerationType";
import { dummySahayikaList, mapDemandRows } from "./DemandGenerationApi";
import {
  clearDemand,
  setDemandLoading,
  setDemandRows,
} from "./DemandGenerationReducer";

const schema = yup.object().shape({
  co_id: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Sahayika is required"),
  group_id: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Group is required"),
});

export const useDemandGeneration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const rows = useSelector((state: RootState) => state.demandGeneration.rows);
  const generating = useSelector(
    (state: RootState) => state.demandGeneration.loading,
  );

  const requestIdRef = useRef(0);

  const methods = useForm<DemandGenerationForm>({
    defaultValues: {
      co_id: "",
      group_id: "",
    },
    resolver: yupResolver(schema) as never,
  });

  const selectedCoId = methods.watch("co_id");

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

  const onSelectionChange = useCallback(() => {
    requestIdRef.current += 1;
    dispatch(clearDemand());
  }, [dispatch]);

  const onReset = useCallback(() => {
    requestIdRef.current += 1;
    methods.reset({
      co_id: "",
      group_id: "",
    });
    dispatch(clearDemand());
  }, [dispatch, methods]);

  const onGenerate = useCallback(
    (values: DemandGenerationForm) => {
      if (!values.co_id || !values.group_id) return;
      const requestId = ++requestIdRef.current;
      dispatch(setDemandLoading(true));
      const sahayika = dummySahayikaList.find(
        (item) => String(item.CO_Id) === String(values.co_id),
      );
      const group = sahayika?.groups.find(
        (item) => String(item.Group_Id) === String(values.group_id),
      );
      const mapped = mapDemandRows(group?.members ?? []);
      if (requestIdRef.current !== requestId) return;
      dispatch(setDemandRows(mapped));
      dispatch(setDemandLoading(false));
      if (!mapped.length) {
        toast.message("No demand records found for this group.");
      }
    },
    [dispatch],
  );

  return {
    methods,
    coOptions,
    groupOptions,
    coLoading: false,
    groupLoading: false,
    generating,
    rows,
    onGenerate,
    onReset,
    onSelectionChange,
  };
};
