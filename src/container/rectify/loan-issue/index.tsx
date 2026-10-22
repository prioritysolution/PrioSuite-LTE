"use client";

import { useState } from "react";
import LoanRectifyPage from "@/components/rectify/loan-issue";
import LoansTab from "@/components/rectify/loan-issue/LoansTab";
import LoanHistoryTab from "@/components/rectify/loan-issue/LoanHistoryTab";
import LoanLogTab from "@/components/rectify/loan-issue/LoanLogTab";
import { useIsClient } from "@/hooks/useIsClient";
import { LoanRectifyTab } from "./LoanRectifyType";
import { useLoanRectifyHistory } from "./HistoryHooks";
import { useLoanRectify } from "./Hooks";
import { useLoanRectifyLog } from "./LogHooks";

const LoansTabContainer = () => <LoansTab {...useLoanRectify()} />;

const HistoryTabContainer = () => <LoanHistoryTab {...useLoanRectifyHistory()} />;

const LogTabContainer = () => <LoanLogTab {...useLoanRectifyLog()} />;

const TAB_CONTENT: Record<LoanRectifyTab, () => React.JSX.Element> = {
  loans: LoansTabContainer,
  history: HistoryTabContainer,
  log: LogTabContainer,
};

const LoanRectify = () => {
  const [tab, setTab] = useState<LoanRectifyTab>("loans");
  const [opened, setOpened] = useState<LoanRectifyTab[]>(["loans"]);

  const onTabChange = (next: LoanRectifyTab) => {
    setTab(next);
    setOpened((current) => (current.includes(next) ? current : [...current, next]));
  };

  return (
    <LoanRectifyPage tab={tab} onTabChange={onTabChange}>
      {opened.map((id) => {
        const Content = TAB_CONTENT[id];
        return (
          <div key={id} hidden={id !== tab}>
            <Content />
          </div>
        );
      })}
    </LoanRectifyPage>
  );
};

// The queries start from the logged-in user and today's date, which only exist in the browser.
const LoanRectifyContainer = () => {
  const isClient = useIsClient();
  if (!isClient) return null;
  return <LoanRectify />;
};

export default LoanRectifyContainer;
