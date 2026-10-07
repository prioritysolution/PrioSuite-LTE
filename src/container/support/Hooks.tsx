"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "sonner";
import { useGlobalContext } from "@/context/GlobalContext";
import { AppDispatch, RootState } from "@/redux/store";
import {
  openModal as openModalAction,
  closeModal as closeModalAction,
  setSearchTerm as setSearchTermAction,
  resetState as resetStateAction,
} from "./SupportReducer";
import { getSupportTicketsAPI, addSupportTicketAPI } from "./SupportApi";
import {
  ISupportFormInput,
  ISupportTicket,
  SUPPORT_MAX_FILES,
  SUPPORT_MAX_FILE_SIZE_MB,
} from "./SupportType";

const supportSchema = yup.object().shape({
  subject: yup
    .string()
    .trim()
    .required("Subject is required")
    .max(150, "Subject must be at most 150 characters"),
  issue: yup
    .string()
    .trim()
    .required("Issue is required")
    .min(10, "Please describe the issue in at least 10 characters"),
  priority: yup
    .string()
    .oneOf(["Low", "Medium", "High", "Urgent"], "Priority is required")
    .required("Priority is required"),
  attachments: yup
    .array()
    .max(SUPPORT_MAX_FILES, `You can attach up to ${SUPPORT_MAX_FILES} files`)
    .default([]),
});

const defaultValues: ISupportFormInput = {
  subject: "",
  issue: "",
  priority: "",
  attachments: [],
};

const pick = (row: Record<string, any>, keys: string[]) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
};

const normalizeTicket = (row: Record<string, any>, index: number): ISupportTicket => {
  const attachments = pick(row, ["attachments", "Attachments", "files", "Files"]);
  const attachmentCount = Array.isArray(attachments)
    ? attachments.length
    : Number(pick(row, ["attachment_count", "Attachment_Count"]) ?? 0);

  return {
    id: pick(row, ["Ticket_Id", "ticket_id", "id", "Id"]) ?? index,
    ticketNo: String(
      pick(row, ["Ticket_No", "ticket_no", "TicketNo", "Ticket_Id", "ticket_id", "id"]) ?? "-",
    ),
    subject: String(pick(row, ["Subject", "subject"]) ?? ""),
    issue: String(pick(row, ["Issue", "issue", "Description", "description"]) ?? ""),
    priority: String(pick(row, ["Priority", "priority"]) ?? ""),
    status: String(pick(row, ["Status", "status"]) ?? "Open"),
    attachmentCount: Number.isFinite(attachmentCount) ? attachmentCount : 0,
    createdAt: String(
      pick(row, ["Created_At", "created_at", "Created_On", "created_on", "Ticket_Date"]) ?? "",
    ),
  };
};

const fileKey = (file: File) => `${file.name}__${file.size}__${file.lastModified}`;

export const useSupportHook = () => {
  const { user, isMounted } = useGlobalContext();
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.support);

  useEffect(() => {
    return () => {
      dispatch(resetStateAction());
    };
  }, [dispatch]);

  const form = useForm<ISupportFormInput>({
    resolver: yupResolver(supportSchema) as any,
    defaultValues,
  });

  const { handleSubmit, reset, control, setValue, getValues } = form;

  const orgId = user?.org_id as number;
  const branchId = (user?.branch_id ?? 0) as number;

  const { data: ticketData, isLoading: queryLoading } = useQuery({
    queryKey: ["supportTickets", orgId, branchId],
    queryFn: () => getSupportTicketsAPI(orgId, branchId),
    enabled: !!orgId,
    retry: false,
  });

  const isLoading = !isMounted || queryLoading;

  const rawData =
    ticketData?.details ||
    ticketData?.data?.details ||
    ticketData?.data?.Data ||
    ticketData?.Data ||
    ticketData?.data ||
    [];

  const tickets: ISupportTicket[] = Array.isArray(rawData)
    ? rawData.map(normalizeTicket)
    : [];

  const search = state.searchTerm.trim().toLowerCase();
  const filteredData = search
    ? tickets.filter((t) =>
        [t.ticketNo, t.subject, t.issue, t.priority, t.status]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
    : tickets;

  const openCount = tickets.filter((t) => {
    const status = t.status.toLowerCase();
    return !status.includes("close") && !status.includes("resolve");
  }).length;

  const submitMutation = useMutation({
    mutationFn: async (data: ISupportFormInput) => {
      const payload = new FormData();
      payload.append("org_id", String(orgId));
      payload.append("branch_id", String(branchId));
      payload.append("subject", data.subject.trim());
      payload.append("issue", data.issue.trim());
      payload.append("priority", data.priority);
      data.attachments.forEach((file) => payload.append("attachments[]", file));
      return await addSupportTicketAPI(payload);
    },
    onSuccess: (res: any) => {
      const message = String(res?.message || res?.massage || "").trim();
      const normalizedMsg = message.toLowerCase();
      if (
        (normalizedMsg.includes("fail") || normalizedMsg.includes("error")) &&
        !normalizedMsg.includes("success")
      ) {
        toast.error(message || "Failed to raise support ticket.");
        return;
      }

      toast.success("Support ticket raised successfully!");
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to raise support ticket. Please try again.",
      );
    },
  });

  const onSubmit = handleSubmit((data) => {
    submitMutation.mutate(data);
  });

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming || incoming.length === 0) return;

    const current = getValues("attachments") ?? [];
    const existingKeys = new Set(current.map(fileKey));
    const maxBytes = SUPPORT_MAX_FILE_SIZE_MB * 1024 * 1024;
    const accepted: File[] = [];

    Array.from(incoming).forEach((file) => {
      if (existingKeys.has(fileKey(file))) return;
      if (file.size > maxBytes) {
        toast.error(`${file.name} exceeds ${SUPPORT_MAX_FILE_SIZE_MB} MB limit.`);
        return;
      }
      accepted.push(file);
    });

    const room = SUPPORT_MAX_FILES - current.length;
    if (accepted.length > room) {
      toast.error(`You can attach up to ${SUPPORT_MAX_FILES} files.`);
    }

    const next = [...current, ...accepted.slice(0, Math.max(room, 0))];
    setValue("attachments", next, { shouldValidate: true, shouldDirty: true });
  };

  const removeFile = (index: number) => {
    const current = getValues("attachments") ?? [];
    setValue(
      "attachments",
      current.filter((_, i) => i !== index),
      { shouldValidate: true, shouldDirty: true },
    );
  };

  const openModal = () => {
    reset(defaultValues);
    dispatch(openModalAction());
  };

  const closeModal = () => {
    if (submitMutation.isPending) return;
    dispatch(closeModalAction());
    reset(defaultValues);
  };

  const setSearchTerm = (term: string) => {
    dispatch(setSearchTermAction(term));
  };

  return {
    state,
    isLoading,
    filteredData,
    totalCount: tickets.length,
    openCount,
    control,
    form,
    submitPending: submitMutation.isPending,
    onSubmit,
    addFiles,
    removeFile,
    openModal,
    closeModal,
    setSearchTerm,
  };
};
