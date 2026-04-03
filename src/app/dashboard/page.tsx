"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

type MedicalProfile = {
  height_cm: number | null;
  weight_kg: number | null;
  chronic_diseases: string | null;
  allergies: string | null;
  current_medications: string | null;
};

export default function DashboardPage() {
  const { user, error } = useRequireAuth();
  const [profile, setProfile] = useState<MedicalProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    // keep dashboard lightweight; ignore profile errors here
    import("@/lib/api").then(({ apiFetch }) =>
      apiFetch<{ profile: MedicalProfile }>("/medical-profile")
        .then((res) => {
          if (!mounted) return;
          if (!res.ok) return;
          setProfile(res.data.profile);
        })
        .catch(() => {})
    );
    return () => {
      mounted = false;
    };
  }, []);

  function roleLabel(role: string | null | undefined) {
    if (role === "patient") return "مريض";
    if (role === "physician") return "طبيب";
    if (role === "admin") return "مدير";
    return "مستخدم";
  }

  return (
    <div className="min-h-[calc(100vh-0px)] bg-transparent">
      <AppHeader
        title="لوحة التحكم"
        backHref="/"
        userRole={user?.role}
      />

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {error ? (
          <Alert variant="error">
            {error} — تأكد أن الباك-إند شغال على <span dir="ltr">:8000</span>
          </Alert>
        ) : null}

        <Card className="mt-4">
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              لوحة التحكم
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {user ? (
                <>
                  أهلاً <span className="font-medium">{user.name}</span> — دورك:{" "}
                  <span className="font-medium">{roleLabel(user.role)}</span>
                </>
              ) : (
                "جاري تحميل بياناتك..."
              )}
            </p>

            {user?.role === "patient" ? (
              <div className="mt-6 rounded-2xl border border-(--border) bg-(--surface-2) p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">ملخص الملف الطبي</h2>
                    <p className="mt-1 text-xs text-(--muted)">
                      يظهر للطبيب عند مراجعة الاستشارة. يمكنك تحديثه من زر أدناه.
                    </p>
                  </div>
                  <Link href="/profile" className="shrink-0">
                    <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                      تعديل الملف الطبي
                    </Button>
                  </Link>
                </div>

                <ul className="mt-5 divide-y divide-(--border) list-none ps-0">
                  {(
                    [
                      {
                        label: "الطول",
                        value:
                          profile?.height_cm != null ? (
                            <span dir="ltr">{profile.height_cm} cm</span>
                          ) : (
                            "غير محدد"
                          ),
                      },
                      {
                        label: "الوزن",
                        value:
                          profile?.weight_kg != null ? (
                            <span dir="ltr">{profile.weight_kg} kg</span>
                          ) : (
                            "غير محدد"
                          ),
                      },
                      {
                        label: "أمراض مزمنة",
                        value: profile?.chronic_diseases?.trim()
                          ? profile.chronic_diseases
                          : "لا يوجد",
                      },
                      {
                        label: "الحساسية",
                        value: profile?.allergies?.trim() ? profile.allergies : "لا يوجد",
                      },
                      {
                        label: "الأدوية الحالية",
                        value: profile?.current_medications?.trim()
                          ? profile.current_medications
                          : "لا يوجد",
                      },
                    ] as { label: string; value: ReactNode }[]
                  ).map((row) => (
                    <li key={row.label} className="flex gap-3 py-3">
                      <span
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-(--gc-accent)"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-(--muted)">{row.label}</div>
                        <div className="mt-0.5 whitespace-pre-wrap text-sm font-medium text-foreground">
                          {row.value}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div
              className={`mt-6 grid gap-3 ${
                user?.role === "patient" ? "sm:grid-cols-1" : "sm:grid-cols-2"
              }`}
            >
              {user?.role !== "patient" ? (
                <Card className="hover:brightness-[1.03]">
                  <CardBody className="p-5">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                      الملف الطبي
                    </div>
                    <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      استعراض وتحديث بيانات الحالة الصحية.
                    </div>
                    <div className="mt-4">
                      <Link href="/profile">
                        <Button variant="secondary" size="sm">
                          فتح الملف الطبي
                        </Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ) : null}

              <Card
                className={`hover:brightness-[1.03] ${
                  user?.role === "patient" ? "sm:col-span-1" : ""
                }`}
              >
                <CardBody className="p-5">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-50">الاستشارات</div>
                  <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    إنشاء استشارة ومتابعة الحالة والرد.
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/consultations">
                      <Button variant="secondary" size="sm">
                        عرض الاستشارات
                      </Button>
                    </Link>
                    <Link href="/consultations/new">
                      <Button variant="primary" size="sm">
                        استشارة جديدة
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </div>

            <div className="mt-6 flex items-center justify-end">
              {/* logout is only in header */}
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

