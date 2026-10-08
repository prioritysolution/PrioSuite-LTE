"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { format, isValid } from "date-fns";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/redux/store";
import { useGlobalContext } from "@/context/GlobalContext";
import { DemandGenerationForm, SelectOption } from "./DemandGenerationType";
import {
  extractList,
  flattenDetails,
  generateDemandAPI,
  getDemandMemberWiseAPI,
  getSahayikaGroupListAPI,
  getSahayikaListAPI,
  mapDemandRows,
} from "./DemandGenerationApi";
import {
  clearDemand,
  setDemandLoading,
  setDemandRows,
} from "./DemandGenerationReducer";

const schema = yup.object().shape({
  demand_date: yup
    .mixed<Date>()
    .required("Demand date is required")
    .test("valid-date", "Demand date is required", (value) => {
      if (!value) return false;
      const date = value instanceof Date ? value : new Date(String(value));
      return isValid(date);
    }),
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
  value !== "" && value !== null && value !== undefined && !Number.isNaN(Number(value));

const toApiDate = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

const readApiMessage = (res: {
  message?: string;
  details?: unknown;
  Data?: { Message?: unknown; Error_No?: number };
  data?: { Message?: unknown; Error_No?: number };
}) => {
  const details = flattenDetails(res?.details);
  const dataMessage = flattenDetails(res?.Data?.Message ?? res?.data?.Message);
  return details || dataMessage || String(res?.message || "");
};

export const useDemandGeneration = () => {
  const { user } = useGlobalContext();
  const dispatch = useDispatch<AppDispatch>();
  const rows = useSelector((state: RootState) => state.demandGeneration.rows);
  const generating = useSelector(
    (state: RootState) => state.demandGeneration.loading,
  );
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const pendingValues = useRef<DemandGenerationForm | null>(null);
  const requestIdRef = useRef(0);

  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);

  const methods = useForm<DemandGenerationForm>({
    defaultValues: {
      demand_date: new Date(),
      co_id: "",
      group_id: "",
    },
    resolver: yupResolver(schema) as never,
  });

  const selectedCoId = methods.watch("co_id");
  const sahayikaSelected = isChosen(selectedCoId);

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
        .filter(
          (item) =>
            item.label !== "" &&
            item.value !== undefined &&
            !Number.isNaN(item.value),
        ),
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
        .filter(
          (item) => item.label !== "" && item.value > 0 && !Number.isNaN(item.value),
        ),
    [groupQuery.data],
  );

  const onSelectionChange = useCallback(() => {
    requestIdRef.current += 1;
    setRegenerateOpen(false);
    dispatch(clearDemand());
  }, [dispatch]);

  const onReset = useCallback(() => {
    requestIdRef.current += 1;
    setRegenerateOpen(false);
    pendingValues.current = null;
    methods.reset({
      demand_date: new Date(),
      co_id: "",
      group_id: "",
    });
    dispatch(clearDemand());
  }, [dispatch, methods]);

  const loadMemberDemand = useCallback(
    async (values: DemandGenerationForm, requestId: number) => {
      const demandDate = toApiDate(values.demand_date);
      const res = await getDemandMemberWiseAPI(
        orgId,
        branchId,
        demandDate,
        Number(values.group_id),
      );
      if (requestIdRef.current !== requestId) return;
      const message = String(res?.message || "");
      const mapped = /no data found/i.test(message) ? [] : mapDemandRows(extractList(res));
      dispatch(setDemandRows(mapped));
      if (!mapped.length) {
        toast.message("No demand records found for this group.");
      }
    },
    [branchId, dispatch, orgId],
  );

  const runGenerate = useCallback(
    async (values: DemandGenerationForm, regenerate: boolean) => {
      const demandDate = toApiDate(values.demand_date);
      if (!demandDate || !isChosen(values.co_id) || !isChosen(values.group_id)) {
        return;
      }
      if (!orgId || !branchId) {
        toast.error("Branch is not available for this login.");
        return;
      }

      const requestId = ++requestIdRef.current;
      dispatch(setDemandLoading(true));
      try {
        const res = await generateDemandAPI({
          org_id: orgId,
          branch_id: branchId,
          demand_date: demandDate,
          co_id: Number(values.co_id),
          regenerate,
        });
        if (requestIdRef.current !== requestId) return;

        const errorNo = Number(res?.Data?.Error_No ?? res?.data?.Error_No);
        const message = readApiMessage(res);
        if (errorNo === -2) {
          dispatch(setDemandLoading(false));
          setRegenerateOpen(true);
          return;
        }
        if (errorNo < 0 || /error found/i.test(String(res?.message || ""))) {
          toast.error(message || "Unable to generate demand.");
          dispatch(setDemandLoading(false));
          return;
        }
        if (/no demand found/i.test(message)) {
          toast.message(message);
          dispatch(setDemandRows([]));
          dispatch(setDemandLoading(false));
          return;
        }

        toast.success(message || "Demand Generated Successfully");
        await loadMemberDemand(values, requestId);
      } catch (error: unknown) {
        if (requestIdRef.current !== requestId) return;
        const body = (
          error as { response?: { data?: { details?: unknown; message?: string } } }
        )?.response?.data;
        toast.error(
          flattenDetails(body?.details) ||
            body?.message ||
            "Unable to generate demand.",
        );
      } finally {
        if (requestIdRef.current === requestId) {
          dispatch(setDemandLoading(false));
        }
      }
    },
    [branchId, dispatch, loadMemberDemand, orgId],
  );

  const onGenerate = useCallback(
    (values: DemandGenerationForm) => {
      pendingValues.current = values;
      setRegenerateOpen(false);
      void runGenerate(values, false);
    },
    [runGenerate],
  );

  const onConfirmRegenerate = useCallback(() => {
    const values = pendingValues.current;
    setRegenerateOpen(false);
    if (!values) return;
    void runGenerate(values, true);
  }, [runGenerate]);

  const onCancelRegenerate = useCallback(() => {
    setRegenerateOpen(false);
  }, []);

  return {
    methods,
    coOptions,
    groupOptions,
    coLoading: sahayikaQuery.isLoading,
    groupLoading: groupQuery.isLoading,
    generating,
    rows,
    onGenerate,
    onReset,
    onSelectionChange,
    regenerateOpen,
    onConfirmRegenerate,
    onCancelRegenerate,
  };
};
