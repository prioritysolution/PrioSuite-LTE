"use client";

import React from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface ForgotPasswordUIProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export const ForgotPasswordUI: React.FC<ForgotPasswordUIProps> = ({
  loading,
  onSubmit,
}) => {
  return (
    <div className="min-h-full w-full flex flex-col md:flex-row font-sans">
      <div className="bg-[#031d38] md:w-1/2 w-full h-full relative flex items-center justify-center p-10">
        <div className="absolute top-6 left-6 w-16 h-16 hidden md:block">
          <Image
            src="/prioritySolutionsLogo.png"
            alt="Priority Solutions Logo"
            fill
            className="object-contain"
          />
        </div>

        <div className="relative w-full h-[80%] max-w-lg">
          <Image
            src="/prioBankLogin.png"
            alt="Prio Bank Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="absolute bottom-4 left-4 text-white text-xs font-light">
          Designed and Developed by Priority Solution
        </div>
      </div>

      <div className="bg-[#e4ebf3] md:w-1/2 w-full h-full flex items-center justify-center p-6">
        <div className="border border-[#031d38] rounded-md p-8 sm:p-12 w-full max-w-md bg-[#e4ebf3]">
          <h1 className="text-3xl sm:text-4xl text-[#031d38] font-normal mb-2 text-center">
            Welcome to{" "}
            <span className="text-[#3b82f6] italic font-semibold">
              PrioSuite LTE
            </span>
          </h1>

          <p className="text-sm text-gray-700 text-center mb-8">
            Please enter a valid email
          </p>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="flex flex-col">
              <label
                htmlFor="email"
                className="text-sm font-medium mb-1 text-gray-900"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="border border-gray-400 bg-white p-2.5 rounded text-sm text-gray-700 outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6] transition-all"
                required
              />
            </div>

            <div className="flex justify-end mt-2">
              <a
                href="/login"
                className="text-sm text-gray-700 hover:text-[#3b82f6] transition-colors"
              >
                Login with us
              </a>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#031d38] text-white px-10 py-2.5 rounded hover:bg-[#031d38]/90 transition-colors text-sm font-medium w-full sm:w-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Next
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
