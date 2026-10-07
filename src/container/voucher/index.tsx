"use client";

import React from "react";
import { useVoucher } from "./Hooks";
import VoucherComponent from "@/components/voucher";

const VoucherContainer = () => {
  const { methods, onSubmit, resetForm, ledgerList, bankList, loading } =
    useVoucher();

  return (
    <VoucherComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      ledgerList={ledgerList}
      bankList={bankList}
      loading={loading}
    />
  );
};

export default VoucherContainer;
