import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-brand-red text-white hover:bg-red-700 focus:ring-brand-red",
        ghost:
          "bg-transparent text-white border-2 border-white hover:bg-white hover:text-brand-navy focus:ring-white",
        outline:
          "bg-transparent text-brand-navy border-2 border-brand-navy hover:bg-brand-navy hover:text-white focus:ring-brand-navy",
        navy:
          "bg-brand-navy text-white hover:bg-blue-900 focus:ring-brand-navy",
        "ghost-navy":
          "bg-transparent text-brand-navy border-2 border-brand-navy hover:bg-brand-navy hover:text-white focus:ring-brand-navy",
      },
      size: {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
