"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { differenceInCalendarDays, format, isValid, startOfDay } from "date-fns";
import { toast } from "sonner";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import {
  isHeadFlag,
  resolveOrgBranches,
} from "@/container/profile/ProfileApi";
import {
  getDailySheetAPI,
  getDailySheetDetailsAPI,
  mapDailySheet,
  mapDailySheetDetails,
} from "./DailySheetApi";
import { DailySheetData, DailySheetDetailRow, DailySheetForm } from "./DailySheetType";

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

export const useDailySheet = () => {
  const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
  const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
  const branchName = String(
    getCookieData("priobank-lite-branch_name") || "Branch",
  );
  const isHead = isHeadFlag(getCookieData("priobank-lite-is_head"));

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<DailySheetData | null>(null);
  const [view, setView] = useState<"sheet" | "grid">("sheet");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsRows, setDetailsRows] = useState<DailySheetDetailRow[]>([]);

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
  });

  const methods = useForm<DailySheetForm>({
    mode: "onChange",
    defaultValues: {
      fromDate: new Date(),
      toDate: new Date(),
      reportBranchId: isHead ? 0 : "",
    },
    resolver: yupResolver(schema) as any,
  });

  const { data: branchRows = [], isLoading: branchLoading } = useQuery({
    queryKey: ["dailySheetBranches", orgId],
    queryFn: () => getBranchListAPI(orgId),
    enabled: isHead && orgId > 0,
    staleTime: 10 * 60 * 1000,
  });

  const branchOptions = useMemo(() => {
    if (!isHead) return [];
    const rows = resolveOrgBranches(branchRows).filter(
      (row) => Number(row.branch_id) !== branchId,
    );
    return [
      { label: "All Branches", value: 0 },
      { label: "Head Office", value: branchId },
      ...rows.map((row) => ({
        label: row.branch_name || `Branch ${row.branch_id}`,
        value: Number(row.branch_id),
      })),
    ];
  }, [branchId, branchRows, isHead]);

  const watchedFrom = methods.watch("fromDate");
  const watchedTo = methods.watch("toDate");
  const drillAllowed =
    watchedFrom instanceof Date &&
    watchedTo instanceof Date &&
    isValid(watchedFrom) &&
    isValid(watchedTo) &&
    differenceInCalendarDays(startOfDay(watchedTo), startOfDay(watchedFrom)) <= 30;

  const reportBranchParam = (values: DailySheetForm) => {
    if (!isHead) return null;
    const selected = Number(values.reportBranchId);
    return Number.isFinite(selected) ? selected : 0;
  };

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
        : flattenMessages(details) || message || "Failed to load daily sheet.",
    );
  };

  const loadSheet = async (values: DailySheetForm) => {
    if (!orgId || !branchId) {
      toast.error("Branch is not available for this login.");
      return;
    }
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    if (!fromDate || !toDate) return;

    try {
      setLoading(true);
      methods.clearErrors(["fromDate", "toDate"]);
      const res = await getDailySheetAPI(
        orgId,
        branchId,
        fromDate,
        toDate,
        reportBranchParam(values),
      );
      const message = String(res?.message || "");
      if (/error/i.test(message) && !/no transaction|data found/i.test(message)) {
        toast.error(
          typeof res?.details === "string" ? res.details : message,
        );
        setReport(null);
        return;
      }
      const mapped = mapDailySheet(res);
      if (!mapped) {
        toast.error("Daily sheet response was empty.");
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

  const openDetails = async (accountId: number | null, title: string) => {
    if (!drillAllowed) return;
    const values = methods.getValues();
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    setDetailsTitle(title);
    setDetailsRows([]);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await getDailySheetDetailsAPI(
        orgId,
        branchId,
        fromDate,
        toDate,
        reportBranchParam(values),
        accountId,
      );
      const message = String(res?.message || "");
      if (/error/i.test(message) && !/no data|data found/i.test(message)) {
        toast.error(typeof res?.details === "string" ? res.details : message);
        return;
      }
      setDetailsRows(mapDailySheetDetails(res));
    } catch (error) {
      applyApiError(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    void loadSheet(methods.getValues());
    // Load today's sheet once when the screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    form: methods,
    loading,
    isHead,
    branchName,
    branchOptions,
    branchLoading,
    report,
    view,
    drillAllowed,
    onShow: loadSheet,
    onViewChange: setView,
    onOpenLedger: (accountId: number, ledgerName: string) => {
      const from = formatApiRange(methods.getValues());
      void openDetails(accountId, `${ledgerName} — ${from}`);
    },
    onOpenAll: () => {
      void openDetails(null, `All vouchers — ${formatApiRange(methods.getValues())}`);
    },
    detailsOpen,
    detailsTitle,
    detailsLoading,
    detailsRows,
    showBranchColumn: report?.summary.branchId === 0,
    onDetailsOpenChange: setDetailsOpen,
  };
};

const formatApiRange = (values: DailySheetForm) => {
  const from =
    values.fromDate instanceof Date ? format(values.fromDate, "dd-MM-yyyy") : "";
  const to =
    values.toDate instanceof Date ? format(values.toDate, "dd-MM-yyyy") : "";
  return from === to ? from : `${from} – ${to}`;
};
