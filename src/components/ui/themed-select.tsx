import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const ThemedSelect = SelectPrimitive.Root;
const ThemedSelectGroup = SelectPrimitive.Group;
const ThemedSelectValue = SelectPrimitive.Value;

const ThemedSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-[var(--theme-element-select-border-radius,var(--theme-radius-md))] border border-[var(--theme-element-select-border-color,var(--theme-border))] bg-[var(--theme-element-select-bg,var(--theme-surface))] px-[var(--theme-element-select-padding,12px)] py-2 text-sm text-[var(--theme-element-select-color,var(--theme-text))] ring-offset-[var(--theme-background)] placeholder:text-[var(--theme-textMuted)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-[var(--theme-element-select-fontFamily,var(--theme-font-body))] [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
ThemedSelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const ThemedSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
ThemedSelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const ThemedSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
ThemedSelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const ThemedSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-[var(--theme-element-select-border-radius,var(--theme-radius-md))] border border-[var(--theme-element-select-border-color,var(--theme-border))] bg-[var(--theme-element-select-bg,var(--theme-surface))] text-[var(--theme-element-select-color,var(--theme-text))] shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <ThemedSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <ThemedSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
ThemedSelectContent.displayName = SelectPrimitive.Content.displayName;

const ThemedSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-[var(--theme-element-select-color,var(--theme-text))] font-[var(--theme-font-heading)]", className)}
    {...props}
  />
));
ThemedSelectLabel.displayName = SelectPrimitive.Label.displayName;

const ThemedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-[var(--theme-element-select-color,var(--theme-text))] outline-none focus:bg-[var(--theme-primary)] focus:text-[var(--theme-background)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50 font-[var(--theme-element-select-fontFamily,var(--theme-font-body))]",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
ThemedSelectItem.displayName = SelectPrimitive.Item.displayName;

const ThemedSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-[var(--theme-border)]", className)}
    {...props}
  />
));
ThemedSelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  ThemedSelect,
  ThemedSelectGroup,
  ThemedSelectValue,
  ThemedSelectTrigger,
  ThemedSelectContent,
  ThemedSelectLabel,
  ThemedSelectItem,
  ThemedSelectSeparator,
  ThemedSelectScrollUpButton,
  ThemedSelectScrollDownButton,
};