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
  getSahayikaGroupListAPI,
  getSahayikaListAPI,
} from "@/container/loan-entry/demand-generation/DemandGenerationApi";
import { isHeadFlag, resolveOrgBranches } from "@/container/profile/ProfileApi";
import {
  getDemandVsCollectionAPI,
  mapDemandVsCollection,
} from "./DemandVsCollectionApi";
import {
  DemandVsCollectionData,
  DemandVsCollectionForm,
  GroupRow,
  ReportView,
} from "./DemandVsCollectionType";

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

export const useDemandVsCollection = () => {
  const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
  const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
  const branchName = String(getCookieData("priobank-lite-branch_name") || "Branch");
  const isHead = isHeadFlag(getCookieData("priobank-lite-is_head"));

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DemandVsCollectionData | null>(null);
  const [view, setView] = useState<ReportView>(isHead ? "branch" : "sahayika");

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
    groupId: yup.number().optional(),
  });

  const today = new Date();
  const methods = useForm<DemandVsCollectionForm>({
    mode: "onChange",
    defaultValues: {
      fromDate: startOfMonth(today),
      toDate: today,
      reportBranchId: isHead ? 0 : "",
      coId: ALL,
      groupId: ALL,
    },
    resolver: yupResolver(schema) as any,
  });

  const watchedBranch = methods.watch("reportBranchId");
  const watchedCo = methods.watch("coId");
  const watchedGroup = methods.watch("groupId");
  const listBranchId = isHead ? Number(watchedBranch || 0) : branchId;
  const sahayikaDisabled = isHead && listBranchId <= 0;
  const groupDisabled = sahayikaDisabled || Number(watchedCo) < 0;

  const branchQuery = useQuery({
    queryKey: ["demandVsCollectionBranches", orgId],
    queryFn: () => getBranchListAPI(orgId),
    enabled: isHead && orgId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const sahayikaQuery = useQuery({
    queryKey: ["demandVsCollectionSahayika", orgId, listBranchId],
    queryFn: () => getSahayikaListAPI(orgId, listBranchId),
    enabled: orgId > 0 && listBranchId > 0,
  });

  const groupQuery = useQuery({
    queryKey: ["demandVsCollectionGroups", orgId, listBranchId, watchedCo],
    queryFn: () => getSahayikaGroupListAPI(orgId, listBranchId, Number(watchedCo)),
    enabled: orgId > 0 && listBranchId > 0 && Number(watchedCo) >= 0,
  });

  const branchOptions = useMemo(() => {
    if (!isHead) return [];
    const rows = resolveOrgBranches(branchQuery.data);
    return [
      { label: "All Branches", value: 0 },
      ...rows.map((row) => ({
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

  const groupOptions = useMemo(
    () => [
      { label: "All Groups", value: ALL },
      ...extractList(groupQuery.data)
        .map((item) => ({
          label: String(
            item?.Display_Name ||
              [item?.Group_Name, item?.Group_No ? `(${item.Group_No})` : ""]
                .filter(Boolean)
                .join(" "),
          ).trim(),
          value: Number(item?.Group_Id ?? item?.group_id),
        }))
        .filter((item) => item.label && item.value > 0),
    ],
    [groupQuery.data],
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
      const extra = Object.entries(details)
        .filter(([key]) => key !== "from_date" && key !== "to_date")
        .map(([, value]) => flattenMessages(value))
        .filter(Boolean)
        .join(" ");
      if (extra) toast.error(extra);
      return;
    }
    toast.error(
      typeof details === "string"
        ? details
        : flattenMessages(details) || message || "Failed to load the report.",
    );
  };

  const loadReport = async (values: DemandVsCollectionForm, nextView: ReportView) => {
    if (!orgId || !branchId) {
      toast.error("Branch is not available for this login.");
      return;
    }
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    if (!fromDate || !toDate) return;

    const coId = Number(values.coId);
    const groupId = Number(values.groupId);
    try {
      setLoading(true);
      methods.clearErrors(["fromDate", "toDate"]);
      const res = await getDemandVsCollectionAPI({
        orgId,
        branchId,
        fromDate,
        toDate,
        view: nextView,
        reportBranchId: isHead ? Number(values.reportBranchId || 0) : null,
        coId: coId >= 0 ? coId : null,
        groupId: groupId > 0 ? groupId : null,
      });
      const message = String(res?.message || "");
      if (/error/i.test(message) && !/no data|data found/i.test(message)) {
        toast.error(typeof res?.details === "string" ? res.details : message);
        setReport(null);
        return;
      }
      const mapped = mapDemandVsCollection(res, nextView);
      if (!mapped) {
        toast.error("Report response was empty.");
        setReport(null);
        return;
      }
      setView(nextView);
      setReport(mapped);
    } catch (error) {
      setReport(null);
      applyApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const onPreset = (preset: "month" | "lastMonth" | "fy") => {
    const now = new Date();
    let from = startOfMonth(now);
    let to = now;
    if (preset === "lastMonth") {
      const last = subMonths(now, 1);
      from = startOfMonth(last);
      to = endOfMonth(last);
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
    void loadReport({ ...methods.getValues(), fromDate: from, toDate: to }, view);
  };

  const onBranchChange = (value: number) => {
    methods.setValue("coId", ALL);
    methods.setValue("groupId", ALL);
    methods.setValue("reportBranchId", value);
  };

  const onSahayikaChange = (value: number) => {
    methods.setValue("groupId", ALL);
    methods.setValue("coId", value);
  };

  const onDrill = (row: GroupRow) => {
    const values = methods.getValues();
    if (view === "branch") {
      const next = { ...values, reportBranchId: row.keyId, coId: ALL, groupId: ALL };
      methods.reset(next);
      void loadReport(next, "sahayika");
      return;
    }
    if (view === "sahayika") {
      const next = { ...values, coId: row.keyId, groupId: ALL };
      methods.reset(next);
      void loadReport(next, "group");
      return;
    }
    if (view === "group") {
      const next = { ...values, groupId: row.keyId };
      methods.reset(next);
      void loadReport(next, "member");
    }
  };

  const onCrumb = (level: "all" | "branch" | "sahayika" | "group") => {
    const values = methods.getValues();
    if (level === "all") {
      const next = { ...values, reportBranchId: 0, coId: ALL, groupId: ALL };
      methods.reset(next);
      void loadReport(next, "branch");
      return;
    }
    if (level === "branch") {
      const next = { ...values, coId: ALL, groupId: ALL };
      methods.reset(next);
      void loadReport(next, "sahayika");
      return;
    }
    if (level === "sahayika") {
      const next = { ...values, groupId: ALL };
      methods.reset(next);
      void loadReport(next, "group");
    }
  };

  const crumbs = useMemo(() => {
    const items: { label: string; level: "all" | "branch" | "sahayika" | "group" }[] = [];
    if (isHead) items.push({ label: "All Branches", level: "all" });
    const branchValue = Number(watchedBranch || 0);
    if (isHead && branchValue > 0) {
      items.push({
        label:
          branchOptions.find((item) => item.value === branchValue)?.label ||
          report?.summary.branchName ||
          "Branch",
        level: "branch",
      });
    } else if (!isHead) {
      items.push({ label: branchName, level: "branch" });
    }
    const coValue = Number(watchedCo);
    if (coValue >= 0) {
      items.push({
        label: sahayikaOptions.find((item) => item.value === coValue)?.label || "Sahayika",
        level: "sahayika",
      });
    }
    const groupValue = Number(watchedGroup);
    if (groupValue > 0) {
      items.push({
        label: groupOptions.find((item) => item.value === groupValue)?.label || "Group",
        level: "group",
      });
    }
    return items;
  }, [
    branchName,
    branchOptions,
    groupOptions,
    isHead,
    report,
    sahayikaOptions,
    watchedBranch,
    watchedCo,
    watchedGroup,
  ]);

  useEffect(() => {
    void loadReport(methods.getValues(), isHead ? "branch" : "sahayika");
    // Load the default period once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    form: methods,
    loading,
    isHead,
    branchName,
    branchOptions,
    sahayikaOptions,
    groupOptions,
    branchLoading: branchQuery.isLoading,
    sahayikaLoading: sahayikaQuery.isLoading,
    groupLoading: groupQuery.isLoading,
    sahayikaDisabled,
    groupDisabled,
    report,
    view,
    crumbs,
    onShow: (values: DemandVsCollectionForm) => loadReport(values, view),
    onPreset,
    onViewChange: (next: ReportView) => loadReport(methods.getValues(), next),
    onDrill,
    onCrumb,
    onBranchChange,
    onSahayikaChange,
  };
};
