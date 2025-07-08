import { forwardRef, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Alert = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "success";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      {
        "bg-background text-foreground": variant === "default",
        "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive":
          variant === "destructive",
        "border-success/50 text-success dark:border-success [&>svg]:text-success": variant === "success",
      },
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
);
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription };
