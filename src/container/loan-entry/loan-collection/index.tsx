"use client";

import React from "react";
import { useLoanCollection } from "./Hooks";
import LoanCollectionComponent from "@/components/loan-entry/loan-collection";

const LoanCollectionContainer = () => {
  const {
    methods,
    onSubmit,
    resetForm,
    groupList,
    memberList,
    isGroupLoading,
    isMemberLoading,
    isLoanInfoLoading,
    isSplitLoading,
    loading,
    onToggleCollection,
    selectedLoans,
    showSuccessMessage,
    successMessage,
    handleSuccessClose,
    activeAccountId,
    selectedLoanDate,
    selectedLoanAmount,
  } = useLoanCollection();

  return (
    <LoanCollectionComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      groupList={groupList}
      memberList={memberList}
      isGroupLoading={isGroupLoading}
      isMemberLoading={isMemberLoading}
      isLoanInfoLoading={isLoanInfoLoading}
      isSplitLoading={isSplitLoading}
      loading={loading}
      onToggleCollection={onToggleCollection}
      selectedLoans={selectedLoans}
      selectedAccountId={activeAccountId}
      selectedLoanDate={selectedLoanDate}
      selectedLoanAmount={selectedLoanAmount}
      showSuccessMessage={showSuccessMessage}
      successMessage={successMessage}
      onSuccessClose={handleSuccessClose}
    />
  );
};

export default LoanCollectionContainer;
