"use client";

import { useRef, useState, useEffect } from "react";
import { addMeal } from "@/app/actions/mealActions";

export default function MealForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [dateTime, setDateTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; calories?: string; general?: string }>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset());
    setDateTime(agora.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsSaving(true);
    setErrors({});
    
    try {
      const response = await addMeal(formData);
      
      if (!response.success) {
        if (response.fieldErrors) {
          setErrors({
            description: response.fieldErrors.description?.[0],
            calories: response.fieldErrors.calories?.[0],
          });
        } else if (response.error) {
          setErrors({ general: response.error });
        }
      } else {
        // Sucesso
        if (formRef.current) {
          formRef.current.description.value = "";
          formRef.current.calories.value = "";
        }
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: "Ocorreu um erro ao salvar o registro." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
        Registrar Refeição
      </h2>
      <form action={handleSubmit} ref={formRef} className="space-y-4">
        
        {errors.general && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-900/50">
            {errors.general}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">O que você comeu?</label>
          <input 
            type="text" 
            name="description" 
            required 
            placeholder="Ex: 2 ovos mexidos e café" 
            className={`mt-1 block w-full rounded-md border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white`} 
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Calorias (kcal)</label>
            <input 
              type="number" 
              name="calories" 
              required 
              placeholder="Ex: 350" 
              className={`mt-1 block w-full rounded-md border ${errors.calories ? 'border-red-500 focus:ring-red-500' : 'border-zinc-300 dark:border-zinc-700'} bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white`} 
            />
            {errors.calories && (
              <p className="text-xs text-red-500 mt-1">{errors.calories}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Tipo</label>
            <select name="meal_type" required className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white">
              <option value="Café da Manhã">Café da Manhã</option>
              <option value="Almoço">Almoço</option>
              <option value="Lanche">Lanche</option>
              <option value="Jantar">Jantar</option>
              <option value="Ceia">Ceia</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Data e Hora</label>
          <input 
            type="datetime-local" 
            name="created_at" 
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            required 
            className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:ring-1 focus:ring-black dark:text-white" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full bg-black text-white dark:bg-white dark:text-black py-2.5 rounded-md font-semibold hover:opacity-85 disabled:opacity-50 transition-opacity cursor-pointer"
        >
          {isSaving ? "Salvando..." : "Salvar Registro"}
        </button>
      </form>

      {/* Toast Flutuante de Sucesso */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-sm font-medium">Refeição registrada com sucesso!</span>
        </div>
      )}
    </div>
  );
}