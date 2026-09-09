"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalContext } from "@/context/GlobalContext";
import { IProfileFormInput } from "@/app/(dashboard)/profile/types";
import {
  getBranchListAPI,
  getProfileAPI,
  isHeadFlag,
  resolveBranchDetails,
  resolveSubBranchesFromProfile,
  updateProfileAPI,
  UpdateProfilePayload,
} from "./ProfileApi";

const profileSchema = yup.object({
  User_Name: yup
    .string()
    .trim()
    .required("Display name is required")
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be at most 60 characters"),
  org_name: yup.string().default(""),
  org_id: yup.string().default(""),
  branch_name: yup.string().default(""),
  branch_code: yup.string().default(""),
  branch_id: yup.string().default(""),
  branch_address: yup.string().default(""),
  branch_mobile: yup.string().default(""),
  branch_mail: yup
    .string()
    .default("")
    .test("email", "Enter a valid email", (value) => {
      if (!value || !String(value).trim()) return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
    }),
  is_head: yup.string().default(""),
  branch_status: yup.string().default(""),
  shg_inv: yup.string().default(""),
  user_status: yup.string().default(""),
  financialYear: yup.string().default(""),
});

const emptyProfileValues = (): IProfileFormInput => ({
  User_Name: "",
  org_name: "",
  org_id: "",
  branch_name: "",
  branch_code: "",
  branch_id: "",
  branch_address: "",
  branch_mobile: "",
  branch_mail: "",
  is_head: "",
  branch_status: "",
  shg_inv: "",
  user_status: "",
  financialYear: "",
});

const resolveStatus = (status: number | string | undefined | null) => {
  if (status === undefined || status === null || status === "") return null;
  const parsed = Number(status);
  return Number.isNaN(parsed) ? null : parsed;
};

const statusLabel = (status: number | string | undefined | null) => {
  const parsed = resolveStatus(status);
  if (parsed === 1) return "Active";
  if (parsed === 0) return "Inactive";
  if (typeof status === "string") {
    const normalized = status.trim().toLowerCase();
    if (normalized === "active") return "Active";
    if (normalized === "inactive") return "Inactive";
  }
  return parsed !== null ? String(parsed) : "";
};

const statusToNumber = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized === "active" || normalized === "1") return 1;
  if (normalized === "inactive" || normalized === "0") return 0;
  const parsed = Number(status);
  return Number.isNaN(parsed) ? 1 : parsed;
};

const headToNumber = (value: string) => (isHeadFlag(value) ? 1 : 0);

const prefer = (
  sessionVal: string | undefined | null,
  apiVal: string | undefined | null,
) => {
  if (sessionVal !== undefined && sessionVal !== null) return String(sessionVal);
  return apiVal ? String(apiVal) : "";
};

const isApiSuccess = (res: any) => {
  const message = String(res?.message || res?.massage || res?.data?.message || "");
  if (!message) return true;
  if (
    /error|fail|invalid/i.test(message) &&
    !/success|updated|saved|data found/i.test(message)
  ) {
    return false;
  }
  return true;
};

const buildUpdatePayload = (
  data: IProfileFormInput,
  orgId: number,
  branchId: number,
): UpdateProfilePayload => {
  const userName = data.User_Name.trim();
  const orgName = data.org_name.trim();
  const branchName = data.branch_name.trim();
  const branchAddress = data.branch_address.trim();
  const branchMobile = data.branch_mobile.trim();
  const branchMail = data.branch_mail.trim();
  const branchCode = data.branch_code.trim();
  const shgInv = data.shg_inv.trim();
  const isHead = headToNumber(data.is_head);
  const branchActive = statusToNumber(data.branch_status);
  const userStatus = statusToNumber(data.user_status);

  return {
    org_id: orgId,
    branch_id: branchId,
    User_Name: userName,
    user_name: userName,
    org_name: orgName,
    Org_Name: orgName,
    branch_name: branchName,
    Branch_Name: branchName,
    branch_code: branchCode,
    Branch_Code: branchCode,
    branch_address: branchAddress,
    Branch_Address: branchAddress,
    branch_mobile: branchMobile,
    Branch_Mobile: branchMobile,
    branch_mail: branchMail,
    Branch_Mail: branchMail,
    is_head: isHead,
    Is_Head: isHead,
    branch_status: branchActive,
    Is_Active: branchActive,
    user_status: userStatus,
    Status: userStatus,
    shg_inv: shgInv,
  };
};

