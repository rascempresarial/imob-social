-- Modelos de copy/legenda e roteiros de vídeo/Reels por rede, usados nas
-- páginas de Planejamento. Rode isto no banco já provisionado (SQL Editor
-- do Supabase).

create table if not exists copy_templates (
  id uuid primary key default gen_random_uuid(),
  rede text not null,
  titulo text not null,
  texto text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table copy_templates enable row level security;
create index if not exists copy_templates_rede_idx on copy_templates (rede);
drop trigger if exists copy_templates_set_updated_at on copy_templates;
create trigger copy_templates_set_updated_at
  before update on copy_templates
  for each row execute function set_updated_at();

create table if not exists roteiros (
  id uuid primary key default gen_random_uuid(),
  rede text not null,
  titulo text not null,
  gancho text,
  desenvolvimento text,
  cta text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table roteiros enable row level security;
create index if not exists roteiros_rede_idx on roteiros (rede);
drop trigger if exists roteiros_set_updated_at on roteiros;
create trigger roteiros_set_updated_at
  before update on roteiros
  for each row execute function set_updated_at();
