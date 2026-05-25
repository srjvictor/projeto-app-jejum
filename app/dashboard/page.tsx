import WeeklyReport from "@/components/WeeklyReport";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MealForm from "@/components/MealForm";
import MealItem from "@/components/MealItem";
import CalorieTracker from "@/components/CalorieTracker";
import FastingTimer from "@/components/FastingTimer";
import WaterTracker from "@/components/WaterTracker";
import { handleSignOut } from "@/app/actions/mealActions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: fasts } = await supabase
    .from("fasts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: goalData } = await supabase
    .from("user_goals")
    .select("daily_calories")
    .eq("user_id", user.id)
    .single();

  const userGoal = (goalData as { daily_calories: number } | null)?.daily_calories || 0;

  const today = new Date().toISOString().split("T")[0];

  const consumedToday = meals
    ? meals
      .filter((meal) => meal.created_at && meal.created_at.startsWith(today))
      .reduce((total, meal) => total + meal.calories, 0)
    : 0;

  return (
    // Mudança 1: p-4 no mobile, md:p-8 no desktop
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">

        {/* Mudança 2: Cabeçalho em coluna no mobile, linha no desktop */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 gap-4">
          <div className="overflow-hidden w-full sm:w-auto">
            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white">Meu Painel</h1>
            {/* O truncate impede que um e-mail gigante quebre o layout */}
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 truncate">
              Logado como: <strong className="text-black dark:text-white">{user.email}</strong>
            </p>
          </div>

          <form action={handleSignOut} className="self-end sm:self-auto">
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-0"
            >
              Sair
            </button>
          </form>
        </header>

        {/* Painel Diário de Metas */}
        <CalorieTracker goal={userGoal} consumed={consumedToday} />

        {/* NOVO: Relatório Semanal de Desempenho (Analytics) */}
        <WeeklyReport meals={meals || []} fasts={fasts || []} goal={userGoal} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <MealForm />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FastingTimer />
              <WaterTracker />
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Histórico de Jejuns
              </h2>

              {fasts && fasts.length > 0 ? (
                <ul className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                  {fasts.map((fast) => (
                    <li key={fast.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                          Protocolo {fast.protocol}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {new Date(fast.start_time).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {fast.duration_hours}h
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-4">Nenhum jejum finalizado ainda.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Histórico de Refeições
            </h2>

            {meals && meals.length > 0 ? (
              <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {meals.map((meal) => (
                  <MealItem key={meal.id} meal={meal} />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-8">Nenhuma refeição registrada ainda.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}