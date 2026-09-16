"use client";

import { useFormContext } from "react-hook-form";
import InputField from "@/common/formFields/InputField";
import { Users, Briefcase } from "lucide-react";
import { IMemberFormInput } from "@/app/(dashboard)/manage-profile/member-profile/types";

export const AdditionalDetails = () => {
  const { control } = useFormContext<IMemberFormInput>();

  return (
    <div className="form-grid md:grid-cols-2 xl:grid-cols-2">
      <div className="form-section">
        <div className="form-section-title">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Users size={14} />
          </div>
          <h3 className="font-bold text-primary text-base">Children Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <InputField
            control={control}
            name="boy_count"
            label="Boys"
            isNumeric={true}
            maxLength={3}
            placeholder="Enter count"
          />
          <InputField
            control={control}
            name="girl_count"
            label="Girls"
            isNumeric={true}
            maxLength={3}
            placeholder="Enter count"
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Briefcase size={14} />
          </div>
          <h3 className="font-bold text-primary text-base">Income Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <InputField
            control={control}
            name="mem_ocop"
            label="Occupation"
            maxLength={50}
            isLetters={true}
            placeholder="Enter occupation"
          />
          <InputField
            control={control}
            name="mem_minc"
            label="Monthly Income"
            isNumeric={true}
            maxLength={7}
            placeholder="Enter monthly income"
          />
        </div>
      </div>
    </div>
  );
};
