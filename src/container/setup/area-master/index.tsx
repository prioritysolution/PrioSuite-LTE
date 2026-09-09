"use client"

import React from "react";
import { useAreaHook } from "./Hooks";
import { AreaUI } from "@/components/setup/area-master";

export const AreaMasterContainer: React.FC = () => {
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
    areaTypeOptions,
    areaTypeLoading,
    branchOptions,
    branchLoading,
    deleteTarget,
    deletePending,
    handleDelete,
    closeDeleteModal,
    confirmDelete,
  } = useAreaHook();

  return (
    <AreaUI
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
      areaTypeOptions={areaTypeOptions}
      areaTypeLoading={areaTypeLoading}
      branchOptions={branchOptions}
      branchLoading={branchLoading}
      deleteTarget={deleteTarget}
      deletePending={deletePending}
      handleDelete={handleDelete}
      closeDeleteModal={closeDeleteModal}
      confirmDelete={confirmDelete}
    />
  );
};
