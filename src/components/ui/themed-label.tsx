import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedLabelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[var(--theme-element-label-color,var(--theme-text))] font-[var(--theme-element-label-fontFamily,var(--theme-font-body))]"
);

const ThemedLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof themedLabelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(themedLabelVariants(), className)}
    {...props}
  />
));
ThemedLabel.displayName = LabelPrimitive.Root.displayName;

export { ThemedLabel };