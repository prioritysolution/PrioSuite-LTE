"use client";

import { useState, useEffect, ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { FieldValues, Control, Path, RegisterOptions } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface InputProps<T extends FieldValues> extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'type' | 'disabled' | 'defaultValue'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  startContent?: ReactNode;
  endContent?: ReactNode;
  disabled?: boolean;
  hint?: string;
  rules?: RegisterOptions<T, Path<T>>;
  isUpper?: boolean;
  isRequired?: boolean;
  isBlurUpdate?: boolean;
  isNumeric?: boolean;
  isLetters?: boolean;
}

const InputField = <T extends FieldValues>({
  control,
  name,
  label,
  type = "text",
  placeholder,
  className,
  endContent,
  startContent,
  disabled = false,
  hint,
  rules,
  isUpper = false,
  isRequired = false,
  isBlurUpdate = false,
  isNumeric = false,
  isLetters = false,
  ...rest
}: InputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDisabled = mounted && Boolean(disabled);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState?.error;

        useEffect(() => {
          if (isBlurUpdate) {
            setLocalValue(field.value ?? "");
          }
        }, [field.value, isBlurUpdate]);

        return (
          <FormItem className="flex flex-col w-full gap-2">
            {label && (
              <FormLabel className="text-sm font-medium text-foreground">
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            )}

            <FormControl>
              <div
                className={cn(
                  // ✅ Single unified background + border on the wrapper only
                  "flex items-center w-full rounded-md border bg-background h-10",
                  "transition-all duration-150",
                  "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 focus-within:border-ring",
                  hasError
                    ? "border-destructive focus-within:ring-destructive/30"
                    : "border-input",
                  isDisabled && "cursor-not-allowed bg-muted/80",
                  // ✅ Only add gap when there's start/end content
                  startContent || endContent ? "gap-2" : "",
                  className,
                )}
              >
                {startContent && (
                  <div className="shrink-0 text-muted-foreground pl-3">
                    {startContent}
                  </div>
                )}

                {/* ✅ KEY FIX: Input is fully transparent — no border, no bg, no shadow, no ring */}
                <Input
                  {...rest}
                  value={isBlurUpdate ? localValue : (field.value ?? "")}
                  type={inputType}
                  placeholder={placeholder}
                  disabled={isDisabled}
                  className={cn(
                    // ✅ Full width when no start/end content, flex-1 when there is content
                    startContent || endContent ? "flex-1 min-w-0" : "w-full",
                    "h-full p-0",
                    // ✅ Apply padding directly to input based on content presence
                    !startContent && "pl-3",
                    !endContent && "pr-3",
                    // Remove ALL default Input styles that cause the two-tone look
                    "border-0 border-none",
                    "bg-transparent",
                    "shadow-none",
                    "outline-none",
                    "ring-0 ring-offset-0",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none",
                    "text-sm text-foreground placeholder:text-muted-foreground",
                    "disabled:cursor-not-allowed disabled:opacity-100",
                  )}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (isNumeric) {
                      value = value.replace(/[^0-9.]/g, "");
                      const parts = value.split(".");
                      value = parts[0] + (parts.length > 1 ? "." + parts.slice(1).join("") : "");
                      e.target.value = value;
                    }
                    if (isLetters) {
                      value = value.replace(/[^A-Za-z\s]/g, "").replace(/\s{2,}/g, " ");
                      e.target.value = value;
                    }
                    if (isBlurUpdate) {
                      const upperValue = isUpper ? value.toUpperCase() : value;
                      setLocalValue(upperValue);
                    } else {
                      field.onChange(isUpper ? value.toUpperCase() : value);
                    }
                  }}
                  onBlur={() => {
                    if (isBlurUpdate) {
                      field.onChange(localValue);
                    }
                    field.onBlur();
                  }}
                />

                {endContent && (
                  <div className="shrink-0 text-muted-foreground pr-3">
                    {endContent}
                  </div>
                )}

                {isPassword && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer shrink-0 text-muted-foreground hover:text-foreground transition-colors px-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              </div>
            </FormControl>

            {hint && !hasError && (
              <p className="text-xs text-muted-foreground">{hint}</p>
            )}

            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        );
      }}
    />
  );
};

export default InputField;
