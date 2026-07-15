"use client";

import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

// Re-opens the cookie consent banner so the user can change their choice at any
// time (LGPD: consent must be as easy to withdraw as to give).
export function ManageCookiesButton() {
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => window.dispatchEvent(new Event("tf:cookie-preferences"))}
    >
      <Cookie className="h-4 w-4" />
      Gerenciar cookies
    </Button>
  );
}
