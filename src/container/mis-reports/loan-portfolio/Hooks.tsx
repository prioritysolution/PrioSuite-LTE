"use client";

import { useEffect, useRef, useState } from "react";
import { differenceInCalendarDays, format, isValid, startOfMonth } from "date-fns";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { useDebouncedRequest } from "@/hooks/useDebouncedRequest";
import { getBranchListAPI, isHeadFlag, resolveOrgBranches } from "@/container/profile/ProfileApi";
import { getSahayikaListAPI, resolveSahayikaDropdown } from "@/container/mis-reports/receipt-payment-scroll/ReceiptPaymentScrollApi";
import { getDatePresetRange } from "@/common/reportFilters/datePresetRange";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";
import { fetchAllPortfolioRows, getLoanPortfolio } from "./LoanPortfolioApi";
import type { LoanPortfolioData, LoanPortfolioForm, PortfolioQuery, PortfolioView } from "./LoanPortfolioType";

const views: PortfolioView[] = ["branch", "branch_summary", "sahayika", "group", "village", "member"];
const baseCoOptions: { label: string; value: number | "all" }[] = [{ label: "All Sahayika", value: "all" }, { label: "Not Assigned", value: 0 }];
const toDate = (value: Date | null) => value instanceof Date && isValid(value) ? format(value, "yyyy-MM-dd") : "";
const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { message?: string; details?: Record<string, unknown> } | undefined;
    const details = body?.details && typeof body.details === "object" ? Object.values(body.details).flat().filter((item): item is string => typeof item === "string") : [];
    return details.join(" ") || body?.message || "Could not reach the portfolio API.";
  }
  return error instanceof Error ? error.message : "Could not load the portfolio report.";
};

