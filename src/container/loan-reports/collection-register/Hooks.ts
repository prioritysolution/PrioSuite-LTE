"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch, RootState } from "@/redux/store";
import {
  CollectionRegisterForm,
  CollectionRegisterGroupOption,
} from "./CollectionRegisterType";
import {
  clearCollectionRegister,
  fetchBranchList,
  fetchCollectionRegister,
} from "./CollectionRegisterReducer";
import { getGroupListAPI } from "./CollectionRegisterApi";

const GROUP_LIST_STALE_MS = 5 * 60 * 1000;
const GROUP_NAME_KEYS = ["Grp_Name", "Group_Name", "grp_name", "GroupName"];
const GROUP_ID_KEYS = ["Group_Id", "Grp_Id", "grp_id", "GroupId", "group_id"];
const GROUP_NO_KEYS = ["Group_No", "Grp_No", "group_no"];

const pick = (item: any, keys: string[]) => {
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const extractGroupList = (res: any): any[] => {
  const candidates = [res?.Data, res?.details, res?.data?.Data, res?.data];
  return candidates.find((item) => Array.isArray(item)) ?? [];
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const str = String(value).trim();
  if (!str) return null;
  const native = new Date(str);
  if (!Number.isNaN(native.getTime())) return native;
  const match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (match) {
    const parsed = new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1]),
    );
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const toApiDate = (value: CollectionRegisterForm["fromDate"]) => {
  if (!value) return "";
  if (value instanceof Date) return format(value, "yyyy-MM-dd");
  const parsed = parseDate(value);
  if (parsed) return format(parsed, "yyyy-MM-dd");
  return String(value).trim();
};

export const useCollectionRegister = () => {
  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(
    (state: RootState) => state.collectionRegister.loading,
  );
  const branchList = useSelector(
    (state: RootState) => state.collectionRegister.branchList,
  );

  const searchRequestRef = useRef<{ abort: () => void } | null>(null);
  const branchesLoadedRef = useRef(false);

  const methods = useForm<CollectionRegisterForm>({
    defaultValues: {
      fromDate: "",
      toDate: "",
      branch: "",
      group: "",
    },
    resolver: yupResolver(
      yup.object().shape({
        fromDate: yup.mixed().required("From date is required"),
        toDate: yup.mixed().required("To date is required"),
        branch: yup.mixed().required("Branch is required"),
      }),
    ) as any,
  });

  const selectedBranchId = Number(methods.watch("branch") || 0);

  const groupQuery = useQuery({
    queryKey: ["collection-register", "groups", Number(orgId), selectedBranchId],
    queryFn: () => getGroupListAPI(Number(orgId), selectedBranchId),
    enabled: Boolean(orgId) && selectedBranchId > 0,
    staleTime: GROUP_LIST_STALE_MS,
  });

  const groupOptions: CollectionRegisterGroupOption[] = useMemo(
    () =>
      extractGroupList(groupQuery.data)
        .map((group) => {
          const name = String(pick(group, GROUP_NAME_KEYS)).trim();
          const no = String(pick(group, GROUP_NO_KEYS)).trim();
          return {
            label: [name, no ? `(${no})` : ""].filter(Boolean).join(" "),
            value: Number(pick(group, GROUP_ID_KEYS)),
          };
        })
        .filter((option) => option.label !== "" && option.value > 0),
    [groupQuery.data],
  );

  // A group belongs to one branch: clear it when the branch changes
  const lastBranchRef = useRef(selectedBranchId);
  useEffect(() => {
    if (lastBranchRef.current === selectedBranchId) return;
    lastBranchRef.current = selectedBranchId;
    methods.setValue("group", "");
  }, [methods, selectedBranchId]);

  const resetForm = useCallback(() => {
    searchRequestRef.current?.abort();
    searchRequestRef.current = null;
    methods.reset({
      fromDate: "",
      toDate: "",
      branch: "",
      group: "",
    });
    dispatch(clearCollectionRegister());
  }, [dispatch, methods]);

  const onSubmit = useCallback(
    (data: CollectionRegisterForm) => {
      if (!orgId) return;

      searchRequestRef.current?.abort();
      const promise = dispatch(
        fetchCollectionRegister({
          orgId: Number(orgId),
          branchId: Number(data.branch),
          fromDate: toApiDate(data.fromDate),
          toDate: toApiDate(data.toDate),
          groupId: Number(data.group) > 0 ? Number(data.group) : undefined,
        }),
      );
      searchRequestRef.current = promise;
    },
    [dispatch, orgId],
  );

  // Load branches once — never on every render / remount cycle duplicate
  useEffect(() => {
    if (!orgId) return;
    if (branchesLoadedRef.current || branchList.length > 0) return;
    branchesLoadedRef.current = true;
    dispatch(fetchBranchList(Number(orgId)));
  }, [orgId, branchList.length, dispatch]);

  useEffect(() => {
    return () => {
      searchRequestRef.current?.abort();
      searchRequestRef.current = null;
    };
  }, []);

  return {
    methods,
    resetForm,
    onSubmit,
    orgId,
    loading,
    groupOptions,
    groupLoading: groupQuery.isFetching,
  };
};
