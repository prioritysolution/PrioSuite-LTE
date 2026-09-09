"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import InputField from "@/common/formFields/InputField";
import DropdownField from "@/common/formFields/DropdownField";
import {
  Controller,
  UseFormRegister,
  UseFormHandleSubmit,
  Control,
  FieldErrors,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { ILoginInput } from "@/types/types";
import { IFyear } from "@/container/auth/login/Hooks";

interface LoginUIProps {
  methods: UseFormReturn<ILoginInput>;
  showPassword: boolean;
  togglePassword: () => void;
  financialYear: any;
  isPending: boolean;
  register: UseFormRegister<ILoginInput>;
  handleSubmit: UseFormHandleSubmit<ILoginInput>;
  control: Control<ILoginInput>;
  errors: FieldErrors<ILoginInput>;
  onSubmit: (data: ILoginInput) => void;
}

export const LoginUI: React.FC<LoginUIProps> = ({
  methods,
  showPassword,
  togglePassword,
  financialYear,
  isPending,
  register,
  handleSubmit,
  control,
  errors,
  onSubmit,
}) => {
  return (
    <div className="h-full w-full overflow-hidden flex items-center justify-center p-4 relative bg-gray-50 md:bg-transparent">
      {/* Background Image — fixed so it never shifts on small screens */}
      <div className="fixed inset-0 z-0 w-full h-full hidden md:block">
        <Image
          src="/logo1.png"
          alt="Background"
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-[400px] bg-white/95 backdrop-blur-lg rounded-[20px] sm:rounded-[24px] shadow-2xl border border-white/20 p-5 sm:p-7 mx-auto">
        {/* Logo */}
        <div className="flex justify-center items-center gap-2 mb-4 sm:mb-5">
          <Image
            src="/pristlogo.png"
            alt="PrioSuite"
            width={50}
            height={50}
            className="object-contain w-12 h-12 sm:w-14 sm:h-14"
          />
          <div className="flex flex-col">
            <span className="text-[24px] sm:text-[26px] font-extrabold tracking-tight text-[#1a3a5c] leading-none">
              Prio<span className="text-[#1769c2]">Suite</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="block h-[1.5px] w-6 bg-[#1769c2]" />
              <span className="text-[9px] font-bold tracking-[3px] text-[#1769c2]">
                LTE
              </span>
              <span className="block h-[1.5px] w-6 bg-[#1769c2]" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mt-2 mb-4 sm:mb-5">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-[#1a2e44]">
            Welcome Back!
          </h2>
          <p className="text-[12px] text-[#8a9ab0] mt-0.5">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 sm:space-y-4"
            autoComplete="off"
          >
            <DropdownField
              control={control}
              name="financialYear"
              label="Financial Year"
              options={financialYear?.details || []}
              optionLabelKey="Yr"
              optionValueKey="Id"
              isSearch={true}
              rules={{ required: "Financial year is required" }}
            />

            <InputField
              control={control}
              name="branch_code"
              label="Branch Code"
              isRequired={true}
              placeholder="Enter Branch Code"
              className="h-11 bg-white"
            />

            <InputField
              control={control}
              name="user_name"
              label="User ID"
              isRequired={true}
              placeholder="Enter User ID"
              className="h-11 bg-white"
            />

            <InputField
              control={control}
              name="password"
              type="password"
              label="Password"
              isRequired={true}
              placeholder="Enter password"
              className="h-11 bg-white"
            />

            {/* Forgot Password */}
            <div className="flex justify-end pt-1">
              <a
                href="/forgot-password"
                className="text-[13px] text-[#1769c2] font-medium hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-[50px] rounded-[12px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-[15px] font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </FormProvider>

        {/* Footer */}
        <div className="text-center text-[11px] text-[#b0bec8] mt-5 pt-4 border-t border-[#f0f4f8]">
          © {new Date().getFullYear()} Priority Solutions. All rights reserved.
        </div>
      </div>
    </div>
  );
};
