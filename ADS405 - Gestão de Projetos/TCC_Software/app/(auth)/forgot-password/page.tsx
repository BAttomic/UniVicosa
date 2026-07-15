import { ForgotPasswordForm } from "@/components/shared/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#bfdbfe,_transparent_45%),linear-gradient(to_bottom,_#eff6ff,_#f8fafc)] p-6">
      <ForgotPasswordForm />
    </main>
  );
}