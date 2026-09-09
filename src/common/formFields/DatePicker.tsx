"use client";

import * as React from "react";
import {
  format,
  getDaysInMonth,
  isAfter,
  isBefore,
  startOfDay,
  isValid,
  parse,
} from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import {
  useController,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import getCookieData from "@/lib/getCookieData";

// Utility to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

interface DatePickerProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dateFormat?: string;
  allowClear?: boolean;
  picker?: "date" | "month" | "year";
  isRequired?: boolean;
  disablePastAndFuture?: boolean;
  disableFuture?: boolean;
  disableBeforeStartDate?: boolean;
  restrictToFinancialYear?: boolean;
  showCurrentDate?: boolean;
  onChange?: (date: Date | null) => void;
  rules?: any;
  /** Keyboard typing plus calendar icon. Defaults to true for date fields. */
  isManualInput?: boolean;
}

type DateMask = {
  separator: string;
  yearLen: number;
  maxDigits: number;
  expectedLength: number;
  parsePattern: string;
  placeholder: string;
};

function getDateMask(dateFormat: string): DateMask {
  const separator = dateFormat.includes("/") ? "/" : "-";
  const yearLen = 4;

  return {
    separator,
    yearLen,
    maxDigits: 4 + yearLen,
    expectedLength: 4 + yearLen + 2,
    parsePattern: `dd${separator}MM${separator}yyyy`,
    placeholder: `DD${separator}MM${separator}YYYY`,
  };
}

function getNaturalDateError(formatted: string, mask: DateMask): string | null {
  if (!formatted) return null;

  const [dayPart = "", monthPart = "", yearPart = ""] = formatted.split(mask.separator);

  if (dayPart.length === 2) {
    const day = Number(dayPart);
    if (day < 1 || day > 31) return "Enter a valid day (01-31)";
  }

  if (monthPart.length === 2) {
    const month = Number(monthPart);
    if (month < 1 || month > 12) return "Enter a valid month (01-12)";
  }

  if (
    dayPart.length !== 2 ||
    monthPart.length !== 2 ||
    yearPart.length !== 4
  ) {
    return null;
  }

  const day = Number(dayPart);
  const month = Number(monthPart);
  const year = Number(yearPart);

  if (year < 1000) return "Enter a full year (YYYY)";

  const maxDay = getDaysInMonth(new Date(year, month - 1, 1));
  if (day > maxDay) return "Enter a valid date";

  return null;
}

function formatDateDigits(
  digits: string,
  mask: DateMask,
  addTrailingSeparator: boolean,
) {
  const clean = digits.replace(/\D/g, "").slice(0, mask.maxDigits);
  const day = clean.slice(0, 2);
  const month = clean.slice(2, 4);
  const year = clean.slice(4, 4 + mask.yearLen);

  let formatted = day;
  if (month) formatted += mask.separator + month;
  else if (addTrailingSeparator && clean.length === 2) formatted += mask.separator;

  if (year) formatted += mask.separator + year;
  else if (addTrailingSeparator && clean.length === 4) formatted += mask.separator;

  return formatted;
}

