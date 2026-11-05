"use client";

import LoanPortfolioComponent from "@/components/mis-reports/loan-portfolio";
import { useIsClient } from "@/hooks/useIsClient";
import { useLoanPortfolio } from "./Hooks";

const LoanPortfolioContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <LoanPortfolioReport />;
};
const LoanPortfolioReport = () => <LoanPortfolioComponent {...useLoanPortfolio()} />;
export default LoanPortfolioContainer;
