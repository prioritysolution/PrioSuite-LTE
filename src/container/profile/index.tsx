"use client";

import { ProfileUI } from "@/components/profile";
import { useProfileHook } from "./Hooks";

export const ProfileContainer = () => {
  const {
    methods,
    onSubmit,
    handleReset,
    handleLogout,
    user,
    isMounted,
    isDirty,
    isSubmitting,
    isActive,
    isHeadUser,
    subBranches,
  } = useProfileHook();

  return (
    <ProfileUI
      methods={methods}
      onSubmit={onSubmit}
      handleReset={handleReset}
      handleLogout={handleLogout}
      user={user}
      isMounted={isMounted}
      isDirty={isDirty}
      isSubmitting={isSubmitting}
      isActive={isActive}
      isHeadUser={isHeadUser}
      subBranches={subBranches}
    />
  );
};
