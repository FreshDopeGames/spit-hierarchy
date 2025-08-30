import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const ThemedAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-[var(--theme-element-avatar-border-radius,50%)] bg-[var(--theme-element-avatar-bg,var(--theme-surface))] border-[var(--theme-element-avatar-border-width,2px)] border-[var(--theme-element-avatar-border-style,solid)] border-[var(--theme-element-avatar-border-color,var(--theme-primary))]",
      className
    )}
    {...props}
  />
));
ThemedAvatar.displayName = AvatarPrimitive.Root.displayName;

const ThemedAvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
ThemedAvatarImage.displayName = AvatarPrimitive.Image.displayName;

const ThemedAvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-[var(--theme-element-avatar-border-radius,50%)] bg-[var(--theme-element-avatar-bg,var(--theme-surface))] text-[var(--theme-element-avatar-color,var(--theme-text))] font-[var(--theme-font-body)]",
      className
    )}
    {...props}
  />
));
ThemedAvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { ThemedAvatar, ThemedAvatarImage, ThemedAvatarFallback };