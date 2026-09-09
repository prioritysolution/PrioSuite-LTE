"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format, isAfter, isBefore, isValid, startOfDay } from "date-fns";
import {
  ClipboardList,
  FileText,
  HandCoins,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import getCookieData from "@/lib/getCookieData";
import { useGlobalContext } from "@/context/GlobalContext";
import { AppDispatch, RootState } from "@/redux/store";
import {
  amountToIndianWords,
  numberToIndianWords,
} from "@/lib/numberToWords";
import { fetchDashboardStats } from "./DashboardApi";
import { failure, start, success } from "./DashboardReducer";
import {
  DashboardBranchSection,
  DashboardStatCard,
  DashboardStats,
} from "./DashboardType";

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : startOfDay(value);
  }

  const str = String(value).trim();
  if (!str) return null;

  const native = new Date(str);
  if (isValid(native) && !Number.isNaN(native.getTime())) {
    return startOfDay(native);
  }

  const match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
    );
    return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
  }

  return null;
};

const toApiDate = (value: Date | null) => {
  if (!value || !isValid(value)) return "";
  return format(value, "yyyy-MM-dd");
};

const formatINR = (value: number) =>
  `₹ ${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(value || 0),
  )}`;

const formatCount = (value: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(value || 0),
  );

const buildStatCards = (stats: DashboardStats): DashboardStatCard[] => [
  {
    key: "loan-issue",
    title: "Total Loan Issue Amount",
    value: formatINR(stats.totalLoanIssue),
    valueInWords: amountToIndianWords(stats.totalLoanIssue),
    Icon: FileText,
    theme: "blue",
  },
  {
    key: "collection",
    title: "Total Collection Amount",
    value: formatINR(stats.totalCollection),
    valueInWords: amountToIndianWords(stats.totalCollection),
    Icon: HandCoins,
    theme: "green",
  },
  {
    key: "outstanding",
    title: "Total Outstanding",
    value: formatINR(stats.totalOutstanding),
    valueInWords: amountToIndianWords(stats.totalOutstanding),
    Icon: ClipboardList,
    theme: "yellow",
  },
  {
    key: "borrowers",
    title: "Total Active Borrowers",
    value: formatCount(stats.totalActiveBorrowers),
    valueInWords: numberToIndianWords(stats.totalActiveBorrowers),
    Icon: Users,
    theme: "purple",
  },
];

export const useDashboardHook = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isMounted } = useGlobalContext();
  const { loading, error, stats, isHeadView, branches } = useSelector(
    (state: RootState) => state.dashboard,
  );

  const [branchName, setBranchName] = useState("Branch");
  const [orgId, setOrgId] = useState(0);
  const [branchId, setBranchId] = useState(0);
  const [finStartDate, setFinStartDate] = useState<Date | null>(null);
  const [finEndDate, setFinEndDate] = useState<Date | null>(null);
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const didInitFetch = useRef(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isMounted) return;

    const resolvedOrgId = Number(
      user?.org_id || getCookieData("priobank-lite-org_id") || 0,
    );
    const resolvedBranchId = Number(
      user?.branch_id || getCookieData("priobank-lite-branch_id") || 0,
    );
    const rawBranchName =
      user?.branch_name || getCookieData("priobank-lite-branch_name") || "";

    setOrgId(resolvedOrgId);
    setBranchId(resolvedBranchId);
    setBranchName(
      rawBranchName
        ? /branch/i.test(String(rawBranchName))
          ? String(rawBranchName)
          : `${rawBranchName} Branch`
        : "Branch",
    );

    const startVal = parseDate(getCookieData("priobank-lite-fin_start_date"));
    const endVal = parseDate(getCookieData("priobank-lite-fin_end_date"));
    const today = startOfDay(new Date());

    setFinStartDate(startVal);
    setFinEndDate(endVal);

    const defaultFrom = startVal || today;
    let defaultTo = today;
    if (endVal && isAfter(defaultTo, endVal)) defaultTo = endVal;
    if (isBefore(defaultTo, defaultFrom)) defaultTo = defaultFrom;

    setFromDate(defaultFrom);
    setToDate(defaultTo);
  }, [isMounted, user]);

  const loadStats = useCallback(
    async (from: Date | null, to: Date | null) => {
      if (!orgId || !branchId) {
        toast.error("Branch session is missing. Please sign in again.");
        return;
      }
      if (!from || !to) {
        toast.error("Please select a date range.");
        return;
      }
      if (isAfter(startOfDay(from), startOfDay(to))) {
        toast.error("From date cannot be after To date.");
        return;
      }

      const requestId = ++requestIdRef.current;
      dispatch(start());

      try {
        const data = await fetchDashboardStats(
          orgId,
          branchId,
          toApiDate(from),
          toApiDate(to),
        );
        if (requestId !== requestIdRef.current) return;
        dispatch(success(data));
      } catch (err: any) {
        if (requestId !== requestIdRef.current) return;
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load dashboard data.";
        dispatch(failure(message));
        toast.error(message);
      }
    },
    [branchId, dispatch, orgId],
  );

  useEffect(() => {
    if (didInitFetch.current) return;
    if (!orgId || !branchId || !fromDate || !toDate) return;
    didInitFetch.current = true;
    loadStats(fromDate, toDate);
  }, [branchId, fromDate, loadStats, orgId, toDate]);

  useEffect(() => {
    return () => {
      requestIdRef.current += 1;
    };
  }, []);

  const onFromDateChange = (date: Date | undefined) => {
    setFromDate(date ? startOfDay(date) : null);
  };

  const onToDateChange = (date: Date | undefined) => {
    setToDate(date ? startOfDay(date) : null);
  };

  const onSearch = () => {
    loadStats(fromDate, toDate);
  };

  /** Refresh: reset filter to financial-year range, then reload dashboard. */
  const onRefresh = useCallback(() => {
    const today = startOfDay(new Date());
    const fyFrom = finStartDate || today;
    let fyTo = today;
    if (finEndDate && isAfter(fyTo, finEndDate)) fyTo = finEndDate;
    if (isBefore(fyTo, fyFrom)) fyTo = fyFrom;

    setFromDate(fyFrom);
    setToDate(fyTo);
    loadStats(fyFrom, fyTo);
  }, [finEndDate, finStartDate, loadStats]);

  const statCards = useMemo(() => buildStatCards(stats), [stats]);

  const branchSections: DashboardBranchSection[] = useMemo(() => {
    if (!isHeadView) return [];
    // Skip head-office row — Overall Summary already covers it.
    return branches
      .filter((branch) => !branch.isHead)
      .map((branch) => ({
        branchId: branch.branchId,
        branchName: branch.branchName,
        isHead: branch.isHead,
        cards: buildStatCards(branch.stats).map((card) => ({
          ...card,
          key: `${branch.branchId}-${card.key}`,
        })),
      }));
  }, [branches, isHeadView]);

  return {
    branchName,
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    onSearch,
    onRefresh,
    loading,
    error,
    statCards,
    isHeadView,
    branchSections,
    finStartDate,
    finEndDate,
  };
};
