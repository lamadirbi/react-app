"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch, setToken } from "@/lib/api";
import { routeForRole } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { BrandLogo } from "@/components/BrandLogo";

type LoginResponse = {
  user: { id: number; name: string; email: string; role: string };
  token: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
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
              تسجيل الدخول (مريض / طبيب)
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              ادخل بريدك وكلمة المرور للوصول لحسابك — سواء كنت مريضاً أو طبيباً.
            </p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                البريد الإلكتروني
              </span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-(--ring) dark:text-zinc-50"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                كلمة المرور
              </span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                required
                className="h-11 rounded-xl border border-(--border) bg-(--surface) px-3 text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-(--ring) dark:text-zinc-50"
              />
            </label>

            {error ? (
              <Alert variant="error">{error}</Alert>
            ) : null}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "جاري الدخول..." : "دخول"}
            </Button>
          </form>

          <div className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            ليس لديك حساب؟{" "}
            <Link className="font-medium text-zinc-900 dark:text-zinc-50" href="/register">
              إنشاء حساب
            </Link>
          </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}

