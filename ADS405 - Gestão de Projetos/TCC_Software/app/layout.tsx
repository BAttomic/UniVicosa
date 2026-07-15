import type { Metadata } from "next";
import { Toaster } from "sonner";
import { CookieConsent } from "@/components/shared/cookie-consent";
import "./globals.css";

export const metadata: Metadata = {
  title: "TicketFlow",
  description: "Plataforma de venda de ingressos online",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" />
        <CookieConsent />
      </body>
    </html>
  );
}
