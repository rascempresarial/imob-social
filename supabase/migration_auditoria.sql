-- Rode isso no SQL Editor do Supabase se o seu banco já existe (criado antes
-- do log de auditoria). Se você ainda não rodou o schema.sql nenhuma vez,
-- não precisa rodar este arquivo, já está incluído no schema.sql.

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete set null,
  actor text not null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
alter table audit_log enable row level security;

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);
