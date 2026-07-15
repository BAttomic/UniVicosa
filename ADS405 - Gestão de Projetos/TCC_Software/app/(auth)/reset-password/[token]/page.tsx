import { ResetPasswordForm } from "@/components/shared/reset-password-form";

type ResetPasswordPageProps = {
  params: Promise<{ token: string }>;
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,_#c7d2fe,_transparent_45%),linear-gradient(to_bottom,_#eef2ff,_#f8fafc)] p-6">
      <ResetPasswordForm token={token} />
    </main>
  );
}