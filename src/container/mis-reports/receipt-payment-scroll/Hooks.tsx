"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format, isValid, startOfMonth } from "date-fns";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { getDatePresetRange } from "@/common/reportFilters/datePresetRange";
import { useDebouncedRequest } from "@/hooks/useDebouncedRequest";
import { isHeadFlag, resolveOrgBranches } from "@/container/profile/ProfileApi";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";
import type {
  ReceiptPaymentScrollData,
  ReceiptPaymentScrollForm,
  ScrollView,
} from "./ReceiptPaymentScrollType";
import {
  buildMonthGroups,
  fetchScrollDailyReport,
  getBranchListAPI,
  getReceiptPaymentScrollAPI,
  getSahayikaListAPI,
  mapReceiptPaymentScroll,
  resolveSahayikaDropdown,
} from "./ReceiptPaymentScrollApi";

const defaultBranchOptions = [
  { label: "All Branches", value: 0 },
  { label: "Panskura Branch (01)", value: 1 },
  { label: "Contai Branch (02)", value: 2 },
  { label: "Kolkata Branch (03)", value: 3 },
  { label: "Howrah Branch (04)", value: 4 },
];

const toApiDate = (value: Date | null) =>
  value instanceof Date && isValid(value) ? format(value, "yyyy-MM-dd") : "";

