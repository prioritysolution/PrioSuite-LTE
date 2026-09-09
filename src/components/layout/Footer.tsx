"use client";

import { Skeleton } from "../ui/skeleton";

interface FooterProps {
  financialYearLabel: string | null;
  startDate: string;
  endDate: string;
  branchName: string;
  currentTime: Date;
  mounted: boolean;
}

const Footer = ({
  financialYearLabel,
  startDate,
  endDate,
  branchName,
  currentTime,
  mounted
}: FooterProps) => {
  return (
    <footer className="flex-shrink-0 h-10 w-full bg-[#00264D] border-t border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 overflow-hidden">
      {/* Branch name */}
      <div className="text-white/50 text-[10px] sm:text-xs whitespace-nowrap">
        Branch:{" "}
        <span className="font-semibold text-white/70">
          {mounted && branchName ? (
            branchName
          ) : mounted ? (
            "Main Branch"
          ) : (
            <Skeleton className="inline-block w-10 h-3 bg-white/15 rounded align-middle" />
          )}
        </span>
      </div>

      {/* Financial Year — center */}
      <div className="flex items-center gap-1.5 text-white/50 text-[10px] sm:text-xs">
        <span className="whitespace-nowrap">FY:</span>
        <span className="font-semibold text-white/70">
          {mounted ? (
            financialYearLabel || (startDate && endDate ? `${startDate.slice(0, 4)} – ${endDate.slice(0, 4)}` : "...")
          ) : (
            <Skeleton className="inline-block w-10 h-3 bg-white/15 rounded align-middle" />
          )}
        </span>
      </div>

      {/* Current date and time */}
      <div className="flex items-center gap-1.5 text-white/50 text-[10px] sm:text-xs">
        <span className="whitespace-nowrap hidden sm:inline">Date & Time:</span>
        <span className="font-semibold text-white/70 whitespace-nowrap">
          {mounted ? (
            <>
              {currentTime.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              {currentTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </>
          ) : (
            <Skeleton className="inline-block w-[140px] h-3 bg-white/15 rounded align-middle" />
          )}
        </span>
      </div>
    </footer>
  );
};

export default Footer;