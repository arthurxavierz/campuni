-- ============================================================
-- Campuni · 0001 · estrutura
-- Rode no SQL Editor do Supabase, um arquivo por vez, na ordem.
-- ============================================================

create extension if not exists pgcrypto;

-- Perfil público de quem publica. Criado sozinho no primeiro login (0002).
create table if not exists perfis (
  id          uuid primary key references auth.users(id) on delete cascade,
  nome        text,
  whatsapp    text,
  cidade      text,
  uf          char(2),
  destaque    boolean not null default false,  -- "Perfil em destaque": só o admin liga
  papel       text not null default 'anunciante' check (papel in ('anunciante', 'admin')),
  criado_em   timestamptz not null default now()
);

-- As 16 categorias do Campuni. Slug na URL, nome na tela.
create table if not exists categorias (
  slug   text primary key,
  nome   text not null,
  ordem  int  not null default 0
);

insert into categorias (slug, nome, ordem) values
  ('insumos', 'Insumos', 1),
  ('fertilizantes-e-corretivos', 'Fertilizantes e corretivos', 2),
  ('sementes', 'Sementes', 3),
  ('defensivos', 'Defensivos', 4),
  ('maquinas-e-implementos', 'Máquinas e implementos', 5),
  ('pecas-e-manutencao', 'Peças e manutenção', 6),
  ('servicos-agricolas', 'Serviços agrícolas', 7),
  ('drones', 'Drones', 8),
  ('irrigacao', 'Irrigação', 9),
  ('agricultura-de-precisao', 'Agricultura de precisão', 10),
  ('analises', 'Análises', 11),
  ('profissionais-e-consultoria', 'Profissionais e consultoria', 12),
  ('pecuaria', 'Pecuária', 13),
  ('tecnologia', 'Tecnologia', 14),
  ('producao-rural', 'Produção rural', 15),
  ('outros', 'Outros', 16)
on conflict (slug) do update set nome = excluded.nome, ordem = excluded.ordem;

create table if not exists publicacoes (
  id             uuid primary key default gen_random_uuid(),
  -- A autoria vem da sessão (auth.uid()), nunca do navegador.
  autor_id       uuid not null default auth.uid() references perfis(id) on delete cascade,
  tipo           text not null check (tipo in ('oferta', 'procura')),
  categoria      text not null references categorias(slug),
  titulo         text not null check (char_length(titulo) between 6 and 80),
  descricao      text check (char_length(descricao) <= 4000),
  preco          numeric(14, 2) check (preco is null or preco >= 0),  -- null = a combinar
  unidade        text not null default 'unidade',
  quantidade     text,
  cidade         text not null,
  uf             char(2) not null,
  status         text not null default 'ativa' check (status in ('ativa', 'pausada', 'removida')),
  publicada_em   timestamptz not null default now(),
  renovada_em    timestamptz,
  expira_em      timestamptz not null default now() + interval '30 days',
  curtidas       int not null default 0,
  visualizacoes  int not null default 0
);

create index if not exists publicacoes_vitrine on publicacoes (status, expira_em desc, publicada_em desc);
create index if not exists publicacoes_categoria on publicacoes (categoria);
create index if not exists publicacoes_uf on publicacoes (uf);
create index if not exists publicacoes_autor on publicacoes (autor_id);

-- Fotos já chegam processadas pelo navegador (1080×1350, WebP).
create table if not exists fotos (
  id              uuid primary key default gen_random_uuid(),
  publicacao_id   uuid not null references publicacoes(id) on delete cascade,
  caminho         text not null,        -- caminho no bucket "fotos": <autor>/<publicação>/<n>.webp
  ordem           int not null default 0,
  largura         int,
  altura          int,
  criado_em       timestamptz not null default now()
);
create index if not exists fotos_publicacao on fotos (publicacao_id, ordem);

create table if not exists curtidas (
  publicacao_id  uuid not null references publicacoes(id) on delete cascade,
  usuario_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  criado_em      timestamptz not null default now(),
  primary key (publicacao_id, usuario_id)
);

-- Contato, denúncia e novidades. Só a função /api/contato (service_role) grava.
create table if not exists contatos (
  id              uuid primary key default gen_random_uuid(),
  tipo            text not null check (tipo in ('contato', 'denuncia', 'novidades')),
  nome            text,
  email           text,
  whatsapp        text,
  assunto         text,
  mensagem        text,
  publicacao_id   uuid references publicacoes(id) on delete set null,
  pagina_origem   text,
  consentimento   boolean not null default false,
  resolvido       boolean not null default false,
  criado_em       timestamptz not null default now()
);
create index if not exists contatos_abertos on contatos (resolvido, criado_em desc);
