"use client"

import React from "react";
import { useMemberProfileHook } from "./Hooks";
import { MemberProfileUI } from "@/components/manage-profile/member-profile";

export const MemberProfileContainer: React.FC = () => {
  const {
    state,
    methods,
    onSubmit,
    handleNextClick,
    handleResetFlow,
    setFlowMode,
    setIsSearchOpen,
    setSearchId,
    fetchMemberMutation,
    submitMutation,
  } = useMemberProfileHook();

  return (
    <MemberProfileUI
      state={state}
      methods={methods}
      onSubmit={onSubmit}
      handleNextClick={handleNextClick}
      handleResetFlow={handleResetFlow}
      setFlowMode={setFlowMode}
      setIsSearchOpen={setIsSearchOpen}
      setSearchId={setSearchId}
      fetchPending={fetchMemberMutation.isPending}
      onFetchMember={(mem_no) => fetchMemberMutation.mutate(mem_no)}
      submitPending={submitMutation.isPending}
    />
  );
};
