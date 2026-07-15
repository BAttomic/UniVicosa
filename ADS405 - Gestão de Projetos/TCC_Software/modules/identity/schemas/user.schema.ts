import { z } from "zod";
import { isValidCnpj, isValidCpf } from "@/lib/br-validators";

const OrganizerProfileInput = z.object({
  personType: z.enum(["pf", "pj"]),
  legalName: z.string().min(2, "Informe a razão social / nome completo."),
  tradeName: z.string().optional().or(z.literal("")),
  document: z.string().min(11, "Informe o documento."),
  responsibleName: z.string().min(2, "Informe o responsável legal."),
  phone: z.string().min(8, "Informe um telefone."),
  address: z.object({
    cep: z.string().min(8, "CEP inválido."),
    street: z.string().min(2, "Informe o logradouro."),
    number: z.string().min(1, "Informe o número."),
    complement: z.string().optional().or(z.literal("")),
    district: z.string().min(2, "Informe o bairro."),
    city: z.string().min(2, "Informe a cidade."),
    state: z.string().length(2, "UF deve ter 2 letras."),
  }),
  pixKey: z.string().optional().or(z.literal("")),
});

export const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(2),
    role: z.enum(["buyer", "organizer"]).default("buyer"),
    phone: z.string().optional(),
    organizerProfile: OrganizerProfileInput.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== "organizer") return;
    if (!data.organizerProfile) {
      ctx.addIssue({ code: "custom", message: "Preencha os dados de organizador.", path: ["organizerProfile"] });
      return;
    }
    const doc = data.organizerProfile.document.replace(/\D/g, "");
    if (data.organizerProfile.personType === "pj" && !isValidCnpj(doc)) {
      ctx.addIssue({ code: "custom", message: "CNPJ inválido.", path: ["organizerProfile", "document"] });
    }
    if (data.organizerProfile.personType === "pf" && !isValidCpf(doc)) {
      ctx.addIssue({ code: "custom", message: "CPF inválido.", path: ["organizerProfile", "document"] });
    }
  });

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const UserOutputSchema = z.object({
  _id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["buyer", "organizer", "operator", "admin"]),
  phone: z.string().optional(),
  createdAt: z.coerce.date(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UserOutput = z.infer<typeof UserOutputSchema>;
