"use client";

import { cn } from "@/lib/cn";

type Variant = "info" | "success" | "error" | "warning";

export function Alert({
  variant = "info",
  className,
  title,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: Variant;
  title?: string;
}) {
  const styles: Record<Variant, string> = {
    info: "border-(--border) bg-(--surface-2) text-foreground",
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-100",
    error:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200",
    warning:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-100",
  };

  return (
    <div
      className={cn("rounded-2xl border px-4 py-3 text-sm", styles[variant], className)}
      {...props}
    >
      {title ? <div className="font-semibold">{title}</div> : null}
      {children ? <div className={cn(title ? "mt-1" : "")}>{children}</div> : null}
    </div>
  );
}

