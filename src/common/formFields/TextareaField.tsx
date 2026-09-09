"use client";

import { FieldValues, Control, Path, RegisterOptions } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface InputProps<T extends FieldValues> extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'disabled' | 'defaultValue'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  rows?: number;
  maxRows?: number;
  description?: string;
  isRequired?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
}

const TextareaField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  className,
  disabled = false,
  rows = 3,
  description,
  isRequired = false,
  rules,
  ...rest
}: InputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState?.error;

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
                  "relative flex items-start",
                  "bg-background border rounded-md overflow-hidden py-2 px-2",
                  "transition-all duration-150",
                  "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 focus-within:border-ring",
                  hasError
                    ? "border-destructive focus-within:ring-destructive/30"
                    : "border-input",
                  disabled && "opacity-50 cursor-not-allowed bg-muted/80",
                  className,
                )}
              >
                <Textarea
                  {...field}
                  {...rest}
                  placeholder={placeholder}
                  disabled={disabled}
                  rows={rows}
                  className={cn(
                    "border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none",
                    "text-sm p-0 min-h-[80px] w-full",
                  )}
                />
              </div>
            </FormControl>

            {description && !hasError && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}

            <FormMessage className="text-xs text-destructive" />
          </FormItem>
        );
      }}
    />
  );
};

export default TextareaField;
