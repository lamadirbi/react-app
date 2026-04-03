"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export type MedicalProfileSummary = {
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  medical_history?: string | null;
  allergies: string | null;
  current_medications: string | null;
};

type Props = {
  title?: string;
  subtitle?: string;
  profile: MedicalProfileSummary;
  /** إظهار زر تعديل يذهب لصفحة الملف الطبي */
  editHref?: string;
};

function fieldOrDash(value: string | null | undefined) {
  const v = value?.trim();
  return v ? v : "—";
}

export function MedicalProfileSummaryCard({
  title = "ملخص الملف الطبي",
  subtitle = "يساعد الطبيب على فهم الحالة بسرعة.",
  profile,
  editHref,
}: Props) {
  return (
    <Card>
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{title}</div>
            {subtitle ? (
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div>
            ) : null}
          </div>
          {editHref ? (
            <Link href={editHref}>
              <Button variant="secondary" size="sm" type="button">
                تعديل
              </Button>
            </Link>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 text-sm text-zinc-700 dark:text-zinc-200 sm:grid-cols-2">
          <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">الطول</div>
            <div className="mt-1 font-medium">
              {profile.height_cm != null ? <span dir="ltr">{profile.height_cm} cm</span> : "غير محدد"}
            </div>
          </div>
          <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">الوزن</div>
            <div className="mt-1 font-medium">
              {profile.weight_kg != null ? <span dir="ltr">{profile.weight_kg} kg</span> : "غير محدد"}
            </div>
          </div>

          <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">أمراض مزمنة</div>
            <div className="mt-1 whitespace-pre-wrap font-medium">{fieldOrDash(profile.chronic_diseases)}</div>
          </div>

          {"medical_history" in profile ? (
            <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">التاريخ الطبي</div>
              <div className="mt-1 whitespace-pre-wrap font-medium">{fieldOrDash(profile.medical_history)}</div>
            </div>
          ) : null}

          <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">الحساسية</div>
            <div className="mt-1 whitespace-pre-wrap font-medium">{fieldOrDash(profile.allergies)}</div>
          </div>

          <div className="rounded-xl border border-(--border) bg-(--surface-2) px-4 py-3 sm:col-span-2">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">الأدوية الحالية</div>
            <div className="mt-1 whitespace-pre-wrap font-medium">{fieldOrDash(profile.current_medications)}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

