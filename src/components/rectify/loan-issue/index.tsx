"use client";

import { ReactNode } from "react";
import { History, Landmark, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { LoanRectifyTab } from "@/container/rectify/loan-issue/LoanRectifyType";

const TABS: { id: LoanRectifyTab; label: string; icon: ReactNode }[] = [
  { id: "loans", label: "Issued Loans", icon: <Landmark size={16} /> },
  { id: "history", label: "Correction History", icon: <History size={16} /> },
  { id: "log", label: "Activity Log", icon: <ScrollText size={16} /> },
];

interface LoanRectifyPageProps {
  tab: LoanRectifyTab;
  onTabChange: (tab: LoanRectifyTab) => void;
  children: ReactNode;
}

const LoanRectifyPage = ({ tab, onTabChange, children }: LoanRectifyPageProps) => (
  <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="page-header-card">
      <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
      <div className="pl-2 min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Loan Issue
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Find an issued loan and correct the loan date, amount, scheme, purpose,
          guarantor or Sahayika
        </p>
      </div>
    </div>

    <div
      role="tablist"
      className="flex flex-wrap gap-2 rounded-xl border border-gray-100 bg-white p-1.5 shadow-sm"
    >
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          onClick={() => onTabChange(item.id)}
          className={cn(
            "flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors",
            tab === item.id
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 hover:bg-primary/5 hover:text-primary",
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>

    {children}
  </div>
);

export default LoanRectifyPage;
