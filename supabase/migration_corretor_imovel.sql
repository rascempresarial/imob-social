-- Vincula imóveis a um corretor, para a tela de Corretores mostrar
-- quantos imóveis e anúncios rodando cada um tem.
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

alter table imoveis add column if not exists corretor_id uuid references corretores(id) on delete set null;
