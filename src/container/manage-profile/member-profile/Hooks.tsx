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
} from "./MemberProfileReducer";
import { getMemberDataAPI, addMemberAPI, updateMemberAPI, getMiscConfigAPI, extractMiscField } from "./MemberProfileApi";
import { extractMemberRecord, mapMemberToForm, pickMemberValue, pickMemberNumber } from "./memberProfileHelpers";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { toast } from "sonner";
import { IMemberFormInput } from "@/app/(dashboard)/manage-profile/member-profile/types";
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

const optionalNumber = () =>
  yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      const n = Number(originalValue);
      return Number.isNaN(n) ? undefined : n;
    })
    .nullable()
    .notRequired();

const requiredNumber = (message: string) => optionalNumber().required(message);

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.]{1,49}$/;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const VOTER_ID_PATTERN = /^[A-Z]{3}[0-9]{7}$/;
const AADHAR_PATTERN = /^[2-9]\d{11}$/;

const optionalText = () =>
  yup
    .string()
    .trim()
    .transform((value) => (value ? value : undefined))
    .nullable()
    .notRequired();

const hasSpouseDetail = (parent: {
  mem_sage?: number | string;
  sp_aadhar?: string;
  sp_epic?: string;
}) =>
  (parent.mem_sage !== undefined &&
    parent.mem_sage !== null &&
    String(parent.mem_sage).trim() !== "") ||
  Boolean(parent.sp_aadhar && String(parent.sp_aadhar).trim()) ||
  Boolean(parent.sp_epic && String(parent.sp_epic).trim());

const memberSchema = yup.object().shape({
  member_name: yup
    .string()
    .trim()
    .required("Member name is required")
    .matches(NAME_PATTERN, "Member name must contain letters only"),
  mem_fname: yup
    .string()
    .trim()
    .required("Guardian name is required")
    .matches(NAME_PATTERN, "Guardian name must contain letters only"),
  mem_spose: yup
    .string()
    .trim()
    .nullable()
    .test("spouse-name-required", "Spouse name is required", function (value) {
      if (!hasSpouseDetail(this.parent)) return true;
      return Boolean(value && value.trim());
    })
    .test(
      "spouse-name-format",
      "Spouse name must contain letters only",
      (value) => !value || NAME_PATTERN.test(value),
    ),
  mem_add: yup.string().trim().required("Address is required"),
  mem_mob: yup
    .string()
    .trim()
    .required("Mobile number is required")
    .matches(/^[6-9]\d{9}$/, "Mobile no must be 10 digits and start with 6-9"),
  mem_conct: yup
    .string()
    .trim()
    .nullable()
    .test(
      "contact-no",
      "Contact no must be 10 digits and start with 6-9",
      (value) => !value || /^[6-9]\d{9}$/.test(value),
    ),
  mem_age: requiredNumber("Age is required")
    .integer("Age must be a whole number")
    .min(18, "Age must be between 18 and 100")
    .max(100, "Age must be between 18 and 100"),
  mem_sage: yup
    .number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || originalValue === undefined) {
        return undefined;
      }
      const n = Number(originalValue);
      return Number.isNaN(n) ? undefined : n;
    })
    .nullable()
    .notRequired()
    .integer("Spouse age must be a whole number")
    .min(18, "Spouse age must be between 18 and 100")
    .max(100, "Spouse age must be between 18 and 100"),
  mem_gender: requiredNumber("Gender is required"),
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
  area_vill: requiredNumber("Area village is required"),
  mem_aadhar: yup
    .string()
    .trim()
    .required("Aadhar no is required")
    .matches(AADHAR_PATTERN, "Aadhar no must be 12 digits and cannot start with 0 or 1"),
  mem_pan: optionalText()
    .transform((value) => (value ? String(value).toUpperCase() : value))
    .test(
      "pan",
      "PAN must be 10 characters (e.g. ABCDE1234F)",
      (value) => !value || PAN_PATTERN.test(value),
    ),
  mem_epic: optionalText()
    .transform((value) => (value ? String(value).toUpperCase() : value))
    .test(
      "voter-id",
      "Voter ID must be 3 letters and 7 digits (e.g. ABC1234567)",
      (value) => !value || VOTER_ID_PATTERN.test(value),
    ),
  sp_aadhar: optionalText().test(
    "spouse-aadhar",
    "Spouse Aadhar must be 12 digits and cannot start with 0 or 1",
    (value) => !value || AADHAR_PATTERN.test(value),
  ),
  sp_epic: optionalText()
    .transform((value) => (value ? String(value).toUpperCase() : value))
    .test(
      "spouse-voter-id",
      "Spouse Voter ID must be 3 letters and 7 digits (e.g. ABC1234567)",
      (value) => !value || VOTER_ID_PATTERN.test(value),
    ),
  mem_quf: optionalText().test(
    "qualification",
    "Qualification must contain letters only",
    (value) => !value || /^[A-Za-z][A-Za-z\s.]{0,49}$/.test(value),
  ),
  mem_ocop: optionalText().test(
    "occupation",
    "Occupation must contain letters only",
    (value) => !value || /^[A-Za-z][A-Za-z\s.]{1,49}$/.test(value),
  ),
  boy_count: optionalNumber()
    .integer("Boys must be a whole number")
    .min(0, "Boys cannot be less than 0")
    .max(20, "Boys cannot be more than 20"),
  girl_count: optionalNumber()
    .integer("Girls must be a whole number")
    .min(0, "Girls cannot be less than 0")
    .max(20, "Girls cannot be more than 20"),
  mem_minc: optionalNumber()
    .min(0, "Monthly income cannot be less than 0")
    .max(9999999, "Enter a valid monthly income"),
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
  co_id: requiredNumber("Admitted by is required"),
  adm_date: yup
    .mixed()
    .test("adm_date", "Admission date is required", (value) => {
      if (!value) return false;
      if (value instanceof Date) return isValid(value);
      return String(value).trim() !== "";
    }),
});

