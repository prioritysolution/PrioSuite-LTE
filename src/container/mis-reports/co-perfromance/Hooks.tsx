"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import {
  endOfMonth,
  format,
  isValid,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import { toast } from "sonner";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import {
  extractList,
  getSahayikaListAPI,
} from "@/container/loan-entry/demand-generation/DemandGenerationApi";
import { isHeadFlag, resolveOrgBranches } from "@/container/profile/ProfileApi";
import { getCoPerformanceAPI, mapCoPerformance } from "./CoPerformanceApi";
import {
  CoPerformanceData,
  CoPerformanceForm,
  DataView,
  LayoutView,
  PerfRow,
} from "./CoPerformanceType";

const ALL = -1;

const flattenMessages = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => String(item)).join(" ");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((item) => flattenMessages(item))
      .filter(Boolean)
      .join(" ");
  }
  return String(value);
};

const toApiDate = (value: Date | string | null) => {
  if (value instanceof Date && isValid(value)) return format(value, "yyyy-MM-dd");
  return typeof value === "string" ? value : "";
};

const parseCookieDate = (value: unknown) => {
  if (!value) return null;
  const text = String(value).trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const parsed = new Date(text);
  return isValid(parsed) ? parsed : null;
};

export const useCoPerformance = () => {
  const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
  const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
  const branchName = String(getCookieData("priobank-lite-branch_name") || "Branch");
  const isHead = isHeadFlag(getCookieData("priobank-lite-is_head"));

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CoPerformanceData | null>(null);
  const [layout, setLayout] = useState<LayoutView>("table");

  const schema = yup.object({
    fromDate: yup
      .mixed<Date>()
      .required("From date is required")
      .test("valid", "From date is required", (value) => value instanceof Date && isValid(value)),
    toDate: yup
      .mixed<Date>()
      .required("To date is required")
      .test("valid", "To date is required", (value) => value instanceof Date && isValid(value))
      .test("order", "To date must be on or after from date", function (value) {
        const from = this.parent.fromDate;
        if (!(from instanceof Date) || !(value instanceof Date)) return true;
        return startOfDay(value) >= startOfDay(from);
      }),
    reportBranchId: yup.mixed<number | "">().optional(),
    coId: yup.number().optional(),
  });

  const today = new Date();
  const methods = useForm<CoPerformanceForm>({
    mode: "onChange",
    defaultValues: {
      fromDate: startOfMonth(today),
      toDate: today,
      reportBranchId: isHead ? 0 : "",
      coId: ALL,
    },
    resolver: yupResolver(schema) as any,
  });

  const watchedBranch = methods.watch("reportBranchId");
  const watchedCo = methods.watch("coId");
  const listBranchId = isHead ? Number(watchedBranch || 0) : branchId;
  const sahayikaDisabled = isHead && listBranchId <= 0;

  const branchQuery = useQuery({
    queryKey: ["coPerformanceBranches", orgId],
    queryFn: () => getBranchListAPI(orgId),
    enabled: isHead && orgId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const sahayikaQuery = useQuery({
    queryKey: ["coPerformanceSahayika", orgId, listBranchId],
    queryFn: () => getSahayikaListAPI(orgId, listBranchId),
    enabled: orgId > 0 && listBranchId > 0,
  });

  const branchOptions = useMemo(() => {
    if (!isHead) return [];
    return [
      { label: "All Branches", value: 0 },
      ...resolveOrgBranches(branchQuery.data).map((row) => ({
        label: row.branch_name || `Branch ${row.branch_id}`,
        value: Number(row.branch_id),
      })),
    ];
  }, [branchQuery.data, isHead]);

  const sahayikaOptions = useMemo(
    () => [
      { label: "All Sahayika", value: ALL },
      ...extractList(sahayikaQuery.data)
        .map((item) => ({
          label: String(
            item?.Display_Name ||
              [item?.CO_Name, item?.CO_Code ? `(${item.CO_Code})` : ""]
                .filter(Boolean)
                .join(" "),
          ).trim(),
          value: Number(item?.CO_Id ?? item?.co_id),
        }))
        .filter((item) => item.label && !Number.isNaN(item.value)),
    ],
    [sahayikaQuery.data],
  );

  const applyApiError = (error: any) => {
    const body = error?.response?.data;
    const message = String(body?.message || "");
    const details = body?.details;
    if (message === "Invalid data send" && details && typeof details === "object") {
      const fromMessage = flattenMessages(details.from_date);
      const toMessage = flattenMessages(details.to_date);
      if (fromMessage) methods.setError("fromDate", { message: fromMessage });
      if (toMessage) methods.setError("toDate", { message: toMessage });
      return;
    }
    toast.error(
      typeof details === "string"
        ? details
        : flattenMessages(details) || message || "Failed to load CO performance.",
    );
  };

  const loadReport = async (values: CoPerformanceForm, nextView: DataView) => {
    if (!orgId || !branchId) {
      toast.error("Branch is not available for this login.");
      return;
    }
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    if (!fromDate || !toDate) return;
    const coId = Number(values.coId);
    try {
      setLoading(true);
      methods.clearErrors(["fromDate", "toDate"]);
      const res = await getCoPerformanceAPI({
        orgId,
        branchId,
        fromDate,
        toDate,
        view: nextView,
        reportBranchId: isHead ? Number(values.reportBranchId || 0) : null,
        coId: coId >= 0 ? coId : null,
      });
      const message = String(res?.message || "");
      if (/error/i.test(message) && !/no data|data found/i.test(message)) {
        toast.error(typeof res?.details === "string" ? res.details : message);
        setReport(null);
        return;
      }
      const mapped = mapCoPerformance(res, nextView);
      if (!mapped) {
        toast.error("Report response was empty.");
        setReport(null);
        return;
      }
      setReport(mapped);
    } catch (error) {
      setReport(null);
      applyApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const viewFor = (values: CoPerformanceForm, nextLayout: LayoutView): DataView => {
    if (nextLayout === "trend") return "month";
    return Number(values.coId) >= 0 ? "group" : "sahayika";
  };

  const onPreset = (preset: "month" | "lastMonth" | "quarter" | "fy") => {
    const now = new Date();
    let from = startOfMonth(now);
    let to = now;
    if (preset === "lastMonth") {
      const last = subMonths(now, 1);
      from = startOfMonth(last);
      to = endOfMonth(last);
    }
    if (preset === "quarter") {
      const startMonth = Math.floor(now.getMonth() / 3) * 3;
      from = new Date(now.getFullYear(), startMonth, 1);
    }
    if (preset === "fy") {
      const start = parseCookieDate(getCookieData("priobank-lite-fin_start_date"));
      const end = parseCookieDate(getCookieData("priobank-lite-fin_end_date"));
      from = start || startOfMonth(now);
      to = end && end < now ? end : now;
      if (to < from) to = from;
    }
    methods.setValue("fromDate", from, { shouldValidate: true });
    methods.setValue("toDate", to, { shouldValidate: true });
    const values = { ...methods.getValues(), fromDate: from, toDate: to };
    void loadReport(values, viewFor(values, layout));
  };

  const onBranchChange = (value: number) => {
    methods.setValue("coId", ALL);
    methods.setValue("reportBranchId", value);
  };

  const onDrill = (row: PerfRow) => {
    if (report?.view !== "sahayika") return;
    const values = methods.getValues();
    const next = {
      ...values,
      reportBranchId: isHead ? row.branchId || values.reportBranchId : values.reportBranchId,
      coId: row.keyId,
    };
    methods.reset(next);
    setLayout("table");
    void loadReport(next, "group");
  };

  const onCrumb = (level: "branch" | "sahayika") => {
    if (level !== "branch") return;
    const next = { ...methods.getValues(), coId: ALL };
    methods.reset(next);
    setLayout("table");
    void loadReport(next, "sahayika");
  };

  const onLayout = (next: LayoutView) => {
    setLayout(next);
    const values = methods.getValues();
    const nextView = viewFor(values, next);
    if (report?.view !== nextView) void loadReport(values, nextView);
  };

  const crumbs = useMemo(() => {
    const items: { label: string; level: "branch" | "sahayika" }[] = [];
    const branchValue = Number(watchedBranch || 0);
    if (isHead && branchValue > 0) {
      items.push({
        label: branchOptions.find((item) => item.value === branchValue)?.label || "Branch",
        level: "branch",
      });
    } else if (!isHead) {
      items.push({ label: branchName, level: "branch" });
    } else {
      items.push({ label: "All Branches", level: "branch" });
    }
    const coValue = Number(watchedCo);
    if (coValue >= 0) {
      items.push({
        label: sahayikaOptions.find((item) => item.value === coValue)?.label || "Sahayika",
        level: "sahayika",
      });
    }
    return items;
  }, [branchName, branchOptions, isHead, sahayikaOptions, watchedBranch, watchedCo]);

  useEffect(() => {
    void loadReport(methods.getValues(), "sahayika");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    form: methods,
    loading,
    isHead,
    branchName,
    branchOptions,
    sahayikaOptions,
    branchLoading: branchQuery.isLoading,
    sahayikaLoading: sahayikaQuery.isLoading,
    sahayikaDisabled,
    report,
    layout,
    crumbs,
    onShow: (values: CoPerformanceForm) => loadReport(values, viewFor(values, layout)),
    onPreset,
    onLayout,
    onDrill,
    onCrumb,
    onBranchChange,
  };
};
