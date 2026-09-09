"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openModal as openModalAction,
  closeModal as closeModalAction,
  setSearchTerm as setSearchTermAction,
  IPurpose,
} from "./PurposeMasterReducer";
import {
  getLoanPurposeAPI,
  addLoanPurposeAPI,
  updateLoanPurposeAPI,
  deleteLoanPurposeAPI,
} from "./PurposeMasterApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";

export interface IPurposeFormInput {
  purpose: string;
}

const purposeSchema = yup.object().shape({
  purpose: yup
    .string()
    .trim()
    .required("Purpose is required")
    .min(1, "Purpose is required"),
});

const normalizePurposeName = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

export const usePurposeHook = () => {
  const { user, isMounted } = useGlobalContext();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.purposeMaster);

  const [deleteTarget, setDeleteTarget] = useState<IPurpose | null>(null);

  const form = useForm<IPurposeFormInput>({
    resolver: yupResolver(purposeSchema) as any,
    defaultValues: {
      purpose: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    control,
    formState: { errors },
  } = form;

  const { data: purposeData, isLoading: queryLoading } = useQuery({
    queryKey: ["purposeList", user?.org_id],
    queryFn: () => getLoanPurposeAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const isLoading = !isMounted || queryLoading;

  const rawData =
    purposeData?.details ||
    purposeData?.data?.details ||
    purposeData?.data?.Data ||
    purposeData?.Data ||
    [];

  const tableData: IPurpose[] = Array.isArray(rawData) ? rawData : [];

  const filteredData = tableData.filter((item: IPurpose) => {
    const purposeName = item.Purp_Desc || "";
    return purposeName.toLowerCase().includes(state.searchTerm.toLowerCase());
  });

  const isDuplicatePurpose = (purposeName: string, excludeId?: number | null) => {
    const normalized = normalizePurposeName(purposeName);
    if (!normalized) return false;

    return tableData.some((item) => {
      if (excludeId && item.Purp_Id === excludeId) return false;
      return normalizePurposeName(item.Purp_Desc || "") === normalized;
    });
  };

  const submitMutation = useMutation({
    mutationFn: async (data: IPurposeFormInput) => {
      const payload = {
        purpose: data.purpose.trim().replace(/\s+/g, " "),
        org_id: user?.org_id as number,
      };

      if (state.editId) {
        return await updateLoanPurposeAPI({
          ...payload,
          purpose_id: state.editId,
        });
      }

      return await addLoanPurposeAPI(payload);
    },
    onSuccess: (res: any) => {
      const message =
        res?.message || res?.massage || res?.details || res?.data?.message || "";
      const normalizedMsg = String(message).toLowerCase();
      const isFailure =
        normalizedMsg.includes("fail") ||
        normalizedMsg.includes("exist") ||
        normalizedMsg.includes("duplicate") ||
        normalizedMsg.includes("already");

      if (isFailure && !normalizedMsg.includes("success")) {
        toast.error(message || "Purpose name already exists.");
        setError("purpose", {
          type: "manual",
          message: "Purpose name already exists",
        });
        return;
      }

      toast.success(
        state.editId
          ? "Purpose updated successfully!"
          : "Purpose added successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["purposeList"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Operation failed. Please try again.",
      );
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (isDuplicatePurpose(data.purpose, state.editId)) {
      setError("purpose", {
        type: "manual",
        message: "Purpose name already exists",
      });
      toast.error("Purpose name already exists.");
      return;
    }

    submitMutation.mutate(data);
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: IPurpose) => {
      return await deleteLoanPurposeAPI({
        purpose_id: item.Purp_Id,
        org_id: user?.org_id as number,
      });
    },
    onSuccess: (res: any) => {
      const message =
        res?.message || res?.massage || res?.details || res?.data?.message || "";
      const normalizedMsg = String(message).toLowerCase();
      const isFailure =
        !!normalizedMsg &&
        (normalizedMsg.includes("fail") ||
          normalizedMsg.includes("error") ||
          normalizedMsg.includes("cannot") ||
          normalizedMsg.includes("unable"));

      if (isFailure && !normalizedMsg.includes("success")) {
        toast.error(message || "Failed to delete purpose. Please try again.");
        return;
      }

      toast.success("Purpose deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["purposeList"] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete purpose. Please try again.",
      );
    },
  });

  const handleDelete = (item: IPurpose) => {
    setDeleteTarget(item);
  };

  const closeDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const handleEdit = (item: IPurpose) => {
    if (item.Purp_Id) {
      dispatch(openModalAction(item));
      setValue("purpose", item.Purp_Desc || "");
    }
  };

  const openModal = () => {
    dispatch(openModalAction());
    reset({ purpose: "" });
  };

  const closeModal = () => {
    dispatch(closeModalAction());
    reset({ purpose: "" });
  };

  const setSearchTerm = (term: string) => {
    dispatch(setSearchTermAction(term));
  };

  return {
    state,
    isLoading,
    filteredData,
    register,
    control,
    errors,
    submitMutation,
    onSubmit,
    handleEdit,
    openModal,
    closeModal,
    setSearchTerm,
    form,
    deleteTarget,
    deletePending: deleteMutation.isPending,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
  };
};
