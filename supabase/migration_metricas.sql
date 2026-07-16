-- Rode isso no SQL Editor do Supabase se o seu banco já existe (criado antes
-- das colunas de métricas). Se você ainda não rodou o schema.sql nenhuma vez,
-- não precisa rodar este arquivo — já está incluído no schema.sql.

alter table posts add column if not exists alcance integer;
alter table posts add column if not exists curtidas integer;
alter table posts add column if not exists comentarios integer;
alter table posts add column if not exists salvamentos integer;
