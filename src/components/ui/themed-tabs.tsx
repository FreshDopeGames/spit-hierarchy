import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const ThemedTabs = TabsPrimitive.Root;

const ThemedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-[var(--theme-element-tabs-border-radius,var(--theme-radius-md))] bg-[var(--theme-element-tabs-bg,var(--theme-surface))] p-1 text-[var(--theme-element-tabs-color,var(--theme-textMuted))] border border-[var(--theme-element-tabs-border-color,var(--theme-border))]",
      className
    )}
    {...props}
  />
));
ThemedTabsList.displayName = TabsPrimitive.List.displayName;

const ThemedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-[var(--theme-background)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[var(--theme-element-tabs-active-bg,var(--theme-background))] data-[state=active]:text-[var(--theme-element-tabs-active-color,var(--theme-primary))] data-[state=active]:shadow-sm text-[var(--theme-element-tabs-color,var(--theme-textMuted))] font-[var(--theme-element-tabs-fontFamily,var(--theme-font-body))]",
      className
    )}
    {...props}
  />
));
ThemedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const ThemedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-[var(--theme-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
ThemedTabsContent.displayName = TabsPrimitive.Content.displayName;

export { ThemedTabs, ThemedTabsList, ThemedTabsTrigger, ThemedTabsContent };