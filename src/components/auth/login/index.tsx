"use client";

import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import InputField from "@/common/formFields/InputField";
import DropdownField from "@/common/formFields/DropdownField";
import {
  UseFormRegister,
  UseFormHandleSubmit,
  Control,
  FieldErrors,
  FormProvider,
  UseFormReturn,
} from "react-hook-form";
import { Loader2 } from "lucide-react";
import { ILoginInput } from "@/types/types";

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
  financialYear,
  isPending,
  handleSubmit,
  control,
  onSubmit,
}) => {
  return (
    <div className="h-full w-full flex overflow-hidden bg-white">
      {/* Brand panel — large screens only, logo + text, no full image */}
      <aside className="relative hidden lg:flex lg:w-[44%] xl:w-[48%] shrink-0 flex-col justify-between overflow-hidden bg-[#0c3d6e] px-10 py-10 xl:px-14 xl:py-12 text-white">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#1769c2]/40" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-[#1aa6a6]/20" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <Image
              src="/pristlogo.png"
              alt="PrioSuite"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <div>
            <p className="text-xl font-extrabold leading-none tracking-tight">
              PrioSuite
            </p>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.28em] text-white/80">
              LTE
            </p>
          </div>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl xl:text-4xl font-bold leading-tight">
            Smart Solution For Microfinance And NBFC
          </h2>
          <p className="mt-4 text-sm xl:text-base leading-relaxed text-white/75">
            Manage members, loans, and collections from one secure workspace.
          </p>
        </div>

        <p className="relative z-10 text-sm font-medium text-white/80">
          by Priority Solutions
        </p>
      </aside>

      {/* Form panel — full screen below large */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto bg-white">
        <div className="min-h-full flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-5 flex items-center gap-2.5 lg:hidden">
                <Image
                  src="/pristlogo.png"
                  alt="PrioSuite"
                  width={48}
                  height={48}
                  className="h-11 w-11 object-contain"
                />
                <div className="flex flex-col">
                  <span className="text-[22px] font-extrabold tracking-tight text-[#0c3d6e] leading-none">
                    PrioSuite
                  </span>
                  <span className="mt-1 text-[10px] font-bold tracking-[0.28em] text-[#1769c2]">
                    LTE
                  </span>
                </div>
              </div>

              <h1 className="text-[22px] sm:text-[26px] font-bold text-[#1a2e44] leading-tight">
                Welcome back
              </h1>
              <p className="mt-1.5 text-sm text-[#6b7c90]">
                Sign in to continue to your account
              </p>
            </div>

            <FormProvider {...methods}>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
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
                  placeholder="Enter branch code"
                  className="h-11 bg-white"
                />

                <InputField
                  control={control}
                  name="user_name"
                  label="User ID"
                  isRequired={true}
                  placeholder="Enter user ID"
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

                <div className="flex justify-end pt-0.5">
                  <a
                    href="/forgot-password"
                    className="text-[13px] font-medium text-[#1769c2] hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-12 w-full rounded-xl bg-[#1769c2] text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-[#1257a3] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </FormProvider>

            <p className="mt-8 text-center text-[11px] text-[#8a9ab0] lg:text-left">
              © {new Date().getFullYear()} Priority Solutions. All rights reserved.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
