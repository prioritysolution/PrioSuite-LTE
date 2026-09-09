"use client";

import { useDispatch, useSelector } from "react-redux";
import {
  saveStart,
  saveSuccess,
  saveFailure,
  setCoList,
} from "./NewApplicationReducer";
import { getCoListAPI, saveGroupLoanAPI } from "./NewApplicationApi";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { IGroupLoanForm } from "@/app/(dashboard)/loan-entry/new-application/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";
import getCookieData from "@/lib/getCookieData";
import { useEffect } from "react";
import { format, isValid } from "date-fns";

const toApiDate = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value as string);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

const DEFAULT_FORM_VALUES: IGroupLoanForm = {
  loan_date: "",
  branch_id: "",
  group_id: null,
  group_no: "",
  group_name: "",
  group_address: "",
  group_area: "",
  scheme_id: 0,
  roi: 0,
  repay_mode: 0,
  repay_name: "",
  sanction_limit: 0,
  appl_amt: 0,
  members: [],
  co_id: "",
};

const groupLoanSchema = yup.object().shape({
  loan_date: yup.mixed().required("Loan Date is required"),
  branch_id: yup
    .mixed<string | number>()
    .test(
      "required",
      "Select branch is required",
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value)) &&
        Number(value) !== 0,
    ),
  group_no: yup.string().required("Group Number is required"),
  scheme_id: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Scheme is required")
    .min(1, "Scheme is required"),
  appl_amt: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Application Amount is required")
    .min(1, "Application Amount must be greater than 0"),
  co_id: yup.string().required("CO is required"),
});

export const useNewApplicationHook = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.newApplication);

  const cookieBranchId = Number(getCookieData("priobank-lite-branch_id"));
  const orgId = Number(getCookieData("priobank-lite-org_id"));

  const methods = useForm<IGroupLoanForm>({
    defaultValues: DEFAULT_FORM_VALUES,
    resolver: yupResolver(groupLoanSchema) as any,
  });

  const selectedBranchId = Number(methods.watch("branch_id") || 0);

  const getCoListAPICall = async (org_id: number, branch_id: number) => {
    try {
      const res = await getCoListAPI(org_id, branch_id);

      const message = res?.message;
      const dataList = res?.Data;

      if (message === "Data Found" && Array.isArray(dataList)) {
        dispatch(setCoList(dataList));
      } else {
        dispatch(setCoList([]));
      }
    } catch (error) {
      console.log("error= ", error);
      dispatch(setCoList([]));
    }
  };

  useEffect(() => {
    if (orgId && selectedBranchId) {
      getCoListAPICall(orgId, selectedBranchId);
    } else {
      dispatch(setCoList([]));
    }
  }, [orgId, selectedBranchId, dispatch]);

  const resetForm = () => {
    methods.reset({ ...DEFAULT_FORM_VALUES, members: [] });
    methods.clearErrors();
  };

  const submitMutation = useMutation({
    mutationFn: async (data: IGroupLoanForm) => {
      dispatch(saveStart());
      const payload = {
        group_id: data.group_id,
        loan_date: toApiDate(data.loan_date),
        scheme_id: Number(data.scheme_id),
        roi: data.roi,
        repay_mode: data.repay_mode,
        tot_loan_amt: data.appl_amt,
        co_id: data.co_id,
        branch_id: Number(data.branch_id) || cookieBranchId,
        org_id: orgId,
        mem_details: data.members
          .filter((m) => Number(m.loan_amount) > 0)
          .map((m) => ({
            mem_id: m.mem_id,
            ln_cycle: m.ln_cycle || 1,
            ln_amt: Number(m.loan_amount),
            purp_id: m.purpose ? Number(m.purpose) : null,
            gurr_name: m.guranter_name || "",
            inst_no: m.inst_no || 0,
            inst_amt: m.inst_amt || 0,
            resil_amt: m.resil_amt || 0,
            final_date: m.final_date || "",
          })),
      };
      return await saveGroupLoanAPI(payload);
    },
    onSuccess: (res: any) => {
      const message =
        res?.message || res?.massage || res?.details || res?.data?.message || "";
      const normalizedMsg = String(message).toLowerCase();
      const isFailure =
        !!normalizedMsg &&
        (normalizedMsg.includes("fail") ||
          normalizedMsg.includes("error") ||
          normalizedMsg.includes("invalid"));

      if (isFailure && !normalizedMsg.includes("success")) {
        dispatch(saveFailure(message || "Failed to save"));
        toast.error(message || "Operation failed. Please try again.");
        return;
      }

      dispatch(saveSuccess());
      toast.success("Group Loan Entry saved successfully!");
      resetForm();
    },
    onError: (error: any) => {
      dispatch(saveFailure(error.message || "Failed to save"));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Operation failed. Please try again.",
      );
    },
  });

  const onSubmit: SubmitHandler<IGroupLoanForm> = (data) => {
    const validMembers = data.members.filter((m) => Number(m.loan_amount) > 0);
    if (validMembers.length === 0) {
      toast.error("Please enter loan amount for at least one member.");
      return;
    }
    submitMutation.mutate(data);
  };

  return {
    state,
    methods,
    onSubmit,
    submitPending: submitMutation.isPending,
    resetForm,
  };
};
