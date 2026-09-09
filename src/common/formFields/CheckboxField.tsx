"use client";

import { FieldValues, Control, Path } from "react-hook-form";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface InputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  className?: string;
}

const CheckboxField = <T extends FieldValues>({
  control,
  name,
  label,
  className,
}: InputProps<T>) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(
          "border border-input px-4 h-10 rounded-md flex items-center gap-3 self-end w-full bg-background",
          fieldState?.error && "border-destructive",
          className
        )}>
          <FormControl>
            <label className="flex items-center gap-2 cursor-pointer w-full text-sm font-medium text-foreground select-none">
              <input
                type="checkbox"
                checked={!!field.value}
                onChange={(e) => field.onChange(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-ring focus:ring-offset-0 cursor-pointer"
              />
              <span>{label}</span>
            </label>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default CheckboxField;