export const useReceiptPaymentScroll = () => {
  const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
  const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
  const branchName = String(getCookieData("priobank-lite-branch_name") || "Panskura");
  const rawHead = getCookieData("priobank-lite-is_head");
  const isHead = isHeadFlag(rawHead) || !rawHead;

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReceiptPaymentScrollData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const [activePreset, setActivePreset] = useState<DatePreset | null>("month");
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: number }[]>(defaultBranchOptions);
  const branchLoading = false;

  const [sahayikaOptions, setSahayikaOptions] = useState<{ label: string; value: number | "" }[]>([
    { label: "All Sahayika", value: "" },
    { label: "Not Assigned", value: 0 },
  ]);
  const sahayikaLoading = false;

  const [view, setView] = useState<ScrollView>("transactions");

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
        return !(from instanceof Date && value instanceof Date) || value >= from;
      }),
    reportBranchId: yup.mixed<number | "">().optional(),
    sahayikaId: yup.mixed<number | "">().optional(),
    scrollType: yup.mixed<ReceiptPaymentScrollForm["scrollType"]>().required(),
    view: yup.mixed<ScrollView>().required(),
    page: yup.number().required(),
    perPage: yup.number().required(),
  });

  const form = useForm<ReceiptPaymentScrollForm>({
    mode: "onChange",
    defaultValues: {
      fromDate: startOfMonth(new Date()),
      toDate: new Date(),
      reportBranchId: isHead ? 0 : "",
      sahayikaId: "",
      scrollType: "all",
      view: "transactions",
      page: 1,
      perPage: 25,
    },
    resolver: yupResolver(schema) as never,
  });

  const selectedBranch = useWatch({ control: form.control, name: "reportBranchId" });

  // Load authorized branches for Head Office
  useEffect(() => {
    if (!isHead || !orgId) return;
    let active = true;
    getBranchListAPI(orgId)
      .then((response) => {
        if (!active) return;
        const resolved = resolveOrgBranches(response);
        if (resolved.length > 0) {
          setBranchOptions([
            { label: "All Branches", value: 0 },
            ...resolved.map((branch) => ({
              label: branch.branch_name || `Branch ${branch.branch_id}`,
              value: Number(branch.branch_id),
            })),
          ]);
        }
      })
      .catch(() => {
        // keep fallback branches
      });
    return () => {
      active = false;
    };
  }, [isHead, orgId]);

  // Load Sahayika list whenever effective branch changes
  useEffect(() => {
    const effectiveBranchId =
      typeof selectedBranch === "number" && selectedBranch > 0 ? selectedBranch : branchId || 1;
    let active = true;

    getSahayikaListAPI(orgId || 1, effectiveBranchId)
      .then((response: unknown) => {
        if (!active) return;
        const options = resolveSahayikaDropdown(response);
        if (options.length > 0) {
          setSahayikaOptions(options);
        }
      })
      .catch(() => {
        // Keep existing options if API fails
      });

    return () => {
      active = false;
    };
  }, [orgId, branchId, selectedBranch]);

  const loadReport = async (values: ReceiptPaymentScrollForm, requestId: number) => {
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    if (!fromDate || !toDate) {
      if (requestId === requestIdRef.current) setLoading(false);
      return;
    }

    setLoading(true);

    const effectiveBranchName =
      typeof values.reportBranchId === "number" && values.reportBranchId > 0
        ? branchOptions.find((b) => b.value === values.reportBranchId)?.label || branchName
        : branchName;

    const effectiveCoName =
      values.sahayikaId !== "" && values.sahayikaId !== undefined && values.sahayikaId !== null
        ? sahayikaOptions.find((s) => s.value === values.sahayikaId)?.label || ""
        : "";

    try {
      if (orgId && branchId) {
        // Fetch active view for table grid
        const mainPromise = getReceiptPaymentScrollAPI(
          orgId,
          branchId,
          fromDate,
          toDate,
          {
            reportBranchId: values.reportBranchId,
            coId: values.sahayikaId,
            scrollType: values.scrollType,
            view: values.view,
            page: values.page,
            perPage: values.perPage,
          },
        );

        // Fetch full daily records across all selected months with per_page=500 for print & export
        const dailyPromise = fetchScrollDailyReport(orgId, branchId, fromDate, toDate, {
          reportBranchId: values.reportBranchId,
          coId: values.sahayikaId,
          scrollType: values.scrollType,
        });

        const [response, fullDailyRows] = await Promise.all([mainPromise, dailyPromise]);
        if (requestId !== requestIdRef.current) return;

        const mapped = mapReceiptPaymentScroll(response, {
          fromDate,
          toDate,
          branchName: effectiveBranchName,
          coName: effectiveCoName,
          view: values.view,
        });

        if (mapped) {
          if (fullDailyRows && fullDailyRows.length > 0) {
            mapped.monthGroups = buildMonthGroups(
              fullDailyRows,
              fromDate,
              toDate,
              mapped.summary.openingCash,
            );
          }
          setReport(mapped);
          return;
        }
      }

      throw new Error("Could not load the report. Please check your session and try again.");
    } catch {
      if (requestId !== requestIdRef.current) return;
      setReport(null);
      setError("Could not load the report. Please check your connection and try again.");
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const debouncedRequest = useDebouncedRequest(loadReport);
  const requestReport = (values: ReceiptPaymentScrollForm) => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    debouncedRequest(values, requestId);
  };

  const onShow = (values: ReceiptPaymentScrollForm) => {
    // Reset page to 1 on explicit filter submit
    const updated = { ...values, page: 1 };
    form.setValue("page", 1);
    requestReport(updated);
  };

  const onPreset = (preset: DatePreset) => {
    const { from, to } = getDatePresetRange(preset);
    setActivePreset(preset);
    form.setValue("fromDate", from, { shouldValidate: true, shouldDirty: true });
    form.setValue("toDate", to, { shouldValidate: true, shouldDirty: true });
    form.setValue("page", 1);
    requestReport({ ...form.getValues(), fromDate: from, toDate: to, page: 1 });
  };

  const onViewChange = (newView: ScrollView) => {
    setView(newView);
    form.setValue("view", newView);
    form.setValue("page", 1);
    requestReport({ ...form.getValues(), view: newView, page: 1 });
  };

  const onPageChange = (newPage: number) => {
    form.setValue("page", newPage);
    requestReport({ ...form.getValues(), page: newPage });
  };

  const onPerPageChange = (newPerPage: number) => {
    form.setValue("perPage", newPerPage);
    form.setValue("page", 1);
    requestReport({ ...form.getValues(), perPage: newPerPage, page: 1 });
  };

  useEffect(() => {
    debouncedRequest(form.getValues(), ++requestIdRef.current);
    return () => { requestIdRef.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    form,
    loading,
    isHead,
    branchName,
    branchOptions: useMemo(() => (isHead ? branchOptions : []), [branchOptions, isHead]),
    branchLoading,
    sahayikaOptions,
    sahayikaLoading,
    report,
    error,
    onShow,
    onPreset,
    activePreset,
    view,
    onViewChange,
    onPageChange,
    onPerPageChange,
  };
};