export function DatePicker<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Select date",
  disabled = false,
  className,
  dateFormat = "dd-MM-yyyy",
  allowClear = true,
  picker = "date",
  isRequired = false,
  disablePastAndFuture = false,
  disableFuture = false,
  disableBeforeStartDate = false,
  restrictToFinancialYear = false,
  showCurrentDate = false,
  onChange,
  rules,
  isManualInput = true,
}: DatePickerProps<T>) {
  const [open, setOpen] = React.useState(false);
  const isEditingRef = React.useRef(false);
  const mask = React.useMemo(() => getDateMask(dateFormat), [dateFormat]);
  const allowKeyboard = isManualInput && picker === "date";
  const [startDateFromCookie, setStartDateFromCookie] =
    React.useState<Date | null>(null);
  const [inputValue, setInputValue] = React.useState("");
  const [inputError, setInputError] = React.useState("");

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: {
      required: isRequired ? "This field is required" : false,
      ...rules,
    },
  });

  const [finStartDate, setFinStartDate] = React.useState<Date | null>(null);
  const [finEndDate, setFinEndDate] = React.useState<Date | null>(null);

  // Load start date from cookie on mount
  React.useEffect(() => {
    const cookieVal = getCookie("PrioBankStartDate");
    if (cookieVal) {
      const d = new Date(cookieVal);
      if (!isNaN(d.getTime())) {
        setStartDateFromCookie(startOfDay(d));
      }
    }
    
    if (restrictToFinancialYear) {
      const startVal = getCookieData("priobank-lite-fin_start_date");
      const endVal = getCookieData("priobank-lite-fin_end_date");
      if (startVal) {
        const d = new Date(startVal);
        if (!isNaN(d.getTime())) setFinStartDate(startOfDay(d));
      }
      if (endVal) {
        const d = new Date(endVal);
        if (!isNaN(d.getTime())) setFinEndDate(startOfDay(d));
      }
    }
  }, [restrictToFinancialYear]);

  // Handle showCurrentDate logic (only if today is allowed)
  React.useEffect(() => {
    if (!showCurrentDate || field.value) return;
    if (restrictToFinancialYear && (!finStartDate || !finEndDate)) return;

    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const todayStart = startOfDay(today);
    if (disableFuture && isAfter(todayStart, startOfDay(new Date()))) return;
    if (restrictToFinancialYear) {
      if (finStartDate && isBefore(todayStart, finStartDate)) return;
      if (finEndDate && isAfter(todayStart, finEndDate)) return;
    }
    if (
      disableBeforeStartDate &&
      startDateFromCookie &&
      isBefore(todayStart, startDateFromCookie)
    ) {
      return;
    }

    field.onChange(today);
  }, [
    showCurrentDate,
    field.value,
    field.onChange,
    restrictToFinancialYear,
    finStartDate,
    finEndDate,
    disableFuture,
    disableBeforeStartDate,
    startDateFromCookie,
  ]);

  // Sync typed text with the stored date, unless the user is mid-entry
  React.useEffect(() => {
    if (isEditingRef.current) return;
    if (field.value) {
      const d = new Date(field.value);
      if (isValid(d)) {
        setInputValue(format(d, mask.parsePattern));
        return;
      }
    }
    setInputValue("");
  }, [field.value, dateFormat, mask.parsePattern]);

  const date =
    (field.value as any) instanceof Date
      ? (field.value as Date)
      : field.value
        ? new Date(field.value as any)
        : undefined;

  const handleSelect = (newDate?: Date) => {
    let finalDate = newDate;
    if (finalDate) {
      finalDate = new Date(finalDate);
      finalDate.setHours(12, 0, 0, 0);
      // Never accept dates blocked by FY / future / start-date rules
      if (disabledDate(finalDate)) {
        setOpen(false);
        return;
      }
    }

    field.onChange(finalDate || null);
    if (onChange) onChange(finalDate || null);
    isEditingRef.current = false;
    setInputError("");
    setInputValue(finalDate ? format(finalDate, mask.parsePattern) : "");

    // Only close if it's a "date" picker or if a full selection is made
    // For month/year pickers, we might want to close on selection too
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    isEditingRef.current = false;
    setInputValue("");
    setInputError("");
    field.onChange(null);
    if (onChange) onChange(null);
  };

  const rejectTypedDate = (message: string) => {
    setInputError(message);
    field.onChange(null);
    if (onChange) onChange(null);
  };

  const commitTypedDate = (formattedValue: string) => {
    const naturalError = getNaturalDateError(formattedValue, mask);
    if (naturalError) {
      rejectTypedDate(naturalError);
      return;
    }

    if (formattedValue.length !== mask.expectedLength) {
      setInputError("");
      if (!formattedValue) {
        field.onChange(null);
        if (onChange) onChange(null);
      }
      return;
    }

    const parsedDate = parse(formattedValue, mask.parsePattern, new Date());
    const isExact =
      isValid(parsedDate) && format(parsedDate, mask.parsePattern) === formattedValue;

    if (!isExact) {
      rejectTypedDate("Enter a valid date");
      return;
    }

    parsedDate.setHours(12, 0, 0, 0);
    if (disabledDate(parsedDate)) {
      rejectTypedDate("This date is not allowed");
      return;
    }

    setInputError("");
    field.onChange(parsedDate);
    if (onChange) onChange(parsedDate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatDateDigits(e.target.value, mask, true);
    setInputValue(formattedValue);
    commitTypedDate(formattedValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace") return;

    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start !== end || start === 0) return;
    if (inputValue[start - 1] !== mask.separator) return;

    e.preventDefault();
    const digits = inputValue.replace(/\D/g, "");
    const formattedValue = formatDateDigits(digits.slice(0, -1), mask, false);
    setInputValue(formattedValue);
    commitTypedDate(formattedValue);
  };

  const handleInputBlur = () => {
    isEditingRef.current = false;
    if (!inputValue) {
      setInputError("");
      return;
    }

    const naturalError = getNaturalDateError(inputValue, mask);
    if (naturalError) {
      rejectTypedDate(naturalError);
      return;
    }

    if (inputValue.length !== mask.expectedLength) {
      const parts = inputValue.split(mask.separator);
      const needsYear =
        parts[0]?.length === 2 &&
        parts[1]?.length === 2 &&
        (parts[2]?.length ?? 0) < 4;
      rejectTypedDate(
        needsYear
          ? "Enter a full year (YYYY)"
          : `Enter a full date (${mask.placeholder})`,
      );
      return;
    }

    if (field.value) {
      const d = new Date(field.value);
      if (isValid(d)) {
        setInputError("");
        setInputValue(format(d, mask.parsePattern));
      }
    }
  };

  const disabledDate = (d: Date) => {
    const today = startOfDay(new Date());
    const target = startOfDay(d);

    if (disableFuture && isAfter(target, today)) return true;
    if (
      disablePastAndFuture &&
      (isAfter(target, today) || isBefore(target, today))
    )
      return true;

    if (
      disableBeforeStartDate &&
      startDateFromCookie &&
      isBefore(target, startDateFromCookie)
    ) {
      return true;
    }

    if (restrictToFinancialYear) {
      if (finStartDate && isBefore(target, finStartDate)) return true;
      if (finEndDate && isAfter(target, finEndDate)) return true;
    }

    return false;
  };

  // Clear value if it falls outside allowed range once FY dates are loaded
  React.useEffect(() => {
    if (!field.value) return;
    if (restrictToFinancialYear && (!finStartDate || !finEndDate)) return;

    const rawValue = field.value as unknown;
    const current =
      rawValue instanceof Date ? rawValue : new Date(rawValue as string | number);
    if (!isValid(current)) return;

    if (disabledDate(current)) {
      field.onChange(null);
      if (onChange) onChange(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-check when bounds change
  }, [finStartDate, finEndDate, restrictToFinancialYear, disableFuture, disablePastAndFuture, disableBeforeStartDate, startDateFromCookie]);

  const calendarContent = (
    <Calendar
      mode="single"
      selected={date}
      onSelect={handleSelect}
      disabled={disabledDate}
      initialFocus
      className="p-1"
    />
  );

  return (
    <div className="grid w-full gap-2">
      {label && (
        <label className="text-[13px] text-[#00264D] tracking-widest font-medium px-1 flex items-center">
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        {allowKeyboard ? (
          <PopoverAnchor asChild>
            <div className="relative group w-full">
              <Input
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onClick={() => setOpen(false)}
                onFocus={() => {
                  isEditingRef.current = true;
                  setOpen(false);
                }}
                onBlur={handleInputBlur}
                placeholder={mask.placeholder}
                disabled={disabled}
                inputMode="numeric"
                autoComplete="off"
                maxLength={mask.expectedLength}
                className={cn(
                    "w-full pr-20 h-11 transition-all duration-200",
                    (error || inputError) && "border-destructive focus-visible:ring-destructive/50",
                    disabled && "cursor-not-allowed bg-muted/80",
                    "disabled:opacity-100",
                    className,
                )}
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {allowClear && date && !disabled && (
                  <div
                    className="p-1 rounded-full hover:bg-muted-foreground/20 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClear(e);
                    }}
                  >
                    <X className="h-3 w-3 opacity-50" />
                  </div>
                )}
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open calendar"
                    disabled={disabled}
                    className="p-1 rounded-md hover:bg-muted-foreground/15 transition-colors cursor-pointer"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </button>
                </PopoverTrigger>
              </div>
            </div>
          </PopoverAnchor>
        ) : (
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-between text-left font-normal h-11 px-3 relative transition-all duration-200",
                "hover:bg-accent hover:text-accent-foreground",
                !date && "text-muted-foreground",
                error && "border-destructive focus-visible:ring-destructive/50",
                disabled && "cursor-not-allowed bg-muted/80",
                "disabled:opacity-100",
                className,
              )}
              disabled={disabled}
              type="button"
            >
              <span className="truncate">
                {date ? format(date, dateFormat) : placeholder}
              </span>
              <div className="flex items-center gap-2">
                {allowClear && date && !disabled && (
                  <div
                    className="p-1 rounded-full hover:bg-muted-foreground/20 transition-colors"
                    onClick={handleClear}
                  >
                    <X className="h-3 w-3 opacity-50" />
                  </div>
                )}
                <CalendarIcon className="h-4 w-4 opacity-70" />
              </div>
            </Button>
          </PopoverTrigger>
        )}
        <PopoverContent
          className="w-auto p-0 shadow-2xl border-border bg-popover"
          align="start"
        >
          {calendarContent}
        </PopoverContent>
      </Popover>

      {restrictToFinancialYear && finStartDate && finEndDate && (
        <span className="text-[10px] font-medium text-slate-400 px-1">
          Allowed: {format(finStartDate, mask.parsePattern)} to {format(finEndDate, mask.parsePattern)}
        </span>
      )}

      {(inputError || error) && (
        <p className="text-[0.8rem] font-medium text-destructive px-1 animate-in fade-in slide-in-from-top-1">
          {inputError || error?.message}
        </p>
      )}
    </div>
  );
}
