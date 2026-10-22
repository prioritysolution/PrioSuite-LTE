"use client";

import React from "react";
import { useNewApplicationHook } from "./Hooks";
import { NewApplicationUI } from "@/components/loan-entry/new-application";

export const NewApplicationContainer: React.FC = () => {
  const {
    methods,
    onSubmit,
    submitPending,
    resetForm,
    isContinuePromptOpen,
    onContinueSame,
    onStartFresh,
  } = useNewApplicationHook();

  return (
    <NewApplicationUI
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
      submitPending={submitPending}
      onReset={resetForm}
      isContinuePromptOpen={isContinuePromptOpen}
      onContinueSame={onContinueSame}
      onStartFresh={onStartFresh}
    />
  );
};
