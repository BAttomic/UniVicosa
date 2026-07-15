import { Suspense } from "react";
import { LoginForm } from "@/components/shared/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#e2e8f0,_transparent_45%),linear-gradient(to_bottom,_#f8fafc,_#eef2ff)] p-6">
      <Suspense fallback={<div className="text-sm text-slate-600">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}