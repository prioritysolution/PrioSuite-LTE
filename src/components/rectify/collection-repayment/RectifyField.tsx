import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RectifyFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const fieldInputClass =
  "h-11 text-[15px] border-[1.5px] focus-visible:ring-4 focus-visible:ring-ring/18";

const RectifyField = ({
  label,
  required,
  error,
  hint,
  className,
  children,
}: RectifyFieldProps) => (
  <div className={cn("flex flex-col w-full gap-2", className)}>
    <label className="text-sm font-medium text-foreground">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {error ? (
      <p className="text-xs text-red-500">{error}</p>
    ) : hint ? (
      <p className="text-xs text-muted-foreground">{hint}</p>
    ) : null}
  </div>
);

export default RectifyField;
