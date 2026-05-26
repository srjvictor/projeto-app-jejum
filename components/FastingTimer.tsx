"use client";

import { useState, useEffect } from "react";
import { saveFastRecord } from "@/app/actions/mealActions";

export default function FastingTimer() {
  const [mounted, setMounted] = useState(false);
  const [isFasting, setIsFasting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [protocol, setProtocol] = useState("16:8");
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Carrega o estado persistido do localStorage após a montagem do componente no cliente
  useEffect(() => {
    setMounted(true);
    const storedIsFasting = localStorage.getItem("fasting_is_fasting") === "true";
    const storedStartTime = localStorage.getItem("fasting_start_time");
    const storedProtocol = localStorage.getItem("fasting_protocol");

    if (storedIsFasting && storedStartTime) {
      const start = new Date(storedStartTime);
      setStartTime(start);
      setIsFasting(true);
      const diffInSeconds = Math.floor((new Date().getTime() - start.getTime()) / 1000);
      setElapsedTime(diffInSeconds > 0 ? diffInSeconds : 0);
      if (storedProtocol) {
        setProtocol(storedProtocol);
      }
    }
  }, []);

  // Intervalo do cronômetro
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFasting && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(diffInSeconds > 0 ? diffInSeconds : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFasting, startTime]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsFasting(true);
    setElapsedTime(0);

    localStorage.setItem("fasting_is_fasting", "true");
    localStorage.setItem("fasting_start_time", now.toISOString());
    localStorage.setItem("fasting_protocol", protocol);
  };

  const handleCancel = () => {
    if (window.confirm("Deseja realmente cancelar o jejum atual? O progresso não será salvo.")) {
      setIsFasting(false);
      setStartTime(null);
      setElapsedTime(0);

      localStorage.removeItem("fasting_is_fasting");
      localStorage.removeItem("fasting_start_time");
      localStorage.removeItem("fasting_protocol");
    }
  };

  const handleStop = async () => {
    if (!startTime) return;
    setIsSaving(true);
    
    const endTime = new Date();
    const durationHours = elapsedTime / 3600;

    const formData = new FormData();
    formData.append("start_time", startTime.toISOString());
    formData.append("end_time", endTime.toISOString());
    formData.append("protocol", protocol);
    formData.append("duration_hours", durationHours.toFixed(2));

    await saveFastRecord(formData);
    
    setIsFasting(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsSaving(false);

    localStorage.removeItem("fasting_is_fasting");
    localStorage.removeItem("fasting_start_time");
    localStorage.removeItem("fasting_protocol");
    
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Cálculo de progresso circular
  const getProtocolHours = () => {
    return parseInt(protocol.split(":")[0]) || 16;
  };

  const targetHours = getProtocolHours();
  const targetSeconds = targetHours * 3600;
  const progressPercent = Math.min((elapsedTime / targetSeconds) * 100, 100);
  
  // Parâmetros do SVG Circle
  const radius = 64;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // Fase biológica com base no tempo de jejum
  const getFastingStage = (seconds: number) => {
    const hours = seconds / 3600;
    if (hours < 12) return { name: "Abaixando Glicose", color: "text-blue-500", desc: "Seu corpo está digerindo a última refeição." };
    if (hours < 16) return { name: "Queima de Gordura", color: "text-amber-500", desc: "A queima de gordura e o uso de cetonas começam." };
    if (hours < 24) return { name: "Autofagia Ativa", color: "text-indigo-500", desc: "Reciclagem celular e rejuvenescimento iniciados." };
    return { name: "Cetose Avançada", color: "text-emerald-500", desc: "O corpo está predominantemente gerando cetonas." };
  };

  const stage = getFastingStage(elapsedTime);

  // Evita Hydration Mismatch renderizando uma casca vazia ou padrão antes da montagem
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center min-h-[300px] w-full">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-zinc-200 dark:bg-zinc-800 h-24 w-24"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center relative w-full overflow-hidden">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Acompanhamento de Jejum</h2>
      
      {!isFasting ? (
        <div className="w-full space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800/80 text-left">
            <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Selecione o Protocolo</label>
            <select 
              value={protocol} 
              onChange={(e) => setProtocol(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2.5 text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="12:12">12 horas (Iniciante)</option>
              <option value="14:10">14 horas (Intermediário)</option>
              <option value="16:8">16 horas (Clássico)</option>
              <option value="18:6">18 horas (Avançado)</option>
              <option value="20:4">20 horas (Guerreiro)</option>
              <option value="24:0">24 horas (OMAD)</option>
            </select>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Meta ideal de jejum: <strong className="text-zinc-700 dark:text-zinc-300">{targetHours} horas</strong> seguidas por {24 - targetHours} horas de janela alimentar.
            </p>
          </div>
          
          <button 
            onClick={handleStart}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors cursor-pointer shadow-sm shadow-blue-500/10"
          >
            Iniciar Jejum
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          
          {/* Círculo de Progresso Circular */}
          <div className="relative flex items-center justify-center mb-6">
            <svg className="w-40 h-40 transform -rotate-90">
              <defs>
                <linearGradient id="fastingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              {/* Círculo de Fundo */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Círculo de Progresso */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                stroke="url(#fastingGradient)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Texto Central */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">Jejum</span>
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white tracking-tight">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {progressPercent.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Feedback do Estado Biológico */}
          <div className="mb-6 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 w-full">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Estado Atual</p>
            <p className={`text-sm font-bold mt-0.5 ${stage.color}`}>{stage.name}</p>
            <p className="text-xs text-zinc-500 mt-1">{stage.desc}</p>
          </div>

          <div className="flex gap-3 w-full">
            <button 
              onClick={handleCancel}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              onClick={handleStop}
              disabled={isSaving}
              className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
            >
              {isSaving ? "Salvando..." : "Concluir Jejum"}
            </button>
          </div>
        </div>
      )}

      {/* Toast Flutuante */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up z-50">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-sm font-medium">Jejum registrado com sucesso!</span>
        </div>
      )}
    </div>
  );
}