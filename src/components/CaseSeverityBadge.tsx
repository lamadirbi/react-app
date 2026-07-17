"use client";

import { caseSeverityBadgeClass, caseSeverityLabel } from "@/lib/caseSeverity";

type Props = {
  severity: string | null | undefined;
  className?: string;
};

export function CaseSeverityBadge({ severity, className = "" }: Props) {
  const label = caseSeverityLabel(severity);
  if (!label) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${caseSeverityBadgeClass(severity)} ${className}`}
    >
      مستوى الحالة: {label}
    </span>
  );
}
