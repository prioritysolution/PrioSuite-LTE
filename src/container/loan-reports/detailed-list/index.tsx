"use client";
import DetailedListComponent from "@/components/loan-reports/detailed-list";
import React, { useEffect } from "react";
import { useDetailedList } from "./Hooks";

const DeatailedListContainer = () => {
  const {
    getBranchListAPICall,
    getSchemeListAPICall,
    methods,
    onSubmit,
    resetForm,
    orgId,
    loading,
  } = useDetailedList();

  useEffect(() => {
    if (orgId) {
      getBranchListAPICall(Number(orgId));
      getSchemeListAPICall(Number(orgId));
    }
  }, [orgId]);

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  return (
    <DetailedListComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      loading={loading}
    />
  );
};

export default DeatailedListContainer;
