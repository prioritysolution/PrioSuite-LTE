"use client";

import React, { useState } from "react";
import { FormProvider, UseFormReturn } from "react-hook-form";
import {
  AlertTriangle,
  Loader2,
  LogOut,
  RefreshCw,
  Save,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { IUser } from "@/types/types";
import { IProfileFormInput } from "@/app/(dashboard)/profile/types";
import { ProfileBranchRow } from "@/container/profile/ProfileApi";
import { ProfileDetails } from "./ProfileDetails";

interface ProfileUIProps {
  methods: UseFormReturn<IProfileFormInput>;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void;
  handleReset: () => void;
  handleLogout: () => void;
  user: IUser | null;
  isMounted: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isActive: boolean;
  isHeadUser?: boolean;
  subBranches?: ProfileBranchRow[];
}

export const ProfileUI: React.FC<ProfileUIProps> = ({
  methods,
  onSubmit,
  handleReset,
  handleLogout,
  user,
  isMounted,
  isDirty,
  isSubmitting,
  isActive,
  isHeadUser = false,
  subBranches = [],
}) => {
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const userName = user?.User_Name || "Admin";
  const branchName = user?.branch_name;
  const orgName = user?.org_name;
  const initial = userName.charAt(0).toUpperCase();

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    handleLogout();
  };

  return (
    <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

        <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
          {!isMounted ? (
            <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">
              {initial}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-2xl font-bold text-primary tracking-tight truncate">
                My Profile
              </h2>
              {isMounted && (
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}
                >
                  {isActive ? "Active" : "Inactive"}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              View and update your signed-in account details
            </p>
            {isMounted ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm">
                <span className="font-semibold text-gray-800 truncate">
                  {userName}
                </span>
                {branchName && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 truncate">{branchName}</span>
                  </>
                )}
                {orgName && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-gray-500 truncate">{orgName}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 z-10 w-full xl:w-auto pl-2 xl:pl-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!isDirty || isSubmitting}
            className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Reset
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setLogoutConfirmOpen(true)}
            className="h-11 px-5 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </div>

      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl font-sans gap-0">
          <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 bg-white">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <AlertTriangle size={18} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-xl font-bold text-primary tracking-tight">
                  Confirm Logout
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500 mt-1 font-medium">
                  You will need to sign in again to continue.
                </DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6 form-sections bg-white">
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              Are you sure you want to logout
              {userName ? (
                <>
                  {" "}
                  as <span className="font-bold text-gray-900">{userName}</span>
                </>
              ) : null}
              ?
            </p>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5 border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg shadow-sm w-full sm:w-auto"
                onClick={() => setLogoutConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-red-600 hover:bg-red-700 h-11 px-8 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto min-w-[120px]"
                onClick={confirmLogout}
              >
                <LogOut size={18} />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="page-body-card">
        {!isMounted || !user ? (
          <div className="form-sections">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="form-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="form-sections">
              <div className="flex items-start gap-2.5 text-primary/80">
                <UserRound size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-gray-500 leading-relaxed">
                  Update your account, organisation, and branch details, then
                  save to apply changes to this session.
                </p>
              </div>

              <ProfileDetails
                isHeadUser={isHeadUser}
                subBranches={subBranches}
              />

              <div className="form-actions">
                <Button
                  type="submit"
                  disabled={!isDirty || isSubmitting}
                  className="bg-primary hover:bg-primary/90 h-12 px-10 font-bold rounded-lg text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Save size={20} />
                  )}
                  Save Profile
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};
