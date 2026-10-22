"use client";

import { ReactNode } from "react";
import { History, ListChecks, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { RectifyTab } from "@/container/rectify/collection-repayment/CollectionRectifyType";

const TABS: { id: RectifyTab; label: string; icon: ReactNode }[] = [
  { id: "collections", label: "Collections", icon: <ListChecks size={16} /> },
  { id: "history", label: "Correction History", icon: <History size={16} /> },
  { id: "log", label: "Activity Log", icon: <ScrollText size={16} /> },
];

interface CollectionRectifyPageProps {
  tab: RectifyTab;
  onTabChange: (tab: RectifyTab) => void;
  children: ReactNode;
}

const CollectionRectifyPage = ({
  tab,
  onTabChange,
  children,
}: CollectionRectifyPageProps) => (
  <div className="page-content animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="page-header-card">
      <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
      <div className="pl-2 min-w-0">
        <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
          Collection Repayment
        </h2>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Find a saved loan repayment and correct the loan account, amount,
          date or Sahayika
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

export default CollectionRectifyPage;
