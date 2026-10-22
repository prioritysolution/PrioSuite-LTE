"use client";

import React from "react";
import DemandVsCollectionComponent from "@/components/mis-reports/demand-vs-collection";
import { useIsClient } from "@/hooks/useIsClient";
import { useDemandVsCollection } from "./Hooks";

const DemandVsCollectionReport = () => {
  const report = useDemandVsCollection();
  return <DemandVsCollectionComponent {...report} />;
};

// useDemandVsCollection reads browser cookies during render, so it must not run on the server.
const DemandVsCollectionContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <DemandVsCollectionReport />;
};

export default DemandVsCollectionContainer;
