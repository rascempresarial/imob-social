-- Adiciona controle de administrador nas chaves de acesso.
-- Chaves de acesso e Auditoria (em /dashboard/configuracoes) só ficam
-- visíveis/acessíveis para quem tiver is_admin = true.
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

alter table access_keys add column if not exists is_admin boolean not null default false;

-- Marca como admin a chave com label "Seu Nome" (a chave inicial de quem criou
-- o sistema). Se sua chave tiver outro nome, ajuste o WHERE abaixo ou marque
-- manualmente: update access_keys set is_admin = true where label = 'SEU NOME AQUI';
update access_keys set is_admin = true where label = 'Seu Nome';
