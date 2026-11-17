"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/GlobalContext";
import {
  extractList,
  toApiDate,
  todayNoon,
} from "../collection-repayment/CollectionRectifyApi";
import { LogSearchForm } from "../collection-repayment/CollectionRectifyType";
import {
  getOpeningEntryLogAPI,
  getOpeningEntryLogDetailsAPI,
  mapOpeningLogDetails,
  mapOpeningLogRow,
} from "./OpeningEntryApi";

const defaultFilters = (): LogSearchForm => ({
  fromDate: todayNoon(),
  toDate: todayNoon(),
  result: "",
});

const toParams = (values: LogSearchForm) => ({
  from_date: toApiDate(values.fromDate) || undefined,
  to_date: toApiDate(values.toDate) || undefined,
  result:
    values.result === "" || values.result === null || values.result === undefined
      ? undefined
      : Number(values.result),
});

export const useOpeningEntryLog = () => {
  const { user } = useGlobalContext();
  const orgId = Number(user?.org_id || 0);
  const branchId = Number(user?.branch_id || 0);

  const form = useForm<LogSearchForm>({ defaultValues: defaultFilters() });
  const [params, setParams] = useState(() => toParams(defaultFilters()));
  const [nonce, setNonce] = useState(0);
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null);

  const query = useQuery({
    queryKey: ["openingEntryLog", orgId, branchId, params, nonce],
    queryFn: () =>
      getOpeningEntryLogAPI({ org_id: orgId, branch_id: branchId, ...params }),
    enabled: orgId > 0 && branchId > 0,
  });

  const rows = useMemo(
    () => extractList(query.data).map(mapOpeningLogRow),
    [query.data],
  );

  const detailsQuery = useQuery({
    queryKey: ["openingEntryLogDetails", orgId, branchId, selectedLogId],
    queryFn: () =>
      getOpeningEntryLogDetailsAPI(orgId, branchId, Number(selectedLogId)),
    enabled: orgId > 0 && branchId > 0 && selectedLogId !== null,
  });

  const details = useMemo(() => {
    const mapped = mapOpeningLogDetails(detailsQuery.data);
    return mapped && mapped.log.logId === selectedLogId ? mapped : null;
  }, [detailsQuery.data, selectedLogId]);

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
    const filters = defaultFilters();
    form.reset(filters);
    setParams(toParams(filters));
    setNonce((value) => value + 1);
  }, [form]);

  return {
    form,
    rows,
    loading: query.isFetching,
    onSearch,
    onReset,
    onView: setSelectedLogId,
    detailsOpen: selectedLogId !== null,
    detailsLoading: detailsQuery.isFetching && !details,
    details,
    onCloseDetails: () => setSelectedLogId(null),
  };
};
