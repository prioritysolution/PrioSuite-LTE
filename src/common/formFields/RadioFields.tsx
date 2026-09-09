

"use client";

import { FieldValues, Control, Path } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertCircle } from "lucide-react";

interface RadioOption {
  value: string | number;
  label: string;
  description?: string; // optional subtitle — only shown in vertical/card mode
  disabled?: boolean; // whether this option is disabled
}

interface RadioProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  className?: string;
  options: RadioOption[];
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  isRequired?: boolean;
}

const RadioField = <T extends FieldValues>({
  control,
  name,
  label = "Option",
  className,
  options,
  orientation = "vertical",
  disabled = false,
  isRequired = false,
}: RadioProps<T>) => {
  const isHorizontal = orientation === "horizontal";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState?.error;
        const currentValue =
          field.value === null || field.value === undefined
            ? ""
            : String(field.value);

        const selectValue = (next: string) => {
          if (disabled) return;
          field.onChange(next);
          field.onBlur();
        };

        return (
          <FormItem className={cn("flex flex-col w-full gap-2", className)}>
            {/* ── Label ── */}
            {label && (
              <FormLabel
                className={cn(
                  "text-[10.5px] font-bold uppercase tracking-[0.1em] transition-colors",
                  hasError
                    ? "text-red-600"
                    : disabled
                      ? "text-[#7a9bb5] opacity-60"
                      : "text-[#00264D]",
                )}
              >
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <RadioGroup
                onValueChange={selectValue}
                value={currentValue}
                disabled={disabled}
                className={cn(
                  isHorizontal
                    ? "flex flex-row flex-wrap gap-2.5"
                    : "flex flex-col gap-2",
                  disabled && "opacity-55 pointer-events-none",
                )}
              >
                {options.map((option) => {
                  const optionValue = String(option.value);
                  const isSelected = currentValue === optionValue;
                  const optionDisabled = disabled || !!option.disabled;

                  return (
                    <label
                      key={optionValue}
                      htmlFor={`${String(name)}-${optionValue}`}
                      onClick={(e) => {
                        if (optionDisabled) {
                          e.preventDefault();
                          e.stopPropagation();
                          return;
                        }
                        // Explicit select — sr-only Radix item can miss label clicks
                        e.preventDefault();
                        selectValue(optionValue);
                      }}
                      onKeyDown={(e) => {
                        if (optionDisabled) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectValue(optionValue);
                        }
                      }}
                      className={cn(
                        "select-none transition-all duration-150",
                        optionDisabled
                          ? "opacity-50 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer",

                        // ── Horizontal: pill style ──
                        isHorizontal && [
                          "inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px]",
                          "border-[1.5px] text-[13.5px] font-medium",
                          isSelected && !hasError
                            ? "border-[#1560bd] bg-[#eaf3ff] text-[#0d2f6e] shadow-[0_0_0_3px_rgba(21,96,189,0.10)]"
                            : hasError
                              ? "border-red-400 bg-[#fff8f7] text-[#7a2020] hover:border-red-500"
                              : "border-[#c5daf0] bg-[#f4f8fd] text-[#3a5a7a] hover:border-[#1560bd] hover:bg-[#eaf3ff] hover:text-[#0d1f30]",
                        ],

                        // ── Vertical: card style ──
                        !isHorizontal && [
                          "flex items-center gap-3 px-3.5 py-[11px] rounded-[10px]",
                          "border-[1.5px]",
                          isSelected && !hasError
                            ? "border-[#1560bd] bg-[#eef5ff] shadow-[0_0_0_3px_rgba(21,96,189,0.10)]"
                            : hasError
                              ? "border-red-400 bg-[#fff8f7] hover:border-red-500"
                              : "border-[#c5daf0] bg-[#f4f8fd] hover:border-[#1560bd] hover:bg-[#eaf3ff]",
                        ],
                      )}
                    >
                      {/* Hidden native radio — for a11y + react-hook-form */}
                      <RadioGroupItem
                        value={optionValue}
                        id={`${String(name)}-${optionValue}`}
                        disabled={optionDisabled}
                        className="sr-only"
                        tabIndex={-1}
                      />

                      {/* ── Custom dot ──
                          Outer ring: always white bg, border changes color
                          Inner dot:  small blue filled circle, only when selected
                      */}
                      <span
                        className={cn(
                          "flex-shrink-0 rounded-full border-2 bg-white",
                          "flex items-center justify-center",
                          "transition-all duration-150",
                          isHorizontal ? "w-4 h-4" : "w-[17px] h-[17px]",
                          isSelected && !hasError
                            ? "border-[#1560bd]" // blue ring when selected
                            : hasError
                              ? "border-red-400"
                              : "border-[#b0c8e0]", // gray ring by default
                        )}
                        aria-hidden
                      >
                        {/* Inner filled circle — only visible when selected */}
                        {isSelected && !hasError && (
                          <span
                            className={cn(
                              "rounded-full bg-[#1560bd]",
                              isHorizontal
                                ? "w-[7px] h-[7px]"
                                : "w-[7px] h-[7px]",
                            )}
                          />
                        )}

                        {/* Inner error circle — selected + error */}
                        {isSelected && hasError && (
                          <span className="rounded-full bg-red-500 w-[7px] h-[7px]" />
                        )}
                      </span>

                      {/* ── Text ── */}
                      <span className="flex flex-col gap-0.5 min-w-0">
                        <span
                          className={cn(
                            "font-[600] leading-snug text-[13px]",
                            isSelected && !hasError
                              ? "text-[#0d2f6e]"
                              : hasError
                                ? "text-[#7a2020]"
                                : "text-[#0d1f30]",
                          )}
                        >
                          {option.label}
                        </span>

                        {/* Description — vertical card mode only */}
                        {!isHorizontal && option.description && (
                          <span className="text-[11px] font-[400] text-[#6b90b5] leading-snug truncate">
                            {option.description}
                          </span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </RadioGroup>
            </FormControl>

            {/* ── Error message ── */}
            {hasError && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <AlertCircle size={12} className="text-red-500 flex-shrink-0" />
                <FormMessage className="text-[11px] font-medium text-red-600" />
              </div>
            )}
          </FormItem>
        );
      }}
    />
  );
};

export default RadioField;