export const useProfileHook = () => {
  const {
    user,
    financialYearLabel,
    isMounted,
    updateUser,
    updateFinancialYearLabel,
    logout,
  } = useGlobalContext();
  const queryClient = useQueryClient();

  const methods = useForm<IProfileFormInput>({
    resolver: yupResolver(profileSchema) as never,
    defaultValues: emptyProfileValues(),
  });

  const { reset, handleSubmit, formState, watch } = methods;
  const { isDirty } = formState;
  const watchedIsHead = watch("is_head");

  const orgId = user?.org_id ? Number(user.org_id) : 0;
  const branchId = user?.branch_id ? Number(user.branch_id) : 0;

  const { data: branchPayload } = useQuery({
    queryKey: ["profile-branch-list", orgId, branchId],
    queryFn: async () => {
      const res = await getBranchListAPI(orgId);
      return {
        details: resolveBranchDetails(res, branchId),
      };
    },
    enabled: Boolean(orgId && branchId),
    staleTime: 5 * 60 * 1000,
  });

  const branchDetails = branchPayload?.details ?? null;

  const isHeadUser = useMemo(() => {
    return (
      isHeadFlag(watchedIsHead) ||
      isHeadFlag(user?.is_head) ||
      isHeadFlag(branchDetails?.is_head)
    );
  }, [watchedIsHead, user?.is_head, branchDetails?.is_head]);

  const { data: profileSubBranches = [] } = useQuery({
    queryKey: ["profile-get-profile", orgId, branchId],
    queryFn: async () => {
      const res = await getProfileAPI();
      return resolveSubBranchesFromProfile(res);
    },
    enabled: Boolean(orgId && branchId && isHeadUser),
    staleTime: 5 * 60 * 1000,
  });

  const subBranches = useMemo(() => {
    if (!isHeadUser) return [];
    return profileSubBranches;
  }, [isHeadUser, profileSubBranches]);

  const buildValues = (): IProfileFormInput => {
    if (!user) return emptyProfileValues();
    return {
      User_Name: user.User_Name || "",
      org_name: user.org_name || "",
      org_id: user.org_id ? String(user.org_id) : "",
      branch_name: user.branch_name || branchDetails?.branch_name || "",
      branch_code: user.branch_code || branchDetails?.branch_code || "",
      branch_id: user.branch_id
        ? String(user.branch_id)
        : branchDetails?.branch_id || "",
      branch_address: prefer(user.branch_address, branchDetails?.branch_address),
      branch_mobile: prefer(user.branch_mobile, branchDetails?.branch_mobile),
      branch_mail: prefer(user.branch_mail, branchDetails?.branch_mail),
      is_head: (() => {
        const raw = prefer(user.is_head, branchDetails?.is_head);
        if (isHeadFlag(raw)) return "Yes";
        if (
          raw === "0" ||
          String(raw).trim().toLowerCase() === "no" ||
          String(raw).trim().toLowerCase() === "n"
        ) {
          return "No";
        }
        return raw || "";
      })(),
      branch_status: prefer(user.branch_status, branchDetails?.is_active),
      shg_inv: user.shg_inv || "",
      user_status: statusLabel(user.user_status),
      financialYear: financialYearLabel || "",
    };
  };

  useEffect(() => {
    if (!user || isDirty) return;
    reset(buildValues());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seed only when source data changes and form is clean
  }, [user, financialYearLabel, branchDetails, reset, isDirty]);

  const updateMutation = useMutation({
    mutationKey: ["profile", "update"],
    mutationFn: async (data: IProfileFormInput) => {
      if (!user || !orgId || !branchId) {
        throw new Error("No active session found.");
      }
      const payload = buildUpdatePayload(data, orgId, branchId);
      const res = await updateProfileAPI(payload);
      if (!isApiSuccess(res)) {
        throw new Error(
          String(res?.message || res?.massage || "Failed to update profile."),
        );
      }
      return { res, data };
    },
    onSuccess: ({ data }) => {
      updateUser({
        User_Name: data.User_Name.trim(),
        org_name: data.org_name.trim(),
        org_id: Number(data.org_id) || user?.org_id,
        branch_name: data.branch_name.trim(),
        branch_code: data.branch_code.trim(),
        branch_id: Number(data.branch_id) || user?.branch_id,
        shg_inv: data.shg_inv.trim(),
        user_status: statusToNumber(data.user_status),
        branch_address: data.branch_address.trim(),
        branch_mobile: data.branch_mobile.trim(),
        branch_mail: data.branch_mail.trim(),
        is_head: data.is_head.trim(),
        branch_status: data.branch_status.trim(),
      });

      if (data.financialYear.trim() !== (financialYearLabel || "")) {
        updateFinancialYearLabel(data.financialYear.trim());
      }

      reset({
        ...data,
        User_Name: data.User_Name.trim(),
        org_name: data.org_name.trim(),
        branch_name: data.branch_name.trim(),
        branch_code: data.branch_code.trim(),
        branch_address: data.branch_address.trim(),
        branch_mobile: data.branch_mobile.trim(),
        branch_mail: data.branch_mail.trim(),
        is_head: data.is_head.trim(),
        branch_status: data.branch_status.trim(),
        shg_inv: data.shg_inv.trim(),
        user_status: statusLabel(statusToNumber(data.user_status)),
        financialYear: data.financialYear.trim(),
      });

      queryClient.invalidateQueries({ queryKey: ["profile-get-profile"] });
      queryClient.invalidateQueries({ queryKey: ["profile-branch-list"] });
      toast.success("Profile updated successfully.");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again.",
      );
    },
  });

  const onSubmit = handleSubmit((data) => {
    updateMutation.mutate(data);
  });

  const handleReset = () => {
    if (!user) return;
    reset(buildValues());
    toast.message("Form reset to current profile.");
  };

  return {
    methods,
    onSubmit,
    handleReset,
    handleLogout: logout,
    user,
    isMounted,
    isDirty,
    isSubmitting: updateMutation.isPending || formState.isSubmitting,
    isActive: resolveStatus(user?.user_status) === 1,
    isHeadUser,
    subBranches,
  };
};
