-- Adiciona "Venda ou Locação" ao cadastro de imóveis.
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

do $$ begin
  create type imovel_finalidade as enum ('venda', 'locacao');
exception
  when duplicate_object then null;
end $$;

alter table imoveis add column if not exists finalidade imovel_finalidade not null default 'venda';
