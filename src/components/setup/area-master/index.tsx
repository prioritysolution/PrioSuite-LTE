"use client";

import React from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  MapPin,
  Save,
  AlertTriangle,
} from "lucide-react";
import {
  FieldErrors,
  UseFormRegister,
  Control,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";

import { IAreaFormInput } from "@/container/setup/area-master/Hooks";
import { IArea } from "@/container/setup/area-master/AreaMasterReducer";
import InputField from "@/common/formFields/InputField";
import DropdownField from "@/common/formFields/DropdownField";

interface AreaUIProps {
  state: {
    isModalOpen: boolean;
    editId: number | null;
    searchTerm: string;
  };

  isLoading: boolean;
  filteredData: IArea[];

  register: UseFormRegister<IAreaFormInput>;
  control: Control<IAreaFormInput>;
  errors: FieldErrors<IAreaFormInput>;

  submitPending: boolean;

  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;

  handleEdit: (area: IArea) => void;
  openModal: () => void;
  closeModal: () => void;
  setSearchTerm: (term: string) => void;

  form: UseFormReturn<IAreaFormInput>;
  areaTypeOptions: any[];
  areaTypeLoading: boolean;
  branchOptions: any[];
  branchLoading: boolean;
  deleteTarget: IArea | null;
  deletePending: boolean;
  handleDelete: (area: IArea) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => void;
}

export const AreaUI: React.FC<AreaUIProps> = ({
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
  areaTypeOptions,
  areaTypeLoading,
  branchOptions,
  branchLoading,
  deleteTarget,
  deletePending,
  handleDelete,
  closeDeleteModal,
  confirmDelete,
}) => {
  const columns: ColumnDef<IArea>[] = [
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
      accessorKey: "Area_Name",
      header: "Area Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <MapPin size={14} />
          </div>
          <span className="font-semibold text-primary tracking-wide">
            {row.getValue("Area_Name")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "Area_Type_Label",
      header: "Area Type",
      cell: ({ row }) => {
        const area = row.original;
        const typeCode = area.Area_Type ?? area.Area_Type_Id;
        const matched = areaTypeOptions.find((opt: any) => {
          const keys = [opt?.Opt_Code, opt?.Id, opt?.id, opt?.Option_Id];
          return keys.some(
            (key) =>
              key !== undefined &&
              key !== null &&
              key !== "" &&
              String(key) === String(typeCode ?? ""),
          );
        });

        const label =
          matched?.Opt_Description ||
          matched?.Opt_Desc ||
          matched?.Option_Name ||
          area.Opt_Description ||
          area.Area_Type_Label ||
          "-";

        return (
          <span className="font-medium text-gray-700">{label}</span>
        );
      },
    },
    {
      accessorKey: "Area_Desc",
      header: "Area Description",
      cell: ({ row }) => (
        <span className="text-gray-600 text-[13.5px] font-medium">
          {row.getValue("Area_Desc")}
        </span>
      ),
    },
    {
      accessorKey: "Assign_Branch_Label",
      header: "Assign Branch",
      cell: ({ row }) => {
        const area = row.original;
        const branchId = area.Branch_Id ?? area.branch_id;
        const matched = branchOptions.find((opt: any) => {
          const keys = [opt?.Branch_Id, opt?.branch_id, opt?.Id, opt?.id];
          return keys.some(
            (key) =>
              key !== undefined &&
              key !== null &&
              key !== "" &&
              String(key) === String(branchId ?? ""),
          );
        });

        const label =
          matched?.Branch_Name ||
          matched?.branch_name ||
          area.Branch_Name ||
          area.Assign_Branch_Label ||
          "-";

        return (
          <span className="font-medium text-gray-700">{label}</span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-2">Action</div>,
      cell: ({ row }) => {
        const area = row.original;

        return (
          <div className="flex items-center justify-end gap-1 pr-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10 transition-all rounded-md"
              onClick={() => handleEdit(area)}
            >
              <Edit size={16} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-all rounded-md"
              onClick={() => handleDelete(area)}
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
            <MapPin size={24} />
          </div>

          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
              Area Master
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              Manage and organize operational areas efficiently
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
              <span className="font-semibold text-gray-800">
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "area" : "areas"}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">Operational coverage setup</span>
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
              placeholder="Search area..."
              value={state.searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 bg-slate-50 border-gray-200 focus-visible:ring-primary focus-visible:border-primary w-full font-medium"
            />
          </div>

          <Button
            onClick={openModal}
            className="bg-primary hover:bg-primary/90 h-11 px-5 font-semibold rounded-lg text-white shadow-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus size={18} />
            Add New Area
          </Button>
        </div>
      </div>

      <Dialog
        open={state.isModalOpen}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0">
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                  {state.editId ? "Update Area Details" : "Create New Area"}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                  {state.editId
                    ? "Modify the details of the selected area below."
                    : "Enter the required details to register an area."}
                </DialogDescription>
              </div>
            </div>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={onSubmit}
              className="p-5 sm:p-6 form-sections bg-white"
              autoComplete="off"
            >
              <section className="form-section">
                <div className="form-section-title">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <MapPin size={14} />
                  </div>
                  <h3 className="font-bold text-primary text-base">
                    Area Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-5">
                  <InputField
                    control={control}
                    name="area_name"
                    label="Area Name"
                    placeholder="Enter the name of the area"
                    isRequired={true}
                  />

                  <DropdownField
                    control={control}
                    name="area_type"
                    label="Area Type"
                    placeholder="Select area type"
                    options={areaTypeOptions}
                    optionLabelKey="Option_Name"
                    optionValueKey="Opt_Code"
                    isRequired={true}
                    isSearch={true}
                    loading={areaTypeLoading}
                  />

                  <DropdownField
                    control={control}
                    name="branch_id"
                    label="Select Branch"
                    placeholder="Select branch"
                    options={branchOptions}
                    optionLabelKey="Branch_Name"
                    optionValueKey="Branch_Id"
                    isRequired={true}
                    isSearch={true}
                    loading={branchLoading}
                    rules={{
                      required: "Select branch is required",
                      validate: (value: string | number | "") =>
                        value !== "" &&
                        value !== null &&
                        value !== undefined &&
                        Number(value) !== 0
                          ? true
                          : "Select branch is required",
                    }}
                  />

                  <InputField
                    control={control}
                    name="area_desc"
                    label="Area Description"
                    placeholder="Write a short description"
                    isRequired={true}
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
                  {state.editId ? "Update Area" : "Save Area"}
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
                  Delete Area
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
                {deleteTarget?.Area_Name}
              </span>
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
                <MapPin size={14} />
              </div>
              <h3 className="font-bold text-primary text-base">Area List</h3>
            </div>

            <div className="flex items-start gap-2.5 text-primary/80">
              <MapPin size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm font-medium text-gray-500 leading-relaxed">
                Maintain operational areas used across member and group
                admission workflows.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[280px] sm:h-[320px] rounded-xl border border-gray-100 bg-slate-50/50">
                <div className="flex flex-col items-center gap-3 text-primary">
                  <Loader2 className="animate-spin" size={36} />
                  <span className="text-sm font-bold tracking-wider animate-pulse uppercase text-primary/80">
                    Fetching Records...
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
