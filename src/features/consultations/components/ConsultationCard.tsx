"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { ConsultationStatusBadge } from "./ConsultationStatusBadge";

type Props = {
  id: number;
  questionText: string;
  submittedAt: string;
  status: "pending" | "completed";
  physicianResponse?: string | null;
  /** اسم الطبيب (يظهر لبطاقة المريض عند وجود رد) */
  physicianName?: string | null;
  href: string;
  ctaLabel: string;
  variant?: "patient" | "physician";
  patientName?: string | null;
};

export function ConsultationCard({
  id,
  questionText,
  submittedAt,
  status,
  physicianResponse,
  physicianName,
  href,
  ctaLabel,
  variant = "patient",
  patientName,
}: Props) {
  const short = questionText.length > 160 ? `${questionText.slice(0, 160)}...` : questionText;

  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              <span className="font-semibold">#{id}</span>
              <span className="text-zinc-400 dark:text-zinc-600">—</span>
              <ConsultationStatusBadge status={status} physicianResponse={physicianResponse} />
            </div>

            {variant === "physician" && patientName ? (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                المريض: <span className="font-medium">{patientName}</span>
              </div>
            ) : null}

            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{short}</div>

            <div className="mt-4">
              <Link href={href}>
                <Button variant="secondary" size="sm">
                  {ctaLabel}
                </Button>
              </Link>
            </div>

            {variant === "patient" && physicianResponse?.trim() ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-semibold">
                  <span>رد الطبيب</span>
                  {physicianName?.trim() ? (
                    <>
                      <span className="font-normal text-emerald-800/70 dark:text-emerald-200/80">—</span>
                      <span className="font-bold">{physicianName}</span>
                    </>
                  ) : null}
                </div>
                <div className="mt-1">{physicianResponse}</div>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:text-zinc-200">
            {new Date(submittedAt).toLocaleDateString("ar")}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

