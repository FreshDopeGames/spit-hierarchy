import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

// Root component
const ThemedDropdownMenu = DropdownMenuPrimitive.Root;

// Trigger component
const ThemedDropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ThemedDropdownMenuTrigger.displayName = DropdownMenuPrimitive.Trigger.displayName;

// Group component
const ThemedDropdownMenuGroup = DropdownMenuPrimitive.Group;

// Portal component
const ThemedDropdownMenuPortal = DropdownMenuPrimitive.Portal;

// Sub components
const ThemedDropdownMenuSub = DropdownMenuPrimitive.Sub;

const ThemedDropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
      "focus:bg-[var(--theme-element-dropdown_item-bg,var(--theme-primary))] focus:text-[var(--theme-element-dropdown_item-color,var(--theme-background))]",
      "data-[state=open]:bg-[var(--theme-element-dropdown_item-bg,var(--theme-primary))] data-[state=open]:text-[var(--theme-element-dropdown_item-color,var(--theme-background))]",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
));
ThemedDropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const ThemedDropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
ThemedDropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

// Content component with theming
const ThemedDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-[var(--theme-element-dropdown-border-radius,8px)] shadow-[var(--theme-element-dropdown-shadow,0_10px_15px_rgba(212,175,55,0.2))]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      style={{
        background: 'hsl(var(--theme-element-dropdown-bg, var(--theme-surface)))',
        color: 'hsl(var(--theme-element-dropdown-color, var(--theme-text)))',
        border: `var(--theme-element-dropdown-border-width, 1px) var(--theme-element-dropdown-border-style, solid) hsl(var(--theme-element-dropdown-border-color, var(--theme-border)))`,
        borderRadius: 'var(--theme-element-dropdown-border-radius, 8px)',
        padding: 'var(--theme-element-dropdown-padding, 0.5rem 0)',
        boxShadow: 'var(--theme-element-dropdown-shadow, 0 10px 15px rgba(212, 175, 55, 0.2))',
      }}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
ThemedDropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

// Item component with theming
const ThemedDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm text-sm outline-none transition-colors",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "hover:bg-[var(--theme-element-dropdown_item-hover-bg,var(--theme-primary))] hover:text-[var(--theme-element-dropdown_item-hover-color,var(--theme-background))]",
      "focus:bg-[var(--theme-element-dropdown_item-hover-bg,var(--theme-primary))] focus:text-[var(--theme-element-dropdown_item-hover-color,var(--theme-background))]",
      inset && "pl-8",
      className
    )}
    style={{
      background: 'var(--theme-element-dropdown_item-bg, transparent)',
      color: 'hsl(var(--theme-element-dropdown_item-color, var(--theme-text)))',
      fontSize: 'var(--theme-element-dropdown_item-fontSize, 0.875rem)',
      fontWeight: 'var(--theme-element-dropdown_item-fontWeight, 500)',
      lineHeight: 'var(--theme-element-dropdown_item-lineHeight, 1.25)',
      padding: 'var(--theme-element-dropdown_item-padding, 0.625rem 0.75rem)',
    } as React.CSSProperties}
    {...props}
  />
));
ThemedDropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

// Checkbox item component
const ThemedDropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "focus:bg-[var(--theme-primary)]/20 focus:text-[var(--theme-primary)]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
));
ThemedDropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

// Radio item component
const ThemedDropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors",
      "focus:bg-[var(--theme-primary)]/20 focus:text-[var(--theme-primary)]",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
));
ThemedDropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

// Label component
const ThemedDropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold",
      inset && "pl-8",
      className
    )}
    style={{
      color: 'hsl(var(--theme-primary))',
    }}
    {...props}
  />
));
ThemedDropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

// Separator component
const ThemedDropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px", className)}
    style={{
      backgroundColor: 'hsl(var(--theme-border))/30',
    }}
    {...props}
  />
));
ThemedDropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// Shortcut component
const ThemedDropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  );
};
ThemedDropdownMenuShortcut.displayName = "ThemedDropdownMenuShortcut";

export {
  ThemedDropdownMenu,
  ThemedDropdownMenuTrigger,
  ThemedDropdownMenuContent,
  ThemedDropdownMenuItem,
  ThemedDropdownMenuCheckboxItem,
  ThemedDropdownMenuRadioItem,
  ThemedDropdownMenuLabel,
  ThemedDropdownMenuSeparator,
  ThemedDropdownMenuShortcut,
  ThemedDropdownMenuGroup,
  ThemedDropdownMenuPortal,
  ThemedDropdownMenuSub,
  ThemedDropdownMenuSubContent,
  ThemedDropdownMenuSubTrigger,
};