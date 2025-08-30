
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const themedButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[hsl(var(--theme-element-button-default-bg,var(--theme-primary)))] text-[hsl(var(--theme-element-button-default-color,var(--theme-background)))] hover:bg-[hsl(var(--theme-primaryDark))] font-[var(--theme-font-heading)] border-[var(--theme-element-button-default-border-width,1px)] border-[var(--theme-element-button-default-border-style,solid)] border-[hsl(var(--theme-element-button-default-border-color,var(--theme-primary)))] rounded-[var(--theme-element-button-default-border-radius,8px)] p-[var(--theme-element-button-default-padding,0.5rem_1rem)]",
        destructive: "bg-[hsl(var(--theme-error))] text-[hsl(var(--theme-textLight))] hover:opacity-90",
        outline: "bg-[hsl(var(--theme-element-button-outline-bg,transparent))] text-[hsl(var(--theme-element-button-outline-color,var(--theme-text)))] hover:bg-[hsl(var(--theme-surface))] font-[var(--theme-font-body)] border-[var(--theme-element-button-outline-border-width,1px)] border-[var(--theme-element-button-outline-border-style,solid)] border-[hsl(var(--theme-element-button-outline-border-color,var(--theme-border)))] rounded-[var(--theme-element-button-outline-border-radius,8px)] p-[var(--theme-element-button-outline-padding,0.5rem_1rem)]",
        secondary: "bg-[hsl(var(--theme-element-button-secondary-bg,var(--theme-secondary)))] text-[hsl(var(--theme-element-button-secondary-color,var(--theme-textLight)))] hover:bg-[hsl(var(--theme-secondaryDark))] font-[var(--theme-font-heading)] border-[var(--theme-element-button-secondary-border-width,1px)] border-[var(--theme-element-button-secondary-border-style,solid)] border-[hsl(var(--theme-element-button-secondary-border-color,var(--theme-secondary)))] rounded-[var(--theme-element-button-secondary-border-radius,8px)] p-[var(--theme-element-button-secondary-padding,0.5rem_1rem)]",
        ghost: "text-[hsl(var(--theme-text))] hover:bg-[hsl(var(--theme-surface))]",
        accent: "bg-[hsl(var(--theme-element-button-accent-bg,var(--theme-accent)))] text-[hsl(var(--theme-element-button-accent-color,var(--theme-textLight)))] hover:bg-[hsl(var(--theme-accentDark))] font-[var(--theme-font-heading)] border-[var(--theme-element-button-accent-border-width,1px)] border-[var(--theme-element-button-accent-border-style,solid)] border-[hsl(var(--theme-element-button-accent-border-color,var(--theme-accent)))] rounded-[var(--theme-element-button-accent-border-radius,8px)] p-[var(--theme-element-button-accent-padding,0.5rem_1rem)]",
        gradient: "bg-[hsl(var(--theme-element-button-gradient-bg,var(--theme-gradient-primary-gradient)))] text-[hsl(var(--theme-element-button-gradient-color,var(--theme-background)))] hover:opacity-90 font-[var(--theme-font-heading)] border-[var(--theme-element-button-gradient-border-width,0px)] border-[var(--theme-element-button-gradient-border-style,solid)] border-[hsl(var(--theme-element-button-gradient-border-color,transparent))] rounded-[var(--theme-element-button-gradient-border-radius,8px)] p-[var(--theme-element-button-gradient-padding,0.5rem_1rem)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ThemedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof themedButtonVariants> {
  asChild?: boolean;
}

const ThemedButton = React.forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Apply element-specific styles for gradient variant
    const elementStyle = variant === 'gradient' ? {
      background: 'var(--theme-element-button-gradient-bg, var(--theme-gradient-primary-gradient, linear-gradient(135deg, #D4AF37, #E8C547)))',
      ...style
    } : style;
    
    return (
      <Comp
        className={cn(themedButtonVariants({ variant, size, className }))}
        style={elementStyle}
        ref={ref}
        {...props}
      />
    );
  }
);
ThemedButton.displayName = "ThemedButton";

export { ThemedButton, themedButtonVariants };
