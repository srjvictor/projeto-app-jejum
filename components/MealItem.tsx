"use client";

import { useState } from "react";
import { deleteMeal, updateMeal } from "@/app/actions/mealActions";

const displayMealType = (type: string) => {
  const map: Record<string, string> = {
    café: "Café da Manhã",
    almoço: "Almoço",
    lanche: "Lanche",
    jantar: "Jantar",
    ceia: "Ceia"
  };
  return map[type] || type;
};

const mapToOptionValue = (type: string) => {
  const map: Record<string, string> = {
    café: "Café da Manhã",
    almoço: "Almoço",
    lanche: "Lanche",
    jantar: "Jantar",
    ceia: "Ceia"
  };
  return map[type] || "Café da Manhã";
};

import { Database } from "@/utils/supabase/database.types";

type MealRow = Database["public"]["Tables"]["meals"]["Row"];

export default function MealItem({ meal }: { meal: MealRow }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [showToast, setShowToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  const handleDelete = async () => {
    if (!window.confirm(`Deseja excluir a refeição "${meal.description}"?`)) return;
    setIsDeleting(true);
    const res = await deleteMeal(meal.id);
    if (!res.success) {
      setIsDeleting(false);
      setShowToast({ show: true, msg: res.error || "Erro ao excluir.", type: "error" });
      setTimeout(() => setShowToast({ show: false, msg: "", type: "success" }), 3000);
    } else {
      setShowToast({ show: true, msg: "Refeição excluída com sucesso!", type: "success" });
      setTimeout(() => setShowToast({ show: false, msg: "", type: "success" }), 3000);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setEditError("");

    const formData = new FormData(e.currentTarget);
    formData.append("id", meal.id);

    try {
      const res = await updateMeal(formData);
      if (res.success) {
        setIsEditing(false);
        setShowToast({ show: true, msg: "Refeição editada com sucesso!", type: "success" });
        setTimeout(() => setShowToast({ show: false, msg: "", type: "success" }), 3000);
      } else {
        setEditError(res.error || "Campos inválidos.");
      }
    } catch (error) {
      setEditError("Ocorreu um erro ao atualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  // Formata a data para o padrão Brasileiro (Ex: 24/05/2026 às 14:30)
  const dateObj = new Date(meal.created_at);
  const formattedDate = `${dateObj.toLocaleDateString("pt-BR")} às ${dateObj.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;

  const dateForInput = new Date(meal.created_at);
  dateForInput.setMinutes(dateForInput.getMinutes() - dateForInput.getTimezoneOffset());
  const defaultValueDateTime = dateForInput.toISOString().slice(0, 16);

  if (isEditing) {
    return (
      <li className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-blue-500/50 shadow-md">
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <h3 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Editar Refeição</h3>
          
          {editError && (
            <p className="text-xs text-red-500">{editError}</p>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-500">O que você comeu?</label>
            <input
              type="text"
              name="description"
              required
              defaultValue={meal.description}
              className="mt-1 block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-2.5 py-1.5 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-zinc-500">Calorias (kcal)</label>
              <input
                type="number"
                name="calories"
                required
                defaultValue={meal.calories}
                className="mt-1 block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-2.5 py-1.5 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500">Tipo</label>
              <select
                name="meal_type"
                required
                defaultValue={mapToOptionValue(meal.meal_type)}
                className="mt-1 block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 py-1.5 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Café da Manhã">Café da Manhã</option>
                <option value="Almoço">Almoço</option>
                <option value="Lanche">Lanche</option>
                <option value="Jantar">Jantar</option>
                <option value="Ceia">Ceia</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-500">Data e Hora</label>
            <input
              type="datetime-local"
              name="created_at"
              required
              defaultValue={defaultValueDateTime}
              className="mt-1 block w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-2.5 py-1.5 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 font-semibold px-3 py-1.5 rounded cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="text-xs bg-black text-white dark:bg-white dark:text-black font-semibold px-4 py-1.5 rounded hover:opacity-80 disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-700 flex justify-between items-center group relative overflow-hidden">
      <div className="pr-16 w-full">
        <p className="text-sm font-medium text-zinc-900 dark:text-white break-words">{meal.description}</p>
        
        {/* Aqui mostramos a data e hora cadastradas */}
        <p className="text-xs text-zinc-500 mt-1">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">{displayMealType(meal.meal_type)}</span> • {formattedDate}
        </p>
      </div>
      
      <div className="flex items-center gap-4 flex-shrink-0">
        <span className="text-sm font-bold text-zinc-900 dark:text-white">{meal.calories} kcal</span>
        
        {/* Botão de excluir que aparece só quando passa o mouse (ou clica no mobile) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-md flex gap-1 z-10">
          <button 
            onClick={() => setIsEditing(true)}
            className="text-xs text-zinc-700 dark:text-zinc-200 font-semibold px-2 hover:text-black dark:hover:text-white cursor-pointer"
          >
            Editar
          </button>
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs text-red-600 font-semibold px-2 hover:text-red-800 cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? "..." : "Excluir"}
          </button>
        </div>
      </div>

      {/* Toast de Feedback */}
      {showToast.show && (
        <div className={`fixed bottom-6 right-6 ${showToast.type === "success" ? "bg-emerald-600" : "bg-red-600"} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50`}>
          <span className="text-sm font-medium">{showToast.msg}</span>
        </div>
      )}
    </li>
  );
}