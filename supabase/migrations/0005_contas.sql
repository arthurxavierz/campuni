-- ============================================================
-- Campuni · 0005 · contas
-- Foto do perfil (vem do Google) e cadastro já trazendo WhatsApp,
-- cidade e UF do formulário de criar conta.
-- ============================================================

alter table perfis add column if not exists avatar_url text;

create or replace function novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into perfis (id, nome, whatsapp, cidade, uf, avatar_url)
  values (
    new.id,
    coalesce(nullif(m->>'full_name', ''), nullif(m->>'name', ''), split_part(new.email, '@', 1)),
    nullif(regexp_replace(coalesce(m->>'whatsapp', ''), '\D', '', 'g'), ''),
    nullif(m->>'cidade', ''),
    nullif(upper(m->>'uf'), ''),
    coalesce(nullif(m->>'avatar_url', ''), nullif(m->>'picture', ''))
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- A vitrine passa a levar a foto do perfil, para o card do vendedor.
-- drop + create porque a coluna nova entra no meio da lista.
drop view if exists vitrine;
create view vitrine with (security_invoker = true) as
select
  p.id, p.tipo, p.categoria, p.titulo, p.descricao, p.preco, p.unidade, p.quantidade,
  p.cidade, p.uf, p.curtidas, p.visualizacoes,
  coalesce(p.renovada_em, p.publicada_em) as publicada_em,
  p.expira_em,
  pf.nome as autor_nome,
  pf.whatsapp,
  pf.destaque,
  pf.avatar_url as autor_avatar,
  coalesce(
    (select array_agg(f.caminho order by f.ordem) from fotos f where f.publicacao_id = p.id),
    '{}'
  ) as fotos
from publicacoes p
join perfis pf on pf.id = p.autor_id
where p.status = 'ativa' and p.expira_em > now();

grant select on vitrine to anon, authenticated;
