# App de Monitoramento de Jejum e Calorias (Next.js & Supabase)

Este é um aplicativo moderno e responsivo desenvolvido com **Next.js** (App Router), **Tailwind CSS**, **TypeScript** e **Supabase**, projetado para ajudar os usuários a rastrearem seus períodos de jejum intermitente, consumo diário de água, registro de refeições e controle de metas calóricas.

---

## 🚀 Funcionalidades Principais

* **🔒 Autenticação de Usuários:** Cadastro, login seguro e controle de sessão gerenciados diretamente pelo **Supabase Auth**.
* **📊 Painel Geral (Dashboard):**
  * **Meta Calórica Diária:** Acompanhamento dinâmico de calorias consumidas versus a meta diária estabelecida pelo usuário.
  * **Relatório de Desempenho Semanal:** Gráficos interativos (usando **Recharts**) mostrando a média diária de calorias, jejuns concluídos e tempo médio de jejum.
* **⏱️ Cronômetro de Jejum:** Timer interativo para acompanhar e registrar períodos de jejum com base em protocolos conhecidos (ex: 16:8, 18:6, 20:4) ou personalizado.
* **🍎 Registro de Refeições:**
  * Adicionar refeições com descrição, calorias e categoria (Café da Manhã, Almoço, Lanche, Jantar, Ceia).
  * Histórico detalhado de refeições com suporte para exclusão rápida.
* **💧 Contador de Água:** Registro interativo de copos de água consumidos ao longo do dia para manter-se hidratado.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/) (versão 16 com App Router e Server Actions)
* **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) (moderno, ágil e responsivo)
* **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (com `@supabase/ssr` para autenticação baseada em cookies)
* **Validação de Formulários:** [Zod](https://github.com/colinhacks/zod) e [React Hook Form](https://react-hook-form.com/)
* **Gráficos:** [Recharts](https://recharts.org/) (estatísticas semanais)
* **Ícones:** [Lucide React](https://lucide.dev/)

---

## 📁 Estrutura do Projeto

```text
├── app/
│   ├── actions/          # Server Actions para comunicação com Supabase (refeições, jejum, etc)
│   ├── dashboard/        # Tela principal do Painel de Controle (protegida por autenticação)
│   ├── login/            # Tela de Login e Cadastro (Client Component com Supabase Auth)
│   ├── layout.tsx        # Layout raiz da aplicação
│   └── page.tsx          # Página inicial/redirecionador
├── components/           # Componentes modulares e reutilizáveis (Timer, Gráficos, Formulários)
├── lib/
│   └── supabase/         # Validadores do Zod para autenticação
├── utils/
│   └── supabase/         # Inicializadores de clientes Supabase (Client, Server e Tipos)
├── public/               # Ativos estáticos (imagens, favicon, etc)
├── .env.local            # Variáveis de ambiente locais (não versionadas)
├── database.types.ts     # Tipagem TypeScript autogerada do banco de dados
└── package.json          # Gerenciador de dependências e scripts do projeto
```

---

## ⚙️ Configuração e Instalação

Siga as instruções abaixo para rodar o projeto em sua máquina local:

### 1. Clonar e Instalar Dependências
```bash
# Instale as dependências
npm install
```

### 2. Configurar as Variáveis de Ambiente
Crie um arquivo na raiz do projeto chamado `.env.local` e insira suas credenciais do Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-supabase
```
> ⚠️ **Atenção:** Certifique-se de usar a URL base correta no `NEXT_PUBLIC_SUPABASE_URL` (sem o sufixo `/rest/v1/` no final).

### 3. Configurar o Banco de Dados (Supabase SQL)
No console do seu projeto do Supabase, vá em **SQL Editor** -> **New Query** e execute o script abaixo para criar as tabelas necessárias e as políticas de segurança de linha (RLS):

```sql
-- Habilitar a extensão para gerar IDs únicos UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Metas do Usuário (user_goals)
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    daily_calories INTEGER NOT NULL DEFAULT 2000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de metas próprias" ON public.user_goals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserção de metas próprias" ON public.user_goals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir atualização de metas próprias" ON public.user_goals FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- 2. Tabela de Refeições (meals)
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    calories INTEGER NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('café', 'almoço', 'lanche', 'jantar', 'ceia')),
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de refeições próprias" ON public.meals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserção de refeições próprias" ON public.meals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir atualização de refeições próprias" ON public.meals FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Permitir exclusão de refeições próprias" ON public.meals FOR DELETE TO authenticated USING (auth.uid() = user_id);


-- 3. Tabela de Jejuns (fasts)
CREATE TABLE IF NOT EXISTS public.fasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    protocol TEXT NOT NULL,
    duration_hours NUMERIC NOT NULL,
    plan_type TEXT CHECK (plan_type IN ('16:8', '18:6', '20:4', '24h', 'personalizado')),
    status TEXT CHECK (status IN ('ativo', 'concluido', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.fasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura de jejuns próprios" ON public.fasts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Permitir inserção de jejuns próprios" ON public.fasts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Permitir atualização de jejuns próprios" ON public.fasts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Permitir exclusão de jejuns próprios" ON public.fasts FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

### 4. Rodar o Projeto Localmente
```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```
Abra o navegador em [http://localhost:3000](http://localhost:3000) para testar a aplicação.

---

## 📦 Build de Produção

Para validar a integridade do código e compilar o app para produção, execute:
```bash
# Cria a build otimizada da aplicação
npm run build

# Inicializa o servidor local com o build criado
npm run start
```
