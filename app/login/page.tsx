"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Instanciamos o supabase usando o nosso arquivo de configuração
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha o e-mail e a senha.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha o e-mail e a senha.");
      return;
    }
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Dica: Se o usuário criar conta com sucesso, também mandamos pro dashboard
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-6">
          Acesse sua conta
        </h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-black"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm dark:text-white focus:ring-1 focus:ring-black"
            />
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 bg-black text-white dark:bg-white dark:text-black py-2 rounded-md text-sm font-semibold hover:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Aguarde..." : "Entrar"}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-white py-2 rounded-md text-sm font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Aguarde..." : "Criar Conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}