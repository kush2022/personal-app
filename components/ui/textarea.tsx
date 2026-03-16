import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-lg border border-white/20 bg-white/5 px-2.5 py-2 text-base transition-all outline-none placeholder:text-slate-400 focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm shadow-inner backdrop-blur-md focus-visible:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
