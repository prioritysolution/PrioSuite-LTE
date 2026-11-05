"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { format, isValid, startOfMonth } from "date-fns";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { useDebouncedRequest } from "@/hooks/useDebouncedRequest";
import { isHeadFlag, resolveOrgBranches } from "@/container/profile/ProfileApi";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { getDatePresetRange } from "@/common/reportFilters/datePresetRange";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";
import {
  getMonthlyStatementAPI,
  mapMonthlyStatement,
} from "./MonthlyStatementApi";
import type {
  MonthlyStatementData,
  MonthlyStatementForm,
} from "./MonthlyStatementType";

const defaultBranchOptions = [
  { label: "All Branches", value: 0 },
];

const toApiDate = (value: Date | null) =>
  value instanceof Date && isValid(value) ? format(value, "yyyy-MM-dd") : "";

export const useMonthlyStatement = () => {
  const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
  const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
  const branchName = String(getCookieData("priobank-lite-branch_name") || "Your branch");
  const rawHead = getCookieData("priobank-lite-is_head");
  const isHead = isHeadFlag(rawHead);

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<MonthlyStatementData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const [activePreset, setActivePreset] = useState<DatePreset | null>("month");
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: number }[]>(defaultBranchOptions);
  const [branchLoading, setBranchLoading] = useState(isHead && !!orgId);
  const [branchError, setBranchError] = useState<string | null>(null);

  const schema = yup.object({
    fromDate: yup.mixed<Date>().required("From date is required").test(
      "valid",
      "From date is required",
      (value) => value instanceof Date && isValid(value),
    ),
    toDate: yup.mixed<Date>().required("To date is required").test(
      "valid",
      "To date is required",
      (value) => value instanceof Date && isValid(value),
    ).test("order", "To date must be on or after from date", function (value) {
      const from = this.parent.fromDate;
      return !(from instanceof Date && value instanceof Date) || value >= from;
    }),
    reportBranchId: yup.mixed<number | "">().optional(),
  });

  const form = useForm<MonthlyStatementForm>({
    mode: "onChange",
    defaultValues: {
      fromDate: startOfMonth(new Date()),
      toDate: new Date(),
      reportBranchId: isHead ? 0 : "",
    },
    resolver: yupResolver(schema) as never,
  });

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
      .catch(() => { if (active) setBranchError("Could not load branches. Try reloading the page."); })
      .finally(() => { if (active) setBranchLoading(false); });
    return () => {
      active = false;
    };
  }, [isHead, orgId]);

  const loadReport = async (values: MonthlyStatementForm, requestId: number) => {
    const fromDate = toApiDate(values.fromDate);
    const toDate = toApiDate(values.toDate);
    if (!fromDate || !toDate) {
      if (requestId === requestIdRef.current) setLoading(false);
      return;
    }

    setLoading(true);

    try {
      if (orgId && branchId) {
        const response = await getMonthlyStatementAPI(
          orgId,
          branchId,
          fromDate,
          toDate,
          isHead && Number(values.reportBranchId) > 0 ? Number(values.reportBranchId) : null,
        );
        if (requestId !== requestIdRef.current) return;
        const mapped = mapMonthlyStatement(response);
        if (mapped && mapped.rows.length > 0) {
          setReport(mapped);
          return;
        }
      }
      throw new Error("The server returned an incomplete statement.");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      let message = err instanceof Error ? err.message : "Could not load the statement.";
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string; details?: Record<string, unknown> } | undefined;
        const details = data?.details && typeof data.details === "object" ? Object.values(data.details).flat().filter((item): item is string => typeof item === "string") : [];
        message = details.join(" ") || data?.message || "Could not reach the statement API. Please try again.";
      }
      setReport(null);
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const debouncedRequest = useDebouncedRequest(loadReport);
  const requestReport = (values: MonthlyStatementForm) => {
    const id = ++requestIdRef.current;
    setLoading(true);
    setReport(null);
    setError(null);
    debouncedRequest(values, id);
  };

  const onPreset = (preset: DatePreset) => {
    const { from, to } = getDatePresetRange(preset);
    setActivePreset(preset);
    form.setValue("fromDate", from, { shouldValidate: true, shouldDirty: true });
    form.setValue("toDate", to, { shouldValidate: true, shouldDirty: true });
    requestReport({ ...form.getValues(), fromDate: from, toDate: to });
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
    branchError,
    report,
    error,
    onShow: requestReport,
    onPreset,
    activePreset,
  };
};
