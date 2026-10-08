"use client";

import React from "react";
import DemandVsCollectionComponent from "@/components/mis-reports/demand-vs-collection";
import { useDemandVsCollection } from "./Hooks";

const DemandVsCollectionContainer = () => {
  const report = useDemandVsCollection();
  return <DemandVsCollectionComponent {...report} />;
};

export default DemandVsCollectionContainer;
