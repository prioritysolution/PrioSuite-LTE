"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { startOfMonth } from "date-fns";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  extractList,
  toApiDate,
  todayNoon,
} from "../collection-repayment/CollectionRectifyApi";
import { DateRangeForm } from "../collection-repayment/CollectionRectifyType";
import { getLoanHistoryAPI, mapLoanHistory } from "./LoanRectifyApi";

const defaultRange = (): DateRangeForm => {
  const today = todayNoon();
  const monthStart = startOfMonth(today);
  monthStart.setHours(12, 0, 0, 0);
  return { fromDate: monthStart, toDate: today };
};

const toParams = (values: DateRangeForm) => ({
  from_date: toApiDate(values.fromDate) || undefined,
  to_date: toApiDate(values.toDate) || undefined,
});

export const useLoanRectifyHistory = () => {
  const { user } = useGlobalContext();
  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);

  const form = useForm<DateRangeForm>({ defaultValues: defaultRange() });
  const [params, setParams] = useState(() => toParams(defaultRange()));
  const [nonce, setNonce] = useState(0);

  const query = useQuery({
    queryKey: ["loanRectifyHistory", orgId, branchId, params, nonce],
    queryFn: () =>
      getLoanHistoryAPI({ org_id: orgId, branch_id: branchId, ...params }),
    enabled: orgId > 0 && branchId > 0,
  });

  const rows = useMemo(() => mapLoanHistory(extractList(query.data)), [query.data]);

  const onSearch = form.handleSubmit((values) => {
    const next = toParams(values);
    if (next.from_date && next.to_date && next.from_date > next.to_date) {
      toast.error("From date cannot be after To date.");
      return;
    }
    setParams(next);
    setNonce((value) => value + 1);
  });

  const onReset = useCallback(() => {
    const range = defaultRange();
    form.reset(range);
    setParams(toParams(range));
    setNonce((value) => value + 1);
  }, [form]);

  return {
    form,
    rows,
    loading: query.isFetching,
    onSearch,
    onReset,
  };
};
