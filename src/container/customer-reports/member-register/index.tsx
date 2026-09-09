"use client";

import React, { useEffect } from "react";
import MemberRegisterComponent from "@/components/customer-reports/member-register";
import { useMemberRegister } from "./Hooks";

const MemberRegisterContainer = () => {
  const {
    getBranchListAPICall,
    methods,
    onSubmit,
    resetForm,
    orgId,
    loading,
  } = useMemberRegister();

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
    <MemberRegisterComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      loading={loading}
    />
  );
};

export default MemberRegisterContainer;
