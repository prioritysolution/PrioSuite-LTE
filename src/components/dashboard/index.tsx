"use client";

import React from "react";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import {
  Building2,
  Calendar as CalendarIcon,
  Loader2,
  RefreshCcw,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DashboardBranchSection,
  DashboardCardTheme,
  DashboardStatCard,
  DashboardUIProps,
} from "@/container/dashboard/DashboardType";

const THEME_STYLES: Record<
  DashboardCardTheme,
  {
    accent: string;
    iconWrap: string;
    icon: string;
    value: string;
    glow: string;
  }
> = {
  blue: {
    accent: "from-[#0B4F8A] to-[#1A6BB5]",
    iconWrap: "bg-[#E8F2FB] text-[#0B4F8A]",
    icon: "text-[#0B4F8A]",
    value: "text-[#0A3A66]",
    glow: "shadow-[0_8px_24px_rgba(11,79,138,0.08)]",
  },
  green: {
    accent: "from-[#0F766E] to-[#14B8A6]",
    iconWrap: "bg-[#E6F7F4] text-[#0F766E]",
    icon: "text-[#0F766E]",
    value: "text-[#115E59]",
    glow: "shadow-[0_8px_24px_rgba(15,118,110,0.08)]",
  },
  yellow: {
    accent: "from-[#B45309] to-[#D97706]",
    iconWrap: "bg-[#FFF4E8] text-[#B45309]",
    icon: "text-[#B45309]",
    value: "text-[#92400E]",
    glow: "shadow-[0_8px_24px_rgba(180,83,9,0.08)]",
  },
  purple: {
    accent: "from-[#1E3A5F] to-[#334155]",
    iconWrap: "bg-[#EEF2F7] text-[#1E3A5F]",
    icon: "text-[#1E3A5F]",
    value: "text-[#0F172A]",
    glow: "shadow-[0_8px_24px_rgba(30,58,95,0.08)]",
  },
};

function formatRangeLabel(fromDate: Date | null, toDate: Date | null) {
  if (!fromDate || !toDate) return "Select date range";
  return `${format(fromDate, "dd MMM yyyy")} - ${format(toDate, "dd MMM yyyy")}`;
}

