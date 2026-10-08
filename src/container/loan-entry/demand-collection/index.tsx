"use client";

import DemandCollectionUI from "@/components/loan-entry/demand-collection";

import { useDemandCollection } from "./Hooks";

const DemandCollectionContainer = () => {
  const { methods, ...demand } = useDemandCollection();

  return <DemandCollectionUI form={methods} {...demand} />;
};

export default DemandCollectionContainer;
