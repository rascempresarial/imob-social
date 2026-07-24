-- Cria a tabela de planejamento por rede (Instagram, LinkedIn, Meta ADS).
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

create table if not exists planejamentos (
  rede text primary key,
  conteudo text not null default '',
  updated_at timestamptz not null default now()
);
alter table planejamentos enable row level security;

drop trigger if exists planejamentos_set_updated_at on planejamentos;
create trigger planejamentos_set_updated_at
  before update on planejamentos
  for each row execute function set_updated_at();
