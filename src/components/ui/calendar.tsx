// "use client"

// import * as React from "react"
// import {
//   DayPicker,
//   getDefaultClassNames,
//   type DayButton,
//   type Locale,
// } from "react-day-picker"

// import { cn } from "@/lib/utils"
// import { Button, buttonVariants } from "@/components/ui/button"
// import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react"

// function Calendar({
//   className,
//   classNames,
//   showOutsideDays = true,
//   captionLayout = "label",
//   buttonVariant = "ghost",
//   locale,
//   formatters,
//   components,
//   ...props
// }: React.ComponentProps<typeof DayPicker> & {
//   buttonVariant?: React.ComponentProps<typeof Button>["variant"]
// }) {
//   const defaultClassNames = getDefaultClassNames()

//   return (
//     <DayPicker
//       showOutsideDays={showOutsideDays}
//       className={cn(
//         "group/calendar bg-background p-2 [--cell-radius:var(--radius-md)] [--cell-size:--spacing(7)] in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent",
//         String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
//         String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
//         className
//       )}
//       captionLayout={captionLayout}
//       locale={locale}
//       formatters={{
//         formatMonthDropdown: (date) =>
//           date.toLocaleString(locale?.code, { month: "short" }),
//         ...formatters,
//       }}
//       classNames={{
//         root: cn("w-fit", defaultClassNames.root),
//         months: cn(
//           "relative flex flex-col gap-4 md:flex-row",
//           defaultClassNames.months
//         ),
//         month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
//         nav: cn(
//           "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
//           defaultClassNames.nav
//         ),
//         button_previous: cn(
//           buttonVariants({ variant: buttonVariant }),
//           "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
//           defaultClassNames.button_previous
//         ),
//         button_next: cn(
//           buttonVariants({ variant: buttonVariant }),
//           "size-(--cell-size) p-0 select-none aria-disabled:opacity-50",
//           defaultClassNames.button_next
//         ),
//         month_caption: cn(
//           "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
//           defaultClassNames.month_caption
//         ),
//         dropdowns: cn(
//           "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
//           defaultClassNames.dropdowns
//         ),
//         dropdown_root: cn(
//           "relative rounded-(--cell-radius)",
//           defaultClassNames.dropdown_root
//         ),
//         dropdown: cn(
//           "absolute inset-0 bg-popover opacity-0",
//           defaultClassNames.dropdown
//         ),
//         caption_label: cn(
//           "font-medium select-none",
//           captionLayout === "label"
//             ? "text-sm"
//             : "flex items-center gap-1 rounded-(--cell-radius) text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground",
//           defaultClassNames.caption_label
//         ),
//         table: "w-full border-collapse",
//         weekdays: cn("flex", defaultClassNames.weekdays),
//         weekday: cn(
//           "flex-1 rounded-(--cell-radius) text-[0.8rem] font-normal text-muted-foreground select-none",
//           defaultClassNames.weekday
//         ),
//         week: cn("mt-2 flex w-full", defaultClassNames.week),
//         week_number_header: cn(
//           "w-(--cell-size) select-none",
//           defaultClassNames.week_number_header
//         ),
//         week_number: cn(
//           "text-[0.8rem] text-muted-foreground select-none",
//           defaultClassNames.week_number
//         ),
//         day: cn(
//           "group/day relative aspect-square h-full w-full rounded-(--cell-radius) p-0 text-center select-none [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
//           props.showWeekNumber
//             ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-(--cell-radius)"
//             : "[&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius)",
//           defaultClassNames.day
//         ),
//         range_start: cn(
//           "relative isolate z-0 rounded-l-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-muted",
//           defaultClassNames.range_start
//         ),
//         range_middle: cn("rounded-none", defaultClassNames.range_middle),
//         range_end: cn(
//           "relative isolate z-0 rounded-r-(--cell-radius) bg-muted after:absolute after:inset-y-0 after:left-0 after:w-4 after:bg-muted",
//           defaultClassNames.range_end
//         ),
//         today: cn(
//           "rounded-(--cell-radius) bg-muted text-foreground data-[selected=true]:rounded-none",
//           defaultClassNames.today
//         ),
//         outside: cn(
//           "text-muted-foreground aria-selected:text-muted-foreground",
//           defaultClassNames.outside
//         ),
//         disabled: cn(
//           "text-muted-foreground opacity-50",
//           defaultClassNames.disabled
//         ),
//         hidden: cn("invisible", defaultClassNames.hidden),
//         ...classNames,
//       }}
//       components={{
//         Root: ({ className, rootRef, ...props }) => {
//           return (
//             <div
//               data-slot="calendar"
//               ref={rootRef}
//               className={cn(className)}
//               {...props}
//             />
//           )
//         },
//         Chevron: ({ className, orientation, ...props }) => {
//           if (orientation === "left") {
//             return (
//               <ChevronLeftIcon className={cn("size-4", className)} {...props} />
//             )
//           }

