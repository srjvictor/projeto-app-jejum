"use server";

import { createClient } from "@/lib/supabase/server";
import { LoginSchema, RegisterSchema, ForgotPasswordSchema } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAction(formData: unknown) {
  const parsed = LoginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function registerAction(formData: unknown) {
  const parsed = RegisterSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      // O Supabase por padrão exige confirmação por e-mail. 
      // Se desativar isso no painel do Supabase, o utilizador faz login direto.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };

  return { success: "Registo efetuado! Verifique o seu e-mail ou faça login." };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPasswordAction(formData: unknown) {
  const parsed = ForgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "E-mail inválido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/reset-password`,
  });

  if (error) return { error: error.message };

  return { success: "E-mail de recuperação enviado com sucesso!" };
}