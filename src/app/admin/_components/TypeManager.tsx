"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface TypeManagerProps {
  availableTypes: string[];
}

export function TypeManager({ availableTypes }: TypeManagerProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Types</h3>
      <div className="grid grid-cols-2 gap-4">
        {availableTypes.map((type) => (
          <FormField
            key={type}
            control={control}
            name="type"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(type)}
                    onCheckedChange={(checked) => {
                      const updatedValue = checked
                        ? [...(field.value || []), type]
                        : field.value?.filter((value: string) => value !== type) || [];
                      field.onChange(updatedValue);
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">{type}</FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
}
