"use client";

import { useState } from "react";
import CollectionRectifyPage from "@/components/rectify/collection-repayment";
import CollectionsTab from "@/components/rectify/collection-repayment/CollectionsTab";
import HistoryTab from "@/components/rectify/collection-repayment/HistoryTab";
import LogTab from "@/components/rectify/collection-repayment/LogTab";
import { useIsClient } from "@/hooks/useIsClient";
import { RectifyTab } from "./CollectionRectifyType";
import { useRectifyHistory } from "./HistoryHooks";
import { useCollectionRectify } from "./Hooks";
import { useRectifyLog } from "./LogHooks";

const CollectionsTabContainer = () => <CollectionsTab {...useCollectionRectify()} />;

const HistoryTabContainer = () => <HistoryTab {...useRectifyHistory()} />;

const LogTabContainer = () => <LogTab {...useRectifyLog()} />;

const TAB_CONTENT: Record<RectifyTab, () => React.JSX.Element> = {
  collections: CollectionsTabContainer,
  history: HistoryTabContainer,
  log: LogTabContainer,
};

const CollectionRectify = () => {
  const [tab, setTab] = useState<RectifyTab>("collections");
  const [opened, setOpened] = useState<RectifyTab[]>(["collections"]);

  const onTabChange = (next: RectifyTab) => {
    setTab(next);
    setOpened((current) => (current.includes(next) ? current : [...current, next]));
  };

  return (
    <CollectionRectifyPage tab={tab} onTabChange={onTabChange}>
      {opened.map((id) => {
        const Content = TAB_CONTENT[id];
        return (
          <div key={id} hidden={id !== tab}>
            <Content />
          </div>
        );
      })}
    </CollectionRectifyPage>
  );
};

// The queries start from the logged-in user and today's date, which only exist in the browser.
const CollectionRectifyContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <CollectionRectify />;
};

export default CollectionRectifyContainer;
