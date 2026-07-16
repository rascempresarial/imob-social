# Social Imobiliária

Sistema interno para o time de social media de uma imobiliária: calendário
editorial, cadastro de posts, controle de imóveis disponíveis, aprovação de
conteúdo, biblioteca de mídia e notas.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind · Supabase (Postgres +
Storage, acesso só via `service_role` no backend — a chave `anon` fica
bloqueada, RLS ligado sem policies) · Deploy alvo: Vercel + GitHub.

## Setup

1. Crie um projeto no [Supabase](https://supabase.com) (ou use um existente).
2. No **SQL Editor** do projeto, rode o conteúdo de `supabase/schema.sql`.
   Isso cria as tabelas, os tipos enum e o bucket privado `midia-imoveis`
   no Storage. Se o `insert into storage.buckets` falhar por permissão,
   crie o bucket manualmente em **Storage → New bucket**, nome
   `midia-imoveis`, marcado como privado (Public = false).
3. Cadastre a **primeira** chave de acesso (login não usa senha, usa uma
   chave única por pessoa). Essa é a única que precisa ser criada via SQL —
   depois de logado, todas as outras chaves da equipe são geradas direto
   pela tela **Chaves de acesso** no dashboard:
   ```sql
   insert into access_keys (label, key) values ('Nome da pessoa', 'SUA-CHAVE-AQUI');
   ```
4. Copie `.env.local.example` para `.env.local` e preencha:
   - `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`: em Supabase →
     Project Settings → API.
   - `SESSION_SECRET`: gere com `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.
5. `npm install`
6. `npm run dev` e acesse `http://localhost:3000` — faça login com a chave
   cadastrada no passo 3.

## Telas

- **Visão geral** — estatísticas por status de post, imóveis disponíveis, e
  painel de Avisos (posts agendados para hoje, posts em revisão há mais de
  2 dias, posts vinculados a imóvel que deixou de estar disponível).
- **Calendário editorial** — grade mensal com os posts coloridos por status.
- **Posts** — cadastro com imóvel, edifício/ID (via imóvel), corretor, tipo
  (feed/reels/story), link do criativo, copy/legenda, se foi anunciado, e
  fluxo de aprovação (rascunho → em revisão → aprovado/reprovado → agendado
  → publicado).
- **Imóveis** — cadastro central (código, título, edifício, status de
  disponibilidade, endereço, valor). O status daqui é a fonte da verdade
  usada nos avisos e nos posts.
- **Mídia** — upload de fotos/vídeos por imóvel, com galeria.
- **Corretores** — cadastro simples usado no select de Posts.
- **Notas** — quadro de notas com opção de fixar.
- **Chaves de acesso** — gerar, copiar, desativar e excluir as chaves de login da equipe direto pelo app (formato simples tipo `AB3K-9MPZ`, sem caracteres ambíguos).

## Deploy

Este projeto ainda não tem repositório remoto nem projeto na Vercel — isso é
feito à parte, com confirmação explícita, quando o time estiver pronto para
publicar (`gh repo create` + `vercel` ou import direto pela UI da Vercel,
configurando as mesmas 3 variáveis de ambiente do `.env.local`).
