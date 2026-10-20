import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { modoLocal, supabase } from './dados';
import { guardado } from './guardado';
import type { Cadastro, Usuario } from './tipos';

/**
 * Conta da pessoa: cadastro com e-mail e senha, entrada com Google,
 * recuperação de senha e perfil (nome, WhatsApp, cidade).
 *
 * Com Supabase, tudo passa pelo Supabase Auth e o perfil mora na tabela
 * `perfis` (criada por gatilho no primeiro login, ver 0002 e 0005).
 * Sem Supabase, as contas ficam no navegador, com a senha guardada só
 * como hash SHA-256: dá para rodar o projeto inteiro sem banco.
 */

interface Conta {
  usuario: Usuario | null;
  carregando: boolean;
  cadastrar: (d: Cadastro) => Promise<{ precisaConfirmar: boolean }>;
  entrar: (email: string, senha: string) => Promise<void>;
  entrarComGoogle: (voltarPara?: string) => Promise<void>;
  recuperarSenha: (email: string) => Promise<void>;
  trocarSenha: (nova: string) => Promise<void>;
  atualizarPerfil: (d: Partial<Pick<Usuario, 'nome' | 'whatsapp' | 'cidade' | 'uf'>>) => Promise<void>;
  sair: () => Promise<void>;
}

const Contexto = createContext<Conta | null>(null);

/** Mensagens do Supabase Auth em português, no tom do resto do site. */
export function traduzirErro(e: unknown): string {
  const m = (e instanceof Error ? e.message : String(e)).toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-mail ou senha não conferem. Confira e tente de novo.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já tem conta. Entre com ele ou recupere a senha.';
  if (m.includes('email not confirmed')) return 'Falta confirmar o e-mail. Abra o link que enviamos para você.';
  if (m.includes('password should be') || m.includes('weak')) return 'Senha fraca. Use pelo menos 8 caracteres, com letras e números.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.';
  if (m.includes('provider is not enabled')) return 'Entrar com Google ainda não está disponível. Use e-mail e senha.';
  if (m.includes('fetch') || m.includes('network')) return 'Sem conexão com o servidor. Confira a internet e tente de novo.';
  return e instanceof Error && e.message ? e.message : 'Algo deu errado. Tente de novo.';
}

// ---------------------------------------------------------------- modo local

interface ContaLocal extends Usuario {
  hash: string;
}

