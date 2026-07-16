import * as React from "react";
import { cn } from "../lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] text-slate-900 shadow-sm transition-all file:border-0 file:bg-transparent file:text-[13px] file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
