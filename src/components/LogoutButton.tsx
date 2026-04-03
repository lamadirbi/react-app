"use client";

import { setToken } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export function LogoutButton({ className }: { className?: string }) {
  function logout() {
    setToken(null);
    window.location.href = "/login";
  }

  return (
    <Button variant="danger" size="sm" onClick={logout} className={className}>
      تسجيل الخروج
    </Button>
  );
}

