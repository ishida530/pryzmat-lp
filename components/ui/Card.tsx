import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  featured?: boolean;
}

export function Card({ className, featured, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl p-6 shadow-sm border transition-shadow duration-200 hover:shadow-md",
        featured ? "border-brand-red shadow-md" : "border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
