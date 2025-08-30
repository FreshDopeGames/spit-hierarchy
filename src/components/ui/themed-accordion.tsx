import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const ThemedAccordion = AccordionPrimitive.Root;

const ThemedAccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b border-[var(--theme-element-accordion-border-color,var(--theme-border))] bg-[var(--theme-element-accordion-bg,var(--theme-surface))]",
      className
    )}
    {...props}
  />
));
ThemedAccordionItem.displayName = "ThemedAccordionItem";

const ThemedAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 px-[var(--theme-element-accordion-padding,1rem)] font-medium text-[var(--theme-element-accordion-color,var(--theme-text))] transition-all hover:underline [&[data-state=open]>svg]:rotate-180 font-[var(--theme-font-heading)]",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
ThemedAccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const ThemedAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div 
      className={cn(
        "pb-4 pt-0 px-[var(--theme-element-accordion-padding,1rem)] text-[var(--theme-element-accordion-color,var(--theme-text))] font-[var(--theme-font-body)]", 
        className
      )}
    >
      {children}
    </div>
  </AccordionPrimitive.Content>
));
ThemedAccordionContent.displayName = AccordionPrimitive.Content.displayName;

export {
  ThemedAccordion,
  ThemedAccordionItem,
  ThemedAccordionTrigger,
  ThemedAccordionContent,
};