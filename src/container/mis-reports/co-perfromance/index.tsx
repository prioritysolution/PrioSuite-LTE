"use client";

import React from "react";
import CoPerformanceComponent from "@/components/mis-reports/co-perfromance";
import { useIsClient } from "@/hooks/useIsClient";
import { useCoPerformance } from "./Hooks";

const CoPerformanceReport = () => {
  const report = useCoPerformance();
  return <CoPerformanceComponent {...report} />;
};

// useCoPerformance reads browser cookies during render, so it must not run on the server.
const CoPerformanceContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <CoPerformanceReport />;
};

export default CoPerformanceContainer;
