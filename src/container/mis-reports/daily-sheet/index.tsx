"use client";

import React from "react";
import DailySheetComponent from "@/components/mis-reports/daily-sheet";
import { useDailySheet } from "./Hooks";

const DailySheetContainer = () => {
  const sheet = useDailySheet();
  return <DailySheetComponent {...sheet} />;
};

export default DailySheetContainer;
