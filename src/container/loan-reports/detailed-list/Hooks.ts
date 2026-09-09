"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import getCookieData from "@/lib/getCookieData";
import { format } from "date-fns";

import { DetailedListForm } from "./DetailedListType";
import {
  getBranchListAPI,
  getGroupLoanReportAPI,
  getSchemeListAPI,
} from "./DetailedListApi";
import {
  setBranchList,
  setDetailedList,
  setSchemeList,
} from "./DetailedListReducer";
import { AppDispatch } from "@/redux/store";

const extractSchemeList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

export const useDetailedList = () => {
  const orgId = getCookieData("priobank-lite-org_id");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const schema = yup.object().shape({
    fromDate: yup.mixed().required("From date is required"),
    toDate: yup.mixed().required("To date is required"),
    branch: yup.mixed().required("Branch is required"),
    scheme: yup.mixed().required("Scheme is required"),
  });

  const methods = useForm<DetailedListForm>({
    defaultValues: {
      fromDate: "",
      toDate: "",
      branch: "",
      scheme: "",
    },
    resolver: yupResolver(schema) as any,
  });

  const resetForm = () => {
    methods.reset({
      fromDate: "",
      toDate: "",
      branch: "",
      scheme: "",
    });
    dispatch(setDetailedList(null));
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
    } catch {
      dispatch(setBranchList([]));
    }
  };

  const getSchemeListAPICall = async (orgId: number) => {
    try {
      const res = await getSchemeListAPI(orgId);
      if (res?.message === "Data Found") {
        dispatch(setSchemeList(extractSchemeList(res)));
      } else {
        dispatch(setSchemeList([]));
      }
    } catch {
      dispatch(setSchemeList([]));
    }
  };

  const GetDetailedListAPICall = async (
    branchId: number,
    fromDate: string,
    toDate: string,
    schemeId: number | string,
  ) => {
    try {
      setLoading(true);
      const res = await getGroupLoanReportAPI(
        Number(orgId),
        branchId,
        fromDate,
        toDate,
        schemeId,
      );
      const data = res?.details;
      if (res.message === "Data Found") {
        dispatch(setDetailedList(data));
      } else {
        dispatch(setDetailedList([]));
      }
    } catch {
      dispatch(setDetailedList([]));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: DetailedListForm) => {
    try {
      const formattedFromDate =
        data.fromDate instanceof Date
          ? format(data.fromDate, "yyyy-MM-dd")
          : data.fromDate || "";
      const formattedToDate =
        data.toDate instanceof Date
          ? format(data.toDate, "yyyy-MM-dd")
          : data.toDate || "";

      GetDetailedListAPICall(
        Number(data.branch),
        formattedFromDate,
        formattedToDate,
        data.scheme,
      );
    } catch (error) {
      console.log(error);
    }
  };

  return {
    methods,
    resetForm,
    getBranchListAPICall,
    getSchemeListAPICall,
    onSubmit,
    orgId,
    loading,
  };
};
