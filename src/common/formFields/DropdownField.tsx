"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FieldValues, Control, Path, useController } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface DropdownProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  className?: string;
  options: Array<{ [key: string]: any; Id?: string | number }>;
  optionLabelKey?: string;
  optionValueKey?: string;
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
  onChange?: (value: any) => void;
  disableSorting?: boolean;
  isSearch?: boolean;
  defaultValue?: string | number;
  sortValue?: string | number;
  isRequired?: boolean;
  fixedDropdownWidth?: boolean;
  searchPlaceholder?: string;
  placeholder?: string;
  rules?: any;
}

const DropdownField = <T extends FieldValues>({
  control,
  name,
  label,
  className,
  options = [],
  optionLabelKey = "Option_Value",
  optionValueKey,
  disabled = false,
  loading = false,
  hint,
  onChange: externalOnChange,
  disableSorting = false,
  isSearch = false, // Keep for compatibility
  defaultValue,
  sortValue,
  isRequired = false,
  fixedDropdownWidth = false,
  searchPlaceholder = "",
  placeholder,
  rules,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid SSR/client mismatch: loading/disabled UI only after mount.
  const isLoading = mounted && loading;
  const isDisabled = mounted && Boolean(disabled || loading);

  const { field, fieldState } = useController({
    control,
    name,
    rules,
  });

  const value = field.value;
  const onChange = (val: any) => {
    field.onChange(val);
    externalOnChange?.(val);
  };
  const hasError = !!fieldState.error;
  const errorMessage = fieldState.error?.message ?? "";

  const getItemId = (item: any): string => {
    if (!item) return "";
    if (optionValueKey && item[optionValueKey] !== undefined) {
      return item[optionValueKey]?.toString() ?? "";
    }
    return (
      (
        item.Opt_Code ??
        item.Branch_Id ??
        item.Id ??
        item.id ??
        item.value ??
        item.Rank_Id ??
        item[optionLabelKey]
      )?.toString() ?? ""
    );
  };

  // Find the label for the current value to display
  const getDisplayLabel = (val: any) => {
    if (val === null || val === undefined || val === "") return "";
    const found = options.find((opt) => String(getItemId(opt)) === String(val));
    return found ? String(found[optionLabelKey] ?? "") : "";
  };

  const [searchVal, setSearchVal] = useState(() => getDisplayLabel(value));

  // Sync input text with external value changes
  useEffect(() => {
    setSearchVal(getDisplayLabel(value));
  }, [value, options]);

  // Set default value if exists and form field is empty
  useEffect(() => {
    if (defaultValue && !value && Array.isArray(options)) {
      const defaultItem = options.find(
        (item) => String(getItemId(item)) === defaultValue.toString(),
      );
      if (defaultItem) {
        onChange(defaultValue.toString());
      }
    }
  }, [defaultValue, options, value]);

  const isInteractive = !isDisabled;

  // Determine if we are actively filtering the list
  const isSearching = searchVal !== "" && searchVal !== getDisplayLabel(value);

  const sortedOptions = useMemo(() => {
    if (!options || !Array.isArray(options)) return [];
    const valid = options.filter((item) => {
      const id = getItemId(item);
      return id !== undefined && id !== null && id !== "";
    });

    if (disableSorting) return valid;

    return [...valid].sort((a, b) => {
      if (
        sortValue &&
        a[sortValue] !== undefined &&
        b[sortValue] !== undefined
      ) {
        if (
          typeof a[sortValue] === "number" &&
          typeof b[sortValue] === "number"
        ) {
          return a[sortValue] - b[sortValue];
        }
        return a[sortValue].toString().localeCompare(b[sortValue].toString());
      }

      const aLabel = a[optionLabelKey]?.toLowerCase() ?? "";
      const bLabel = b[optionLabelKey]?.toLowerCase() ?? "";
      return aLabel.localeCompare(bLabel);
    });
  }, [options, optionLabelKey, disableSorting, sortValue]);

  const filteredOptions = useMemo(() => {
    if (isSearching) {
      const q = searchVal.toLowerCase();
      return sortedOptions.filter((item) =>
        String(item?.[optionLabelKey] ?? "")
          .toLowerCase()
          .includes(q),
      );
    }
    return sortedOptions;
  }, [sortedOptions, isSearching, searchVal, optionLabelKey]);

  // Reset active key navigation index when options or open state changes
  useEffect(() => {
    if (filteredOptions.length > 0) {
      const selectedIndex = filteredOptions.findIndex(
        (opt) => String(getItemId(opt)) === String(value),
      );
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    } else {
      setActiveIndex(-1);
    }
  }, [open, filteredOptions, value]);

  const handleSelectOption = (item: any) => {
    const itemValue = getItemId(item);
    const itemLabel = String(item?.[optionLabelKey] ?? "");

    setSearchVal(itemLabel);
    setOpen(false);

    if (itemValue === null || itemValue === undefined || itemValue === "") {
      onChange("");
    } else {
      const numValue = Number(itemValue);
      onChange(
        !isNaN(numValue) &&
          itemValue !== "" &&
          String(numValue) === String(itemValue)
          ? numValue
          : String(itemValue),
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isInteractive) return;
    setOpen(newOpen);
  };

  // Handle focus and search reset when popover open state changes
  useEffect(() => {
    if (!isInteractive) return;
    if (!open) {
      setSearchVal(getDisplayLabel(value));
    } else {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open, isInteractive, value, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInteractive) return;
    setSearchVal(e.target.value);
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isInteractive) return;

    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
        setOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filteredOptions.length) {
        handleSelectOption(filteredOptions[activeIndex]);
      } else if (filteredOptions.length > 0) {
        handleSelectOption(filteredOptions[0]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <FormItem className={cn("flex flex-col w-full gap-2", className)}>
      {label && (
        <FormLabel
          className={cn(
            "text-sm font-medium text-foreground",
            isDisabled && "opacity-45",
          )}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <Popover
          open={open && isInteractive}
          onOpenChange={handleOpenChange}
          modal={false}
        >
          <PopoverAnchor asChild>
            <div className="relative w-full cursor-text">
              <input
                ref={inputRef}
                type="text"
                autoComplete="one-time-code"
                value={searchVal}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={isDisabled}
                placeholder={
                  isLoading
                    ? "Loading..."
                    : placeholder || searchPlaceholder || `Select ${label?.toLowerCase()}`
                }
                className={cn(
                  "flex items-center w-full justify-between font-normal text-[15px]",
                  "border-[1.5px] rounded-md h-auto py-2.5 pl-3.5 pr-10 bg-background transition-all duration-150 outline-none",
                  "focus:border-ring focus:ring-4 focus:ring-ring/18",
                  hasError
                    ? "border-destructive focus:ring-destructive/15 focus:border-destructive"
                    : "border-border",
                  isDisabled &&
                    "bg-slate-50 cursor-not-allowed border-slate-300 text-slate-900 opacity-50",
                )}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isLoading && <Spinner />}
                <button
                  ref={buttonRef}
                  type="button"
                  className="p-1 hover:bg-slate-100 rounded-md transition-colors focus:outline-none"
                  disabled={isDisabled}
                  tabIndex={-1}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isInteractive) return;
                    setOpen((prev) => !prev);
                  }}
                >
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </button>
              </div>
            </div>
          </PopoverAnchor>
          <PopoverContent
            align="start"
            className="p-1 max-h-60 overflow-y-auto bg-popover text-popover-foreground border border-border shadow-md rounded-xl z-50"
            style={{
              width: fixedDropdownWidth
                ? "500px"
                : "var(--radix-popover-trigger-width)",
            }}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onFocusOutside={(e) => {
              const target = e.detail.originalEvent?.target;
              if (
                target === inputRef.current ||
                buttonRef.current?.contains(target as Node)
              ) {
                e.preventDefault();
              }
            }}
            onPointerDownOutside={(e) => {
              if (
                e.target === inputRef.current ||
                buttonRef.current?.contains(e.target as Node)
              ) {
                e.preventDefault();
              }
            }}
          >
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-sm text-slate-500 text-center">
                  No results found
                </div>
              ) : (
                filteredOptions.map((item, index) => {
                  const itemVal = getItemId(item);
                  const itemLabel = String(item?.[optionLabelKey] ?? "");
                  const isSelected = String(value) === itemVal;
                  const isHighlighted = activeIndex === index;

                  return (
                    <button
                      key={`${itemVal}__${itemLabel}__${index}`}
                      type="button"
                      ref={(el) => {
                        if (el && isHighlighted) {
                          el.scrollIntoView({
                            behavior: "auto",
                            block: "nearest",
                          });
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevents input blur
                      }}
                      onClick={() => handleSelectOption(item)}
                      className={cn(
                        "relative flex w-full items-center rounded-lg py-2.5 pl-8 pr-3.5 text-[14px] text-left outline-none select-none cursor-pointer",
                        isSelected
                          ? "bg-accent/40 text-accent-foreground font-medium"
                          : "text-foreground",
                        isHighlighted
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50",
                      )}
                    >
                      {isSelected && (
                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      {itemLabel}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </FormControl>
      {hint && !hasError && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{hint}</p>
      )}
      {errorMessage && (
        <FormMessage className="text-xs mt-0.5 text-red-500">
          {errorMessage}
        </FormMessage>
      )}
    </FormItem>
  );
};

export default DropdownField;
