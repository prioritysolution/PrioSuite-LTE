"use client";

import React from "react";
import { useVoucher } from "./Hooks";
import VoucherComponent from "@/components/voucher";

const VoucherContainer = () => {
  const { methods, onSubmit, resetForm, ledgerList, loading } = useVoucher();

  return (
    <VoucherComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      ledgerList={ledgerList}
      loading={loading}
    />
  );
};

export default VoucherContainer;
