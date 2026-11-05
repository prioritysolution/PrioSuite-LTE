import {
  endOfMonth,
  endOfQuarter,
  isValid,
  startOfMonth,
  startOfQuarter,
} from "date-fns";
import getCookieData from "@/lib/getCookieData";
import type { DatePreset } from "@/container/mis-reports/co-perfromance/CoPerformanceType";

const parseCookieDate = (value: unknown) => {
  if (value instanceof Date && isValid(value)) return value;
  const text = String(value || "").trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (dmy) return new Date(Number(dmy[3]), Number(dmy[2]) - 1, Number(dmy[1]));
  const parsed = new Date(text);
  return isValid(parsed) ? parsed : null;
};

export const getDatePresetRange = (preset: DatePreset, today = new Date()) => {
  if (preset === "lastMonth") {
    const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return { from: startOfMonth(previousMonth), to: endOfMonth(previousMonth) };
  }

  if (preset === "quarter") {
    return { from: startOfQuarter(today), to: endOfQuarter(today) > today ? today : endOfQuarter(today) };
  }

  if (preset === "fy") {
    const financialYearStart = today.getMonth() >= 3
      ? new Date(today.getFullYear(), 3, 1)
      : new Date(today.getFullYear() - 1, 3, 1);
    const configuredStart = parseCookieDate(getCookieData("priobank-lite-fin_start_date"));
    const configuredEnd = parseCookieDate(getCookieData("priobank-lite-fin_end_date"));
    const from = configuredStart || financialYearStart;
    const configuredTo = configuredEnd || new Date(from.getFullYear() + 1, 2, 31);
    return { from, to: configuredTo > today ? today : configuredTo };
  }

  return { from: startOfMonth(today), to: today };
};
