"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Tipo de resposta padronizado para retorno de Server Actions para o cliente
export type ActionResponse = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    description?: string[];
    calories?: string[];
    meal_type?: string[];
  };
};

// Livro de regras do Zod para Refeições
const mealSchema = z.object({
  description: z.string().min(2, "A descrição deve ter pelo menos 2 caracteres."),
  calories: z.coerce.number().min(1, "A refeição deve ter pelo menos 1 caloria."),
  meal_type: z.enum(["Café da Manhã", "Almoço", "Lanche", "Jantar", "Ceia"]),
});

// Tradutor universal para o Supabase (Zod aprova a chave, Supabase recebe o valor)
const mapeamentoTipos: { [key: string]: 'café' | 'almoço' | 'lanche' | 'jantar' | 'ceia' } = {
  "Café da Manhã": "café",
  "Almoço": "almoço",
  "Lanche": "lanche",
  "Jantar": "jantar",
  "Ceia": "ceia"
};

// 1. CREATE (Adicionar)
export async function addMeal(formData: FormData): Promise<ActionResponse> {
  const supabase = (await createClient()) as any;
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  // Passamos os dados pela catraca de validação do Zod
  const validatedFields = mealSchema.safeParse({
    description: formData.get("description"),
    calories: formData.get("calories"),
    meal_type: formData.get("meal_type"),
  });

  // Se o Zod barrar, retornamos os erros de campo estruturados
  if (!validatedFields.success) {
    return {
      success: false,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const createdAtInput = formData.get("created_at") as string;
  const createdAt = createdAtInput ? new Date(createdAtInput).toISOString() : new Date().toISOString();

  const newMeal = {
    user_id: user.id,
    description: validatedFields.data.description,
    calories: validatedFields.data.calories,
    meal_type: mapeamentoTipos[validatedFields.data.meal_type],
    created_at: createdAt, 
  };

  const { error } = await supabase.from("meals").insert(newMeal);

  if (error) {
    console.error("Erro ao salvar no banco:", error);
    return { success: false, error: `Falha ao registrar a refeição: ${error.message} (Código: ${error.code})` };
  }
  
  revalidatePath("/dashboard");
  return { success: true };
}

// 2. DELETE (Excluir)
export async function deleteMeal(mealId: string): Promise<ActionResponse> {
  const supabase = (await createClient()) as any;
  
  const { error } = await supabase.from("meals").delete().eq("id", mealId);

  if (error) {
    console.error("Erro ao deletar:", error);
    return { success: false, error: "Falha ao deletar a refeição." };
  }
  
  revalidatePath("/dashboard");
  return { success: true };
}

// 3. UPDATE (Atualizar)
export async function updateMeal(formData: FormData): Promise<ActionResponse> {
  const supabase = (await createClient()) as any;
  const mealId = String(formData.get("id"));
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Usuário não autenticado." };
  }

  // Aplicando Zod na atualização também para ficar 100% blindado!
  const validatedFields = mealSchema.safeParse({
    description: formData.get("description"),
    calories: formData.get("calories"),
    meal_type: formData.get("meal_type"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const updatedData: any = {
    description: validatedFields.data.description,
    calories: validatedFields.data.calories,
    meal_type: mapeamentoTipos[validatedFields.data.meal_type],
  };

  const createdAtInput = formData.get("created_at") as string;
  if (createdAtInput) {
    updatedData.created_at = new Date(createdAtInput).toISOString();
  }

  const { error } = await supabase
    .from("meals")
    .update(updatedData)
    .eq("id", mealId);

  if (error) {
    console.error("Erro ao atualizar:", error);
    return { success: false, error: "Falha ao atualizar a refeição." };
  }
  
  revalidatePath("/dashboard");
  return { success: true };
}

// === NOVA FUNÇÃO DO JEJUM ===
export async function saveFastRecord(formData: FormData) {
  const supabase = (await createClient()) as any;
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado");

  const start_time = String(formData.get("start_time"));
  const end_time = String(formData.get("end_time"));
  const protocol = String(formData.get("protocol"));
  const duration_hours = Number(formData.get("duration_hours"));

  const { error } = await supabase.from("fasts").insert({
    user_id: user.id,
    start_time,
    end_time,
    protocol,
    duration_hours
  });

  if (error) {
    console.error("Erro ao salvar jejum:", error);
    throw new Error(`Erro do Supabase: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

// === FUNÇÃO DE LOGOUT (SAIR) ===
export async function handleSignOut() {
  const supabase = (await createClient()) as any;
  
  await supabase.auth.signOut();
  
  redirect("/login");
}