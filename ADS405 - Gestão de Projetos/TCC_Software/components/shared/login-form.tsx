"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FormSchema = z.object({
  email: z.string().email("Informe um e-mail valido"),
  password: z.string().min(1, "Informe sua senha"),
});

type FormInput = z.infer<typeof FormSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const form = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      redirectTo: callbackUrl,
    });

    if (!result || result.error) {
      toast.error("E-mail ou senha invalidos.");
      return;
    }

    toast.success("Login realizado com sucesso.");
    router.push(result.url ?? callbackUrl);
    router.refresh();
  });

  return (
    <Card className="w-full max-w-md border-slate-200/70 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Entrar</CardTitle>
        <CardDescription>Acesse sua conta para comprar ou gerenciar eventos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">
              E-mail
            </label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">
              Senha
            </label>
            <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-xs text-red-600">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>

          <div className="flex justify-between text-sm">
            <Link className="text-slate-700 underline" href="/register">
              Criar conta
            </Link>
            <Link className="text-slate-700 underline" href="/forgot-password">
              Esqueci minha senha
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
