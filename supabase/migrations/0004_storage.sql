-- ============================================================
-- Campuni · 0004 · bucket de fotos
-- Público para leitura (as fotos aparecem na vitrine); escrita só na
-- pasta do próprio usuário: <auth.uid()>/<publicação>/<n>.webp
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = true, file_size_limit = 2097152, allowed_mime_types = array['image/webp', 'image/jpeg'];

drop policy if exists fotos_ler on storage.objects;
create policy fotos_ler on storage.objects for select
  using (bucket_id = 'fotos');

drop policy if exists fotos_enviar on storage.objects;
create policy fotos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists fotos_trocar on storage.objects;
create policy fotos_trocar on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists fotos_apagar_proprias on storage.objects;
create policy fotos_apagar_proprias on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Promover o primeiro administrador (troque o e-mail):
-- update perfis set papel = 'admin'
--  where id = (select id from auth.users where email = 'voce@exemplo.com.br');
