"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

// LGPD cookie consent banner. Records the user's choice in localStorage and a
// first-party cookie (readable server-side if ever needed). The banner can be
// reopened from anywhere by dispatching the "tf:cookie-preferences" event
// (see ManageCookiesButton).
const CONSENT_KEY = "ticketflow:cookie-consent";
const CONSENT_COOKIE = "tf_cookie_consent";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type CookieConsentValue = "all" | "essential";

function persistConsent(value: CookieConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
    localStorage.setItem(`${CONSENT_KEY}:at`, new Date().toISOString());
  } catch {
    // ignore storage errors (private mode)
  }
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }

    const reopen = () => setVisible(true);
    window.addEventListener("tf:cookie-preferences", reopen);
    return () => window.removeEventListener("tf:cookie-preferences", reopen);
  }, []);

  function decide(value: CookieConsentValue) {
    persistConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl shadow-slate-400/30 backdrop-blur sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed text-slate-600">
            Usamos cookies <strong>essenciais</strong> para manter você conectado e garantir o funcionamento da
            plataforma. Cookies não essenciais só são usados com o seu consentimento, conforme a{" "}
            <Link href="/privacidade" className="font-medium text-slate-900 underline underline-offset-2">
              Lei Geral de Proteção de Dados (LGPD)
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <button
            onClick={() => decide("essential")}
            className="h-10 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Rejeitar não essenciais
          </button>
          <button
            onClick={() => decide("all")}
            className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}
