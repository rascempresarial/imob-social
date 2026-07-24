-- Métricas manuais por rede (seguidores, curtidas, o que for) preenchidas
-- em Configurações > Métricas e exibidas nas páginas de Planejamento.
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

create table if not exists rede_metricas (
  id uuid primary key default gen_random_uuid(),
  rede text not null,
  mes date not null,
  metrica text not null,
  valor numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (rede, mes, metrica)
);
alter table rede_metricas enable row level security;

create index if not exists rede_metricas_rede_idx on rede_metricas (rede);

drop trigger if exists rede_metricas_set_updated_at on rede_metricas;
create trigger rede_metricas_set_updated_at
  before update on rede_metricas
  for each row execute function set_updated_at();
