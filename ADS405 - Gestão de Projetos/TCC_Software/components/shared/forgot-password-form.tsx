"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { requestPasswordReset } from "@/server/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  email: z.string().email("Informe um e-mail valido"),
});

type FormInput = z.infer<typeof FormSchema>;

export function ForgotPasswordForm() {
  const form = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await requestPasswordReset(values.email);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  });

  return (
    <Card className="w-full max-w-md border-slate-200/70 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Recuperar senha</CardTitle>
        <CardDescription>Enviaremos as instrucoes para redefinir a sua senha.</CardDescription>
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

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Enviando..." : "Enviar link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
