import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-2.5 py-1 text-base transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-100 placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20 focus-visible:bg-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-inner",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
