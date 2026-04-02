import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const ThemedTabs = TabsPrimitive.Root;

const ThemedTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) =>
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex h-10 items-center justify-center rounded-[var(--theme-element-tabs-border-radius,var(--theme-radius-md))] p-1 text-[hsl(var(--theme-element-tabs-color,var(--theme-textMuted)))] bg-theme-black border-2 border-primary px-[4px] mx-0 py-0 my-[4px] pb-[40px]",
    className
    )}
    {...props} />

);
ThemedTabsList.displayName = TabsPrimitive.List.displayName;

const ThemedTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) =>
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm font-medium ring-offset-[hsl(var(--theme-background))] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--theme-primary))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[hsl(var(--theme-element-tabs-active-bg,var(--theme-background)))] data-[state=active]:text-[hsl(var(--theme-element-tabs-active-color,var(--theme-primary)))] data-[state=active]:shadow-sm text-[hsl(var(--theme-element-tabs-color,var(--theme-textMuted)))] font-[var(--theme-element-tabs-fontFamily,var(--theme-font-body))] py-[7px] my-0",

    className
    )}
    {...props} />

);
ThemedTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const ThemedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) =>
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-[hsl(var(--theme-background))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--theme-primary))] focus-visible:ring-offset-2",
      className
    )}
    {...props} />

);
ThemedTabsContent.displayName = TabsPrimitive.Content.displayName;

export { ThemedTabs, ThemedTabsList, ThemedTabsTrigger, ThemedTabsContent };