"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch, RootState } from "@/redux/store";
import { CollectionRegisterForm } from "./CollectionRegisterType";
import {
  clearCollectionRegister,
  fetchBranchList,
  fetchCollectionRegister,
} from "./CollectionRegisterReducer";

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
    },
    resolver: yupResolver(
      yup.object().shape({
        fromDate: yup.mixed().required("From date is required"),
        toDate: yup.mixed().required("To date is required"),
        branch: yup.mixed().required("Branch is required"),
      }),
    ) as any,
  });

  const resetForm = useCallback(() => {
    searchRequestRef.current?.abort();
    searchRequestRef.current = null;
    methods.reset({
      fromDate: "",
      toDate: "",
      branch: "",
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
  };
};
