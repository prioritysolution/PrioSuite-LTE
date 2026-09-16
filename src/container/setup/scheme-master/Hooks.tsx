"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  openModal as openModalAction,
  closeModal as closeModalAction,
  setSearchTerm as setSearchTermAction,
  resetState as resetStateAction,
  IScheme,
} from "./SchemeMasterReducer";
import {
  getSchemeListAPI,
  addSchemeAPI,
  updateSchemeAPI,
  deleteSchemeAPI,
  getApplicationOptionAPI,
  getLedgerListAPI,
} from "./SchemeMasterApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { AppDispatch, RootState } from "@/redux/store";

export interface ISchemeFormInput {
  scheme_name: string;
  roi: number | "";
  repay_mode: number | string | "";
  repay_period: number | "";
  sanction_limit: number | "";
  roi_od: number | "";
  instl_amt_1000: number | "";
  prn_ledger: number | string | "";
  intt_ledger: number | string | "";
}

const REPAY_MODE_GROUP_ID = 9;

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

const extractSchemeList = (res: any): IScheme[] => {
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

const schemeSchema = yup.object().shape({
  scheme_name: yup
    .string()
    .trim()
    .required("Scheme name is required")
    .min(1, "Scheme name is required"),
  roi: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("ROI is required")
    .min(0, "ROI must be 0 or greater"),
  repay_mode: yup
    .mixed<string | number>()
    .test(
      "required",
      "Repay mode is required",
      (value) => value !== "" && value !== null && value !== undefined,
    ),
  repay_period: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Repay period is required")
    .min(1, "Repay period must be at least 1"),
  sanction_limit: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Sanction limit is required")
    .min(0, "Sanction limit must be 0 or greater"),
  roi_od: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("ROI OD is required")
    .min(0, "ROI OD must be 0 or greater"),
  instl_amt_1000: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .required("Installment Amt / 1000 is required")
    .min(0, "Installment Amt / 1000 must be 0 or greater"),
  prn_ledger: yup
    .mixed<string | number>()
    .test(
      "required",
      "Principal ledger is required",
      (value) => value !== "" && value !== null && value !== undefined,
    ),
  intt_ledger: yup
    .mixed<string | number>()
    .test(
      "required",
      "Interest ledger is required",
      (value) => value !== "" && value !== null && value !== undefined,
    ),
});

const emptyFormValues: ISchemeFormInput = {
  scheme_name: "",
  roi: "",
  repay_mode: "",
  repay_period: "",
  sanction_limit: "",
  roi_od: "",
  instl_amt_1000: "",
  prn_ledger: "",
  intt_ledger: "",
};

const pickFirst = (...values: unknown[]) => {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
};

const normalizeName = (value: string) =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

export const useSchemeHook = () => {
  const { user, isMounted } = useGlobalContext();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.schemeMaster);

  const [deleteTarget, setDeleteTarget] = useState<IScheme | null>(null);

  useEffect(() => {
    return () => {
      dispatch(resetStateAction());
    };
  }, [dispatch]);

  const form = useForm<ISchemeFormInput>({
    resolver: yupResolver(schemeSchema) as any,
    defaultValues: emptyFormValues,
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

  const { data: schemeData, isLoading: queryLoading } = useQuery({
    queryKey: ["schemeList", user?.org_id],
    queryFn: () => getSchemeListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: repayModeData, isLoading: repayModeLoading } = useQuery({
    queryKey: ["repayModeOption", REPAY_MODE_GROUP_ID],
    queryFn: () => getApplicationOptionAPI(REPAY_MODE_GROUP_ID),
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ["schemeLedgerList", user?.org_id],
    queryFn: () => getLedgerListAPI(user?.org_id as number),
    enabled: !!user?.org_id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isLoading = !isMounted || queryLoading;

  const tableData = extractSchemeList(schemeData);

  const filteredData = tableData.filter((item) => {
    const name = item.Scheme_Name || "";
    const repay = item.Repay_Name || "";
    const term = state.searchTerm.toLowerCase();
    return (
      name.toLowerCase().includes(term) || repay.toLowerCase().includes(term)
    );
  });

  const repayModeOptions = useMemo(() => {
    const fromApi = extractOptionList(repayModeData)
      .filter((opt: any) => {
        const groupId = opt?.Opt_Grp_Id ?? opt?.opt_grp_id ?? opt?.Group_Id;
        if (groupId === undefined || groupId === null || groupId === "") {
          return true;
        }
        return Number(groupId) === REPAY_MODE_GROUP_ID;
      })
      .map((opt: any) => ({
        ...opt,
        Option_Name:
          opt.Option_Name ||
          opt.Opt_Description ||
          opt.Opt_Desc ||
          opt.Description ||
          "",
        Opt_Code: opt.Opt_Code ?? opt.Id ?? opt.id ?? opt.Optn_Id,
      }))
      .filter(
        (opt: any) =>
          opt.Opt_Code !== undefined &&
          opt.Opt_Code !== null &&
          opt.Opt_Code !== "" &&
          String(opt.Option_Name).trim() !== "",
      );

    if (fromApi.length > 0) return fromApi;

    const map = new Map<string, any>();
    tableData.forEach((item) => {
      if (item.Repay_Mode === undefined || item.Repay_Mode === null) return;
      const key = String(item.Repay_Mode);
      if (!map.has(key)) {
        map.set(key, {
          Opt_Code: item.Repay_Mode,
          Option_Name: item.Repay_Name || `Mode ${item.Repay_Mode}`,
        });
      }
    });
    return Array.from(map.values());
  }, [repayModeData, tableData]);

  const ledgerOptions = useMemo(() => {
    return extractOptionList(ledgerData)
      .map((item: any) => {
        const id =
          item.Account_Id ??
          item.Acc_Id ??
          item.Gl_Id ??
          item.GL_Id ??
          item.Ledger_Id ??
          item.Id;
        const name =
          item.Ledger_Name ||
          item.Acc_Name ||
          item.Gl_Name ||
          item.GL_Name ||
          item.Account_Name ||
          "";
        const code =
          item.Acc_Code || item.Gl_Code || item.GL_Code || item.Ledger_Code || "";
        return {
          ...item,
          Account_Id: id,
          Ledger_Name: [code, name].filter(Boolean).join(" - ") || String(id ?? ""),
        };
      })
      .filter(
        (item: any) =>
          item.Account_Id !== undefined &&
          item.Account_Id !== null &&
          item.Account_Id !== "" &&
          String(item.Ledger_Name).trim() !== "",
      );
  }, [ledgerData]);

  const isDuplicateScheme = (
    schemeName: string,
    excludeId?: number | null,
  ) => {
    const normalized = normalizeName(schemeName);
    if (!normalized) return false;

    return tableData.some((item) => {
      if (excludeId && item.Scheme_Id === excludeId) return false;
      return normalizeName(item.Scheme_Name || "") === normalized;
    });
  };

  const submitMutation = useMutation({
    mutationFn: async (data: ISchemeFormInput) => {
      const payload = {
        scheme_name: String(data.scheme_name).trim().replace(/\s+/g, " "),
        roi: Number(data.roi),
        repay_mode: Number(data.repay_mode),
        repay_period: Number(data.repay_period),
        sanction_limit: Number(data.sanction_limit),
        roi_od: Number(data.roi_od),
        instl_amt_1000: Number(data.instl_amt_1000),
        prn_ledger: Number(data.prn_ledger),
        intt_ledger: Number(data.intt_ledger),
        org_id: user?.org_id as number,
      };

      if (state.editId) {
        return await updateSchemeAPI({
          ...payload,
          scheme_id: state.editId,
        });
      }

      return await addSchemeAPI(payload);
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
        toast.error(message || "Scheme name already exists.");
        setError("scheme_name", {
          type: "manual",
          message: "Scheme name already exists",
        });
        return;
      }

      toast.success(
        state.editId
          ? "Scheme updated successfully!"
          : "Scheme added successfully!",
      );
      queryClient.invalidateQueries({ queryKey: ["schemeList"] });
      closeModal();
    },
    onError: (error: any) => {
      const details = error?.response?.data?.details;
      const detailMsg =
        details && typeof details === "object"
          ? Object.values(details)
              .flat()
              .filter(Boolean)
              .join(" ")
          : "";
      toast.error(
        detailMsg ||
          error?.response?.data?.message ||
          error?.message ||
          "Operation failed. Please try again.",
      );
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (isDuplicateScheme(String(data.scheme_name), state.editId)) {
      setError("scheme_name", {
        type: "manual",
        message: "Scheme name already exists",
      });
      toast.error("Scheme name already exists.");
      return;
    }

    submitMutation.mutate(data);
  });

  const deleteMutation = useMutation({
    mutationFn: async (item: IScheme) => {
      return await deleteSchemeAPI({
        scheme_id: item.Scheme_Id,
        org_id: user?.org_id as number,
      });
    },
    onSuccess: (res: any) => {
      const message = String(res?.message || res?.massage || "").trim();
      const details = String(res?.details || "").trim();
      const combined = `${message} ${details}`.toLowerCase();
      const isFailure =
        message.toLowerCase() === "error found" ||
        combined.includes("cannot") ||
        combined.includes("fail") ||
        combined.includes("unable") ||
        (combined.includes("error") && !combined.includes("success"));

      if (isFailure) {
        toast.error(
          details || message || "Failed to delete scheme. Please try again.",
        );
        return;
      }

      toast.success("Scheme deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["schemeList"] });
      setDeleteTarget(null);
    },
    onError: (error: any) => {
      const data = error?.response?.data;
      toast.error(
        data?.details ||
          data?.message ||
          error?.message ||
          "Failed to delete scheme. Please try again.",
      );
    },
  });

  const handleDelete = (item: IScheme) => {
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

  const handleEdit = (item: IScheme) => {
    if (!item.Scheme_Id) return;
    dispatch(openModalAction(item));
    setValue("scheme_name", item.Scheme_Name || "");
    setValue("roi", item.RoI === "" || item.RoI == null ? "" : Number(item.RoI));
    setValue(
      "repay_mode",
      item.Repay_Mode === undefined || item.Repay_Mode === null
        ? ""
        : item.Repay_Mode,
    );
    const repayPeriod =
      (item as any).Repay_Period ??
      (item as any).repay_period ??
      (item as any).RepayPeriod ??
      "";
    setValue(
      "repay_period",
      repayPeriod === "" || repayPeriod == null ? "" : Number(repayPeriod),
    );
    setValue(
      "sanction_limit",
      item.Sanction_Limit === "" || item.Sanction_Limit == null
        ? ""
        : Number(item.Sanction_Limit),
    );

    const roiOd = pickFirst(
      item.RoI_OD,
      (item as any).roi_od,
      (item as any).Roi_Od,
    );
    setValue("roi_od", roiOd === "" ? "" : Number(roiOd));

    const instlAmt = pickFirst(
      item.InstlAmt_1000,
      (item as any).instl_amt_1000,
      (item as any).Instl_Amt_1000,
    );
    setValue("instl_amt_1000", instlAmt === "" ? "" : Number(instlAmt));

    const prnLedger = pickFirst(
      item.Prn_Ledger,
      (item as any).prn_ledger,
      (item as any).PrnLedger,
    );
    setValue(
      "prn_ledger",
      prnLedger === "" ? "" : (prnLedger as number | string),
    );

    const inttLedger = pickFirst(
      item.Intt_Ledger,
      (item as any).intt_ledger,
      (item as any).InttLedger,
    );
    setValue(
      "intt_ledger",
      inttLedger === "" ? "" : (inttLedger as number | string),
    );
  };

  const openModal = () => {
    dispatch(openModalAction());
    reset(emptyFormValues);
  };

  const closeModal = () => {
    dispatch(closeModalAction());
    reset(emptyFormValues);
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
    repayModeOptions,
    repayModeLoading,
    ledgerOptions,
    ledgerLoading,
    deleteTarget,
    deletePending: deleteMutation.isPending,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
  };
};