export const DashboardUI: React.FC<DashboardUIProps> = ({
  branchName,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onSearch,
  onRefresh,
  loading,
  error,
  statCards,
  isHeadView,
  branchSections,
  finStartDate,
  finEndDate,
}) => {
  const [open, setOpen] = React.useState(false);

  const disabledDate = (date: Date, bound?: "from" | "to") => {
    const target = startOfDay(date);
    const today = startOfDay(new Date());

    if (finStartDate && isBefore(target, startOfDay(finStartDate))) return true;
    if (finEndDate && isAfter(target, startOfDay(finEndDate))) return true;
    if (isAfter(target, today)) return true;

    if (bound === "from" && toDate && isAfter(target, startOfDay(toDate))) {
      return true;
    }
    if (bound === "to" && fromDate && isBefore(target, startOfDay(fromDate))) {
      return true;
    }
    return false;
  };

  const displayName = fromDate && toDate ? branchName : "Branch";

  return (
    <div className="page-content">
      {/* ── Top toolbar ── */}
      <div className="page-header-card">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-primary" />

        <div className="pl-2 flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Building2 size={22} />
          </div>
          <div className="min-w-0 pt-0.5">
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-slate-400 m-0">
              Portfolio Dashboard
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-primary tracking-tight truncate m-0 mt-1">
              {displayName}
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium m-0">
              {isHeadView
                ? "Consolidated view across head office and all branches"
                : "Branch-level loan and collection performance"}
            </p>
          </div>
        </div>

        <div className="flex items-center self-stretch sm:self-center rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-3.5 h-11 text-sm text-slate-700 hover:bg-white transition-colors min-w-0 cursor-pointer"
              >
                <CalendarIcon className="h-4 w-4 text-primary/70 flex-shrink-0" />
                <span className="whitespace-nowrap font-semibold text-slate-800">
                  {formatRangeLabel(fromDate, toDate)}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 px-2 mb-1">
                    From
                  </p>
                  <Calendar
                    mode="single"
                    selected={fromDate ?? undefined}
                    onSelect={onFromDateChange}
                    disabled={(date) => disabledDate(date, "from")}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 px-2 mb-1">
                    To
                  </p>
                  <Calendar
                    mode="single"
                    selected={toDate ?? undefined}
                    onSelect={onToDateChange}
                    disabled={(date) => disabledDate(date, "to")}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <button
            type="button"
            onClick={onSearch}
            disabled={loading || !fromDate || !toDate}
            className="h-11 w-11 flex items-center justify-center border-l border-slate-200 text-slate-600 hover:bg-white hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Search dashboard"
            title="Search"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="h-11 w-11 flex items-center justify-center border-l border-slate-200 text-slate-600 hover:bg-white hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Refresh dashboard to financial year"
            title="Reset to financial year & refresh"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* ── Overall / current-branch KPI ── */}
      <section className="space-y-3.5">
        <SectionHeading
          title={isHeadView ? "Overall Summary" : "Branch Summary"}
          subtitle={
            isHeadView
              ? "Aggregated performance across all branches"
              : "Performance for the selected period"
          }
        />
        <StatCardsGrid cards={statCards} loading={loading} featured />
      </section>

      {/* ── Head office: branch-wise loop ── */}
      {isHeadView && branchSections.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            title="Branch Wise Summary"
            subtitle={`${branchSections.length} branches in this portfolio`}
          />
          <div className="grid grid-cols-1 gap-4">
            {branchSections.map((section, index) => (
              <BranchSectionBlock
                key={section.branchId}
                section={section}
                loading={loading}
                index={index}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-primary tracking-tight m-0">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 m-0 font-medium">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function BranchSectionBlock({
  section,
  loading,
  index,
}: {
  section: DashboardBranchSection;
  loading: boolean;
  index: number;
}) {
  return (
    <div
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500"
      style={{ animationDelay: `${Math.min(index, 6) * 40}ms` }}
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-primary/8 text-primary flex items-center justify-center flex-shrink-0">
            <Users className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate m-0">
              {section.branchName}
            </h3>
          </div>
        </div>
        {section.isHead ? (
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
            Head
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Branch
          </span>
        )}
      </div>

      <div className="p-3.5 sm:p-4">
        <StatCardsGrid cards={section.cards} loading={loading} compact />
      </div>
    </div>
  );
}

function StatCardsGrid({
  cards,
  loading,
  featured = false,
  compact = false,
}: {
  cards: DashboardStatCard[];
  loading: boolean;
  featured?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
      {cards.map((card, i) => (
        <StatCardItem
          key={card.key}
          card={card}
          loading={loading}
          featured={featured}
          compact={compact}
          delay={i * 40}
        />
      ))}
    </div>
  );
}

function StatCardItem({
  card,
  loading,
  featured,
  compact,
  delay = 0,
}: {
  card: DashboardStatCard;
  loading: boolean;
  featured?: boolean;
  compact?: boolean;
  delay?: number;
}) {
  const { Icon } = card;
  const theme = THEME_STYLES[card.theme];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white transition-all duration-300 hover:-translate-y-0.5",
        theme.glow,
        featured ? "min-h-[120px]" : "min-h-[104px]",
        compact ? "px-3.5 py-3.5" : "px-4 py-4 sm:px-5 sm:py-5",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-1 bg-gradient-to-b",
          theme.accent,
        )}
      />

      <div className="flex items-start gap-3.5 min-w-0 pl-1">
        <div
          className={cn(
            "rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105",
            theme.iconWrap,
            compact ? "h-10 w-10" : "h-11 w-11 sm:h-12 sm:w-12",
          )}
        >
          <Icon
            className={cn(compact ? "h-5 w-5" : "h-5 w-5 sm:h-6 sm:w-6", theme.icon)}
            strokeWidth={2.1}
          />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="m-0 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.06em] text-slate-500 leading-snug whitespace-nowrap truncate">
            {card.title}
          </p>
          {loading ? (
            <div className="mt-2.5 space-y-1.5">
              <Skeleton className="h-7 w-28 bg-slate-100" />
              <Skeleton className="h-3 w-40 bg-slate-100" />
            </div>
          ) : (
            <>
              <p
                className={cn(
                  "mt-1.5 font-bold tracking-tight whitespace-nowrap truncate m-0",
                  theme.value,
                  compact
                    ? "text-lg sm:text-xl"
                    : "text-xl sm:text-[22px] leading-none",
                )}
              >
                {card.value}
              </p>
              <p
                className="mt-1.5 mb-0 text-[10px] sm:text-[11px] font-medium text-slate-500 leading-none whitespace-nowrap truncate"
                title={card.valueInWords}
              >
                {card.valueInWords}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
