-- Sistema de social media para imobiliária
-- RLS: ligado em todas as tabelas, SEM policies. Só o service_role (usado no
-- backend Next.js) consegue acessar. A anon key fica totalmente bloqueada.

create extension if not exists "pgcrypto";

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Login por chave de acesso ────────────────────────────────────────────
create table access_keys (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  key text not null unique,
  active boolean not null default true,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);
alter table access_keys enable row level security;

-- ── Corretores ────────────────────────────────────────────────────────────
create table corretores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table corretores enable row level security;

-- ── Imóveis ───────────────────────────────────────────────────────────────
create type imovel_status as enum ('disponivel', 'reservado', 'vendido', 'alugado', 'indisponivel');

create table imoveis (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  titulo text not null,
  edificio text,
  status imovel_status not null default 'disponivel',
  endereco text,
  valor numeric,
  link_site text,
  corretor_id uuid references corretores(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table imoveis enable row level security;

create trigger imoveis_set_updated_at
  before update on imoveis
  for each row execute function set_updated_at();

-- ── Posts (calendário editorial) ─────────────────────────────────────────
create type post_tipo as enum ('feed', 'reels', 'story');
create type post_status as enum ('em_revisao', 'aprovado', 'reprovado', 'agendado', 'publicado');
create type post_rede as enum ('instagram_facebook', 'linkedin', 'youtube', 'blog');

create table posts (
  id uuid primary key default gen_random_uuid(),
  imovel_id uuid references imoveis(id) on delete set null,
  rede post_rede not null default 'instagram_facebook',
  tipo post_tipo not null default 'feed',
  link_criativo text,
  copy text,
  data_publicacao timestamptz,
  anunciado boolean not null default false,
  status post_status not null default 'em_revisao',
  aprovado_por text,
  aprovado_em timestamptz,
  motivo_reprovacao text,
  alcance integer,
  curtidas integer,
  comentarios integer,
  salvamentos integer,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table posts enable row level security;

create index posts_data_publicacao_idx on posts (data_publicacao);
create index posts_imovel_id_idx on posts (imovel_id);
create index posts_status_idx on posts (status);

create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

-- ── Notas ─────────────────────────────────────────────────────────────────
create table notas (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  conteudo text not null,
  fixado boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table notas enable row level security;

create trigger notas_set_updated_at
  before update on notas
  for each row execute function set_updated_at();

-- ── Log de auditoria (histórico de ações em posts) ───────────────────────
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete set null,
  actor text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
alter table audit_log enable row level security;

create index audit_log_created_at_idx on audit_log (created_at desc);

-- ── Seed opcional: cadastre sua primeira chave de acesso (como admin) ────
-- insert into access_keys (label, key, is_admin) values ('Seu Nome', 'TROQUE-ESTA-CHAVE', true);
