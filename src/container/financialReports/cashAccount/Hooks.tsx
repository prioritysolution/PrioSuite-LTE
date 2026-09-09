"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";
import { AppDispatch, RootState } from "@/redux/store";
import { CashAccountForm } from "./cashAccountType";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { setBranchList, setCashAccountReport } from "./cashAccountReducer";
import { getCashAccountReportAPI } from "./cashAccountApi";

export const useCashAccount = () => {
  const orgId = getCookieData("priobank-lite-org_id");
  const branchId = getCookieData("priobank-lite-branch_id");

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const branchList = useSelector(
    (state: RootState) => state.cashAccount.branchList,
  );
  const cashAccountReport = useSelector(
    (state: RootState) => state.cashAccount.cashAccountReport,
  );

  const schema = yup.object().shape({
    fromDate: yup.mixed().required("From date is required"),
    toDate: yup.mixed().required("To date is required"),
    branch: yup.mixed().optional(),
  });

  const methods = useForm<CashAccountForm>({
    defaultValues: {
      fromDate: "",
      toDate: "",
      branch: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const resetForm = () => {
    methods.reset({
      fromDate: "",
      toDate: "",
      branch: "",
    });
    dispatch(setCashAccountReport(null));
  };

  const getBranchListAPICall = async (orgId: number) => {
    try {
      const res = await getBranchListAPI(orgId);
      const data = res?.Data;
      if (res.message === "Data Found") {
        dispatch(setBranchList(data));
      } else {
        dispatch(setBranchList([]));
      }
    } catch (error) {
      dispatch(setBranchList([]));
    }
  };

  const onSubmit = async (data: CashAccountForm) => {
    try {
      setLoading(true);
      const formattedFromDate =
        data.fromDate instanceof Date
          ? format(data.fromDate, "yyyy-MM-dd")
          : data.fromDate || "";
      const formattedToDate =
        data.toDate instanceof Date
          ? format(data.toDate, "yyyy-MM-dd")
          : data.toDate || "";

      // Branch Dropdown: If Not Choose Pass 0 Default
      const selectedBranch = data.branch ? String(data.branch) : "0";

      const res = await getCashAccountReportAPI(
        Number(orgId),
        formattedFromDate,
        formattedToDate,
        selectedBranch,
      );

      if (res.status === "success" && res.data) {
        dispatch(setCashAccountReport(res.data));
      } else {
        dispatch(setCashAccountReport(null));
      }
    } catch (error) {
      dispatch(setCashAccountReport(null));
    } finally {
      setLoading(false);
    }
  };

  return {
    orgId,
    branchId,
    branchList,
    cashAccountReport,
    loading,
    methods,
    resetForm,
    onSubmit,
    getBranchListAPICall,
  };
};
