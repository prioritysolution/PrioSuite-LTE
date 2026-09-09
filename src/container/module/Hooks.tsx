"use client"

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStart,
  fetchSuccess,
  fetchFailure,
  addItem,
} from "./ModuleReducer";
import { fetchItemsAPI, createItemAPI } from "./ModuleApi";
import { toast } from "sonner"; // using existing project logger/toast
import { AppDispatch, RootState } from "@/redux/store";

export const useModuleHook = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.module);

  const fetchItems = useCallback(async (orgId: number, branchId: number) => {
    dispatch(fetchStart());
    try {
      const data = await fetchItemsAPI(orgId, branchId);
      if (data && data.success) {
        dispatch(fetchSuccess(data.details || data.data || []));
      } else {
        dispatch(fetchFailure(data?.message || "Failed to fetch"));
        toast.error(data?.message || "Failed to fetch data");
      }
    } catch (error: any) {
      dispatch(fetchFailure(error.message));
      toast.error(error.message || "An error occurred");
    }
  }, [dispatch]);

  const createItem = useCallback(async (payload: any) => {
    try {
      const result = await createItemAPI(payload);
      if (result) {
        dispatch(addItem(result));
        toast.success("Item created successfully");
        return result;
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create item");
    }
    return null;
  }, [dispatch]);

  return {
    state,
    fetchItems,
    createItem,
  };
};
