"use client";

import React from "react";
import { usePurposeHook } from "./Hooks";
import { PurposeUI } from "@/components/setup/purpose-master";

export const PurposeMasterContainer: React.FC = () => {
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
    deleteTarget,
    deletePending,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
  } = usePurposeHook();

  return (
    <PurposeUI
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
      deleteTarget={deleteTarget}
      deletePending={deletePending}
      handleDelete={handleDelete}
      closeDeleteModal={closeDeleteModal}
      confirmDelete={confirmDelete}
    />
  );
};
