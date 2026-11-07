"use client";

import OpeningEntryPage from "@/components/rectify/opening-entry";
import { useIsClient } from "@/hooks/useIsClient";
import { useOpeningEntry } from "./Hooks";

const OpeningEntry = () => <OpeningEntryPage {...useOpeningEntry()} />;

const OpeningEntryContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <OpeningEntry />;
};

export default OpeningEntryContainer;