async function hash(senha: string): Promise<string> {
  const dados = new TextEncoder().encode('campuni:' + senha);
  const h = await crypto.subtle.digest('SHA-256', dados);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const contasLocais = () => guardado.ler<ContaLocal[]>('contas', []);
const semHash = ({ hash: _h, ...u }: ContaLocal): Usuario => u;

// ---------------------------------------------------------------- provedor

export function ProvedorConta({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregarPerfil = useCallback(async () => {
    if (modoLocal) {
      const id = guardado.ler<string | null>('sessao', null);
      const c = contasLocais().find((x) => x.id === id);
      setUsuario(c ? semHash(c) : null);
      setCarregando(false);
      return;
    }
    const db = await supabase();
    const { data } = await db.auth.getUser();
    const u = data.user;
    if (!u) {
      setUsuario(null);
      setCarregando(false);
      return;
    }
    const { data: p } = await db.from('perfis').select('nome, whatsapp, cidade, uf, avatar_url').eq('id', u.id).maybeSingle();
    const meta = u.user_metadata ?? {};
    setUsuario({
      id: u.id,
      email: u.email ?? '',
      nome: p?.nome || meta.full_name || meta.name || (u.email ?? '').split('@')[0],
      whatsapp: p?.whatsapp ?? '',
      cidade: p?.cidade ?? '',
      uf: p?.uf ?? 'MG',
      avatar: p?.avatar_url || meta.avatar_url || meta.picture,
      provedor: u.app_metadata?.provider === 'google' ? 'google' : 'email',
      criadoEm: u.created_at,
    });
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarPerfil();
    if (modoLocal) return;
    let cancelar = () => {};
    supabase().then((db) => {
      const { data } = db.auth.onAuthStateChange((evento) => {
        if (evento === 'SIGNED_IN' || evento === 'SIGNED_OUT' || evento === 'USER_UPDATED') {
          // fora do callback, para não travar o cliente do Supabase
          window.setTimeout(carregarPerfil, 0);
        }
      });
      cancelar = () => data.subscription.unsubscribe();
    });
    return () => cancelar();
  }, [carregarPerfil]);

  const cadastrar = useCallback(
    async (d: Cadastro) => {
      const email = d.email.trim().toLowerCase();
      const whatsapp = d.whatsapp.replace(/\D/g, '');
      if (modoLocal) {
        const contas = contasLocais();
        if (contas.some((c) => c.email === email)) throw new Error('Este e-mail já tem conta. Entre com ele ou recupere a senha.');
        const nova: ContaLocal = {
          id: 'u-' + Date.now().toString(36),
          nome: d.nome.trim(),
          email,
          whatsapp,
          cidade: d.cidade.trim(),
          uf: d.uf,
          provedor: 'email',
          criadoEm: new Date().toISOString(),
          hash: await hash(d.senha),
        };
        guardado.gravar('contas', [...contas, nova]);
        guardado.gravar('sessao', nova.id);
        await carregarPerfil();
        return { precisaConfirmar: false };
      }
      const db = await supabase();
      const { data, error } = await db.auth.signUp({
        email,
        password: d.senha,
        options: {
          data: { full_name: d.nome.trim(), whatsapp, cidade: d.cidade.trim(), uf: d.uf },
          emailRedirectTo: window.location.origin + '/minha-conta',
        },
      });
      if (error) throw new Error(traduzirErro(error));
      // Supabase devolve usuário sem identidades quando o e-mail já existe.
      if (data.user && data.user.identities && data.user.identities.length === 0)
        throw new Error('Este e-mail já tem conta. Entre com ele ou recupere a senha.');
      if (data.session) await carregarPerfil();
      return { precisaConfirmar: !data.session };
    },
    [carregarPerfil],
  );

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const e = email.trim().toLowerCase();
      if (modoLocal) {
        const c = contasLocais().find((x) => x.email === e);
        if (!c || c.hash !== (await hash(senha))) throw new Error('E-mail ou senha não conferem. Confira e tente de novo.');
        guardado.gravar('sessao', c.id);
        await carregarPerfil();
        return;
      }
      const db = await supabase();
      const { error } = await db.auth.signInWithPassword({ email: e, password: senha });
      if (error) throw new Error(traduzirErro(error));
      await carregarPerfil();
    },
    [carregarPerfil],
  );

  const entrarComGoogle = useCallback(async (voltarPara = '/minha-conta') => {
    const db = await supabase();
    guardado.gravar('voltar', voltarPara);
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/entrar?retorno=1', queryParams: { prompt: 'select_account' } },
    });
    if (error) throw new Error(traduzirErro(error));
  }, []);

  const recuperarSenha = useCallback(async (email: string) => {
    if (modoLocal) return;
    const db = await supabase();
    const { error } = await db.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: window.location.origin + '/minha-conta?aba=seguranca',
    });
    if (error) throw new Error(traduzirErro(error));
  }, []);

  const trocarSenha = useCallback(
    async (nova: string) => {
      if (modoLocal) {
        const id = guardado.ler<string | null>('sessao', null);
        const h = await hash(nova);
        guardado.gravar('contas', contasLocais().map((c) => (c.id === id ? { ...c, hash: h } : c)));
        return;
      }
      const db = await supabase();
      const { error } = await db.auth.updateUser({ password: nova });
      if (error) throw new Error(traduzirErro(error));
    },
    [],
  );

  const atualizarPerfil = useCallback(
    async (d: Partial<Pick<Usuario, 'nome' | 'whatsapp' | 'cidade' | 'uf'>>) => {
      const limpo = { ...d, ...(d.whatsapp !== undefined ? { whatsapp: d.whatsapp.replace(/\D/g, '') } : {}) };
      if (modoLocal) {
        const id = guardado.ler<string | null>('sessao', null);
        guardado.gravar('contas', contasLocais().map((c) => (c.id === id ? { ...c, ...limpo } : c)));
        await carregarPerfil();
        return;
      }
      const db = await supabase();
      const { data } = await db.auth.getUser();
      if (!data.user) throw new Error('Sua sessão expirou. Entre de novo.');
      const { error } = await db.from('perfis').update(limpo).eq('id', data.user.id);
      if (error) throw new Error(traduzirErro(error));
      await carregarPerfil();
    },
    [carregarPerfil],
  );

  const sair = useCallback(async () => {
    if (modoLocal) guardado.gravar('sessao', null);
    else await (await supabase()).auth.signOut();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, cadastrar, entrar, entrarComGoogle, recuperarSenha, trocarSenha, atualizarPerfil, sair }),
    [usuario, carregando, cadastrar, entrar, entrarComGoogle, recuperarSenha, trocarSenha, atualizarPerfil, sair],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useConta(): Conta {
  const v = useContext(Contexto);
  if (!v) throw new Error('useConta fora do ProvedorConta');
  return v;
}

/** Força da senha de 0 a 4, para a barrinha do cadastro. */
export function forcaSenha(s: string): number {
  let n = 0;
  if (s.length >= 8) n++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++;
  if (/\d/.test(s)) n++;
  if (/[^A-Za-z0-9]/.test(s) || s.length >= 12) n++;
  return s ? Math.max(1, n) : 0;
}
