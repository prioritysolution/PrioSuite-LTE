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
import {
  ALL_SAHAYIKA,
  DemandCoRow,
  DemandDrill,
  DemandGenerationForm,
  DemandGroupRow,
  DemandLevel,
  DemandMemberRow,
  DemandReportScope,
  GenerateResult,
  SelectOption,
} from "./DemandGenerationType";
import {
  extractList,
  flattenDetails,
  generateDemandAPI,
  getDemandReportAPI,
  getSahayikaListAPI,
  mapGenerateResult,
  previewDemandAPI,
} from "./DemandGenerationApi";
import {
  clearDemand,
  setDemandLoading,
  setDemandResult,
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
  co_id: yup.mixed().nullable(),
});

const EMPTY_DRILL: DemandDrill = { co: null, group: null, account: null };

const toApiDate = (value: Date | string | null | undefined) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

/** `null` means all Sahayika; `0` is the "Not Assigned" bucket. */
const toCoId = (value: DemandGenerationForm["co_id"]) => {
  if (value === "" || value === ALL_SAHAYIKA || value === null || value === undefined) {
    return null;
  }
  const id = Number(value);
  return Number.isNaN(id) ? null : id;
};

const levelOf = (drill: DemandDrill): DemandLevel =>
  drill.account ? "emi" : "member";

const errorMessage = (error: unknown, fallback: string) => {
  const body = (
    error as { response?: { data?: { details?: unknown; message?: string } } }
  )?.response?.data;
  return flattenDetails(body?.details) || body?.message || fallback;
};

