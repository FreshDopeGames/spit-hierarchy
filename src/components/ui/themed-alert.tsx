import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedAlertVariants = cva(
  "relative w-full rounded-[var(--theme-element-alert-border-radius,var(--theme-radius-lg))] border border-[var(--theme-element-alert-border-color,var(--theme-border))] p-[var(--theme-element-alert-padding,1rem)] bg-[var(--theme-element-alert-bg,var(--theme-surface))] text-[var(--theme-element-alert-color,var(--theme-text))] font-[var(--theme-font-body)] shadow-[var(--theme-element-alert-shadow,var(--theme-shadow-sm))]",
  {
    variants: {
      variant: {
        default: "bg-[var(--theme-element-alert-bg,var(--theme-surface))] text-[var(--theme-element-alert-color,var(--theme-text))] border-[var(--theme-element-alert-border-color,var(--theme-border))]",
        destructive: "border-[var(--theme-error)] text-[var(--theme-error)] bg-[var(--theme-error)]/10 [&>svg]:text-[var(--theme-error)]",
        success: "border-[var(--theme-success)] text-[var(--theme-success)] bg-[var(--theme-success)]/10 [&>svg]:text-[var(--theme-success)]",
        warning: "border-[var(--theme-warning)] text-[var(--theme-warning)] bg-[var(--theme-warning)]/10 [&>svg]:text-[var(--theme-warning)]",
        info: "border-[var(--theme-info)] text-[var(--theme-info)] bg-[var(--theme-info)]/10 [&>svg]:text-[var(--theme-info)]"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

const ThemedAlert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof themedAlertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(themedAlertVariants({ variant }), className)}
    {...props}
  />
));
ThemedAlert.displayName = "ThemedAlert";

const ThemedAlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight font-[var(--theme-font-heading)]", className)}
    {...props}
  />
));
ThemedAlertTitle.displayName = "ThemedAlertTitle";

const ThemedAlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed opacity-90", className)}
    {...props}
  />
));
ThemedAlertDescription.displayName = "ThemedAlertDescription";

export { ThemedAlert, ThemedAlertTitle, ThemedAlertDescription };