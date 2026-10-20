import type { SupabaseClient } from '@supabase/supabase-js';

import { SEMENTES } from '../demo/sementes';
import { SUPABASE_ANON, SUPABASE_URL } from './config';
import { blobParaDataUrl } from './imagem';
import { guardado } from './guardado';
import type { FotoProcessada, NovaPublicacao, Publicacao, StatusPublicacao } from './tipos';

/**
 * Acesso a dados.
 *
 * Duas fontes atrás da mesma interface:
 *
 *   Local (sem VITE_SUPABASE_URL): contas e publicações guardadas no
 *   navegador. Serve para rodar o projeto sem banco.
 *
 *   Supabase: lê a view `vitrine` (só ativas e dentro da validade, por
 *   RLS) e grava com a sessão de quem publica. A autoria vem do
 *   `auth.uid()` no banco, nunca de um campo enviado pelo navegador.
 *
 * As publicações de abertura (demo/sementes.ts) entram junto da vitrine
 * para ela não começar vazia. Desligue com VITE_EXEMPLOS=nao quando o
 * volume real bastar.
 */

// VITE_SUPABASE_URL=local força o modo local (sem banco), útil para desenvolver offline.
const forcarLocal = import.meta.env.VITE_SUPABASE_URL === 'local';
const URL_SUPABASE = forcarLocal ? undefined : ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || SUPABASE_URL);
const CHAVE_ANON = forcarLocal ? undefined : ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || SUPABASE_ANON);
const COM_EXEMPLOS = import.meta.env.VITE_EXEMPLOS !== 'nao';

export const modoLocal = !URL_SUPABASE || !CHAVE_ANON;
export const googleAtivo = !modoLocal && import.meta.env.VITE_GOOGLE === 'sim';

let cliente: Promise<SupabaseClient> | null = null;
export function supabase(): Promise<SupabaseClient> {
  if (modoLocal) return Promise.reject(new Error('Sem banco configurado.'));
  cliente ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(URL_SUPABASE!, CHAVE_ANON!, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } }),
  );
  return cliente;
}

const exemplos = () => (COM_EXEMPLOS ? SEMENTES : []);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------- leitura

interface Linha {
  id: string;
  tipo: 'oferta' | 'procura';
  categoria: string;
  titulo: string;
  descricao: string | null;
  preco: number | null;
  unidade: string | null;
  quantidade: string | null;
  cidade: string;
  uf: string;
  autor_nome?: string | null;
  autor_id?: string;
  whatsapp?: string | null;
  destaque?: boolean;
  curtidas: number;
  visualizacoes?: number;
  fotos: string[] | { caminho: string; ordem: number }[] | null;
  publicada_em: string;
  renovada_em?: string | null;
  expira_em: string;
  status?: StatusPublicacao;
}

function urlFoto(caminho: string): string {
  return `${URL_SUPABASE}/storage/v1/object/public/fotos/${caminho}`;
}

function daLinha(l: Linha): Publicacao {
  const fotos = (l.fotos ?? [])
    .map((f) => (typeof f === 'string' ? { caminho: f, ordem: 0 } : f))
    .sort((a, b) => a.ordem - b.ordem)
    .map((f) => urlFoto(f.caminho));
  return {
    id: l.id,
    tipo: l.tipo,
    categoria: l.categoria,
    titulo: l.titulo,
    descricao: l.descricao ?? '',
    preco: l.preco,
    unidade: l.unidade ?? 'unidade',
    quantidade: l.quantidade ?? undefined,
    cidade: l.cidade,
    uf: l.uf,
    autor: l.autor_nome ?? 'Anunciante',
    autorId: l.autor_id,
    whatsapp: l.whatsapp ?? undefined,
    destaque: !!l.destaque,
    curtidas: l.curtidas,
    visualizacoes: l.visualizacoes ?? 0,
    fotos,
    publicadaEm: l.renovada_em ?? l.publicada_em,
    expiraEm: l.expira_em,
    status: l.status ?? 'ativa',
  };
}

const ativa = (p: Publicacao) => (p.status ?? 'ativa') === 'ativa' && new Date(p.expiraEm).getTime() > Date.now();

