import { cn } from "@/lib/utils";

const RESULT_STYLES: Record<number, string> = {
  1: "bg-emerald-50 text-emerald-700 border-emerald-200",
  0: "bg-amber-50 text-amber-700 border-amber-200",
  2: "bg-orange-50 text-orange-700 border-orange-200",
  3: "bg-red-50 text-red-700 border-red-200",
};

const LogResultBadge = ({ result, name }: { result: number; name: string }) => (
  <span
    className={cn(
      "inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
      RESULT_STYLES[result] ?? "bg-slate-50 text-slate-600 border-slate-200",
    )}
  >
    {name || "—"}
  </span>
);

export default LogResultBadge;
