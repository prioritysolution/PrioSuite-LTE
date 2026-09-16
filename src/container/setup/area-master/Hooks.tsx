"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openModal as openModalAction,
  closeModal as closeModalAction,
  setSearchTerm as setSearchTermAction,
  resetState as resetStateAction,
  IArea,
} from "./AreaMasterReducer";
import {
  getAreaListAPI,
  addAreaAPI,
  updateAreaAPI,
  deleteAreaAPI,
  getApplicationOptionAPI,
} from "./AreaMasterApi";
import { getBranchListAPI } from "@/container/loan-reports/detailed-list/DetailedListApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";

export interface IAreaFormInput {
  area_name: string;
  area_desc: string;
  area_type: string | number | "";
  branch_id: string | number | "";
}

const AREA_TYPE_GROUP_ID = 18;

const extractOptionList = (res: any): any[] => {
  const candidates = [
    res?.details,
    res?.Data,
    res?.data?.details,
    res?.data?.Data,
    res?.data,
    res,
  ];

  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const getOptionDescription = (opt: any) =>
  opt?.Opt_Description ||
  opt?.Opt_Desc ||
  opt?.Option_Name ||
  opt?.Description ||
  "";

const matchAreaTypeOption = (
  options: any[],
  typeCode?: string | number | null,
) => {
  if (typeCode === undefined || typeCode === null || typeCode === "") {
    return undefined;
  }

  return options.find((opt: any) => {
    const keys = [
      opt?.Opt_Code,
      opt?.Id,
      opt?.id,
      opt?.Option_Id,
      opt?.Optn_Id,
    ];

    return keys.some(
      (key) =>
        key !== undefined &&
        key !== null &&
        key !== "" &&
        String(key) === String(typeCode),
    );
  });
};

const extractBranchList = (res: any): any[] => {
  const candidates = [
    res?.Data,
    res?.data?.Data,
    res?.details,
    res?.data?.details,
    res?.data,
    res,
  ];

  const list = candidates.find((item) => Array.isArray(item));
  return Array.isArray(list) ? list : [];
};

const areaSchema = yup.object().shape({
  area_name: yup.string().required("Area name is required"),
  area_type: yup
    .mixed<string | number>()
    .test(
      "required",
      "Area type is required",
      (value) => value !== "" && value !== null && value !== undefined,
    ),
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
  area_desc: yup.string().required("Area description is required"),
});

export const useAreaHook = () => {
  const { user, isMounted } = useGlobalContext();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.areaMaster);

  const [deleteTarget, setDeleteTarget] = useState<IArea | null>(null);

  useEffect(() => {
    return () => {
      dispatch(resetStateAction());
    };
  }, [dispatch]);

  const form = useForm<IAreaFormInput>({
    resolver: yupResolver(areaSchema) as any,
    defaultValues: {
      area_name: "",
      area_desc: "",
      area_type: "",
      branch_id: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = form;

  const { data: areaData, isLoading: queryLoading } = useQuery({
    queryKey: ["areaList", user?.org_id],
    queryFn: () =>
      getAreaListAPI(user?.org_id as number, user?.branch_id as number),
    enabled: !!user?.org_id,
  });

  const { data: areaTypeData, isLoading: areaTypeLoading } = useQuery({
    queryKey: ["areaTypeOption", AREA_TYPE_GROUP_ID],
    queryFn: () => getApplicationOptionAPI(AREA_TYPE_GROUP_ID),
    enabled: !!user?.org_id,
  });

  const { data: branchData, isLoading: branchLoading } = useQuery({
    queryKey: ["branchList", user?.org_id],
    queryFn: () => getBranchListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
  });

  const isLoading =
    !isMounted || queryLoading || areaTypeLoading || branchLoading;

  const rawData = areaData?.data?.Data || areaData?.Data || areaData;
  const tableData: IArea[] = Array.isArray(rawData) ? rawData : [];

  const areaTypeOptions = extractOptionList(areaTypeData);
  const branchOptions = extractBranchList(branchData);

  const getAreaTypeDescription = (item: IArea) => {
    if (item.Opt_Description) {
      return String(item.Opt_Description);
    }

    const typeCode = item.Area_Type ?? item.Area_Type_Id;
    const matched = matchAreaTypeOption(areaTypeOptions, typeCode);

    return getOptionDescription(matched) || String(typeCode ?? "");
  };

  const getBranchName = (item: IArea) => {
    if (item.Branch_Name) {
      return String(item.Branch_Name);
    }

    const branchId = item.Branch_Id ?? item.branch_id;
    if (branchId === undefined || branchId === null || branchId === ("" as any)) {
      return "";
    }

    const matched = branchOptions.find((opt: any) => {
      const keys = [opt?.Branch_Id, opt?.branch_id, opt?.Id, opt?.id];
      return keys.some(
        (key) =>
          key !== undefined &&
          key !== null &&
          key !== "" &&
          String(key) === String(branchId),
      );
    });

    return (
      matched?.Branch_Name ||
      matched?.branch_name ||
      matched?.Name ||
      ""
    );
  };

  const tableDataWithType = tableData.map((item: IArea) => ({
    ...item,
    Area_Type_Label: getAreaTypeDescription(item),
    Assign_Branch_Label: getBranchName(item),
  }));

  const filteredData = tableDataWithType?.filter(
    (item: IArea) =>
      item.Area_Name?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      item.Area_Desc?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
      String(item.Area_Type_Label ?? "")
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase()) ||
      String(item.Assign_Branch_Label ?? "")
        .toLowerCase()
        .includes(state.searchTerm.toLowerCase()),
  );

  const submitMutation = useMutation({
    mutationFn: async (data: IAreaFormInput) => {
      const payload = {
        area_name: data.area_name,
        area_desc: data.area_desc,
        area_type: data.area_type,
        branch_id: Number(data.branch_id),
        org_id: user?.org_id as number,
      };

      if (state.editId) {
        return await updateAreaAPI({ ...payload, area_id: state.editId });
      } else {
        return await addAreaAPI(payload);
      }
    },
    onSuccess: () => {
      toast.success(
        state.editId
          ? "Area updated successfully!"
          : "Area added successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["areaList"] });
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
    mutationFn: async (area: IArea) => {
      return await deleteAreaAPI({
        area_id: area.Area_Id,
        org_id: user?.org_id as number,
        branch_id:
          Number(area.Branch_Id ?? area.branch_id) ||
          (user?.branch_id as number),
      });
    },
    onSuccess: () => {
      toast.success("Area deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["areaList"] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete area. Please try again.",
      );
    },
  });

  const handleDelete = (area: IArea) => {
    setDeleteTarget(area);
  };

  const closeDeleteModal = () => {
    if (deleteMutation.isPending) return;
    setDeleteTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
  };

  const handleEdit = (area: IArea) => {
    dispatch(openModalAction(area));
    setValue("area_name", area.Area_Name);
    setValue("area_desc", area.Area_Desc);
    setValue(
      "branch_id",
      area.Branch_Id ?? area.branch_id ?? user?.branch_id ?? "",
    );

    const typeCode = area.Area_Type_Id ?? area.Area_Type;
    const matchedType =
      matchAreaTypeOption(areaTypeOptions, typeCode) ||
      areaTypeOptions.find(
        (opt: any) =>
          String(getOptionDescription(opt)).toLowerCase() ===
          String(area.Area_Type ?? area.Opt_Description ?? "").toLowerCase(),
      );

    setValue("area_type", matchedType?.Opt_Code ?? matchedType?.Id ?? "");
  };

  const openModal = () => {
    dispatch(openModalAction());
    reset({
      area_name: "",
      area_desc: "",
      area_type: "",
      branch_id: "",
    });
  };

  const closeModal = () => {
    dispatch(closeModalAction());
    reset({ area_name: "", area_desc: "", area_type: "", branch_id: "" });
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
    areaTypeOptions,
    areaTypeLoading,
    branchOptions,
    branchLoading,
    deleteTarget,
    deletePending: deleteMutation.isPending,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
  };
};
