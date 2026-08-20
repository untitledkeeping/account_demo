import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-bold rounded-full border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-emerald-50 text-emerald-800 border-emerald-200",
        secondary: "bg-slate-100 text-slate-700 border-slate-200",
        destructive: "bg-rose-50 text-rose-800 border-rose-200",
        outline: "text-slate-900 border-slate-200",
        warning: "bg-amber-50 text-amber-800 border-amber-200",
        info: "bg-sky-50 text-sky-800 border-sky-200",
        brand: "bg-indigo-50 text-indigo-800 border-indigo-200",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-xs font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  children?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}

export { Badge, badgeVariants };
