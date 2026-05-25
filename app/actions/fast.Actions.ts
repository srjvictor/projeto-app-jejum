"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveFastRecord(formData: FormData) {
  // Desligando a tipagem estrita para focar no funcionamento
  const supabase = (await createClient()) as any;
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Usuário não autenticado");

  const start_time = String(formData.get("start_time"));
  const end_time = String(formData.get("end_time"));
  const protocol = String(formData.get("protocol"));
  const duration_hours = Number(formData.get("duration_hours"));

  // Salva na tabela 'fasts'
  const { error } = await supabase.from("fasts").insert({
    user_id: user.id,
    start_time,
    end_time,
    protocol,
    duration_hours
  });

  if (error) {
    console.error("Erro ao salvar jejum:", error);
    throw new Error("Falha ao registrar o jejum.");
  }

  // Atualiza a tela para refletir mudanças
  revalidatePath("/dashboard");
}