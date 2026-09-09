"use client"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setFlowMode as setFlowModeAction,
  showForm,
  hideForm,
  openSearch,
  closeSearch,
  setEditMode as setEditModeAction,
  setSearchId as setSearchIdAction,
  resetFlow,
} from "./GroupAdmissionReducer";
import { getGroupDataAPI, addGroupAPI, updateGroupAPI, getMiscConfigAPI, extractAdmissionFee } from "./GroupAdmissionApi";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { toast } from "sonner";
import { IGroupFormInput } from "@/app/(dashboard)/manage-profile/group-admission/types";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";
import { format, isValid } from "date-fns";

const toDbDate = (value: any) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (!isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
};

const schema = yup.object().shape({
  grp_name: yup.string().required("Group name is required"),
  grp_add: yup.string().required("Group address is required"),
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
  area_vill: yup
    .mixed<string | number>()
    .test(
      "required",
      "Village/Area is required",
      (value) =>
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(Number(value)),
    ),
  mem_no: yup
    .number()
    .transform((value, originalValue) =>
      originalValue === "" || originalValue === null || Number.isNaN(value)
        ? undefined
        : value,
    )
    .required("No of member is required")
    .integer("No of member must be a whole number")
    .min(1, "No of member must be at least 1")
    .max(50, "No of member cannot be more than 50"),
  bank_id: yup.mixed().when("txn_mode", {
    is: "Bank",
    then: (schema) =>
      schema.test(
        "bank-required",
        "Select bank account is required",
        (value) =>
          value !== "" &&
          value !== null &&
          value !== undefined &&
          Number(value) !== 0,
      ),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  bank_ref: yup.string().when("txn_mode", {
    is: "Bank",
    then: (schema) =>
      schema
        .trim()
        .required("Bank reference is required")
        .matches(/^[A-Za-z0-9/-]{3,30}$/, "Enter a valid bank reference"),
    otherwise: (schema) => schema.nullable().notRequired(),
  }),
  grp_type: yup.number().transform((value) => (Number.isNaN(value) ? undefined : value)).required("Group type is required"),
  co_id: yup.number().transform((value) => (Number.isNaN(value) ? undefined : value)).required("CO is required"),
  adm_date: yup.string().required("Admission date is required"),
  adm_amt: yup.number().transform((value) => (Number.isNaN(value) ? undefined : value)).required("Admission fee is required"),
});

export const useGroupAdmissionHook = () => {
  const { user } = useGlobalContext();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.groupAdmission);

  const methods = useForm<IGroupFormInput & { flowMode: "add" | "update" }>({
    defaultValues: {
      txn_mode: "Cash",
      flowMode: "add",
      branch_id: "",
      adm_date: format(new Date(), "yyyy-MM-dd"),
    },
    resolver: yupResolver(schema) as any,
  });

  const { data: miscConfig } = useQuery({
    queryKey: ["miscConfig", user?.org_id, user?.branch_id],
    queryFn: () =>
      getMiscConfigAPI(user?.org_id as number, user?.branch_id as number),
    enabled: !!user?.org_id,
  });

  const defaultAdmAmt = extractAdmissionFee(miscConfig);

  useEffect(() => {
    if (defaultAdmAmt === "") return;
    const current = methods.getValues("adm_amt");
    if (current === "" || current === undefined || current === null) {
      methods.setValue("adm_amt", defaultAdmAmt);
    }
  }, [defaultAdmAmt, state.editMode, state.isFormVisible, methods]);

  const flowModeForm = methods.watch("flowMode");

  useEffect(() => {
    if (flowModeForm && flowModeForm !== state.flowMode) {
      dispatch(setFlowModeAction(flowModeForm));
    }
  }, [flowModeForm, state.flowMode, dispatch]);


  const fetchGroupMutation = useMutation({
    mutationFn: (group_no: string) => getGroupDataAPI(user?.org_id as number, group_no, user?.branch_id as number),
    onSuccess: (response) => {
      const data = response?.Data?.[0] || response?.data?.Data?.[0] || response?.details?.[0] || response?.data?.[0];
      if (!data) {
        toast.error("No group data found.");
        return;
      }

      const groupFee = extractAdmissionFee(data);
      const admAmt =
        groupFee !== ""
          ? groupFee
          : data.Admission_Fee ??
            data.Adm_Amt ??
            data.AdmAmt ??
            data.Adm_Fee ??
            data.adm_amt ??
            data.adm_fee ??
            defaultAdmAmt;

      const mappedData: IGroupFormInput = {
        grp_id: data.Group_Id ?? data.Grp_Id,
        grp_no: data.Group_No ?? data.Grp_No,
        grp_name: data.Group_Name ?? data.Grp_Name ?? "",
        grp_add: data.Grp_Address ?? data.Grp_Add ?? "",
        branch_id:
          data.Branch_Id ??
          data.branch_id ??
          user?.branch_id ??
          "",
        area_vill: data.Vill_Area ?? data.Area_Vill ?? "",
        mem_no: data.Mem_No ?? data.mem_no ?? "",
        grp_type: data.Group_Type ?? data.Grp_Type ?? "",
        co_id: data.CO_Id ?? data.Co_Id ?? "",
        adm_amt: admAmt === "" || admAmt === undefined || admAmt === null ? "" : Number(admAmt),
        grp_sts: data.Status ?? data.Grp_Sts ?? "",
        remarks: data.Remarks ?? "",
        adm_date: data.Adm_Date ? toDbDate(data.Adm_Date) : "",
        with_date: data.Withdrwan_Date ? new Date(data.Withdrwan_Date).toISOString().split("T")[0] : "",
        txn_mode: "Cash",
      };

      if (mappedData.adm_amt === "" || Number.isNaN(mappedData.adm_amt as number)) {
        mappedData.adm_amt = defaultAdmAmt === "" ? "" : defaultAdmAmt;
      }

      methods.reset(mappedData);
      dispatch(setSearchIdAction(""));
      dispatch(setEditModeAction(true));
      dispatch(showForm());
      dispatch(closeSearch());
      requestAnimationFrame(() => {
        if (mappedData.adm_amt !== "" && mappedData.adm_amt !== undefined) {
          methods.setValue("adm_amt", mappedData.adm_amt);
        }
      });
    },
    onError: (error) => {
      console.error("API Fetch Error:", error);
      toast.error("Failed to fetch group data.");
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: IGroupFormInput) => {
      const payload: any = {
        grp_no: data.grp_no,
        grp_name: data.grp_name,
        grp_add: data.grp_add,
        area_vill: Number(data.area_vill),
        mem_no: data.mem_no ? Number(data.mem_no) : undefined,
        grp_type: Number(data.grp_type),
        co_id: Number(data.co_id),
        adm_date: toDbDate(data.adm_date),
        adm_amt: Number(data.adm_amt),
        branch_id: Number(data.branch_id),
        org_id: user?.org_id as number,
      };

      if (state.editMode) {
        payload.grp_id = data.grp_id;
        payload.grp_sts = Number(data.grp_sts);
        if (data.with_date) payload.with_date = toDbDate(data.with_date);
        if (data.remarks) payload.remarks = data.remarks;
        return await updateGroupAPI(payload);
      } else {
        payload.grp_sts = 1;
        if (data.txn_mode === "Bank") {
          payload.bank_id = data.bank_id ? Number(data.bank_id) : undefined;
          payload.bank_ref = data.bank_ref;
        } else {
          payload.bank_id = 0;
        }
        return await addGroupAPI(payload);
      }
    },
    onSuccess: () => {
      toast.success(`Group ${state.editMode ? "updated" : "added"} successfully!`);
      handleResetFlow();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Operation failed. Please try again.");
    },
  });

  const onSubmit: SubmitHandler<IGroupFormInput> = (data) => submitMutation.mutate(data);

  const handleNextClick = () => {
    if (state.flowMode === "add") {
      dispatch(setEditModeAction(false));
      methods.reset({
        txn_mode: "Cash",
        branch_id: "",
        adm_date: format(new Date(), "yyyy-MM-dd"),
        adm_amt: defaultAdmAmt === "" ? "" : defaultAdmAmt,
      });
      dispatch(showForm());
    } else {
      dispatch(openSearch());
    }
  };

  const handleResetFlow = () => {
    dispatch(resetFlow());
    methods.reset({
      txn_mode: "Cash",
      branch_id: "",
      adm_date: format(new Date(), "yyyy-MM-dd"),
      adm_amt: defaultAdmAmt === "" ? "" : defaultAdmAmt,
    });
  };

  const setFlowMode = (mode: "add" | "update") => {
    dispatch(setFlowModeAction(mode));
  };

  const setIsSearchOpen = (open: boolean) => {
    dispatch(open ? openSearch() : closeSearch());
  };

  const setSearchId = (id: string) => {
    dispatch(setSearchIdAction(id));
  };

  return {
    state,
    methods,
    onSubmit,
    handleNextClick,
    handleResetFlow,
    setFlowMode,
    setIsSearchOpen,
    setSearchId,
    fetchGroupMutation,
    submitMutation,
  };
};
