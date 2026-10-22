"use client";

import React from "react";
import DailySheetComponent from "@/components/mis-reports/daily-sheet";
import { useIsClient } from "@/hooks/useIsClient";
import { useDailySheet } from "./Hooks";

const DailySheetReport = () => {
  const sheet = useDailySheet();
  return <DailySheetComponent {...sheet} />;
};

// useDailySheet reads browser cookies during render, so it must not run on the server.
const DailySheetContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <DailySheetReport />;
};

export default DailySheetContainer;
