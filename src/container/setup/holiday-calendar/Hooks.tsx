"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openModal as openModalAction,
  closeModal as closeModalAction,
  setSearchTerm as setSearchTermAction,
  IHoliday,
} from "./HolidayCalendarReducer";
import {
  getHolidayListAPI,
  addHolidayAPI,
  updateHolidayAPI,
  deleteHolidayAPI,
} from "./HolidayCalendarApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";

export interface IHolidayFormInput {
  holiday_date: Date;
  purpose: string;
}

const holidaySchema = yup.object().shape({
  holiday_date: yup.date().required("Holiday date is required"),
  purpose: yup.string().required("Purpose is required"),
});

export const useHolidayHook = () => {
  const { user, isMounted } = useGlobalContext();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.holidayCalendar);

  const [deleteTarget, setDeleteTarget] = useState<IHoliday | null>(null);

  const form = useForm<IHolidayFormInput>({
    resolver: yupResolver(holidaySchema) as any,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = form;

  const { data: holidayData, isLoading: queryLoading } = useQuery({
    queryKey: ["holidayList", user?.org_id],
    queryFn: () => getHolidayListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const isLoading = !isMounted || queryLoading;

  const tableData: IHoliday[] =
    holidayData?.details ||
    holidayData?.data?.details ||
    holidayData?.data?.Data ||
    [];

  const filteredData = tableData?.filter(
    (item: IHoliday) =>
      item.Purpose?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      item.Holiday_Date?.includes(state.searchTerm),
  );

  const submitMutation = useMutation({
    mutationFn: async (data: IHolidayFormInput) => {
      const payload = {
        holiday_date: format(data.holiday_date, "yyyy-MM-dd"),
        purpose: data.purpose,
        org_id: user?.org_id as number,
      };

      if (state.editId) {
        return await updateHolidayAPI({ ...payload, holiday_id: state.editId });
      } else {
        return await addHolidayAPI(payload);
      }
    },
    onSuccess: () => {
      toast.success(
        state.editId
          ? "Holiday updated successfully!"
          : "Holiday added successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["holidayList"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Operation failed. Please try again.",
      );
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitMutation.mutate(data);
  });

  const deleteMutation = useMutation({
    mutationFn: async (holiday: IHoliday) => {
      return await deleteHolidayAPI({
        holiday_id: holiday.Id,
        org_id: user?.org_id as number,
      });
    },
    onSuccess: () => {
      toast.success("Holiday deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["holidayList"] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to delete holiday. Please try again.",
      );
    },
  });

  const handleDelete = (holiday: IHoliday) => {
    setDeleteTarget(holiday);
  };

  const closeDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const handleEdit = (holiday: IHoliday) => {
    dispatch(openModalAction(holiday));
    setValue("holiday_date", new Date(holiday.Holiday_Date));
    setValue("purpose", holiday.Purpose);
  };

  const openModal = () => {
    dispatch(openModalAction());
  };

  const closeModal = () => {
    dispatch(closeModalAction());
    reset({ holiday_date: undefined, purpose: "" });
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
