"use client";

import { useEffect, useState } from "react";
import { apiFetch, getToken } from "@/lib/api";

export type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  physician_profile?: { specialty: string; certificate: string } | null;
  physicianProfile?: { specialty: string; certificate: string } | null;
};
type MeResponse = { user: MeUser };

export function routeForRole(role: string | undefined | null) {
  if (role === "physician") return "/physician/dashboard";
  return "/dashboard";
}

export function useRequireAuth(options?: {
  allowedRoles?: string[];
  redirectTo?: string;
}) {
  const redirectTo = options?.redirectTo ?? "/login";
  const allowedRoles = options?.allowedRoles;

  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const token = getToken();
    if (!token) {
      window.location.href = redirectTo;
      return;
    }

    apiFetch<MeResponse>("/auth/me")
      .then((res) => {
        if (!mounted) return;
        setLoading(false);

        if (!res.ok) {
          window.location.href = redirectTo;
          return;
        }

        const u = res.data.user;
        if (allowedRoles && !allowedRoles.includes(u.role)) {
          window.location.href = routeForRole(u.role);
          return;
        }

        setUser(u);
      })
      .catch(() => {
        if (!mounted) return;
        setLoading(false);
        setError("فشل التحقق من الجلسة");
      });

    return () => {
      mounted = false;
    };
  }, [allowedRoles, redirectTo]);

  return { user, loading, error };
}