export const useLoanPortfolio = () => {
  const orgId = Number(getCookieData("priobank-lite-org_id") || 0);
  const branchId = Number(getCookieData("priobank-lite-branch_id") || 0);
  const branchName = String(getCookieData("priobank-lite-branch_name") || "Your branch");
  const isHead = isHeadFlag(getCookieData("priobank-lite-is_head"));
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [report, setReport] = useState<LoanPortfolioData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [branchError, setBranchError] = useState<string | null>(null);
  const [coError, setCoError] = useState<string | null>(null);
  const [branchLoading, setBranchLoading] = useState(isHead && !!orgId);
  const [sahayikaLoading, setSahayikaLoading] = useState(false);
  const [branchOptions, setBranchOptions] = useState<{ label: string; value: number }[]>([{ label: "All Branches", value: 0 }]);
  const [sahayikaOptions, setSahayikaOptions] = useState(baseCoOptions);
  const [activePreset, setActivePreset] = useState<DatePreset | null>("month");
  const requestId = useRef(0);

  const form = useForm<LoanPortfolioForm>({
    defaultValues: { fromDate: startOfMonth(new Date()), toDate: new Date(), reportBranchId: isHead ? 0 : "", sahayikaId: "all", view: "branch" },
    resolver: yupResolver(yup.object({
      fromDate: yup.mixed<Date>().required("From date is required").test("valid", "Enter a valid start date", (v) => v instanceof Date && isValid(v)),
      toDate: yup.mixed<Date>().required("To date is required").test("valid", "Enter a valid end date", (v) => v instanceof Date && isValid(v)).test("range", "Select an end date on or after the start, within 366 days", function (v) {
        const from = this.parent.fromDate;
        if (!(from instanceof Date) || !(v instanceof Date) || !isValid(from) || !isValid(v)) return true;
        const days = differenceInCalendarDays(v, from);
        return days >= 0 && days <= 365;
      }),
      reportBranchId: yup.mixed<number | "">(), sahayikaId: yup.mixed<number | "all" | "">(),
      view: yup.mixed<PortfolioView>().oneOf(views).required(),
    })) as never,
  });
  const selectedBranch = Number(useWatch({ control: form.control, name: "reportBranchId" }) || 0);

  useEffect(() => {
    if (!isHead || !orgId) return;
    let active = true;
    getBranchListAPI(orgId).then((response) => {
      if (!active) return;
      const options = resolveOrgBranches(response).filter((branch) => Number(branch.branch_id) > 0).map((branch) => ({ label: branch.branch_name || `Branch ${branch.branch_id}`, value: Number(branch.branch_id) }));
      setBranchOptions([{ label: "All Branches", value: 0 }, ...options]);
    }).catch(() => { if (active) setBranchError("Could not load branches. Reload the page to choose a branch."); }).finally(() => { if (active) setBranchLoading(false); });
    return () => { active = false; };
  }, [isHead, orgId]);

  useEffect(() => {
    if (!orgId || !branchId || (isHead && !selectedBranch && branchLoading)) return;
    let active = true;
    const branches = isHead && !selectedBranch ? branchOptions.filter((b) => b.value > 0).map((b) => b.value) : [selectedBranch || branchId];
    if (!branches.length) return;
    // All-branch selection aggregates the existing branch-scoped dropdown API.
    void Promise.resolve().then(() => { if (active) { setSahayikaLoading(true); setCoError(null); setSahayikaOptions(baseCoOptions); } });
    Promise.allSettled(branches.map((id) => getSahayikaListAPI(orgId, id))).then((results) => {
      if (!active) return;
      const options = new Map<number, { label: string; value: number }>();
      for (const result of results) if (result.status === "fulfilled") {
        for (const item of resolveSahayikaDropdown(result.value)) {
          if (typeof item.value === "number" && item.value > 0) options.set(item.value, { label: item.label, value: item.value });
        }
      }
      setSahayikaOptions([...baseCoOptions, ...options.values()]);
      if (results.some((result) => result.status === "rejected")) setCoError("Some Sahayika options could not be loaded. Reload the page to retry.");
    }).finally(() => { if (active) setSahayikaLoading(false); });
    return () => { active = false; };
  }, [orgId, branchId, isHead, selectedBranch, branchOptions, branchLoading]);

  const load = async (query: PortfolioQuery, id: number) => {
    setLoading(true);
    try {
      if (!query.orgId || !query.branchId) throw new Error("Session details are missing. Please sign in again.");
      const result = await getLoanPortfolio(query);
      if (id === requestId.current) setReport(result);
    } catch (err) {
      if (id === requestId.current) { setReport(null); setError(errorMessage(err)); }
    } finally { if (id === requestId.current) setLoading(false); }
  };
  const debouncedLoad = useDebouncedRequest(load);
  const request = (query: PortfolioQuery) => {
    const id = ++requestId.current;
    setLoading(true); setError(null); setReport(null);
    debouncedLoad(query, id);
  };
  const queryFrom = (values: LoanPortfolioForm): PortfolioQuery => ({
    orgId, branchId, fromDate: toDate(values.fromDate), toDate: toDate(values.toDate),
    reportBranchId: isHead && Number(values.reportBranchId) > 0 ? Number(values.reportBranchId) : undefined,
    coId: values.sahayikaId === "all" || values.sahayikaId === "" ? undefined : Number(values.sahayikaId),
    view: values.view, page: 1, perPage: 10,
  });
  const onShow = (values: LoanPortfolioForm) => request(queryFrom(values));
  const onPreset = (preset: DatePreset) => {
    const { from, to } = getDatePresetRange(preset);
    setActivePreset(preset); form.setValue("fromDate", from, { shouldValidate: true }); form.setValue("toDate", to, { shouldValidate: true });
    request(queryFrom({ ...form.getValues(), fromDate: from, toDate: to }));
  };
  useEffect(() => {
    const id = ++requestId.current;
    debouncedLoad(queryFrom(form.getValues()), id);
    return () => { requestId.current += 1; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prepareExport = async () => {
    if (!report || loading || exporting) return null;
    setExporting(true); setError(null);
    const id = requestId.current;
    try {
      const complete = await fetchAllPortfolioRows(report.query, report);
      return id === requestId.current ? complete : null;
    } catch (err) { if (id === requestId.current) setError(errorMessage(err)); return null; }
    finally { setExporting(false); }
  };
  return {
    form, loading, exporting, isHead, branchName, branchOptions, branchLoading, sahayikaOptions, sahayikaLoading, report, error,
    dropdownError: [branchError, coError].filter(Boolean).join(" ") || null,
    onShow, onPreset, activePreset, prepareExport,
    onBranchChange: () => form.setValue("sahayikaId", "all"),
    onPageChange: (page: number) => { if (report) request({ ...report.query, page }); },
    onPerPageChange: (perPage: number) => { if (report) request({ ...report.query, page: 1, perPage }); },
  };
};