//           if (orientation === "right") {
//             return (
//               <ChevronRightIcon className={cn("size-4", className)} {...props} />
//             )
//           }

//           return (
//             <ChevronDownIcon className={cn("size-4", className)} {...props} />
//           )
//         },
//         DayButton: ({ ...props }) => (
//           <CalendarDayButton locale={locale} {...props} />
//         ),
//         WeekNumber: ({ children, ...props }) => {
//           return (
//             <td {...props}>
//               <div className="flex size-(--cell-size) items-center justify-center text-center">
//                 {children}
//               </div>
//             </td>
//           )
//         },
//         ...components,
//       }}
//       {...props}
//     />
//   )
// }

// function CalendarDayButton({
//   className,
//   day,
//   modifiers,
//   locale,
//   ...props
// }: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
//   const defaultClassNames = getDefaultClassNames()

//   const ref = React.useRef<HTMLButtonElement>(null)
//   React.useEffect(() => {
//     if (modifiers.focused) ref.current?.focus()
//   }, [modifiers.focused])

//   return (
//     <Button
//       ref={ref}
//       variant="ghost"
//       size="icon"
//       data-day={day.date.toLocaleDateString(locale?.code)}
//       data-selected-single={
//         modifiers.selected &&
//         !modifiers.range_start &&
//         !modifiers.range_end &&
//         !modifiers.range_middle
//       }
//       data-range-start={modifiers.range_start}
//       data-range-end={modifiers.range_end}
//       data-range-middle={modifiers.range_middle}
//       className={cn(
//         "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-ring/50 data-[range-end=true]:rounded-(--cell-radius) data-[range-end=true]:rounded-r-(--cell-radius) data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-muted data-[range-middle=true]:text-foreground data-[range-start=true]:rounded-(--cell-radius) data-[range-start=true]:rounded-l-(--cell-radius) data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground dark:hover:text-foreground [&>span]:text-xs [&>span]:opacity-70",
//         defaultClassNames.day,
//         className
//       )}
//       {...props}
//     />
//   )
// }

// export { Calendar, CalendarDayButton }

"use client";

import * as React from "react";
import {
  DayPicker,
  getDefaultClassNames,
  type DayButton,
  type Locale,
  type DayPickerProps,
} from "react-day-picker";
import {
  format,
  setMonth,
  setYear,
  startOfYear,
  addYears,
  subYears,
  addMonths,
  subMonths,
} from "date-fns";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";

type CalendarView = "days" | "months" | "years";

