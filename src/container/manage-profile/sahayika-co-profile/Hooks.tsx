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
  resetFlow,
} from "./CoProfileReducer";
import { addCoAPI, updateCoAPI, getCoDataAPI } from "./CoProfileApi";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { toast } from "sonner";
import { ICoFormInput, ICoProfile } from "@/app/(dashboard)/manage-profile/sahayika-co-profile/types";
import {
  extractCoRecord,
  getCoAddress,
  getCoContactNo,
  getCoGuardianName,
  getCoPass,
  pickCoValue,
} from "./coProfileHelpers";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";

const emptyFormValues: ICoFormInput = {
  co_name: "",
  gurd_name: "",
  co_add: "",
  contact_no: "",
  co_pass: "",
};

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s.]{1,49}$/;

const coSchema = yup.object().shape({
  co_name: yup
    .string()
    .trim()
    .required("CO name is required")
    .matches(NAME_PATTERN, "CO name must contain letters only"),
  gurd_name: yup
    .string()
    .trim()
    .required("Guardian name is required")
    .matches(NAME_PATTERN, "Guardian name must contain letters only"),
  co_add: yup.string().nullable(),
  contact_no: yup
    .string()
    .required("Contact no is required")
    .matches(/^[6-9]\d{9}$/, "Contact no must be 10 digits and start with 6-9"),
  co_pass: yup
    .string()
    .nullable()
    .test(
      "pin",
      "Security pin must be up to 6 digits",
      (value) => !value || /^\d{1,6}$/.test(value),
    ),
});

export const useCoProfileHook = () => {
  const { user } = useGlobalContext();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.coProfile);

  const methods = useForm<ICoFormInput & { flowMode?: "add" | "update" }>({
    defaultValues: { ...emptyFormValues, flowMode: "add" },
    resolver: yupResolver(coSchema) as any,
  });

  const flowModeForm = methods.watch("flowMode");
  useEffect(() => {
    if (flowModeForm && flowModeForm !== state.flowMode) {
      dispatch(setFlowModeAction(flowModeForm));
    }
  }, [flowModeForm, state.flowMode, dispatch]);

  const mapCoToForm = (coData: any, fallback?: ICoProfile): ICoFormInput => ({
    co_id: Number(coData?.CO_Id ?? coData?.Co_Id ?? fallback?.CO_Id ?? 0) || undefined,
    co_code: pickCoValue(coData, ["CO_Code", "Co_Code", "co_code"]) || fallback?.CO_Code || "",
    co_name: pickCoValue(coData, ["CO_Name", "Co_Name", "co_name"]) || fallback?.CO_Name || "",
    gurd_name: getCoGuardianName(coData) || getCoGuardianName(fallback) || "",
    co_add: getCoAddress(coData) || getCoAddress(fallback) || "",
    contact_no: getCoContactNo(coData) || getCoContactNo(fallback) || "",
    co_pass: getCoPass(coData) || getCoPass(fallback) || "",
  });

  const handleCoSelect = async (coData: ICoProfile) => {
    let detail: any = coData;

    try {
      if (user?.org_id && (coData.CO_Id || coData.CO_Code)) {
        const response = await getCoDataAPI(
          user.org_id as number,
          user.branch_id as number,
          {
            co_id: coData.CO_Id || undefined,
            co_code: coData.CO_Code || undefined,
          },
        );
        const record = extractCoRecord(response, {
          co_id: coData.CO_Id,
          co_code: coData.CO_Code,
        });

        if (record) {
          detail = { ...coData, ...record };
        }
      }
    } catch {
      detail = coData;
    }

    const mappedData = {
      ...mapCoToForm(detail, coData),
      flowMode: "update" as const,
    };

    dispatch(setEditModeAction(true));
    dispatch(closeSearch());
    dispatch(showForm());
    methods.reset(mappedData);
    requestAnimationFrame(() => {
      methods.reset(mappedData);
    });
    toast.success("Profile loaded for editing.");
  };

  const submitMutation = useMutation({
    mutationFn: async (data: ICoFormInput) => {
      const address = data.co_add || "";
      const payload = {
        co_name: data.co_name,
        gurd_name: data.gurd_name,
        co_add: address,
        address,
        co_address: address,
        CO_Address: address,
        contact_no: data.contact_no,
        Coll_Pwd: data.co_pass || "",
        coll_pwd: data.co_pass || "",
        co_pass: data.co_pass || "",
        branch_id: user?.branch_id as number,
        org_id: user?.org_id as number,
        ...(data.co_code ? { co_code: data.co_code } : {}),
      };

      if (state.editMode && data.co_id) {
        return await updateCoAPI({ ...payload, co_id: data.co_id });
      } else {
        return await addCoAPI(payload);
      }
    },
    onSuccess: () => {
      toast.success(`CO Profile ${state.editMode ? "updated" : "added"} successfully!`);
      queryClient.invalidateQueries({ queryKey: ["coList"] });
      handleResetFlow();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Operation failed. Please try again.");
    },
  });

  const onSubmit: SubmitHandler<ICoFormInput> = (data) => submitMutation.mutate(data);

  const handleNextClick = () => {
    if (state.flowMode === "add") {
      dispatch(setEditModeAction(false));
      methods.reset({ ...emptyFormValues });
      dispatch(showForm());
    } else {
      dispatch(openSearch());
    }
  };

  const handleResetFlow = () => {
    dispatch(resetFlow());
    methods.reset({ ...emptyFormValues });
  };

  const setFlowMode = (mode: "add" | "update") => {
    dispatch(setFlowModeAction(mode));
  };

  const setIsSearchOpen = (open: boolean) => {
    dispatch(open ? openSearch() : closeSearch());
  };

  return {
    state,
    methods,
    onSubmit,
    handleCoSelect,
    handleNextClick,
    handleResetFlow,
    setFlowMode,
    setIsSearchOpen,
    submitPending: submitMutation.isPending,
  };
};
