"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Phone,
  Mail,
  Users,
} from "lucide-react";
import InputField from "@/common/formFields/InputField";
import TextareaField from "@/common/formFields/TextareaField";
import DropdownField from "@/common/formFields/DropdownField";
import { DataTable } from "@/components/ui/data-table";
import { IProfileFormInput } from "@/app/(dashboard)/profile/types";
import { ProfileBranchRow } from "@/container/profile/ProfileApi";

const statusOptions = [
  { Id: "Active", Option_Value: "Active" },
  { Id: "Inactive", Option_Value: "Inactive" },
];

const yesNoOptions = [
  { Id: "Yes", Option_Value: "Yes" },
  { Id: "No", Option_Value: "No" },
];

const display = (value: unknown) => {
  const s = String(value ?? "").trim();
  return s || "—";
};

type ProfileDetailsProps = {
  isHeadUser?: boolean;
  subBranches?: ProfileBranchRow[];
};

export const ProfileDetails = ({
  isHeadUser = false,
  subBranches = [],
}: ProfileDetailsProps) => {
  const { control } = useFormContext<IProfileFormInput>();

  const subBranchColumns = useMemo<ColumnDef<ProfileBranchRow>[]>(
    () => [
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
        accessorKey: "branch_name",
        header: "Branch Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Building2 size={14} />
            </div>
            <span className="font-semibold text-primary tracking-wide truncate">
              {display(row.getValue("branch_name"))}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "branch_code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">
            {display(row.getValue("branch_code"))}
          </span>
        ),
      },
      {
        accessorKey: "branch_id",
        header: "ID",
        cell: ({ row }) => (
          <span className="font-medium text-gray-700">
            {display(row.getValue("branch_id"))}
          </span>
        ),
      },
      {
        accessorKey: "branch_mobile",
        header: "Mobile",
        cell: ({ row }) => (
          <span className="text-gray-600 text-[13.5px] font-medium">
            {display(row.getValue("branch_mobile"))}
          </span>
        ),
      },
      {
        accessorKey: "branch_mail",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-gray-600 text-[13.5px] font-medium truncate block max-w-[200px]">
            {display(row.getValue("branch_mail"))}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
          const status = display(row.getValue("is_active"));
          const isActive = String(status).toLowerCase() === "active";
          return (
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "branch_address",
        header: "Address",
        cell: ({ row }) => (
          <span className="text-gray-600 text-[13.5px] font-medium">
            {display(row.getValue("branch_address"))}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="form-sections">
      <section className="form-section">
        <div className="form-section-title">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck size={14} />
          </div>
          <h3 className="font-bold text-primary text-base">Account</h3>
        </div>

        <div className="form-grid">
          <InputField
            control={control}
            name="User_Name"
            label="Display Name"
            placeholder="Enter display name"
            isRequired
          />
          <DropdownField
            control={control}
            name="user_status"
            label="Account Status"
            options={statusOptions}
            optionLabelKey="Option_Value"
            optionValueKey="Id"
            placeholder="Select status"
            disableSorting
            disabled
          />
          <InputField
            control={control}
            name="financialYear"
            label="Financial Year"
            placeholder="Enter financial year"
            startContent={<CalendarDays size={16} className="text-gray-400" />}
            disabled
          />
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-title">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={14} />
          </div>
          <h3 className="font-bold text-primary text-base">Organisation</h3>
        </div>

        <div className="form-grid">
          <InputField
            control={control}
            name="org_name"
            label="Organisation Name"
            placeholder="Enter organisation name"
          />
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-title">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={14} />
          </div>
          <h3 className="font-bold text-primary text-base">Branch</h3>
        </div>

        <div className="form-grid">
          <InputField
            control={control}
            name="branch_name"
            label="Branch Name"
            placeholder="Enter branch name"
          />
          <InputField
            control={control}
            name="branch_mobile"
            label="Branch Mobile"
            placeholder="Enter branch mobile"
            startContent={<Phone size={16} className="text-gray-400" />}
          />
          <InputField
            control={control}
            name="branch_mail"
            label="Branch Email"
            placeholder="Enter branch email"
            startContent={<Mail size={16} className="text-gray-400" />}
          />
          <DropdownField
            control={control}
            name="is_head"
            label="Head Office"
            options={yesNoOptions}
            optionLabelKey="Option_Value"
            optionValueKey="Id"
            placeholder="Select"
            disableSorting
            disabled
          />
          <DropdownField
            control={control}
            name="branch_status"
            label="Branch Status"
            options={statusOptions}
            optionLabelKey="Option_Value"
            optionValueKey="Id"
            placeholder="Select status"
            disableSorting
            disabled
          />
        </div>

        <div className="mt-4">
          <TextareaField
            control={control}
            name="branch_address"
            label="Branch Address"
            rows={3}
            placeholder="Enter branch address"
          />
        </div>
      </section>

      {isHeadUser && (
        <section className="form-section">
          <div className="form-section-title">
            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Users size={14} />
            </div>
            <h3 className="font-bold text-primary text-base">Sub Branches</h3>
          </div>

          <div className="flex items-start gap-2.5 text-primary/80">
            <Users size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Branches under this head office
              {subBranches.length > 0
                ? ` · ${subBranches.length} ${
                    subBranches.length === 1 ? "branch" : "branches"
                  }`
                : ""}
              .
            </p>
          </div>

          <DataTable columns={subBranchColumns} data={subBranches} />
        </section>
      )}
    </div>
  );
};
