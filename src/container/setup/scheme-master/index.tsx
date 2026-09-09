"use client";

import React from "react";
import { useSchemeHook } from "./Hooks";
import { SchemeUI } from "@/components/setup/scheme-master";

export const SchemeMasterContainer: React.FC = () => {
  const {
    state,
    isLoading,
    filteredData,
    register,
    control,
    errors,
    submitMutation,
    onSubmit,
    handleEdit,
    openModal,
    closeModal,
    setSearchTerm,
    form,
    repayModeOptions,
    repayModeLoading,
    ledgerOptions,
    ledgerLoading,
  } = useSchemeHook();

  return (
    <SchemeUI
      state={state}
      isLoading={isLoading}
      filteredData={filteredData}
      register={register}
      control={control}
      errors={errors}
      submitPending={submitMutation.isPending}
      onSubmit={onSubmit}
      handleEdit={handleEdit}
      openModal={openModal}
      closeModal={closeModal}
      setSearchTerm={setSearchTerm}
      form={form}
      repayModeOptions={repayModeOptions}
      repayModeLoading={repayModeLoading}
      ledgerOptions={ledgerOptions}
      ledgerLoading={ledgerLoading}
    />
  );
};
