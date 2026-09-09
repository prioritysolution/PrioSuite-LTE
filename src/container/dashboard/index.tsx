"use client";

import React from "react";
import { useDashboardHook } from "./Hooks";
import { DashboardUI } from "@/components/dashboard";

export const DashboardContainer: React.FC = () => {
  const {
    branchName,
    fromDate,
    toDate,
    onFromDateChange,
    onToDateChange,
    onSearch,
    onRefresh,
    loading,
    error,
    statCards,
    isHeadView,
    branchSections,
    finStartDate,
    finEndDate,
  } = useDashboardHook();

  return (
    <DashboardUI
      branchName={branchName}
      fromDate={fromDate}
      toDate={toDate}
      onFromDateChange={onFromDateChange}
      onToDateChange={onToDateChange}
      onSearch={onSearch}
      onRefresh={onRefresh}
      loading={loading}
      error={error}
      statCards={statCards}
      isHeadView={isHeadView}
      branchSections={branchSections}
      finStartDate={finStartDate}
      finEndDate={finEndDate}
    />
  );
};
