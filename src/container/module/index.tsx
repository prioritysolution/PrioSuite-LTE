"use client"

import React from "react";
import { useModuleHook } from "./Hooks";
import { ModuleUI } from "@/components/module";
import { useGlobalContext } from "@/context/GlobalContext";

export const ModuleContainer: React.FC = () => {
  const { state, fetchItems, createItem } = useModuleHook();
  const { user } = useGlobalContext();

  const handleFetch = () => {
    fetchItems(user?.org_id || 1, user?.branch_id || 1);
  };

  const handleCreate = (name: string) => {
    createItem({ name });
  };

  return (
    <ModuleUI
      loading={state.loading}
      data={state.data}
      error={state.error}
      onFetch={handleFetch}
      onCreate={handleCreate}
    />
  );
};
