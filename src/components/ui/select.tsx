import * as React from "react";
import { cn } from "../../utils/cn";

export interface NativeSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(
          "flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-900 shadow-2xs transition-colors focus-visible:outline-none focus-visible:border-emerald-500 focus-visible:bg-white disabled:cursor-not-allowed disabled:opacity-50 font-medium",
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
