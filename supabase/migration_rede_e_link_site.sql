-- Rode isso no SQL Editor do Supabase se o seu banco já existe (criado antes
-- da troca de corretor por rede social nos posts e do link do imóvel no
-- site). Se você ainda não rodou o schema.sql nenhuma vez, não precisa
-- rodar este arquivo, já está incluído no schema.sql.

do $$ begin
  if not exists (select 1 from pg_type where typname = 'post_rede') then
    create type post_rede as enum ('instagram_facebook', 'linkedin', 'youtube', 'blog');
  end if;
end $$;

alter table posts add column if not exists rede post_rede not null default 'instagram_facebook';
alter table posts drop column if exists corretor_id;

alter table imoveis add column if not exists link_site text;