function locais(): Publicacao[] {
  return guardado.ler<Publicacao[]>('minhas', []);
}
function gravarLocais(lista: Publicacao[]) {
  guardado.gravar('minhas', lista);
  // Sem espaço (fotos grandes demais para o navegador): guarda só a capa.
  if (guardado.ler<Publicacao[]>('minhas', []).length !== lista.length) {
    guardado.gravar('minhas', lista.map((p) => ({ ...p, fotos: p.fotos.slice(0, 1) })));
  }
}

let cache: Publicacao[] | null = null;

export async function listarPublicacoes(): Promise<Publicacao[]> {
  if (modoLocal) return [...locais().filter(ativa), ...exemplos()];
  if (cache) return cache;
  const db = await supabase();
  const { data, error } = await db.from('vitrine').select('*').order('publicada_em', { ascending: false }).limit(500);
  if (error) {
    console.error(error);
    return exemplos();
  }
  cache = [...(data as Linha[]).map(daLinha), ...exemplos()];
  return cache;
}

export async function obterPublicacao(id: string): Promise<Publicacao | null> {
  const ex = exemplos().find((p) => p.id === id);
  if (ex) return ex;
  if (modoLocal) return locais().find((p) => p.id === id) ?? null;
  if (!UUID.test(id)) return null;
  const db = await supabase();
  const { data, error } = await db.from('vitrine').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (data) db.rpc('registrar_visualizacao', { p_id: id }).then(() => undefined, () => undefined);
  return data ? daLinha(data as Linha) : null;
}

// ---------------------------------------------------------------- publicações da conta

export async function listarMinhas(usuarioId: string): Promise<Publicacao[]> {
  if (modoLocal) return locais().filter((p) => p.autorId === usuarioId);
  const db = await supabase();
  const { data, error } = await db
    .from('publicacoes')
    .select('*, fotos(caminho, ordem)')
    .eq('autor_id', usuarioId)
    .order('publicada_em', { ascending: false });
  if (error) throw error;
  return (data as Linha[]).map((l) => ({ ...daLinha(l), minha: true }));
}

