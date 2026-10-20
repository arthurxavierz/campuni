-- ============================================================
-- Campuni · 0003 · permissões (RLS). NÃO PULE ESTE ARQUIVO.
-- Sem ele, qualquer pessoa com a chave pública lê e altera tudo.
-- ============================================================

alter table perfis      enable row level security;
alter table categorias  enable row level security;
alter table publicacoes enable row level security;
alter table fotos       enable row level security;
alter table curtidas    enable row level security;
alter table contatos    enable row level security;

-- Perfis: nome, WhatsApp e destaque são públicos (aparecem no anúncio).
drop policy if exists perfis_leitura on perfis;
create policy perfis_leitura on perfis for select using (true);
drop policy if exists perfis_proprio on perfis;
-- Papel e destaque são protegidos pelo gatilho proteger_perfil (0002), e
-- não aqui: uma política de perfis que consulta perfis entra em recursão.
create policy perfis_proprio on perfis for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Categorias: leitura pública, escrita só pelo painel do Supabase.
drop policy if exists categorias_leitura on categorias;
create policy categorias_leitura on categorias for select using (true);

-- Publicações: público vê ativas e válidas; o autor vê e mexe nas suas.
drop policy if exists pub_leitura on publicacoes;
create policy pub_leitura on publicacoes for select
  using ((status = 'ativa' and expira_em > now()) or autor_id = auth.uid());
drop policy if exists pub_criar on publicacoes;
create policy pub_criar on publicacoes for insert to authenticated
  with check (autor_id = auth.uid());
drop policy if exists pub_alterar on publicacoes;
create policy pub_alterar on publicacoes for update to authenticated
  using (autor_id = auth.uid() or exists (select 1 from perfis where id = auth.uid() and papel = 'admin'));
drop policy if exists pub_apagar on publicacoes;
create policy pub_apagar on publicacoes for delete to authenticated
  using (autor_id = auth.uid() or exists (select 1 from perfis where id = auth.uid() and papel = 'admin'));

-- Fotos: seguem a publicação.
drop policy if exists fotos_leitura on fotos;
create policy fotos_leitura on fotos for select using (true);
drop policy if exists fotos_criar on fotos;
create policy fotos_criar on fotos for insert to authenticated
  with check (exists (select 1 from publicacoes p where p.id = publicacao_id and p.autor_id = auth.uid()));
drop policy if exists fotos_apagar on fotos;
create policy fotos_apagar on fotos for delete to authenticated
  using (exists (select 1 from publicacoes p where p.id = publicacao_id and p.autor_id = auth.uid()));

-- Curtidas: cada um mexe só nas suas.
drop policy if exists curtidas_proprias on curtidas;
create policy curtidas_proprias on curtidas for all to authenticated
  using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Contatos: nenhuma política para anon/authenticated. Só a service_role
-- (função /api/contato) grava, e o admin lê pelo painel.
drop policy if exists contatos_admin on contatos;
create policy contatos_admin on contatos for select to authenticated
  using (exists (select 1 from perfis where id = auth.uid() and papel = 'admin'));

grant select on vitrine to anon, authenticated;
