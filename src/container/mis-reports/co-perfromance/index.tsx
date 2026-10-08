"use client";

import React from "react";
import CoPerformanceComponent from "@/components/mis-reports/co-perfromance";
import { useCoPerformance } from "./Hooks";

const CoPerformanceContainer = () => {
  const report = useCoPerformance();
  return <CoPerformanceComponent {...report} />;
};

export default CoPerformanceContainer;
