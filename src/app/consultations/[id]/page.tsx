"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import { useMountedRef } from "@/lib/hooks/useMountedRef";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import {
  ConsultationDetailHeader,
  MedicalFilesList,
  PhysicianInfoModal,
  getConsultationDetail,
  type ConsultationDetail,
  type PhysicianProfileData,
} from "@/features/consultations";

type ShowResponse = { consultation: ConsultationDetail };

export default function ConsultationDetailPage() {
  const { user } = useRequireAuth();
  const params = useParams<{ id: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);
  const mounted = useMountedRef();

  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConsultationDetail(id)
      .then((res) => {
        if (!mounted.current) return;
        setLoading(false);
        if (!res.ok) {
          setError(res.message);
          return;
        }
        // backend returns medicalFiles (camel?) as medicalFiles. We'll support both.
        const c: any = res.data.consultation as any;
        c.medical_files = c.medical_files ?? c.medicalFiles ?? [];
        if (c.physician?.physician_profile && !c.physician.physicianProfile) {
          c.physician.physicianProfile = c.physician.physician_profile;
        }
        setConsultation(c as ConsultationDetail);
      })
      .catch(() => {
        if (!mounted.current) return;
        setLoading(false);
        setError("فشل تحميل الاستشارة");
      });
  }, [id]);

  function physicianProfileFor(p: ConsultationDetail["physician"]) {
    if (!p) return null;
    const raw = p as {
      physicianProfile?: PhysicianProfileData | null;
      physician_profile?: PhysicianProfileData | null;
    };
    return raw.physicianProfile ?? raw.physician_profile ?? null;
  }

  const [physicianModalOpen, setPhysicianModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent">
      <AppHeader title="تفاصيل الاستشارة" backHref="/consultations" userRole={user?.role} />

      <main className="mx-auto w-full max-w-3xl px-4 py-8">
        {loading ? (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">جاري التحميل...</div>
        ) : null}
        {error ? (
          <div className="mb-4">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : null}

        {consultation ? (
          <Card>
            <CardBody>
            <ConsultationDetailHeader
              id={consultation.id}
              status={consultation.status}
              physicianResponse={consultation.physician_response}
              questionText={consultation.question_text}
            />

            {consultation.medical_files && consultation.medical_files.length ? (
              <div className="mt-6">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  الملفات المرفقة
                </div>
                <div className="mt-2">
                  <MedicalFilesList
                    files={consultation.medical_files}
                    preview="images"
                    hideImageName
                    onError={(m) => setError(m)}
                  />
                </div>
              </div>
            ) : null}

            {consultation.physician_response ? (
              <div className="mt-6">
                <Alert variant="success">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="font-semibold">رد الطبيب</span>
                    {consultation.physician ? (
                      <>
                        <span className="text-emerald-800/70 dark:text-emerald-200/80">—</span>
                        <button
                          type="button"
                          onClick={() => setPhysicianModalOpen(true)}
                          className="inline font-bold text-emerald-900 underline decoration-emerald-600/40 underline-offset-2 hover:decoration-emerald-700 dark:text-emerald-100"
                        >
                          {consultation.physician.name}
                        </button>
                      </>
                    ) : null}
                  </div>
                  <div className="mt-3 whitespace-pre-wrap border-t border-emerald-200/60 pt-3 dark:border-emerald-900/40">
                    {consultation.physician_response}
                  </div>
                </Alert>
              </div>
            ) : null}
            </CardBody>
          </Card>
        ) : !loading ? (
          <Alert variant="info">لم يتم العثور على الاستشارة.</Alert>
        ) : null}
      </main>

      {physicianModalOpen && consultation?.physician ? (
        <PhysicianInfoModal
          open={physicianModalOpen}
          onClose={() => setPhysicianModalOpen(false)}
          consultationId={consultation.id}
          physicianName={consultation.physician.name}
          profile={physicianProfileFor(consultation.physician)}
        />
      ) : null}
    </div>
  );
}

