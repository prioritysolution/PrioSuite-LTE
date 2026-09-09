"use client";

import React, { useEffect } from "react";
import IssueRegisterComponent from "@/components/loan-reports/issue-register";
import { useIssueRegister } from "./Hooks";

const IssueRegisterContainer = () => {
  const { getBranchListAPICall, methods, onSubmit, resetForm, orgId, loading } =
    useIssueRegister();

  useEffect(() => {
    if (orgId) {
      getBranchListAPICall(Number(orgId));
    }
  }, [orgId]);

  useEffect(() => {
    return () => {
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <IssueRegisterComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      loading={loading}
    />
  );
};

export default IssueRegisterContainer;
