import { Eye, EyeOff, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { UFS } from '../lib/categorias';
import { forcaSenha, traduzirErro, useConta } from '../lib/conta';
import { googleAtivo, modoLocal } from '../lib/dados';
import { mascaraTelefone } from '../lib/formato';

/**
 * Caixa de entrar / criar conta. Usada na página /entrar e no último
 * passo de Publicar, onde aparece compacta.
 */

type Modo = 'entrar' | 'cadastro' | 'recuperar';

interface Props {
  inicial?: Modo;
  compacta?: boolean;
  voltarPara?: string;
  aoEntrar?: () => void;
  /** Dados já digitados em Publicar, para não pedir de novo. */
  sugestao?: { nome?: string; whatsapp?: string; cidade?: string; uf?: string };
}

export function IconeGoogle() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function FormularioConta({ inicial = 'entrar', compacta, voltarPara = '/minha-conta', aoEntrar, sugestao }: Props) {
  const { cadastrar, entrar, entrarComGoogle, recuperarSenha } = useConta();
  const [modo, setModo] = useState<Modo>(inicial);
  const [f, setF] = useState({
    nome: sugestao?.nome ?? '',
    email: '',
    senha: '',
    whatsapp: sugestao?.whatsapp ?? '',
    cidade: sugestao?.cidade ?? '',
    uf: sugestao?.uf ?? 'MG',
    aceite: false,
  });
  const [ver, setVer] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  const [confirmar, setConfirmar] = useState(false);

  const mudar = (k: keyof typeof f, v: string | boolean) => {
    setF((a) => ({ ...a, [k]: v }));
    setErros((e) => ({ ...e, [k]: '' }));
    setAviso(null);
  };

  const validar = () => {
    const e: Record<string, string> = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'Confira o e-mail.';
    if (modo !== 'recuperar' && f.senha.length < (modo === 'cadastro' ? 8 : 1)) e.senha = modo === 'cadastro' ? 'Use pelo menos 8 caracteres.' : 'Digite a senha.';
    if (modo === 'cadastro') {
      if (f.nome.trim().length < 2) e.nome = 'Informe seu nome ou o da empresa.';
      if (f.whatsapp.replace(/\D/g, '').length < 10) e.whatsapp = 'Use DDD + número, como (34) 99999-9999.';
      if (!f.cidade.trim()) e.cidade = 'Informe sua cidade.';
      if (!f.aceite) e.aceite = 'Para criar a conta, aceite os termos de uso.';
    }
    setErros(e);
    return !Object.keys(e).length;
  };

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validar()) return;
    setOcupado(true);
    setAviso(null);
    try {
      if (modo === 'entrar') {
        await entrar(f.email, f.senha);
        aoEntrar?.();
      } else if (modo === 'cadastro') {
        const r = await cadastrar({ nome: f.nome, email: f.email, senha: f.senha, whatsapp: f.whatsapp, cidade: f.cidade, uf: f.uf });
        if (r.precisaConfirmar) setConfirmar(true);
        else aoEntrar?.();
      } else {
        await recuperarSenha(f.email);
        setAviso({ tipo: 'ok', texto: `Se ${f.email} tiver conta, você vai receber um link para criar uma senha nova.` });
      }
    } catch (e) {
      setAviso({ tipo: 'erro', texto: traduzirErro(e) });
    } finally {
      setOcupado(false);
    }
  };

  const google = async () => {
    setOcupado(true);
    try {
      await entrarComGoogle(voltarPara);
    } catch (e) {
      setAviso({ tipo: 'erro', texto: traduzirErro(e) });
      setOcupado(false);
    }
  };

  if (confirmar) {
    return (
      <div className={'conta-caixa' + (compacta ? ' compacta' : '')} style={{ textAlign: 'center', justifyItems: 'center' }}>
        <MailCheck size={48} style={{ color: 'var(--oliva)' }} />
        <h2>Confirme seu e-mail</h2>
        <p className="sub">Enviamos um link para <b>{f.email}</b>. Abra no celular ou no computador e sua conta fica ativa na hora.</p>
        <button className="link-acao" style={{ justifySelf: 'center' }} onClick={() => { setConfirmar(false); setModo('entrar'); }}>Já confirmei, quero entrar</button>
      </div>
    );
  }

  const titulos: Record<Modo, [string, string]> = {
    entrar: ['Entrar', 'Acesse sua conta para publicar e acompanhar seus anúncios.'],
    cadastro: ['Criar conta', 'Grátis. Seus dados de contato vão direto para os anúncios.'],
    recuperar: ['Recuperar senha', 'Digite o e-mail da conta e enviamos um link para criar uma senha nova.'],
  };
  const forca = forcaSenha(f.senha);

  return (
    <form className={'conta-caixa' + (compacta ? ' compacta' : '')} onSubmit={enviar} noValidate>
      <div style={{ display: 'grid', gap: 10 }}>
        <h2>{titulos[modo][0]}</h2>
        <p className="sub">{titulos[modo][1]}</p>
      </div>

      {googleAtivo && modo !== 'recuperar' && (
        <>
          <button type="button" className="btn btn-google btn-g" onClick={google} disabled={ocupado}>
            <IconeGoogle /> Continuar com Google
          </button>
          <div className="ou">ou com e-mail</div>
        </>
      )}

      {modo === 'cadastro' && (
        <div className="campo">
          <label htmlFor="ct-nome">Nome ou empresa</label>
          <input id="ct-nome" className={'entrada' + (erros.nome ? ' erro' : '')} value={f.nome} onChange={(e) => mudar('nome', e.target.value)} autoComplete="name" />
          {erros.nome && <span className="msg-erro">{erros.nome}</span>}
        </div>
      )}

      <div className="campo">
        <label htmlFor="ct-email">E-mail</label>
        <input id="ct-email" type="email" inputMode="email" className={'entrada' + (erros.email ? ' erro' : '')} value={f.email} onChange={(e) => mudar('email', e.target.value)} autoComplete="email" />
        {erros.email && <span className="msg-erro">{erros.email}</span>}
      </div>

      {modo !== 'recuperar' && (
        <div className="campo">
          <label htmlFor="ct-senha">Senha</label>
          <div className="senha-campo">
            <input id="ct-senha" type={ver ? 'text' : 'password'} className={'entrada' + (erros.senha ? ' erro' : '')} value={f.senha} onChange={(e) => mudar('senha', e.target.value)} autoComplete={modo === 'cadastro' ? 'new-password' : 'current-password'} />
            <button type="button" onClick={() => setVer((v) => !v)} aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}>
              {ver ? <EyeOff className="ico" /> : <Eye className="ico" />}
            </button>
          </div>
          {modo === 'cadastro' && f.senha && (
            <div className={'forca n' + forca} aria-label="Força da senha"><i /><i /><i /><i /></div>
          )}
          {erros.senha && <span className="msg-erro">{erros.senha}</span>}
          {modo === 'entrar' && !modoLocal && (
            <button type="button" className="link-acao" onClick={() => setModo('recuperar')}>Esqueci minha senha</button>
          )}
        </div>
      )}

      {modo === 'cadastro' && (
        <>
          <div className="campo">
            <label htmlFor="ct-whats">WhatsApp</label>
            <input id="ct-whats" className={'entrada num' + (erros.whatsapp ? ' erro' : '')} inputMode="tel" value={f.whatsapp} onChange={(e) => mudar('whatsapp', mascaraTelefone(e.target.value))} placeholder="(34) 99999-9999" autoComplete="tel" />
            {erros.whatsapp && <span className="msg-erro">{erros.whatsapp}</span>}
          </div>
          <div className="preco-linha" style={{ gridTemplateColumns: '1fr 100px' }}>
            <div className="campo">
              <label htmlFor="ct-cidade">Cidade</label>
              <input id="ct-cidade" className={'entrada' + (erros.cidade ? ' erro' : '')} value={f.cidade} onChange={(e) => mudar('cidade', e.target.value)} autoComplete="address-level2" />
            </div>
            <div className="campo">
              <label htmlFor="ct-uf">UF</label>
              <select id="ct-uf" className="entrada" value={f.uf} onChange={(e) => mudar('uf', e.target.value)}>
                {UFS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          {erros.cidade && <span className="msg-erro">{erros.cidade}</span>}
          <label className="marcar">
            <input type="checkbox" checked={f.aceite} onChange={(e) => mudar('aceite', e.target.checked)} />
            <span>Li e aceito os <Link to="/termos" target="_blank">termos de uso</Link> e a <Link to="/privacidade" target="_blank">política de privacidade</Link>.</span>
          </label>
          {erros.aceite && <span className="msg-erro">{erros.aceite}</span>}
        </>
      )}

      {aviso && <div className={'aviso' + (aviso.tipo === 'ok' ? ' ok' : '')} role="status"><span>{aviso.texto}</span></div>}

      <button className="btn btn-primario btn-g" disabled={ocupado}>
        {ocupado ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : modo === 'cadastro' ? 'Criar minha conta' : 'Enviar link'}
      </button>

      <p className="troca-conta">
        {modo === 'entrar' ? (
          <>Ainda não tem conta? <button type="button" onClick={() => setModo('cadastro')}>Criar conta grátis</button></>
        ) : (
          <>Já tem conta? <button type="button" onClick={() => setModo('entrar')}>Entrar</button></>
        )}
      </p>
    </form>
  );
}
