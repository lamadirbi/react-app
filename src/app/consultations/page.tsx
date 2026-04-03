"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useMountedRef } from "@/lib/hooks/useMountedRef";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { ConsultationCard, getMyConsultations, type ConsultationListItem } from "@/features/consultations";

export default function ConsultationsPage() {
  const { user } = useRequireAuth();
  const [items, setItems] = useState<ConsultationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useMountedRef();

  useEffect(() => {
    getMyConsultations()
      .then((res) => {
        if (!mounted.current) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        setItems(res.data.data ?? []);
      })
      .catch(() => {
        if (!mounted.current) return;
        setLoading(false);
        setError("فشل تحميل الاستشارات");
      });
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title="الاستشارات"
        backHref="/dashboard"
        userRole={user?.role}
        primaryAction={
          <Link href="/consultations/new">
            <Button size="sm">استشارة جديدة</Button>
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            جاري التحميل...
          </div>
        ) : null}

        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        <div className="grid gap-3">
          {items.map((c) => (
            <ConsultationCard
              key={c.id}
              id={c.id}
              status={c.status}
              physicianResponse={c.physician_response}
              physicianName={c.physician?.name ?? null}
              questionText={c.question_text}
              submittedAt={c.submitted_at}
              href={`/consultations/${c.id}`}
              ctaLabel="عرض التفاصيل"
              variant="patient"
            />
          ))}

          {!loading && !error && items.length === 0 ? (
            <Alert variant="info">
              لا يوجد استشارات بعد. ابدأ بـ{" "}
              <Link className="font-medium hover:underline" href="/consultations/new">
                استشارة جديدة
              </Link>
              .
            </Alert>
          ) : null}
        </div>
      </main>
    </div>
  );
}