export const useMemberProfileHook = () => {
  const { user } = useGlobalContext();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.memberProfile);

  const methods = useForm<IMemberFormInput & { flowMode?: "add" | "update" }>({
    defaultValues: {
      txn_mode: "Cash",
      flowMode: "add",
      branch_id: "",
      adm_date: format(new Date(), "yyyy-MM-dd"),
    },
    resolver: yupResolver(memberSchema) as any,
  });

  const { data: miscConfig } = useQuery({
    queryKey: ["miscConfig", user?.org_id, user?.branch_id],
    queryFn: () =>
      getMiscConfigAPI(user?.org_id as number, user?.branch_id as number),
    enabled: !!user?.org_id,
  });

  const defaultAdmAmt = extractMiscField(miscConfig, [
    "Mem_Adm_Amt",
    "mem_adm_amt",
    "Adm_Amt",
    "Admission_Fee",
  ]);
  const defaultShareAmt = extractMiscField(miscConfig, [
    "Mem_Shr_Amt",
    "mem_shr_amt",
    "Share_Amt",
    "Share_Amount",
  ]);

  useEffect(() => {
    if (state.editMode) return;
    if (defaultAdmAmt !== "") {
      const current = methods.getValues("adm_amt");
      if (current === undefined || current === null || current === ("" as any)) {
        methods.setValue("adm_amt", defaultAdmAmt);
      }
    }
    if (defaultShareAmt !== "") {
      const current = methods.getValues("share_amt");
      if (current === undefined || current === null || current === ("" as any)) {
        methods.setValue("share_amt", defaultShareAmt);
      }
    }
  }, [defaultAdmAmt, defaultShareAmt, state.editMode, state.isFormVisible, methods]);

  const flowModeForm = methods.watch("flowMode");
  useEffect(() => {
    if (flowModeForm && flowModeForm !== state.flowMode) {
      dispatch(setFlowModeAction(flowModeForm));
    }
  }, [flowModeForm, state.flowMode, dispatch]);

  const fetchMemberMutation = useMutation({
    mutationFn: (mem_no: string) => getMemberDataAPI(user?.org_id as number, mem_no, user?.branch_id as number),
    onSuccess: (response) => {
      const memberData = extractMemberRecord(response);
      if (!memberData) {
        toast.error("No data found for this member.");
        return;
      }

      const admissionDate = pickMemberValue(memberData, [
        "Admission_Date",
        "Adm_Date",
        "adm_date",
      ]);
      const withdrawnDate = pickMemberValue(memberData, [
        "Withdrwan_Date",
        "Withdrawn_Date",
        "with_date",
      ]);

      const mappedData = {
        ...mapMemberToForm(memberData),
        branch_id:
          pickMemberNumber(memberData, [
            "Branch_Id",
            "branch_id",
            "BranchId",
          ]) ||
          user?.branch_id ||
          "",
        adm_date: admissionDate ? toDbDate(admissionDate) : "",
        with_date: withdrawnDate ? toDbDate(withdrawnDate) : "",
        flowMode: "update" as const,
      };

      dispatch(setSearchIdAction(""));
      dispatch(setEditModeAction(true));
      dispatch(closeSearch());
      dispatch(showForm());
      methods.reset(mappedData);
      requestAnimationFrame(() => {
        methods.reset(mappedData);
      });
    },
    onError: () => toast.error("Failed to fetch member details."),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: IMemberFormInput) => {
      const payload: any = {
        ...data,
        mem_age: Number(data.mem_age),
        mem_gender: Number(data.mem_gender),
        mem_caste: data.mem_caste ? Number(data.mem_caste) : undefined,
        mem_relig: data.mem_relig ? Number(data.mem_relig) : undefined,
        mar_sts: data.mar_sts ? Number(data.mar_sts) : undefined,
        mem_sage: data.mem_sage ? Number(data.mem_sage) : undefined,
        area_vill: Number(data.area_vill),
        mem_com: data.mem_com ? Number(data.mem_com) : undefined,
        grp_id: data.grp_id ? Number(data.grp_id) : undefined,
        boy_count: data.boy_count ? Number(data.boy_count) : 0,
        girl_count: data.girl_count ? Number(data.girl_count) : 0,
        mem_minc: data.mem_minc ? Number(data.mem_minc) : 0,
        co_id: Number(data.co_id),
        adm_date: toDbDate(data.adm_date),
        org_id: user?.org_id,
        branch_id: Number(data.branch_id),
      };

      if (!state.editMode) {
        delete payload.member_no;
        payload.adm_amt = data.adm_amt ? Number(data.adm_amt) : 0;
        payload.share_amt = data.share_amt ? Number(data.share_amt) : 0;
        if (data.txn_mode === "Bank") {
          payload.bank_id = data.bank_id ? Number(data.bank_id) : undefined;
        }
        return await addMemberAPI(payload);
      } else {
        payload.member_no = Number(data.member_no);
        payload.mem_status = data.mem_status ? Number(data.mem_status) : undefined;
        return await updateMemberAPI(payload);
      }
    },
    onSuccess: () => {
      toast.success(`Member ${state.editMode ? "updated" : "added"} successfully!`);
      handleResetFlow();
    },
    onError: () => toast.error("Operation failed. Please try again."),
  });

  const onSubmit: SubmitHandler<IMemberFormInput> = (data) => submitMutation.mutate(data);

  const onInvalid = () => {
    toast.error("Please fill all required fields marked with *.");
  };

  const handleNextClick = () => {
    if (state.flowMode === "add") {
      dispatch(setEditModeAction(false));
      methods.reset({
        txn_mode: "Cash",
        branch_id: "",
        adm_date: format(new Date(), "yyyy-MM-dd"),
        adm_amt: defaultAdmAmt === "" ? undefined : defaultAdmAmt,
        share_amt: defaultShareAmt === "" ? undefined : defaultShareAmt,
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
      adm_amt: defaultAdmAmt === "" ? undefined : defaultAdmAmt,
      share_amt: defaultShareAmt === "" ? undefined : defaultShareAmt,
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
    onSubmit: methods.handleSubmit(onSubmit, onInvalid),
    handleNextClick,
    handleResetFlow,
    setFlowMode,
    setIsSearchOpen,
    setSearchId,
    fetchMemberMutation,
    submitMutation,
  };
};
