"use client";

import MonthlyStatementComponent from "@/components/mis-reports/monthly-statement-of-accounts";
import { useIsClient } from "@/hooks/useIsClient";
import { useMonthlyStatement } from "./Hooks";

const MonthlyStatementContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <MonthlyStatementReport />;
};

const MonthlyStatementReport = () => {
  const report = useMonthlyStatement();
  return <MonthlyStatementComponent {...report} />;
};

export default MonthlyStatementContainer;
