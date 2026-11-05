"use client";

import ReceiptPaymentScrollComponent from "@/components/mis-reports/receipt-payment-scroll";
import { useIsClient } from "@/hooks/useIsClient";
import { useReceiptPaymentScroll } from "./Hooks";

const ReceiptPaymentScrollContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <ReceiptPaymentScrollReport />;
};

const ReceiptPaymentScrollReport = () => {
  const report = useReceiptPaymentScroll();
  return <ReceiptPaymentScrollComponent {...report} />;
};

export default ReceiptPaymentScrollContainer;
