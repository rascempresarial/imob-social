-- Remove "edifício" de imóveis e adiciona "patrocinado" (Patrocinado/ADS),
-- que passa a alimentar o contador de anúncios rodando por corretor.
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

alter table imoveis add column if not exists patrocinado boolean not null default false;
alter table imoveis drop column if exists edificio;
