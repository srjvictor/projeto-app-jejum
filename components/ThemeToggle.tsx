"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Ao montar no cliente, verifica o tema atual
    const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 transition-all border border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
      aria-label="Alternar tema"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4 text-amber-500" />
      )}
    </button>
  );
}
