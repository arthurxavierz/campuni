-- ============================================================
-- Campuni · 0006 · formulário de contato pelo próprio banco
-- O visitante chama registrar_contato(); a função valida, limita a
-- frequência e grava. Ninguém de fora lê ou altera a tabela contatos.
-- ============================================================

create or replace function registrar_contato(
  p_tipo text, p_nome text, p_email text, p_whatsapp text,
  p_assunto text, p_mensagem text, p_publicacao uuid, p_pagina text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_email text := lower(nullif(trim(p_email), ''));
  v_whats text := nullif(regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'), '');
begin
  if p_tipo not in ('contato', 'denuncia', 'novidades') then raise exception 'tipo inválido'; end if;
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'e-mail inválido'; end if;
  if p_tipo = 'novidades' and v_email is null then raise exception 'informe o e-mail'; end if;
  if p_tipo = 'contato' and v_email is null and v_whats is null then raise exception 'informe um contato'; end if;
  if p_tipo = 'denuncia' and p_publicacao is null then raise exception 'publicação não informada'; end if;
  -- freio simples contra enxurrada: no máximo 30 registros por minuto no total
  if (select count(*) from contatos where criado_em > now() - interval '1 minute') >= 30 then
    raise exception 'limite de envios atingido';
  end if;
  insert into contatos (tipo, nome, email, whatsapp, assunto, mensagem, publicacao_id, pagina_origem, consentimento)
  values (p_tipo, left(nullif(trim(p_nome), ''), 120), left(v_email, 160), left(v_whats, 20),
          left(nullif(trim(p_assunto), ''), 120), left(nullif(trim(p_mensagem), ''), 4000),
          p_publicacao, left(p_pagina, 300), true);
end $$;

revoke all on function registrar_contato(text, text, text, text, text, text, uuid, text) from public;
grant execute on function registrar_contato(text, text, text, text, text, text, uuid, text) to anon, authenticated;
