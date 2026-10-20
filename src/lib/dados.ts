import type { SupabaseClient } from '@supabase/supabase-js';

import { SEMENTES } from '../demo/sementes';
import { blobParaDataUrl } from './imagem';
import { guardado } from './guardado';
import type { FotoProcessada, NovaPublicacao, Publicacao } from './tipos';

/**
 * Acesso a dados.
 *
 * Duas fontes atrás da mesma interface:
 *
 *   Demonstração (sem VITE_SUPABASE_URL): publicações de exemplo e, por
 *   cima, o que o visitante publicar, guardado no navegador dele.
 *   Ninguém vê o anúncio de teste de ninguém.
 *
 *   Supabase: lê a view `vitrine` (só ativas e dentro da validade, por
 *   RLS) e grava com a sessão de quem publica. A autoria vem do
 *   `auth.uid()` no banco, nunca de um campo enviado pelo navegador.
 *
 * O cliente do Supabase é importado sob demanda: na demonstração o
 * visitante não baixa os ~50 KB dele.
 */

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const CHAVE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const modoDemo = !URL_SUPABASE || !CHAVE_ANON;

let cliente: Promise<SupabaseClient> | null = null;
export function supabase(): Promise<SupabaseClient> {
  if (modoDemo) return Promise.reject(new Error('Sem banco configurado.'));
  cliente ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(URL_SUPABASE!, CHAVE_ANON!, { auth: { persistSession: true, detectSessionInUrl: true } }),
  );
  return cliente;
}

// ---------------------------------------------------------------- leitura

interface LinhaVitrine {
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
  autor_nome: string | null;
  whatsapp: string | null;
  destaque: boolean;
  curtidas: number;
  fotos: string[] | null;
  publicada_em: string;
  expira_em: string;
}

function urlFoto(caminho: string): string {
  return `${URL_SUPABASE}/storage/v1/object/public/fotos/${caminho}`;
}

function daLinha(l: LinhaVitrine): Publicacao {
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
    whatsapp: l.whatsapp ?? undefined,
    destaque: l.destaque,
    curtidas: l.curtidas,
    fotos: (l.fotos ?? []).map(urlFoto),
    publicadaEm: l.publicada_em,
    expiraEm: l.expira_em,
  };
}

function minhasDemo(): Publicacao[] {
  return guardado.ler<Publicacao[]>('minhas', []).filter((p) => new Date(p.expiraEm).getTime() > Date.now());
}

let cache: Publicacao[] | null = null;

export async function listarPublicacoes(): Promise<Publicacao[]> {
  if (modoDemo) return [...minhasDemo(), ...SEMENTES];
  if (cache) return cache;
  const db = await supabase();
  const { data, error } = await db.from('vitrine').select('*').order('publicada_em', { ascending: false }).limit(500);
  if (error) throw error;
  cache = (data as LinhaVitrine[]).map(daLinha);
  return cache;
}

export async function obterPublicacao(id: string): Promise<Publicacao | null> {
  if (modoDemo) return [...minhasDemo(), ...SEMENTES].find((p) => p.id === id) ?? null;
  const db = await supabase();
  const { data, error } = await db.from('vitrine').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (data) db.rpc('registrar_visualizacao', { p_id: id }).then(() => undefined, () => undefined);
  return data ? daLinha(data as LinhaVitrine) : null;
}

// ---------------------------------------------------------------- sessão

export async function sessaoAtiva(): Promise<boolean> {
  if (modoDemo) return true;
  const db = await supabase();
  const { data } = await db.auth.getSession();
  return !!data.session;
}

export async function enviarCodigo(email: string): Promise<void> {
  const db = await supabase();
  const { error } = await db.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  if (error) throw error;
}

export async function confirmarCodigo(email: string, codigo: string): Promise<void> {
  const db = await supabase();
  const { error } = await db.auth.verifyOtp({ email, token: codigo, type: 'email' });
  if (error) throw error;
}

export async function entrarComGoogle(voltarPara: string): Promise<void> {
  const db = await supabase();
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + voltarPara },
  });
  if (error) throw error;
}

// ---------------------------------------------------------------- escrita

export async function publicar(nova: NovaPublicacao, fotos: FotoProcessada[]): Promise<Publicacao> {
  const agora = new Date();
  const expiraEm = new Date(agora.getTime() + nova.validadeDias * 86_400_000).toISOString();

  if (modoDemo) {
    const urls = await Promise.all(fotos.map((f) => blobParaDataUrl(f.blob)));
    const pub: Publicacao = {
      id: 'minha-' + agora.getTime().toString(36),
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
      whatsapp: nova.whatsapp,
      destaque: false,
      curtidas: 0,
      fotos: urls,
      publicadaEm: agora.toISOString(),
      expiraEm,
      minha: true,
    };
    const lista = [pub, ...minhasDemo()];
    guardado.gravar('minhas', lista);
    // Se o navegador recusou por falta de espaço (fotos grandes), guarda sem as fotos.
    if (guardado.ler<Publicacao[]>('minhas', []).length !== lista.length) {
      guardado.gravar('minhas', lista.map((p) => ({ ...p, fotos: p.fotos.slice(0, 1) })));
    }
    return pub;
  }

  const db = await supabase();
  const { data: sessao } = await db.auth.getUser();
  if (!sessao.user) throw new Error('Entre para publicar.');

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

  cache = null;
  const pub = await obterPublicacao(id);
  if (!pub) throw new Error('Publicado, mas não consegui carregar o anúncio.');
  return { ...pub, minha: true };
}

/** Curtida: local sempre (resposta imediata); no banco quando há sessão. */
export async function registrarCurtida(id: string, ligado: boolean): Promise<void> {
  if (modoDemo) return;
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
 * Formulários públicos vão para a função /api/contato, que grava com a
 * service_role. O visitante não tem permissão de escrita nessas tabelas.
 * Na demonstração (ou rodando só o Vite, sem a função), simula o envio.
 */
export async function enviarContato(dados: Contato): Promise<{ simulado: boolean }> {
  try {
    const r = await fetch('/api/contato', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...dados, pagina: window.location.pathname }),
    });
    if (r.status === 404 && modoDemo) return { simulado: true };
    const corpo = (await r.json().catch(() => ({}))) as { erro?: string; simulado?: boolean };
    if (!r.ok) throw new Error(corpo.erro ?? 'Não foi possível enviar agora.');
    return { simulado: !!corpo.simulado };
  } catch (e) {
    if (modoDemo) return { simulado: true };
    throw e;
  }
}
