"use client";

import React, { useEffect } from "react";
import CollectionRegisterComponent from "@/components/loan-reports/collection-register";
import { useCollectionRegister } from "./Hooks";

const CollectionRegisterContainer = () => {
  const { methods, onSubmit, resetForm, loading } = useCollectionRegister();

  useEffect(() => {
    return () => {
      resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CollectionRegisterComponent
      form={methods}
      onSubmit={onSubmit}
      resetForm={resetForm}
      loading={loading}
    />
  );
};

export default CollectionRegisterContainer;
