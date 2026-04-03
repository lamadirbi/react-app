"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type Consultation = {
  id: number;
  question_text: string;
  submitted_at: string;
  patient?: { name: string } | null;
};

type Props = {
  items: Consultation[];
  loading: boolean;
  error: string | null;
};

export function PhysicianCompletedSection({ items, loading, error }: Props) {
  return (
    <section className="mt-10">
      <div className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
        استشارات منتهية
      </div>
      <p className="mb-3 text-xs text-(--muted)">
        الاستشارات التي أكملت الرد فيها (مرتبطة بحسابك).
      </p>
      <div className="grid gap-3">
        {items.map((c) => (
          <Card key={c.id}>
            <CardBody className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    #{c.id} — مكتملة
                  </div>
                  {c.patient?.name ? (
                    <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      المريض: <span className="font-medium">{c.patient.name}</span>
                    </div>
                  ) : null}
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {c.question_text.slice(0, 140)}
                    {c.question_text.length > 140 ? "..." : ""}
                  </div>
                </div>
                <Link href={`/physician/consultations/${c.id}`}>
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                    عرض التفاصيل
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
        {!loading && !error && items.length === 0 ? (
          <Alert variant="info">لا توجد استشارات منتهية بعد.</Alert>
        ) : null}
      </div>
    </section>
  );
}

