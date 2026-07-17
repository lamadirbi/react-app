"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch, getToken, setToken } from "@/lib/api";

export type MeUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_disabled?: boolean;
  caregiver_mode_enabled?: boolean;
  caregiver_relationship?: string | null;
  physician_profile?: {
    specialty: string;
    certificate: string;
    verification_status?: string;
    rejection_reason?: string | null;
  } | null;
  physicianProfile?: {
    specialty: string;
    certificate: string;
    verification_status?: string;
    rejection_reason?: string | null;
  } | null;
};
type MeResponse = { user: MeUser };

const SESSION_STORAGE_KEY = "gc_session_user";

let sessionUser: MeUser | null = null;

function readStoredSession(): MeUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MeUser;
  } catch {
    return null;
  }
}

function writeStoredSession(user: MeUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (!user) localStorage.removeItem(SESSION_STORAGE_KEY);
    else localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore quota / private mode
  }
}

function hydrateSession(): MeUser | null {
  if (sessionUser) return sessionUser;
  const stored = readStoredSession();
  if (stored) sessionUser = stored;
  return sessionUser;
}

export function getAuthSession() {
  return hydrateSession();
}

export function setAuthSession(user: MeUser | null) {
  sessionUser = user;
  writeStoredSession(user);
}

export function clearAuthSession() {
  sessionUser = null;
  writeStoredSession(null);
}

export function logoutAndRedirect(to = "/login") {
  setToken(null);
  clearAuthSession();
  window.location.href = to;
}

export function routeForRole(role: string | undefined | null) {
  if (role === "physician") return "/physician/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}

export function physicianProfileOf(user: MeUser | null | undefined) {
  return user?.physician_profile ?? user?.physicianProfile ?? null;
}

export function isVerifiedPhysician(user: MeUser | null | undefined) {
  const profile = physicianProfileOf(user);
  return profile?.verification_status === "approved";
}

function applyRoleGuard(user: MeUser, allowedRoles?: string[]) {
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    window.location.href = routeForRole(user.role);
    return false;
  }
  return true;
}

export function useRequireAuth(options?: {
  allowedRoles?: string[];
  redirectTo?: string;
}) {
  const redirectTo = options?.redirectTo ?? "/login";
  const allowedRolesKey = options?.allowedRoles?.slice().sort().join(",") ?? "";
  const allowedRoles = useMemo(
    () => (allowedRolesKey ? allowedRolesKey.split(",") : undefined),
    [allowedRolesKey],
  );

  const [user, setUser] = useState<MeUser | null>(() => hydrateSession());
  const [loading, setLoading] = useState(() => {
    if (hydrateSession() && getToken()) return false;
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const token = getToken();
    if (!token) {
      clearAuthSession();
      setToken(null);
      window.location.href = redirectTo;
      return;
    }

    const cached = hydrateSession();
    if (cached) {
      if (!applyRoleGuard(cached, allowedRoles)) return;
      setUser(cached);
      setLoading(false);
    }

    apiFetch<MeResponse>("/auth/me")
      .then((res) => {
        if (!mounted) return;

        if (!res.ok) {
          // Only hard-logout on unauthorized. Keep the session on network/server blips.
          if (res.status === 401) {
            clearAuthSession();
            setToken(null);
            window.location.href = redirectTo;
            return;
          }

          const fallback = hydrateSession();
          if (fallback) {
            if (!applyRoleGuard(fallback, allowedRoles)) return;
            setUser(fallback);
            setLoading(false);
            setError(res.message);
            return;
          }

          setLoading(false);
          setError(res.message || "فشل التحقق من الجلسة");
          return;
        }

        const u = res.data.user;
        if (!applyRoleGuard(u, allowedRoles)) return;

        setAuthSession(u);
        setUser(u);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        const fallback = hydrateSession();
        if (fallback) {
          if (!applyRoleGuard(fallback, allowedRoles)) return;
          setUser(fallback);
          setLoading(false);
          return;
        }
        setLoading(false);
        setError("فشل التحقق من الجلسة");
      });

    return () => {
      mounted = false;
    };
  }, [allowedRoles, redirectTo]);

  return { user, loading, error };
}
