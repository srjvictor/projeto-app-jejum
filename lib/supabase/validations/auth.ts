import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Insira um e-mail válido."),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
});

export const RegisterSchema = z.object({
  email: z.string().email("Insira um e-mail válido."),
  password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As palavras-passe não coincidem.",
  path: ["confirmPassword"],
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Insira um e-mail válido."),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;