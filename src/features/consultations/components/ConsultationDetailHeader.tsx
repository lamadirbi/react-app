"use client";

import { ConsultationStatusBadge } from "./ConsultationStatusBadge";

type Props = {
  id: number;
  status: "pending" | "completed";
  physicianResponse?: string | null;
  questionText: string;
};

export function ConsultationDetailHeader({ id, status, physicianResponse, questionText }: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">#{id}</div>
        <ConsultationStatusBadge status={status} physicianResponse={physicianResponse} />
      </div>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700 dark:text-zinc-200">
        {questionText}
      </div>
    </>
  );
}

