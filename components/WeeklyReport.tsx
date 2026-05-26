"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell
} from "recharts";

import { Database } from "@/utils/supabase/database.types";

type MealRow = Database["public"]["Tables"]["meals"]["Row"];
type FastRow = Database["public"]["Tables"]["fasts"]["Row"];

export default function WeeklyReport({ 
  meals, 
  fasts, 
  goal 
}: { 
  meals: MealRow[]; 
  fasts: FastRow[]; 
  goal: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Gera os últimos 7 dias no formato YYYY-MM-DD
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  // Função para formatar a data para o eixo X (ex: "seg", "ter")
  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr + "T12:00:00"); // Força meio-dia para evitar bug de fuso horário
    return d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  };

  // 2. Processa os dados de Calorias dos últimos 7 dias
  const caloriesData = last7Days.map(date => {
    const dayMeals = meals?.filter(m => m.created_at && m.created_at.startsWith(date)) || [];
    const sum = dayMeals.reduce((acc, m) => acc + m.calories, 0);
    return { date, sum };
  });

  // 3. Processa os dados de Jejum dos últimos 7 dias
  const fastsData = last7Days.map(date => {
    const dayFasts = fasts?.filter(f => f.created_at && f.created_at.startsWith(date)) || [];
    const sum = dayFasts.reduce((acc, f) => acc + Number(f.duration_hours), 0);
    return { date, sum };
  });

  // 4. Calcula os Indicadores Agregados (KPIs)
  const totalCaloriesWeek = caloriesData.reduce((acc, curr) => acc + curr.sum, 0);
  const avgCalories = Math.round(totalCaloriesWeek / 7);

  const recentFasts = fasts?.filter(f => {
    const fDate = f.created_at?.split("T")[0];
    return last7Days.includes(fDate);
  }) || [];
  
  const totalFastsCount = recentFasts.length;
  const totalFastingHours = recentFasts.reduce((acc, f) => acc + Number(f.duration_hours), 0);
  const avgFastingTime = totalFastsCount > 0 ? (totalFastingHours / totalFastsCount).toFixed(1) : 0;

  // Formata os dados para o Recharts
  const chartDataCalories = caloriesData.map(d => ({
    name: formatDay(d.date),
    calories: d.sum,
    isOver: goal > 0 && d.sum > goal
  }));

  const chartDataFasts = fastsData.map(d => ({
    name: formatDay(d.date),
    hours: Number(d.sum.toFixed(1))
  }));

  // Tooltip customizado para Recharts
  const CustomTooltip = ({ active, payload, unit }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-2 text-xs font-semibold rounded-lg shadow-md border border-zinc-800 dark:border-zinc-200">
          <p className="mt-0.5">
            {payload[0].value} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 mb-8 w-full overflow-hidden">
      <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Desempenho Semanal</h2>

      {/* INDICADORES AGREGADOS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Média Diária (Calorias)</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {avgCalories} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">kcal</span>
          </p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Jejuns Concluídos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {totalFastsCount} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">nesta semana</span>
          </p>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
          <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Tempo Médio de Jejum</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {avgFastingTime} <span className="text-xs font-normal text-zinc-400 dark:text-zinc-500">horas</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* GRÁFICO 1: CALORIAS */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Calorias Consumidas vs Meta</h3>
          
          <div className="h-56 w-full flex items-center justify-center">
            {!mounted ? (
              <div className="w-full h-full bg-zinc-50 dark:bg-zinc-800/20 animate-pulse rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataCalories} margin={{ top: 15, right: 5, left: -25, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: "#a1a1aa", fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip unit="kcal" />} cursor={{ fill: "rgba(228, 228, 231, 0.15)" }} />
                  
                  {goal > 0 && (
                    <ReferenceLine 
                      y={goal} 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      label={{ value: `Meta: ${goal}`, fill: "#ef4444", fontSize: 9, position: "top", fontWeight: 700 }} 
                    />
                  )}
                  
                  <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                    {chartDataCalories.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isOver ? "#f87171" : "var(--color-bar, #18181b)"} 
                        className="fill-zinc-900 dark:fill-white" 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* GRÁFICO 2: HORAS DE JEJUM */}
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Horas de Jejum por Dia</h3>
          
          <div className="h-56 w-full flex items-center justify-center">
            {!mounted ? (
              <div className="w-full h-full bg-zinc-50 dark:bg-zinc-800/20 animate-pulse rounded-lg"></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartDataFasts} margin={{ top: 15, right: 5, left: -25, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#a1a1aa", fontSize: 10, fontWeight: 500 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: "#a1a1aa", fontSize: 10 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip unit="h" />} cursor={{ fill: "rgba(228, 228, 231, 0.15)" }} />
                  
                  <ReferenceLine 
                    y={16} 
                    stroke="#3b82f6" 
                    strokeDasharray="3 3" 
                    label={{ value: "16h", fill: "#3b82f6", fontSize: 9, position: "top", fontWeight: 600 }} 
                  />
                  
                  <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}