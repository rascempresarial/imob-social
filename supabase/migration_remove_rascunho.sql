-- Remove o status "rascunho" do fluxo de posts (não é mais usado no sistema).
-- Rode isto no banco já provisionado (SQL Editor do Supabase).

update posts set status = 'em_revisao' where status = 'rascunho';

alter table posts alter column status drop default;
alter type post_status rename to post_status_old;
create type post_status as enum ('em_revisao', 'aprovado', 'reprovado', 'agendado', 'publicado');
alter table posts alter column status type post_status using status::text::post_status;
alter table posts alter column status set default 'em_revisao';
drop type post_status_old;
