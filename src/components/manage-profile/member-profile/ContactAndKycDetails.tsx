"use client";

import { useFormContext } from "react-hook-form";
import InputField from "@/common/formFields/InputField";
import { FileText } from "lucide-react";
import { IMemberFormInput } from "@/app/(dashboard)/manage-profile/member-profile/types";

export const ContactAndKycDetails = () => {
  const { control } = useFormContext<IMemberFormInput>();

  return (
    <div className="form-section">
      <div className="form-section-title">
        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <FileText size={14} />
        </div>
        <h3 className="font-bold text-primary text-base">KYC Details</h3>
      </div>
      <div className="form-grid xl:grid-cols-4">
        <InputField
          control={control}
          name="mem_aadhar"
          label="Aadhar No"
          isRequired={true}
          maxLength={12}
          isNumeric={true}
          placeholder="Enter 12 digit Aadhar no"
        />
        <InputField
          control={control}
          name="mem_epic"
          label="Voter ID"
          maxLength={10}
          isUpper={true}
          placeholder="ABC1234567"
        />
        <InputField
          control={control}
          name="mem_pan"
          label="PAN Card"
          maxLength={10}
          isUpper={true}
          placeholder="ABCDE1234F"
        />
        <InputField
          control={control}
          name="sp_aadhar"
          label="Spouse Aadhar No"
          maxLength={12}
          isNumeric={true}
          placeholder="Enter 12 digit Aadhar no"
        />
        <InputField
          control={control}
          name="sp_epic"
          label="Spouse Voter ID"
          maxLength={10}
          isUpper={true}
          placeholder="ABC1234567"
        />
      </div>
    </div>
  );
};
