"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch, setToken } from "@/lib/api";
import { routeForRole } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { BrandLogo } from "@/components/BrandLogo";

type RegisterResponse = {
  user: { id: number; name: string; email: string; role: string };
  token: string;
};

const roles = [
  { value: "patient", label: "مريض" },
  { value: "physician", label: "طبيب" },
] as const;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["value"]>("patient");
  const [password, setPassword] = useState("");
  const [physicianSpecialty, setPhysicianSpecialty] = useState("");
  const [physicianCertificate, setPhysicianCertificate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPhysician = role === "physician";

  const passwordHint = useMemo(() => {
    if (!password) return null;
    if (password.length < 8) return "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    return null;
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await apiFetch<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        phone: phone || undefined,
        role,
        password,
        physician_specialty: isPhysician ? physicianSpecialty : undefined,
        physician_certificate: isPhysician ? physicianCertificate : undefined,
      }),
      auth: false,
    });

    setLoading(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }

    setToken(res.data.token);
    window.location.href = routeForRole(res.data.user.role);
  }

  return (
    <div className="relative flex flex-1 items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-teal-200/30 blur-3xl dark:bg-teal-500/10" />
        <div className="absolute -top-12 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/10" />
      </div>
      <main className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <BrandLogo href="/" size="xl" showTitle showTagline />
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            الصفحة الرئيسية
          </Link>
        </div>

        <Card>
          <CardBody>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              إنشاء حساب
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              أنشئ حساباً للوصول للاستشارات والملف الطبي.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                الاسم
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                البريد الإلكتروني
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                رقم الجوال (اختياري)
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="tel"
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                نوع الحساب
              </span>
              <select
                value={role}
                onChange={(e) => {
                  const next = e.target.value as any;
                  setRole(next);
                  if (next !== "physician") {
                    setPhysicianSpecialty("");
                    setPhysicianCertificate("");
                  }
                }}
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            {isPhysician ? (
              <>
                <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-900 dark:border-teal-900/40 dark:bg-teal-950/30 dark:text-teal-100">
                  هذه المعلومات ستظهر ضمن ملف الطبيب لتوضيح تخصصه ومؤهلاته.
                </div>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    التخصص
                  </span>
                  <input
                    value={physicianSpecialty}
                    onChange={(e) => setPhysicianSpecialty(e.target.value)}
                    required={isPhysician}
                    placeholder="مثال: طب الأطفال، جراحة عامة، قلب..."
                    className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                </label>

                <label className="grid gap-1">
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    الشهادة / المؤهل
                  </span>
                  <textarea
                    value={physicianCertificate}
                    onChange={(e) => setPhysicianCertificate(e.target.value)}
                    required={isPhysician}
                    rows={3}
                    placeholder="مثال: بكالوريوس طب وجراحة، بورد/زمالة، جامعة..."
                    className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
                  />
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    اكتبها بشكل مختصر وواضح (الحد الأقصى 5000 حرف).
                  </span>
                </label>
              </>
            ) : null}

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                كلمة المرور
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
                className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-white/10"
              />
              {passwordHint ? (
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {passwordHint}
                </span>
              ) : null}
            </label>

            {error ? (
              <Alert variant="error">{error}</Alert>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            لديك حساب؟{" "}
            <Link className="font-medium text-zinc-900 dark:text-zinc-50" href="/login">
              تسجيل الدخول
            </Link>
          </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

