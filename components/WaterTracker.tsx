"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Droplets } from "lucide-react";

export default function WaterTracker() {
  const [mounted, setMounted] = useState(false);
  const [intake, setIntake] = useState(0);
  const goal = 2000; // Meta diária recomendada em ml (2 litros)

  // Obtém a data de hoje no formato YYYY-MM-DD local
  const getTodayKey = () => {
    const today = new Date();
    return `water_intake_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  useEffect(() => {
    setMounted(true);
    const key = getTodayKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      setIntake(parseInt(stored) || 0);
    }
  }, []);

  const handleAddWater = (amount: number) => {
    const key = getTodayKey();
    const newIntake = Math.min(intake + amount, 10000); // Limita em 10 litros por segurança
    setIntake(newIntake);
    localStorage.setItem(key, String(newIntake));
  };

  const handleReset = () => {
    if (window.confirm("Deseja realmente zerar o consumo de água de hoje?")) {
      const key = getTodayKey();
      setIntake(0);
      localStorage.setItem(key, "0");
    }
  };

  const percentage = Math.min(Math.round((intake / goal) * 100), 100);

  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 animate-pulse h-[280px] w-full">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between h-full w-full">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Consumo de Água
            </h2>
            <p className="text-xs text-zinc-500">Mantenha-se hidratado durante o dia</p>
          </div>
          
          {intake > 0 && (
            <button 
              onClick={handleReset}
              title="Zerar progresso"
              className="text-zinc-400 hover:text-red-500 dark:text-zinc-600 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Interface Visual do Copo de Água */}
        <div className="flex items-center gap-6 my-6">
          {/* O Copo / Garrafa */}
          <div className="relative w-16 h-28 border-[3px] border-zinc-300 dark:border-zinc-700 rounded-b-2xl rounded-t-sm overflow-hidden flex items-end bg-zinc-50 dark:bg-zinc-950 shadow-inner flex-shrink-0">
            {/* Água */}
            <div 
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700 ease-out relative"
              style={{ height: `${percentage}%` }}
            >
              {/* Efeito de onda sutil se houver água */}
              {intake > 0 && (
                <div className="absolute -top-1 left-0 w-full h-2 bg-blue-400/40 animate-pulse rounded-t-full"></div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">
              {intake} <span className="text-sm font-normal text-zinc-500">/ {goal} ml</span>
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${percentage >= 100 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'}`}>
                {percentage}% da Meta
              </span>
              {percentage >= 100 && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Meta batida! 🎉</span>
              )}
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
              Recomendado: 8 copos de 250ml por dia.
            </p>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          onClick={() => handleAddWater(250)}
          className="flex items-center justify-center gap-1.5 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-500" />
          +250 ml
        </button>
        <button
          onClick={() => handleAddWater(500)}
          className="flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-500" />
          +500 ml
        </button>
      </div>
    </div>
  );
}
