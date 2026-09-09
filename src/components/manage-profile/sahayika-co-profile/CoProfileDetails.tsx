"use client"

import { useFormContext } from "react-hook-form";
import InputField from "@/common/formFields/InputField";
import TextareaField from "@/common/formFields/TextareaField";
import { UserCircle, KeyRound } from "lucide-react";
import { ICoFormInput } from "@/app/(dashboard)/manage-profile/sahayika-co-profile/types";

interface Props {
    isEditMode: boolean;
}

export const CoProfileDetails = ({ isEditMode }: Props) => {
    const { control } = useFormContext<ICoFormInput>();

    return (
        <div className="form-section">
            <div className="form-section-title">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserCircle size={14} />
                </div>
                <h3 className="font-bold text-primary text-base">Profile Information</h3>
            </div>

            <div className="form-grid">
                <InputField
                    control={control}
                    name="co_name"
                    label="CO Name"
                    placeholder="Enter CO name"
                    isRequired={true}
                />

                <InputField
                    control={control}
                    name="gurd_name"
                    label="Guardian Name"
                    placeholder="Enter guardian name"
                    isRequired={true}
                />

                <InputField
                    control={control}
                    name="contact_no"
                    label="Contact No"
                    placeholder="Enter contact number"
                    isRequired={true}
                    isNumeric={true}
                    maxLength={10}
                />

                <InputField
                    control={control}
                    name="co_pass"
                    type="text"
                    label="Security Pin"
                    placeholder="Enter security pin"
                    startContent={<KeyRound size={18} />}
                    isNumeric={true}
                    maxLength={6}
                />

                <div className="md:col-span-2 xl:col-span-3">
                    <TextareaField
                        control={control}
                        name="co_add"
                        label="Address"
                        placeholder="Enter address"
                        rows={3}
                    />
                </div>
            </div>
        </div>
    );
};
