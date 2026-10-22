"use client";

import React from "react";
import { useLoanCollection } from "./Hooks";
import LoanCollectionComponent from "@/components/loan-entry/loan-collection";

const LoanCollectionContainer = () => {
  const { methods, ...collection } = useLoanCollection();

  return <LoanCollectionComponent form={methods} {...collection} />;
};

export default LoanCollectionContainer;
