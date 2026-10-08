"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import DemandGenerationUI from "@/components/loan-entry/demand-generation";
import { AppDispatch } from "@/redux/store";
import { useDemandGeneration } from "./Hooks";
import { clearDemand } from "./DemandGenerationReducer";

const DemandGenerationContainer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { methods, ...demand } = useDemandGeneration();

  useEffect(() => {
    return () => {
      dispatch(clearDemand());
    };
  }, [dispatch]);

  return <DemandGenerationUI form={methods} {...demand} />;
};

export default DemandGenerationContainer;
