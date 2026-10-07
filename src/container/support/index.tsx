"use client";

import React from "react";
import { useSupportHook } from "./Hooks";
import { SupportUI } from "@/components/support";

export const SupportContainer: React.FC = () => {
  const {
    state,
    isLoading,
    filteredData,
    totalCount,
    openCount,
    control,
    form,
    submitPending,
    onSubmit,
    addFiles,
    removeFile,
    openModal,
    closeModal,
    setSearchTerm,
  } = useSupportHook();

  return (
    <SupportUI
      state={state}
      isLoading={isLoading}
      filteredData={filteredData}
      totalCount={totalCount}
      openCount={openCount}
      control={control}
      form={form}
      submitPending={submitPending}
      onSubmit={onSubmit}
      addFiles={addFiles}
      removeFile={removeFile}
      openModal={openModal}
      closeModal={closeModal}
      setSearchTerm={setSearchTerm}
    />
  );
};
