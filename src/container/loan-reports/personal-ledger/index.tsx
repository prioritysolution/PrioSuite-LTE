"use client";

import { useEffect } from "react";
import { usePersonalLedger } from "./Hooks";
import PersonalLedgerComponent from "@/components/loan-reports/personal-ledger";

const PersonalLedgerContainer = () => {
  const {
    orgId,
    branchId,
    methods,
    getAllGroupListAPICall,
    getAllMemberListAPICall,
    getLoanCycleListAPICall,
    personalLedgerData,
    groupListData,
    memberListData,
    loanCycleListData,
    resetForm,
    onSubmit,
    isMemberListLoading,
    isLoanCycleListLoading,
    loading,
  } = usePersonalLedger();

  const groupId = methods.watch("groupId");
  const memberId = methods.watch("memberId");

  useEffect(() => {
    if (orgId && branchId) {
      getAllGroupListAPICall(Number(orgId), branchId);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    if (orgId && groupId) {
      getAllMemberListAPICall(Number(orgId), groupId);
    }
  }, [orgId, groupId]);

  useEffect(() => {
    if (orgId && branchId && groupId && memberId) {
      getLoanCycleListAPICall(Number(orgId), Number(branchId), groupId, memberId);
    }
  }, [orgId, branchId, groupId, memberId, getLoanCycleListAPICall]);

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

  return (
    <PersonalLedgerComponent
      form={methods}
      onSubmit={onSubmit}
      groupListData={groupListData}
      memberListData={memberListData}
      loanCycleListData={loanCycleListData}
      personalLedgerData={personalLedgerData}
      resetForm={resetForm}
      isMemberListLoading={isMemberListLoading}
      isLoanCycleListLoading={isLoanCycleListLoading}
      loading={loading}
    />
  );
};

export default PersonalLedgerContainer;
