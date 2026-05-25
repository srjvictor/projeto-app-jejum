import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans">
      
      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
          Acompanhamento de Jejum e Calorias
        </h1>
        <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Registre suas refeições, defina suas metas e acompanhe seus ciclos de jejum de forma simples, neutra e informativa.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {/* Botão que vai levar para a tela de Login ou Dashboard */}
          <Link
            href="/login"
            className="rounded-md bg-black dark:bg-white px-6 py-3 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Acessar o Sistema
          </Link>
        </div>
      </main>

      {/* Rodapé com o Aviso Ético Obrigatório */}
      <footer className="p-6 text-center text-sm text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
        <p>
          <strong>Aviso ético:</strong> Este sistema é um exercício acadêmico. A aplicação não substitui orientação médica ou nutricional.
        </p>
      </footer>
      
    </div>
  );
}