export const useDemandGeneration = () => {
  const { user } = useGlobalContext();
  const dispatch = useDispatch<AppDispatch>();
  const result = useSelector((state: RootState) => state.demandGeneration.result);
  const generating = useSelector(
    (state: RootState) => state.demandGeneration.loading,
  );
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [scope, setScope] = useState<DemandReportScope | null>(null);
  const [drill, setDrill] = useState<DemandDrill>(EMPTY_DRILL);
  const [preview, setPreview] = useState<GenerateResult | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const pendingValues = useRef<DemandGenerationForm | null>(null);
  const requestIdRef = useRef(0);

  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);
  const level = levelOf(drill);

  const methods = useForm<DemandGenerationForm>({
    defaultValues: {
      demand_date: new Date(),
      co_id: ALL_SAHAYIKA,
    },
    resolver: yupResolver(schema) as never,
  });

  const sahayikaQuery = useQuery({
    queryKey: ["demandSahayikaList", orgId, branchId],
    queryFn: () => getSahayikaListAPI(orgId, branchId),
    enabled: orgId > 0 && branchId > 0,
  });

  const coOptions: SelectOption[] = useMemo(() => {
    const list = extractList(sahayikaQuery.data)
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
      );
    return [{ label: "All Sahayika", value: ALL_SAHAYIKA }, ...list];
  }, [sahayikaQuery.data]);

  const reportQuery = useQuery({
    queryKey: [
      "demandReport",
      orgId,
      branchId,
      scope,
      level,
      drill.co?.id,
      drill.group?.id,
      drill.account?.id,
    ],
    queryFn: () => {
      const base = {
        org_id: orgId,
        branch_id: branchId,
        demand_date: scope!.demandDate,
      };
      if (level === "emi") {
        return getDemandReportAPI(level, { ...base, account_id: drill.account!.id });
      }
      return getDemandReportAPI(level, {
        ...base,
        co_id: drill.co ? drill.co.id : scope!.coId,
        group_id: drill.group?.id,
      });
    },
    enabled: !!scope && orgId > 0 && branchId > 0,
    retry: false,
  });

  const clearPreview = useCallback(() => {
    setPreview(null);
    setPreviewReady(false);
  }, []);

  const clearReport = useCallback(() => {
    requestIdRef.current += 1;
    setRegenerateOpen(false);
    setScope(null);
    setDrill(EMPTY_DRILL);
    setPreviewing(false);
    clearPreview();
    dispatch(clearDemand());
  }, [clearPreview, dispatch]);

  const onSelectionChange = clearReport;

  const onReset = useCallback(() => {
    pendingValues.current = null;
    methods.reset({
      demand_date: new Date(),
      co_id: ALL_SAHAYIKA,
    });
    clearReport();
  }, [clearReport, methods]);

  const showReport = useCallback((values: DemandGenerationForm) => {
    setDrill(EMPTY_DRILL);
    setScope({
      demandDate: toApiDate(values.demand_date),
      coId: toCoId(values.co_id),
      version: Date.now(),
    });
  }, []);

  const runGenerate = useCallback(
    async (values: DemandGenerationForm, regenerate: boolean) => {
      const demandDate = toApiDate(values.demand_date);
      if (!demandDate) return;
      if (!orgId || !branchId) {
        toast.error("Branch is not available for this login.");
        return;
      }

      const coId = toCoId(values.co_id);
      const requestId = ++requestIdRef.current;
      dispatch(setDemandLoading(true));
      dispatch(setDemandResult(null));
      setScope(null);
      try {
        const res = await generateDemandAPI({
          org_id: orgId,
          branch_id: branchId,
          demand_date: demandDate,
          ...(coId !== null ? { co_id: coId } : {}),
          regenerate,
        });
        if (requestIdRef.current !== requestId) return;

        const generated = mapGenerateResult(res);
        const errorNo = Number(res?.Data?.Error_No ?? res?.data?.Error_No);
        if (errorNo === -2) {
          setRegenerateOpen(true);
          return;
        }
        if (errorNo < 0 || /error found/i.test(String(res?.message || ""))) {
          toast.error(generated.message || "Unable to generate demand.");
          return;
        }
        if (/no demand found/i.test(generated.message)) {
          toast.message(generated.message);
          return;
        }

        toast.success(generated.message || "Demand Generated Successfully");
        clearPreview();
        dispatch(setDemandResult(generated));
        showReport(values);
      } catch (error: unknown) {
        if (requestIdRef.current !== requestId) return;
        toast.error(errorMessage(error, "Unable to generate demand."));
      } finally {
        if (requestIdRef.current === requestId) {
          dispatch(setDemandLoading(false));
        }
      }
    },
    [branchId, clearPreview, dispatch, orgId, showReport],
  );

  const runPreview = useCallback(
    async (values: DemandGenerationForm) => {
      const demandDate = toApiDate(values.demand_date);
      if (!demandDate) return;
      if (!orgId || !branchId) {
        toast.error("Branch is not available for this login.");
        return;
      }

      const coId = toCoId(values.co_id);
      const requestId = ++requestIdRef.current;
      setPreviewing(true);
      clearPreview();
      dispatch(setDemandResult(null));
      setScope(null);
      setDrill(EMPTY_DRILL);
      try {
        const res = await previewDemandAPI({
          org_id: orgId,
          branch_id: branchId,
          demand_date: demandDate,
          ...(coId !== null ? { co_id: coId } : {}),
        });
        if (requestIdRef.current !== requestId) return;

        const previewed = mapGenerateResult(res);
        const errorNo = Number(res?.Data?.Error_No ?? res?.data?.Error_No);
        if (errorNo === -2) {
          toast.message(
            previewed.message ||
              "Demand already generated for this date. Click Save to regenerate or view it.",
          );
          setPreviewReady(true);
          return;
        }
        if (errorNo < 0 || /error found/i.test(String(res?.message || ""))) {
          toast.error(previewed.message || "Unable to preview demand.");
          return;
        }
        if (/no demand found/i.test(previewed.message)) {
          toast.message(previewed.message);
          return;
        }

        setPreview(previewed);
        setPreviewReady(true);
      } catch (error: unknown) {
        if (requestIdRef.current !== requestId) return;
        const status = (error as { response?: { status?: number } })?.response
          ?.status;
        if (status === 404) {
          toast.message(
            "Demand preview is not available yet. Review the selection and click Save to generate.",
          );
          setPreviewReady(true);
          return;
        }
        toast.error(errorMessage(error, "Unable to preview demand."));
      } finally {
        if (requestIdRef.current === requestId) {
          setPreviewing(false);
        }
      }
    },
    [branchId, clearPreview, dispatch, orgId],
  );

  const onGenerate = useCallback(
    (values: DemandGenerationForm) => {
      pendingValues.current = values;
      setRegenerateOpen(false);
      void runPreview(values);
    },
    [runPreview],
  );

  const onSave = useCallback(() => {
    const values = pendingValues.current;
    if (!values) return;
    setRegenerateOpen(false);
    void runGenerate(values, false);
  }, [runGenerate]);

  const onConfirmRegenerate = useCallback(() => {
    const values = pendingValues.current;
    setRegenerateOpen(false);
    if (!values) return;
    void runGenerate(values, true);
  }, [runGenerate]);

  const onCancelRegenerate = useCallback(() => {
    setRegenerateOpen(false);
  }, []);

  const onViewExisting = useCallback(() => {
    const values = pendingValues.current;
    setRegenerateOpen(false);
    if (!values) return;
    clearPreview();
    showReport(values);
  }, [clearPreview, showReport]);

  const onSelectCo = useCallback((row: DemandCoRow) => {
    setDrill({ co: { id: row.coId, name: row.coName }, group: null, account: null });
  }, []);

  const onSelectGroup = useCallback((row: DemandGroupRow) => {
    setDrill((prev) => ({
      co: prev.co ?? { id: row.coId, name: row.coName },
      group: {
        id: row.groupId,
        name: [row.groupName, row.groupNo ? `(${row.groupNo})` : ""]
          .filter(Boolean)
          .join(" "),
      },
      account: null,
    }));
  }, []);

  const onSelectAccount = useCallback((row: DemandMemberRow) => {
    setDrill((prev) => ({
      ...prev,
      account: {
        id: row.accountId,
        label: row.accountLabel,
        memberName: row.memberName,
      },
    }));
  }, []);

  const onNavigate = useCallback((target: DemandLevel) => {
    setDrill((prev) => {
      if (target === "co") return EMPTY_DRILL;
      if (target === "group") return { ...prev, group: null, account: null };
      if (target === "member") return { ...prev, account: null };
      return prev;
    });
  }, []);

  return {
    methods,
    coOptions,
    coLoading: sahayikaQuery.isLoading,
    generating,
    result,
    preview,
    previewReady,
    previewing,
    onSave,
    scope,
    drill,
    level,
    report: reportQuery.data ?? null,
    reportLoading: reportQuery.isFetching,
    reportError: reportQuery.error
      ? errorMessage(reportQuery.error, "Unable to load demand.")
      : "",
    onSelectCo,
    onSelectGroup,
    onSelectAccount,
    onNavigate,
    onGenerate,
    onReset,
    onSelectionChange,
    regenerateOpen,
    onConfirmRegenerate,
    onCancelRegenerate,
    onViewExisting,
  };
};
