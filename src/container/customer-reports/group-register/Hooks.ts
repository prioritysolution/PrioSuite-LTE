"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { format } from "date-fns";
import getCookieData from "@/lib/getCookieData";
import { AppDispatch } from "@/redux/store";
import { GroupRegisterForm } from "./GroupRegisterType";
import { getBranchListAPI, getGroupRegisterAPI } from "./GroupRegisterApi";
import { setBranchList, setGroupRegisterList } from "./GroupRegisterReducer";

const pick = (item: any, keys: string[]) => {
  for (const key of keys) {
    const val = item?.[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
  }
  return "";
};

const parseDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

const filterByAdmissionDate = (
  list: any[],
  fromDate: string,
  toDate: string,
) => {
  const from = parseDate(fromDate);
  const to = parseDate(toDate);
  if (!from && !to) return list;

  return list.filter((item) => {
    const adm = parseDate(
      pick(item, ["Adm_Date", "adm_date", "Admission_Date", "Form_Date"]),
    );
    if (!adm) return true;
    if (from) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      if (adm < start) return false;
    }
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      if (adm > end) return false;
    }
    return true;
  });
};

const extractList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.details,
    res?.data?.Data,
    res?.data?.details,
    res?.data?.data,
    res?.data,
    res,
  ];
  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

export const useGroupRegister = () => {
  const orgId = getCookieData<string | number>("priobank-lite-org_id");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const schema = yup.object().shape({
    fromDate: yup.mixed().required("From date is required"),
    toDate: yup.mixed().required("To date is required"),
    branch: yup.mixed().required("Branch is required"),
  });

  const methods = useForm<GroupRegisterForm>({
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
    dispatch(setGroupRegisterList(null));
  };

  const getBranchListAPICall = async (org_Id: number) => {
    try {
      const res = await getBranchListAPI(org_Id);
      if (res?.message === "Data Found" || Array.isArray(res?.Data)) {
        dispatch(setBranchList(extractList(res)));
      } else {
        dispatch(setBranchList([]));
      }
    } catch {
      dispatch(setBranchList([]));
    }
  };

  const getGroupRegisterAPICall = async (
    branchId: number,
    fromDate: string,
    toDate: string,
  ) => {
    try {
      setLoading(true);
      const res = await getGroupRegisterAPI(
        Number(orgId),
        branchId,
        fromDate,
        toDate,
      );
      const list = extractList(res);
      const filtered = filterByAdmissionDate(list, fromDate, toDate);
      dispatch(setGroupRegisterList(filtered));
    } catch {
      dispatch(setGroupRegisterList([]));
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: GroupRegisterForm) => {
    const formattedFromDate =
      data.fromDate instanceof Date
        ? format(data.fromDate, "yyyy-MM-dd")
        : data.fromDate || "";
    const formattedToDate =
      data.toDate instanceof Date
        ? format(data.toDate, "yyyy-MM-dd")
        : data.toDate || "";

    getGroupRegisterAPICall(
      Number(data.branch),
      String(formattedFromDate),
      String(formattedToDate),
    );
  };

  return {
    methods,
    resetForm,
    getBranchListAPICall,
    onSubmit,
    orgId,
    loading,
  };
};
