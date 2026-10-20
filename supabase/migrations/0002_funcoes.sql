-- ============================================================
-- Campuni · 0002 · funções, gatilhos e a view da vitrine
-- ============================================================

-- Perfil criado no primeiro login, com o nome que vier do Google (se vier).
create or replace function novo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfis (id, nome)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function novo_usuario();

-- Contador de curtidas mantido pelo banco, não pelo navegador.
create or replace function contar_curtidas() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update publicacoes set curtidas = curtidas + 1 where id = new.publicacao_id;
  elsif tg_op = 'DELETE' then
    update publicacoes set curtidas = greatest(curtidas - 1, 0) where id = old.publicacao_id;
  end if;
  return null;
end $$;

drop trigger if exists ao_curtir on curtidas;
create trigger ao_curtir after insert or delete on curtidas
  for each row execute function contar_curtidas();

-- O anunciante não altera contadores nem destaque pelo update comum.
create or replace function proteger_publicacao() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from perfis where id = auth.uid() and papel = 'admin') then
    new.curtidas := old.curtidas;
    new.visualizacoes := old.visualizacoes;
    new.autor_id := old.autor_id;
    new.publicada_em := old.publicada_em;
  end if;
  return new;
end $$;

drop trigger if exists antes_de_alterar_publicacao on publicacoes;
create trigger antes_de_alterar_publicacao before update on publicacoes
  for each row execute function proteger_publicacao();

-- Validade entre 1 e 60 dias, aplicada no banco. (now() não pode ir num
-- CHECK de forma confiável, então o limite fica num gatilho.)
create or replace function limitar_validade() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.expira_em > now() + interval '60 days' then new.expira_em := now() + interval '60 days'; end if;
  if tg_op = 'INSERT' and new.expira_em < now() + interval '1 day' then new.expira_em := now() + interval '1 day'; end if;
  return new;
end $$;

drop trigger if exists validade_publicacao on publicacoes;
create trigger validade_publicacao before insert or update of expira_em on publicacoes
  for each row execute function limitar_validade();

-- Papel e destaque do perfil só mudam pelas mãos de um admin.
create or replace function proteger_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from perfis where id = auth.uid() and papel = 'admin') then
    new.papel := old.papel;
    new.destaque := old.destaque;
  end if;
  return new;
end $$;

drop trigger if exists antes_de_alterar_perfil on perfis;
create trigger antes_de_alterar_perfil before update on perfis
  for each row execute function proteger_perfil();

-- Renovar: volta ao topo e ganha nova validade, sem passar de 60 dias.
create or replace function renovar_publicacao(p_id uuid, p_dias int default 30) returns void
language sql security definer set search_path = public as $$
  update publicacoes
     set renovada_em = now(),
         expira_em = now() + make_interval(days => least(greatest(p_dias, 1), 60)),
         status = 'ativa'
   where id = p_id and autor_id = auth.uid();
$$;

-- Visualização contada no servidor; chamável por qualquer visitante.
create or replace function registrar_visualizacao(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update publicacoes set visualizacoes = visualizacoes + 1 where id = p_id and status = 'ativa';
$$;

-- A vitrine: o que a página pública lê. Só ativas e dentro da validade.
-- security_invoker para respeitar as políticas de RLS de quem consulta.
create or replace view vitrine with (security_invoker = true) as
select
  p.id, p.tipo, p.categoria, p.titulo, p.descricao, p.preco, p.unidade, p.quantidade,
  p.cidade, p.uf, p.curtidas, p.visualizacoes,
  coalesce(p.renovada_em, p.publicada_em) as publicada_em,
  p.expira_em,
  pf.nome as autor_nome,
  pf.whatsapp,
  pf.destaque,
  coalesce(
    (select array_agg(f.caminho order by f.ordem) from fotos f where f.publicacao_id = p.id),
    '{}'
  ) as fotos
from publicacoes p
join perfis pf on pf.id = p.autor_id
where p.status = 'ativa' and p.expira_em > now();

grant execute on function registrar_visualizacao(uuid) to anon, authenticated;
grant execute on function renovar_publicacao(uuid, int) to authenticated;
