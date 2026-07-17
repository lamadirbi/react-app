export const CASE_SEVERITIES = [
  { value: "mild", label: "بسيطة" },
  { value: "moderate", label: "متوسطة" },
  { value: "critical", label: "حرجة" },
] as const;

export type CaseSeverity = (typeof CASE_SEVERITIES)[number]["value"];

export function caseSeverityLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  return CASE_SEVERITIES.find((s) => s.value === value)?.label ?? null;
}

export function caseSeverityBadgeClass(value: string | null | undefined): string {
  if (value === "critical") {
    return "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-100";
  }
  if (value === "moderate") {
    return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100";
  }
  if (value === "mild") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100";
  }
  return "border-(--border) bg-(--surface-2) text-(--muted)";
}
