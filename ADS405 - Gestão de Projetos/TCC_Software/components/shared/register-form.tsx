"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { registerUser } from "@/server/actions/auth.actions";
import { isValidCnpj, isValidCpf } from "@/lib/br-validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const FormSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome"),
    email: z.string().email("Informe um e-mail valido"),
    password: z.string().min(8, "A senha deve ter no minimo 8 caracteres"),
    isOrganizer: z.boolean(),
    personType: z.enum(["pf", "pj"]),
    document: z.string(),
    legalName: z.string(),
    tradeName: z.string(),
    responsibleName: z.string(),
    phone: z.string(),
    cep: z.string(),
    street: z.string(),
    number: z.string(),
    complement: z.string(),
    district: z.string(),
    city: z.string(),
    state: z.string(),
    pixKey: z.string(),
  })
  .superRefine((data, ctx) => {
    if (!data.isOrganizer) return;
    const require = (field: keyof typeof data, message: string) => {
      if (!String(data[field] ?? "").trim()) ctx.addIssue({ code: "custom", message, path: [field] });
    };
    require("legalName", data.personType === "pj" ? "Informe a razão social" : "Informe o nome completo");
    require("responsibleName", "Informe o responsável");
    require("phone", "Informe um telefone");
    require("cep", "Informe o CEP");
    require("street", "Informe o logradouro");
    require("number", "Informe o número");
    require("district", "Informe o bairro");
    require("city", "Informe a cidade");
    if (String(data.state).trim().length !== 2) ctx.addIssue({ code: "custom", message: "UF (2 letras)", path: ["state"] });

    const doc = data.document.replace(/\D/g, "");
    if (data.personType === "pj" && !isValidCnpj(doc)) ctx.addIssue({ code: "custom", message: "CNPJ inválido", path: ["document"] });
    if (data.personType === "pf" && !isValidCpf(doc)) ctx.addIssue({ code: "custom", message: "CPF inválido", path: ["document"] });
  });

type FormInput = z.infer<typeof FormSchema>;

export function RegisterForm() {
  const router = useRouter();
  const form = useForm<FormInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      isOrganizer: false,
      personType: "pj",
      document: "",
      legalName: "",
      tradeName: "",
      responsibleName: "",
      phone: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      district: "",
      city: "",
      state: "",
      pixKey: "",
    },
  });

  const isOrganizer = form.watch("isOrganizer");
  const personType = form.watch("personType");

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = values.isOrganizer
      ? {
          name: values.name,
          email: values.email,
          password: values.password,
          role: "organizer" as const,
          phone: values.phone,
          organizerProfile: {
            personType: values.personType,
            legalName: values.legalName,
            tradeName: values.tradeName || undefined,
            document: values.document,
            responsibleName: values.responsibleName,
            phone: values.phone,
            address: {
              cep: values.cep,
              street: values.street,
              number: values.number,
              complement: values.complement || undefined,
              district: values.district,
              city: values.city,
              state: values.state.toUpperCase(),
            },
            pixKey: values.pixKey || undefined,
          },
        }
      : { name: values.name, email: values.email, password: values.password, role: "buyer" as const };

    const result = await registerUser(payload);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    router.push("/login");
  });

  const errors = form.formState.errors;

  return (
    <Card className="w-full max-w-xl border-slate-200/70 bg-white/80 backdrop-blur">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Cadastre-se para comprar ingressos em segundos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="name">Nome completo</label>
            <Input id="name" autoComplete="name" {...form.register("name")} />
            {errors.name ? <p className="text-xs text-red-600">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="email">E-mail</label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="password">Senha</label>
            <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
          </div>

          {/* Toggle organizador */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <input type="checkbox" className="mt-1 h-4 w-4" {...form.register("isOrganizer")} />
            <span className="text-sm">
              <span className="font-medium text-slate-900">Quero criar e vender eventos (organizador)</span>
              <span className="block text-xs text-slate-500">Para repasses no Brasil, precisamos dos dados fiscais e de contato.</span>
            </span>
          </label>

          {isOrganizer ? (
            <div className="space-y-4 rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Dados do organizador</p>

              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" value="pj" {...form.register("personType")} /> Pessoa jurídica (CNPJ)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="pf" {...form.register("personType")} /> Pessoa física (CPF)
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="legalName">
                    {personType === "pj" ? "Razão social" : "Nome completo"}
                  </label>
                  <Input id="legalName" {...form.register("legalName")} />
                  {errors.legalName ? <p className="text-xs text-red-600">{errors.legalName.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="document">{personType === "pj" ? "CNPJ" : "CPF"}</label>
                  <Input id="document" inputMode="numeric" {...form.register("document")} placeholder={personType === "pj" ? "00.000.000/0000-00" : "000.000.000-00"} />
                  {errors.document ? <p className="text-xs text-red-600">{errors.document.message}</p> : null}
                </div>
              </div>

              {personType === "pj" ? (
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="tradeName">Nome fantasia (opcional)</label>
                  <Input id="tradeName" {...form.register("tradeName")} />
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="responsibleName">Responsável legal</label>
                  <Input id="responsibleName" {...form.register("responsibleName")} />
                  {errors.responsibleName ? <p className="text-xs text-red-600">{errors.responsibleName.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="phone">Telefone</label>
                  <Input id="phone" inputMode="tel" {...form.register("phone")} placeholder="(31) 99999-9999" />
                  {errors.phone ? <p className="text-xs text-red-600">{errors.phone.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="cep">CEP</label>
                  <Input id="cep" inputMode="numeric" {...form.register("cep")} placeholder="36570-000" />
                  {errors.cep ? <p className="text-xs text-red-600">{errors.cep.message}</p> : null}
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium" htmlFor="street">Logradouro</label>
                  <Input id="street" {...form.register("street")} />
                  {errors.street ? <p className="text-xs text-red-600">{errors.street.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="number">Número</label>
                  <Input id="number" {...form.register("number")} />
                  {errors.number ? <p className="text-xs text-red-600">{errors.number.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="complement">Complemento</label>
                  <Input id="complement" {...form.register("complement")} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="district">Bairro</label>
                  <Input id="district" {...form.register("district")} />
                  {errors.district ? <p className="text-xs text-red-600">{errors.district.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-sm font-medium" htmlFor="city">Cidade</label>
                  <Input id="city" {...form.register("city")} />
                  {errors.city ? <p className="text-xs text-red-600">{errors.city.message}</p> : null}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium" htmlFor="state">UF</label>
                  <Input id="state" maxLength={2} {...form.register("state")} placeholder="MG" />
                  {errors.state ? <p className="text-xs text-red-600">{errors.state.message}</p> : null}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium" htmlFor="pixKey">Chave PIX para repasses (opcional)</label>
                <Input id="pixKey" {...form.register("pixKey")} placeholder="e-mail, CPF/CNPJ, telefone ou chave aleatória" />
              </div>
            </div>
          ) : null}

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
