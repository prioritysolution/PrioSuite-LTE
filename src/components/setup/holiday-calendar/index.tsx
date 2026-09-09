"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  CalendarDays,
  Search,
  Save,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { IHoliday } from "@/container/setup/holiday-calendar/HolidayCalendarReducer";
import {
  Control,
  FieldErrors,
  UseFormRegister,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";
import { IHolidayFormInput } from "@/container/setup/holiday-calendar/Hooks";
import InputField from "@/common/formFields/InputField";
import { DatePicker } from "@/common/formFields/DatePicker";

interface HolidayUIProps {
  state: {
    isModalOpen: boolean;
    editId: number | null;
    searchTerm: string;
  };
  isLoading: boolean;
  filteredData: IHoliday[];
  register: UseFormRegister<IHolidayFormInput>;
  control: Control<IHolidayFormInput>;
  errors: FieldErrors<IHolidayFormInput>;
  submitPending: boolean;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleEdit: (holiday: IHoliday) => void;
  openModal: () => void;
  closeModal: () => void;
  setSearchTerm: (term: string) => void;
  form: UseFormReturn<IHolidayFormInput>;
  deleteTarget: IHoliday | null;
  deletePending: boolean;
  handleDelete: (holiday: IHoliday) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
}

export const HolidayUI: React.FC<HolidayUIProps> = ({
  state,
  isLoading,
  filteredData,
  control,
  submitPending,
  onSubmit,
  handleEdit,
  openModal,
  closeModal,
  setSearchTerm,
  form,
  deleteTarget,
  deletePending,
  handleDelete,
  closeDeleteModal,
  confirmDelete,
}) => {
  const columns: ColumnDef<IHoliday>[] = [
    {
      id: "sl",
      header: "Sl",
      cell: ({ row }) => (
        <span className="text-gray-600 font-semibold px-1">
          {row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: "Holiday_Date",
      header: "Holiday Date",
      cell: ({ row }) => {
        const rawDate = row.getValue("Holiday_Date") as string;
        const displayDate = rawDate
          ? format(new Date(rawDate), "dd MMM, yyyy")
          : "N/A";
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <CalendarDays size={14} />
            </div>
            <span className="font-semibold text-primary tracking-wide">
              {displayDate}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "Purpose",
      header: "Purpose / Occasion",
      cell: ({ row }) => (
        <span className="text-gray-700 text-[13.5px] font-medium">
          {row.getValue("Purpose")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Action</div>,
      cell: ({ row }) => {
        const holiday = row.original;
        return (
          <div className="flex items-center justify-end gap-1 pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 transition-all rounded-md"
              onClick={() => handleEdit(holiday)}
            >
              <Edit size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
              onClick={() => handleDelete(holiday)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

        <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <CalendarDays size={24} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
              Holiday Calendar
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Manage institutional holidays and off-days
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="font-semibold text-gray-800">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "holiday" : "holidays"}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">Branch calendar setup</span>
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
              placeholder="Search date or occasion..."
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9 h-11 bg-slate-50 border-gray-200 focus-visible:ring-primary focus-visible:border-primary w-full font-medium"
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
            Add Holiday
          </Button>
        </div>
      </div>

      <Dialog
        open={state.isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0">
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <CalendarDays size={18} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                  {state.editId ? "Update Holiday" : "Add New Holiday"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                  {state.editId
                    ? "Modify the holiday details below."
                    : "Enter the date and purpose for the new holiday."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={onSubmit}
              className="p-5 sm:p-6 form-sections bg-white"
            >
              <section className="form-section">
                <div className="form-section-title">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarDays size={14} />
                  </div>
                  <h3 className="font-bold text-primary text-base">
                    Holiday Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  <DatePicker
                    control={control}
                    name="holiday_date"
                    label="Holiday Date"
                    isRequired={true}
                  />

                  <InputField
                    control={control}
                    name="purpose"
                    label="Purpose / Occasion"
                    isRequired={true}
                    placeholder="Enter the purpose of the holiday"
                  />
                </div>
              </section>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitPending}
                  className="bg-primary hover:bg-primary/90 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[140px]"
                >
                  {submitPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {state.editId ? "Update Holiday" : "Save Holiday"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) closeDeleteModal();
        }}
      >
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0">
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                  Delete Holiday
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 form-sections bg-white">
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-900">
                {deleteTarget?.Purpose || "this holiday"}
              </span>
              {deleteTarget?.Holiday_Date
                ? ` (${format(new Date(deleteTarget.Holiday_Date), "dd MMM, yyyy")})`
                : ""}
              ?
            </p>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                onClick={closeDeleteModal}
                disabled={deletePending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={deletePending}
                className="bg-red-600 hover:bg-red-700 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[120px]"
                onClick={confirmDelete}
              >
                {deletePending ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Trash2 size={18} />
                )}
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="page-body-card">
        <div className="form-sections">
          <section className="form-section">
            <div className="form-section-title">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <CalendarDays size={14} />
              </div>
              <h3 className="font-bold text-primary text-base">
                Holiday List
              </h3>
            </div>

            <div className="flex items-start gap-2.5 text-primary/80">
              <CalendarDays size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Review and maintain the institution holiday calendar. Use edit
                to update an existing occasion.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50">
                <div className="flex flex-col items-center gap-3 text-primary">
                  <Loader2 className="animate-spin" size={36} />
                  <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
                    Fetching Calendar...
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