export async function mudarStatus(id: string, status: StatusPublicacao): Promise<void> {
  cache = null;
  if (modoLocal) return gravarLocais(locais().map((p) => (p.id === id ? { ...p, status } : p)));
  const db = await supabase();
  const { error } = await db.from('publicacoes').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function renovar(id: string, dias = 30): Promise<void> {
  cache = null;
  const expira = new Date(Date.now() + dias * 86_400_000).toISOString();
  if (modoLocal)
    return gravarLocais(locais().map((p) => (p.id === id ? { ...p, status: 'ativa', expiraEm: expira, publicadaEm: new Date().toISOString() } : p)));
  const db = await supabase();
  const { error } = await db.rpc('renovar_publicacao', { p_id: id, p_dias: dias });
  if (error) throw error;
}

export async function excluir(id: string): Promise<void> {
  cache = null;
  if (modoLocal) return gravarLocais(locais().filter((p) => p.id !== id));
  const db = await supabase();
  const { data } = await db.from('fotos').select('caminho').eq('publicacao_id', id);
  const caminhos = ((data ?? []) as { caminho: string }[]).map((f) => f.caminho);
  if (caminhos.length) await db.storage.from('fotos').remove(caminhos);
  const { error } = await db.from('publicacoes').delete().eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------- escrita

export async function publicar(nova: NovaPublicacao, fotos: FotoProcessada[], usuarioId: string): Promise<Publicacao> {
  const agora = new Date();
  const expiraEm = new Date(agora.getTime() + nova.validadeDias * 86_400_000).toISOString();
  cache = null;

  if (modoLocal) {
    const urls = await Promise.all(fotos.map((f) => blobParaDataUrl(f.blob)));
    const pub: Publicacao = {
      id: 'p-' + agora.getTime().toString(36),
      tipo: nova.tipo,
      categoria: nova.categoria,
      titulo: nova.titulo,
      descricao: nova.descricao,
      preco: nova.preco,
      unidade: nova.unidade,
      quantidade: nova.quantidade || undefined,
      cidade: nova.cidade,
      uf: nova.uf,
      autor: nova.autor,
      autorId: usuarioId,
      whatsapp: nova.whatsapp,
      destaque: false,
      curtidas: 0,
      visualizacoes: 0,
      fotos: urls,
      publicadaEm: agora.toISOString(),
      expiraEm,
      status: 'ativa',
      minha: true,
    };
    gravarLocais([pub, ...locais()]);
    return pub;
  }

  const db = await supabase();
  const { data: sessao } = await db.auth.getUser();
  if (!sessao.user) throw new Error('Entre na sua conta para publicar.');

  await db.from('perfis').update({ nome: nova.autor, whatsapp: nova.whatsapp.replace(/\D/g, '') }).eq('id', sessao.user.id);

  const { data, error } = await db
    .from('publicacoes')
    .insert({
      tipo: nova.tipo,
      categoria: nova.categoria,
      titulo: nova.titulo,
      descricao: nova.descricao,
      preco: nova.preco,
      unidade: nova.unidade,
      quantidade: nova.quantidade || null,
      cidade: nova.cidade,
      uf: nova.uf,
      expira_em: expiraEm,
    })
    .select('id')
    .single();
  if (error) throw error;

  const id = (data as { id: string }).id;
  for (let i = 0; i < fotos.length; i++) {
    const f = fotos[i];
    const ext = f.blob.type === 'image/webp' ? 'webp' : 'jpg';
    const caminho = `${sessao.user.id}/${id}/${i}.${ext}`;
    const envio = await db.storage.from('fotos').upload(caminho, f.blob, { contentType: f.blob.type, upsert: true });
    if (envio.error) throw envio.error;
    await db.from('fotos').insert({ publicacao_id: id, caminho, ordem: i, largura: f.largura, altura: f.altura });
  }

  const pub = await obterPublicacao(id);
  if (!pub) throw new Error('Publicado, mas não consegui carregar o anúncio. Veja em Minha conta.');
  return { ...pub, minha: true };
}

/** Curtida: local sempre (resposta imediata); no banco quando há sessão. */
export async function registrarCurtida(id: string, ligado: boolean): Promise<void> {
  if (modoLocal || !UUID.test(id)) return;
  try {
    const db = await supabase();
    const { data } = await db.auth.getUser();
    if (!data.user) return;
    if (ligado) await db.from('curtidas').insert({ publicacao_id: id });
    else await db.from('curtidas').delete().eq('publicacao_id', id).eq('usuario_id', data.user.id);
  } catch {
    /* curtida é conveniência: falha não interrompe ninguém */
  }
}

export interface Contato {
  tipo: 'contato' | 'denuncia' | 'novidades';
  nome?: string;
  email?: string;
  whatsapp?: string;
  assunto?: string;
  mensagem?: string;
  publicacaoId?: string;
  consentimento: boolean;
  /** Campo-armadilha. Pessoa não vê, robô preenche. */
  empresa?: string;
}

/**
 * Contato, denúncia e novidades.
 *
 * Com banco: a função `registrar_contato` (0006) valida e grava. O
 * visitante não tem permissão de escrita direta na tabela `contatos`,
 * nem de leitura: só o administrador lê.
 * Sem banco: tenta a função /api/contato do Netlify; rodando só o Vite,
 * aceita localmente.
 */
export async function enviarContato(dados: Contato): Promise<void> {
  if (dados.empresa) return; // robô preencheu o campo invisível
  if (!modoLocal) {
    const db = await supabase();
    const { error } = await db.rpc('registrar_contato', {
      p_tipo: dados.tipo,
      p_nome: dados.nome ?? null,
      p_email: dados.email ?? null,
      p_whatsapp: dados.whatsapp ?? null,
      p_assunto: dados.assunto ?? null,
      p_mensagem: dados.mensagem ?? null,
      p_publicacao: dados.publicacaoId && UUID.test(dados.publicacaoId) ? dados.publicacaoId : null,
      p_pagina: window.location.pathname,
    });
    if (error) throw new Error(error.message.includes('limite') ? 'Muitos envios seguidos. Aguarde um pouco.' : 'Não foi possível enviar agora. Tente pelo WhatsApp.');
    return;
  }
  try {
    const r = await fetch('/api/contato', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...dados, pagina: window.location.pathname }),
    });
    if (r.status === 404) return;
    const corpo = (await r.json().catch(() => ({}))) as { erro?: string };
    if (!r.ok) throw new Error(corpo.erro ?? 'Não foi possível enviar agora.');
  } catch {
    /* sem servidor: aceito localmente */
  }
}
