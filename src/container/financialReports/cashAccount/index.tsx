"use client";

import React, { useEffect } from "react";
import CashAccountComponent from "@/components/financialReports/cashAccount";
import { useCashAccount } from "./Hooks";

const CashAccountContainer = () => {
  const {
    orgId,
    branchList,
    cashAccountReport,
    loading,
    methods,
    resetForm,
    onSubmit,
    getBranchListAPICall,
  } = useCashAccount();

  useEffect(() => {
    if (orgId) {
      getBranchListAPICall(Number(orgId));
    }
  }, [orgId]);

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  return (
    <CashAccountComponent
      form={methods}
      onSubmit={onSubmit}
      branchList={branchList}
      cashAccountReport={cashAccountReport}
      resetForm={resetForm}
      loading={loading}
    />
  );
};

export default CashAccountContainer;