function Calendar(
  allProps: DayPickerProps & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  },
) {
  const {
    className,
    classNames,
    showOutsideDays = true,
    buttonVariant = "ghost",
    locale,
    components,
    selected,
    onSelect,
    mode,
    ...props
  } = allProps as any;
  const [view, setView] = React.useState<CalendarView>("days");
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    (selected as Date) || new Date(),
  );

  React.useEffect(() => {
    if (selected instanceof Date) {
      setCurrentMonth(selected);
    }
  }, [selected]);

  const defaultClassNames = getDefaultClassNames();

  const handleMonthSelect = (monthIndex: number) => {
    const newMonth = setMonth(currentMonth, monthIndex);
    setCurrentMonth(newMonth);
    setView("days");
  };

  const handleYearSelect = (year: number) => {
    const newMonth = setYear(currentMonth, year);
    setCurrentMonth(newMonth);
    setView("months");
  };

  const isDateDisabled = (date: Date) => {
    const matcher = props.disabled;
    if (!matcher) return false;

    const matchers = Array.isArray(matcher) ? matcher : [matcher];
    return matchers.some((m: any) => {
      if (typeof m === "boolean") return m;
      if (typeof m === "function") return m(date);
      if (m instanceof Date) {
        return (
          m.getFullYear() === date.getFullYear() &&
          m.getMonth() === date.getMonth() &&
          m.getDate() === date.getDate()
        );
      }
      return false;
    });
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(today);
    // Respect DatePicker disabled rules (FY range, disableFuture, etc.)
    if (onSelect && !isDateDisabled(today)) {
      // @ts-ignore
      onSelect(today);
    }
    setView("days");
  };

  const todayDisabled = isDateDisabled(new Date());

  // Years for the decade view
  const currentYear = currentMonth.getFullYear();
  const startYear = Math.floor(currentYear / 10) * 10;
  const years = Array.from({ length: 12 }, (_, i) => startYear - 1 + i);

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className={cn("p-2 space-y-2 w-[280px]", className)}>
      {view === "days" && (
        <>
          <div className="flex items-center justify-between px-1 relative">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setCurrentMonth(subYears(currentMonth, 1))}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                className="h-7 px-2 text-sm font-semibold hover:bg-accent"
                onClick={() => setView("months")}
              >
                {format(currentMonth, "MMM")}
              </Button>
              <Button
                variant="ghost"
                className="h-7 px-2 text-sm font-semibold hover:bg-accent"
                onClick={() => setView("years")}
              >
                {format(currentMonth, "yyyy")}
              </Button>
            </div>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setCurrentMonth(addYears(currentMonth, 1))}
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <DayPicker
            mode={mode as any}
            selected={selected as any}
            onSelect={onSelect as any}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            showOutsideDays={showOutsideDays}
            className={cn(
              "group/calendar [--cell-radius:var(--radius-md)] [--cell-size:36px]",
              String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
              String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
            )}
            classNames={{
              root: cn("w-fit", defaultClassNames.root),
              months: cn(
                "relative flex flex-col gap-2",
                defaultClassNames.months,
              ),
              month: cn("flex w-full flex-col gap-2", defaultClassNames.month),
              nav: cn(
                "absolute right-0 top-0 flex items-center justify-end gap-1 z-10 hidden",
                defaultClassNames.nav,
              ), // Hidden as we use custom header
              month_caption: "hidden", // Hidden as we use custom header
              table: "w-full border-collapse",
              weekdays: cn("flex", defaultClassNames.weekdays),
              weekday: cn(
                "flex-1 text-[0.8rem] font-normal text-muted-foreground select-none h-9 flex items-center justify-center w-9",
                defaultClassNames.weekday,
              ),
              week: cn("mt-1 flex w-full", defaultClassNames.week),
              day: cn(
                "group/day relative h-9 w-9 rounded-(--cell-radius) p-0 text-center select-none flex items-center justify-center",
                defaultClassNames.day,
              ),
              today: cn(
                "bg-accent text-accent-foreground font-bold",
                defaultClassNames.today,
              ),
              outside: cn(
                "text-muted-foreground opacity-50",
                defaultClassNames.outside,
              ),
              disabled: cn(
                "text-muted-foreground opacity-20",
                defaultClassNames.disabled,
              ),
              ...classNames,
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === "left" ? (
                  <ChevronLeftIcon className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                ),
              DayButton: ({ ...props }) => (
                <CalendarDayButton locale={locale} {...props} />
              ),
              ...components,
            }}
            {...props}
          />

          <div className="flex justify-center border-t pt-2">
            <Button
              variant="link"
              disabled={todayDisabled}
              className={cn(
                "text-xs font-medium hover:no-underline cursor-pointer text-blue-600",
                todayDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
              )}
              onClick={handleTodayClick}
            >
              Today
            </Button>
          </div>
        </>
      )}

      {view === "months" && (
        <div className="w-[280px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <Button
              variant="ghost"
              className="h-8 text-sm font-bold text-blue-600 cursor-pointer hover:bg-blue-50 hover:text-blue-700"
              onClick={() => setView("years")}
            >
              {format(currentMonth, "yyyy")}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                variant={
                  currentMonth.getMonth() === index ? "default" : "ghost"
                }
                className={cn(
                  "cursor-pointer h-12 text-sm transition-all",
                  currentMonth.getMonth() === index &&
                    "bg-blue-500 text-white hover:bg-blue-600",
                )}
                onClick={() => handleMonthSelect(index)}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      )}

      {view === "years" && (
        <div className="w-[280px]">
          <div className="flex items-center justify-between mb-4 px-1">
            <Button
              variant="ghost"
              className="h-8 text-sm font-bold text-blue-600"
              disabled
            >
              {startYear} - {startYear + 9}
            </Button>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setCurrentMonth(subYears(currentMonth, 10))}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 cursor-pointer"
                onClick={() => setCurrentMonth(addYears(currentMonth, 10))}
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => (
              <Button
                key={year}
                variant={currentYear === year ? "default" : "ghost"}
                className={cn(
                  "cursor-pointer h-12 text-sm transition-all",
                  currentYear === year &&
                    "bg-blue-500 text-white hover:bg-blue-600",
                  (year < startYear || year > startYear + 9) && "opacity-30",
                )}
                onClick={() => handleYearSelect(year)}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(
        "cursor-pointer relative isolate z-10 flex h-9 w-9 items-center justify-center border-0 leading-none font-normal rounded-(--cell-radius)",
        modifiers.selected &&
          "bg-blue-500 text-white hover:bg-blue-600 hover:text-white",
        modifiers.today &&
          !modifiers.selected &&
          "bg-blue-50 text-blue-600 font-bold border border-blue-300",
        !modifiers.selected &&
          "hover:bg-blue-50 hover:text-blue-600 transition-colors",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
