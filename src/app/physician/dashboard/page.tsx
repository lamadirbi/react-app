"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { Alert } from "@/components/ui/Alert";
import {
  PhysicianProfilePanel,
  PhysicianQueueSection,
  PhysicianInProgressSection,
  PhysicianCompletedSection,
} from "@/features/physician";

type Consultation = {
  id: number;
  question_text: string;
  status: "pending" | "completed";
  submitted_at: string;
  responded_at?: string | null;
  physician_response?: string | null;
  patient?: { id: number; name: string; role: string };
};

type Paginated<T> = { data: T[] };

export default function PhysicianDashboardPage() {
  const { user } = useRequireAuth({ allowedRoles: ["physician"] });
  const [queue, setQueue] = useState<Consultation[]>([]);
  const [inProgress, setInProgress] = useState<Consultation[]>([]);
  const [completedMine, setCompletedMine] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiFetch<Paginated<Consultation>>("/consultations/queue"),
      apiFetch<Paginated<Consultation>>("/consultations"),
    ])
      .then(([q, mine]) => {
        if (!mounted) return;
        setLoading(false);
        if (!q.ok) setError(q.message);
        if (q.ok) setQueue(q.data.data ?? []);
        if (mine.ok) {
          const rows = mine.data.data ?? [];
          setInProgress(rows.filter((c) => c.status === "pending"));
          setCompletedMine(rows.filter((c) => c.status === "completed"));
        }
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setError("فشل تحميل الحالات");
      });
    return () => {
      mounted = false;
    };
  }, []);


  async function claim(id: number) {
    setClaimingId(id);
    setError(null);
    const res = await apiFetch<{ consultation: Consultation }>(`/consultations/${id}/claim`, {
      method: "POST",
    });
    setClaimingId(null);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    window.location.href = `/physician/consultations/${id}`;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <AppHeader
        title="لوحة الطبيب"
        backHref="/"
        userRole={user?.role}
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

        <div className="grid gap-6">
          <PhysicianProfilePanel initialProfile={(user as any)?.physician_profile ?? (user as any)?.physicianProfile ?? null} />

          <PhysicianQueueSection
            queue={queue}
            loading={loading}
            error={error}
            claimingId={claimingId}
            onClaim={claim}
          />

          <PhysicianInProgressSection items={inProgress} loading={loading} error={error} />

          <PhysicianCompletedSection items={completedMine} loading={loading} error={error} />
        </div>
      </main>
    </div>
  );
}

