"use client";

import { useState } from "react";
import OpeningEditTab, {
  OpeningEntryShell,
} from "@/components/rectify/opening-entry";
import OpeningLogTab from "@/components/rectify/opening-entry/LogTab";
import { useIsClient } from "@/hooks/useIsClient";
import { useOpeningEntry } from "./Hooks";
import { useOpeningEntryLog } from "./LogHooks";
import { OpeningEntryTab } from "./OpeningEntryType";

const EditTabContainer = () => <OpeningEditTab {...useOpeningEntry()} />;

const LogTabContainer = () => <OpeningLogTab {...useOpeningEntryLog()} />;

const TAB_CONTENT: Record<OpeningEntryTab, () => React.JSX.Element> = {
  edit: EditTabContainer,
  log: LogTabContainer,
};

const OpeningEntry = () => {
  const [tab, setTab] = useState<OpeningEntryTab>("edit");
  const [opened, setOpened] = useState<OpeningEntryTab[]>(["edit"]);

  const onTabChange = (next: OpeningEntryTab) => {
    setTab(next);
    setOpened((current) => (current.includes(next) ? current : [...current, next]));
  };

  return (
    <OpeningEntryShell tab={tab} onTabChange={onTabChange}>
      {opened.map((id) => {
        const Content = TAB_CONTENT[id];
        return (
          <div key={id} hidden={id !== tab}>
            <Content />
          </div>
        );
      })}
    </OpeningEntryShell>
  );
};

const OpeningEntryContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <OpeningEntry />;
};

export default OpeningEntryContainer;
