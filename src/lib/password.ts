import { apiFetch, type ApiResult } from "@/lib/api";

const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_API === "true";

export type ForgotPasswordResponse = {
  message: string;
  demo_reset_token?: string;
  demo_reset_url?: string;
};

export type ForgotPasswordSuccessView = {
  variant: "success" | "info";
  message: string;
  showDemoDetails: boolean;
  mailpitUrl?: string | null;
};

export function getForgotPasswordFormHint(): string {
  if (MOCK_MODE) {
    return "أدخل بريد حساب تجريبي ليظهر رابط إعادة التعيين هنا.";
  }
  return "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.";
}

export function getForgotPasswordSuccessView(
  demoToken: string | null,
  demoUrl: string | null,
): ForgotPasswordSuccessView {
  if (MOCK_MODE) {
    if (demoToken || demoUrl) {
      return {
        variant: "success",
        message: "تم تجهيز الرابط. استخدميه أدناه.",
        showDemoDetails: true,
      };
    }
    return {
      variant: "info",
      message: "البريد غير مسجّل. جرّبي حساباً من «دخول سريع».",
      showDemoDetails: false,
    };
  }

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return {
    variant: "success",
    message: isLocal ? "تم الإرسال. افتحي Mailpit لرؤية الرسالة." : "تم الإرسال. راجعي بريدك.",
    showDemoDetails: !!(demoToken || demoUrl),
    mailpitUrl: isLocal ? "http://127.0.0.1:8025" : null,
  };
}

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export async function requestPasswordReset(
  email: string,
): Promise<ApiResult<ForgotPasswordResponse>> {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
    auth: false,
  });
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ApiResult<{ message: string }>> {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      email: payload.email.trim().toLowerCase(),
    }),
    auth: false,
  });
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiResult<{ message: string }>> {
  return apiFetch<{ message: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
