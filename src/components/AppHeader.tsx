"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";
import { LogoutButton } from "@/components/LogoutButton";
import { useState } from "react";

type Props = {
  title: string;
  backHref?: string;
  rightSlot?: React.ReactNode;
  userRole?: string | null;
  primaryAction?: React.ReactNode;
};

export function AppHeader({ title, backHref, rightSlot, userRole, primaryAction }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const onPhysicianDashboard = pathname === "/physician/dashboard";
  const onPatientDashboard = pathname === "/dashboard";

  function goBack() {
    if (backHref) {
      window.location.href = backHref;
      return;
    }
    router.back();
  }

  return (
    <header className="sticky top-0 z-10 overflow-visible border-b border-(--border) bg-(--surface) backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-3 sm:gap-3 sm:py-4">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--surface) px-3 text-sm font-semibold text-foreground hover:bg-(--surface-2) sm:h-10 sm:px-4"
        >
          رجوع
        </button>

        {!rightSlot && userRole ? (
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-(--border) bg-(--surface) px-3 text-sm font-semibold text-foreground hover:bg-(--surface-2) sm:hidden"
            aria-label="القائمة"
          >
            القائمة
          </button>
        ) : null}

        <BrandLogo href="/" size="md" showTitle={false} className="shrink-0" />

        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground sm:text-base">
          {title}
        </div>

        {rightSlot ? (
          <div className="flex shrink-0 items-center gap-2">{rightSlot}</div>
        ) : (
          <div className="hidden shrink-0 flex-wrap items-center justify-end gap-2 sm:flex sm:gap-2.5">
            {primaryAction ? <div>{primaryAction}</div> : null}

            {userRole === "physician" && !onPhysicianDashboard ? (
              <Link
                href="/physician/dashboard"
                className="inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-(--muted) hover:bg-(--surface-2) hover:text-foreground"
              >
                الطابور
              </Link>
            ) : null}
            {userRole && userRole !== "physician" && !onPatientDashboard ? (
              <Link
                href="/dashboard"
                className="inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-(--muted) hover:bg-(--surface-2) hover:text-foreground"
              >
                لوحة التحكم
              </Link>
            ) : null}

            {userRole && userRole !== "physician" ? (
              <>
                <Link
                  href="/consultations"
                  className="inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-(--muted) hover:bg-(--surface-2) hover:text-foreground"
                >
                  الاستشارات
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold text-(--muted) hover:bg-(--surface-2) hover:text-foreground"
                >
                  الملف الطبي
                </Link>
              </>
            ) : null}

            <LogoutButton />
          </div>
        )}

        {!rightSlot && !userRole ? (
          <div className="shrink-0 sm:hidden">
            <LogoutButton />
          </div>
        ) : null}

        {!rightSlot && userRole && menuOpen ? (
          <>
            <button
              type="button"
              aria-label="إغلاق القائمة"
              className="fixed inset-0 z-40 cursor-default sm:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[min(85vh,32rem)] overflow-y-auto overscroll-contain rounded-t-2xl border border-(--border) border-b-0 bg-(--surface) p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-(--shadow) sm:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="قائمة التنقل"
            >
              <div className="mx-auto w-full max-w-md space-y-1">
                {primaryAction ? <div className="pb-2">{primaryAction}</div> : null}

                {userRole === "physician" && !onPhysicianDashboard ? (
                  <Link
                    href="/physician/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-(--surface-2)"
                  >
                    الطابور
                  </Link>
                ) : userRole !== "physician" ? (
                  <>
                    {!onPatientDashboard ? (
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-(--surface-2)"
                      >
                        لوحة التحكم
                      </Link>
                    ) : null}
                    <Link
                      href="/consultations"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-(--surface-2)"
                    >
                      الاستشارات
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-xl px-3 py-3 text-sm font-medium text-foreground hover:bg-(--surface-2)"
                    >
                      الملف الطبي
                    </Link>
                  </>
                ) : null}

                <div className="border-t border-(--border) pt-3">
                  <LogoutButton className="w-full" />
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
