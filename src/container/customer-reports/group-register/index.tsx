"use client";

import React, { useEffect } from "react";
import GroupRegisterComponent from "@/components/customer-reports/group-register";
import { useGroupRegister } from "./Hooks";

const GroupRegisterContainer = () => {
  const { getBranchListAPICall, methods, onSubmit, resetForm, orgId, loading } =
    useGroupRegister();

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
    <GroupRegisterComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      loading={loading}
    />
  );
};

export default GroupRegisterContainer;
