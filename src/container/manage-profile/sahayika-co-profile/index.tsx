"use client"

import React from "react";
import { useCoProfileHook } from "./Hooks";
import { SahayikaCoProfileUI } from "@/components/manage-profile/sahayika-co-profile";

export const SahayikaCoProfileContainer: React.FC = () => {
  const {
    state,
    methods,
    onSubmit,
    handleCoSelect,
    handleNextClick,
    handleResetFlow,
    setFlowMode,
    setIsSearchOpen,
    submitPending,
  } = useCoProfileHook();

  return (
    <SahayikaCoProfileUI
      state={state}
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
      handleCoSelect={handleCoSelect}
      handleNextClick={handleNextClick}
      handleResetFlow={handleResetFlow}
      setFlowMode={setFlowMode}
      setIsSearchOpen={setIsSearchOpen}
      submitPending={submitPending}
    />
  );
};
