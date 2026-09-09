"use client"

import React from "react";
import { useGroupAdmissionHook } from "./Hooks";
import { GroupAdmissionUI } from "@/components/manage-profile/group-admission";

export const GroupAdmissionContainer: React.FC = () => {
  const {
    state,
    methods,
    onSubmit,
    handleNextClick,
    handleResetFlow,
    setFlowMode,
    setIsSearchOpen,
    setSearchId,
    fetchGroupMutation,
    submitMutation,
  } = useGroupAdmissionHook();

  return (
    <GroupAdmissionUI
      state={state}
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
      handleNextClick={handleNextClick}
      handleResetFlow={handleResetFlow}
      setFlowMode={setFlowMode}
      setIsSearchOpen={setIsSearchOpen}
      setSearchId={setSearchId}
      fetchPending={fetchGroupMutation.isPending}
      onFetchGroup={(grp_no) => fetchGroupMutation.mutate(grp_no)}
      submitPending={submitMutation.isPending}
    />
  );
};
