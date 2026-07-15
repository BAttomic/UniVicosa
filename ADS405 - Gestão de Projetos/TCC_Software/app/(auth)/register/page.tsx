import { RegisterForm } from "@/components/shared/register-form";

export default function RegisterPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#fef3c7,_transparent_40%),linear-gradient(to_bottom,_#fffbeb,_#f8fafc)] p-6">
      <RegisterForm />
    </main>
  );
}