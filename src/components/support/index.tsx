"use client";

import React, { useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Control, FormProvider, UseFormReturn, useWatch } from "react-hook-form";
import { MdOutlineSupportAgent } from "react-icons/md";
import {
  Plus,
  Search,
  X,
  Loader2,
  Send,
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Ticket,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import InputField from "@/common/formFields/InputField";
import TextareaField from "@/common/formFields/TextareaField";
import DropdownField from "@/common/formFields/DropdownField";
import { cn } from "@/lib/utils";
import {
  ISupportFormInput,
  ISupportTicket,
  SUPPORT_ACCEPTED_FILE_TYPES,
  SUPPORT_MAX_FILES,
  SUPPORT_MAX_FILE_SIZE_MB,
  SUPPORT_PRIORITY_OPTIONS,
} from "@/container/support/SupportType";

interface SupportUIProps {
  state: {
    isModalOpen: boolean;
    searchTerm: string;
  };
  isLoading: boolean;
  filteredData: ISupportTicket[];
  totalCount: number;
  openCount: number;
  control: Control<ISupportFormInput>;
  form: UseFormReturn<ISupportFormInput>;
  submitPending: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  addFiles: (files: FileList | File[] | null) => void;
  removeFile: (index: number) => void;
  openModal: () => void;
  closeModal: () => void;
  setSearchTerm: (term: string) => void;
}

const priorityStyles: Record<string, string> = {
  low: "bg-slate-100 text-slate-700 border-slate-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  urgent: "bg-red-50 text-red-700 border-red-200",
};

const statusStyle = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("resolve") || s.includes("close"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("progress")) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-primary/5 text-primary border-primary/20";
};

const formatDate = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Pill = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
      className,
    )}
  >
    {children}
  </span>
);

export const SupportUI: React.FC<SupportUIProps> = ({
  state,
  isLoading,
  filteredData,
  totalCount,
  openCount,
  control,
  form,
  submitPending,
  onSubmit,
  addFiles,
  removeFile,
  openModal,
  closeModal,
  setSearchTerm,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const attachments = useWatch({ control, name: "attachments" }) ?? [];
  const attachmentError = form.formState.errors.attachments?.message as
    | string
    | undefined;
  const canAddMore = attachments.length < SUPPORT_MAX_FILES;

  const columns: ColumnDef<ISupportTicket>[] = [
    {
      id: "sl",
      header: "Sl",
      cell: ({ row }) => (
        <span className="text-gray-600 font-semibold px-1">{row.index + 1}</span>
      ),
    },
    {
      id: "ticketNo",
      header: "Ticket No",
      cell: ({ row }) => (
        <span className="font-semibold text-primary whitespace-nowrap">
          #{row.original.ticketNo}
        </span>
      ),
    },
    {
      id: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <div className="min-w-[200px] max-w-[420px]">
          <p className="font-semibold text-gray-800 truncate">
            {row.original.subject || "-"}
          </p>
          {row.original.issue ? (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {row.original.issue}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const priority = row.original.priority;
        if (!priority) return <span className="text-gray-400">-</span>;
        return (
          <Pill
            className={
              priorityStyles[priority.toLowerCase()] ?? priorityStyles.low
            }
          >
            {priority}
          </Pill>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Pill className={statusStyle(row.original.status)}>
          {row.original.status}
        </Pill>
      ),
    },
    {
      id: "attachments",
      header: "Files",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 text-gray-600 text-sm">
          <Paperclip size={14} />
          {row.original.attachmentCount}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Raised On",
      cell: ({ row }) => (
        <span className="text-gray-600 whitespace-nowrap">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
  ];

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!canAddMore) return;
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

        <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <MdOutlineSupportAgent size={28} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
              Support
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Raise and track support tickets with our team
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="font-semibold text-gray-800">
                {totalCount} {totalCount === 1 ? "ticket" : "tickets"}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">{openCount} open</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full xl:w-auto pl-2 xl:pl-0">
          <div className="relative w-full sm:w-[260px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={17}
            />
            <Input
              placeholder="Search tickets..."
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 h-11 bg-slate-50 border-0 shadow-none focus-visible:ring-0 focus-visible:border-0 w-full font-medium"
            />
            {state.searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={17} />
              </button>
            ) : null}
          </div>

          <Button
            onClick={openModal}
            className="bg-primary hover:bg-primary/90 h-11 px-5 font-semibold rounded-lg text-white shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            Add Support
          </Button>
        </div>
      </div>

      <Dialog
        open={state.isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0 max-h-[92vh] flex flex-col">
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <MdOutlineSupportAgent size={22} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                  Raise Support Ticket
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                  Describe your issue and our team will get back to you.
                </DialogDescription>
              </div>
            </div>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={onSubmit}
              className="p-5 sm:p-6 space-y-5 bg-white overflow-y-auto"
              autoComplete="off"
            >
              <InputField
                control={control}
                name="subject"
                label="Subject"
                placeholder="Short summary of the issue"
                isRequired
                maxLength={150}
              />

              <TextareaField
                control={control}
                name="issue"
                label="Issue"
                placeholder="Describe the issue in detail — steps to reproduce, what you expected, and what happened"
                rows={5}
                isRequired
              />

              <DropdownField
                control={control}
                name="priority"
                label="Priority"
                options={SUPPORT_PRIORITY_OPTIONS}
                optionLabelKey="label"
                optionValueKey="value"
                placeholder="Select priority"
                disableSorting
                isRequired
              />

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Attach File
                  </span>
                  <span className="text-xs text-gray-500">
                    {attachments.length}/{SUPPORT_MAX_FILES} files
                  </span>
                </div>

                <div
                  role="button"
                  tabIndex={canAddMore ? 0 : -1}
                  aria-disabled={!canAddMore}
                  onClick={() => canAddMore && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (canAddMore && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (canAddMore) setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors outline-none",
                    "focus-visible:ring-2 focus-visible:ring-ring",
                    !canAddMore
                      ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
                      : isDragging
                        ? "cursor-pointer border-primary bg-primary/5"
                        : "cursor-pointer border-gray-200 bg-slate-50/60 hover:border-primary/50 hover:bg-primary/5",
                    attachmentError && "border-destructive",
                  )}
                >
                  <UploadCloud className="text-primary" size={26} />
                  <p className="text-sm font-semibold text-gray-700">
                    {canAddMore
                      ? "Click to upload or drag & drop"
                      : "Maximum files attached"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Images, PDF, Word, Excel or TXT · up to{" "}
                    {SUPPORT_MAX_FILE_SIZE_MB} MB each
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={SUPPORT_ACCEPTED_FILE_TYPES}
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {attachments.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {attachments.map((file, index) => {
                      const isImage = file.type.startsWith("image/");
                      return (
                        <li
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-xs"
                        >
                          <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                            onClick={() => removeFile(index)}
                            aria-label={`Remove ${file.name}`}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {attachmentError ? (
                  <p className="text-xs text-destructive">{attachmentError}</p>
                ) : null}
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                  onClick={closeModal}
                  disabled={submitPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitPending}
                  className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]"
                >
                  {submitPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                  Submit Ticket
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <div className="page-body-card">
        <div className="form-sections">
          <section className="form-section">
            <div className="form-section-title">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Ticket size={14} />
              </div>
              <h3 className="font-bold text-primary text-base">
                Support Tickets
              </h3>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50">
                <div className="flex flex-col items-center gap-3 text-primary">
                  <Loader2 className="animate-spin" size={36} />
                  <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
                    Fetching Tickets...
                  </span>
                </div>
              </div>
            ) : (
              <DataTable columns={columns} data={filteredData} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
