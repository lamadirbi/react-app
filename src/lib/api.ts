export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; status?: number };

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("gc_token");
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem("gc_token");
  else localStorage.setItem("gc_token", token);
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<ApiResult<T>> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const res = await fetch(url, { ...options, headers });
    const text = await res.text();
    const json = text ? (JSON.parse(text) as unknown) : null;

    if (!res.ok) {
      const message =
        (json as any)?.message ??
        (json as any)?.error ??
        "تعذر إتمام الطلب. حاول مرة أخرى.";
      return { ok: false, message, status: res.status };
    }

    return { ok: true, data: json as T };
  } catch {
    return { ok: false, message: "فشل الاتصال بالخادم. تحقق من الإنترنت." };
  }
}

export async function downloadWithAuth(
  path: string,
  query?: Record<string, string>
): Promise<ApiResult<{ blob: Blob; filename?: string }>> {
  const qs =
    query && Object.keys(query).length > 0
      ? `?${new URLSearchParams(query).toString()}`
      : "";
  const url = `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}${qs}`;
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text();
      let message = "تعذر تنزيل الملف.";
      try {
        const json = text ? JSON.parse(text) : null;
        message = (json as any)?.message ?? message;
      } catch {
        // ignore
      }
      return { ok: false, message, status: res.status };
    }

    const blob = await res.blob();
    const cd = res.headers.get("content-disposition") ?? undefined;
    const filename =
      cd?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)?.[1] ??
      cd?.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i)?.[2];

    return { ok: true, data: { blob, filename: filename ? decodeURIComponent(filename) : undefined } };
  } catch {
    return { ok: false, message: "فشل الاتصال بالخادم. تحقق من الإنترنت." };
  }
}

