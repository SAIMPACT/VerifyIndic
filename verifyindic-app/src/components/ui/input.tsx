import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-[9px] border border-[#d4d2cc] bg-white px-3 py-[11px] text-base text-[var(--ink)] transition-colors focus:border-[var(--teal)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[var(--red)] aria-[invalid=true]:bg-[#fff8f7]",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

