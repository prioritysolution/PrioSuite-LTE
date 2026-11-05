"use client";

import DefaultParCalculationComponent from "@/components/mis-reports/default-par-calculation";
import { useIsClient } from "@/hooks/useIsClient";
import { useDefaultParCalculation } from "./Hooks";

const DefaultParCalculationContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <DefaultParCalculationReport />;
};

const DefaultParCalculationReport = () => (
  <DefaultParCalculationComponent {...useDefaultParCalculation()} />
);

export default DefaultParCalculationContainer;
