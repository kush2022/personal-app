import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default:
          "bg-white/10 text-white border-white/20 backdrop-blur-md shadow-lg [a]:hover:bg-white/20",
        secondary:
          "bg-secondary/20 text-secondary-foreground border-white/10 backdrop-blur-md [a]:hover:bg-secondary/30",
        destructive:
          "bg-rose-500/10 text-rose-400 border border-rose-500/20 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.3)] [a]:hover:bg-rose-500/20",
        outline:
          "border-white/20 text-slate-200 backdrop-blur-sm [a]:hover:bg-white/5",
        ghost:
          "hover:bg-white/10 hover:text-white backdrop-blur-sm text-slate-300",
        link: "text-indigo-300 underline-offset-4 hover:underline",
        earth:
          "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(99,102,241,0.2)]",
        sage: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(16,185,129,0.2)]",
        warm: "bg-rose-500/10 text-rose-300 border-rose-500/30 backdrop-blur-md shadow-[0_0_12px_rgba(244,63,94,0.2)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
