import { CalendarClock, Eye, Heart, KeyRound, LayoutList, LogOut, Pause, Pencil, Play, Plus, RefreshCw, Trash2, UserRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { capaGerada } from '../componentes/Cartao';
import { Midia } from '../componentes/Midia';
import { UFS, nomeCategoria } from '../lib/categorias';
import { forcaSenha, traduzirErro, useConta } from '../lib/conta';
import { excluir, listarMinhas, mudarStatus, renovar } from '../lib/dados';
import { useEstado } from '../lib/estado';
import { diasRestantes, iniciais, mascaraTelefone, moeda, rotuloValidade } from '../lib/formato';
import type { Publicacao } from '../lib/tipos';

type Aba = 'anuncios' | 'perfil' | 'seguranca';

export function MinhaConta() {
  const { usuario, carregando, sair } = useConta();
  const [params, setParams] = useSearchParams();
  const aba = (params.get('aba') as Aba) || 'anuncios';
  const navegar = useNavigate();

  useEffect(() => {
    document.title = 'Minha conta · Campuni';
  }, []);

  if (carregando) return <div className="container" style={{ paddingBlock: 60 }}><div className="esqueleto" style={{ height: 320 }} /></div>;
  if (!usuario) return <Navigate to="/entrar?voltar=/minha-conta" replace />;

  const ir = (a: Aba) => setParams(a === 'anuncios' ? {} : { aba: a }, { replace: true });

  return (
    <div className="container">
      <div className="painel-conta">
        <aside className="lateral-conta">
          <div className="cartao-perfil">
            <span className="avatar">{usuario.avatar ? <img src={usuario.avatar} alt="" referrerPolicy="no-referrer" /> : iniciais(usuario.nome)}</span>
            <b>{usuario.nome}</b>
            <small>{usuario.email}</small>
            {usuario.cidade && <small>{usuario.cidade}/{usuario.uf}</small>}
          </div>
          <nav className="menu-conta" aria-label="Minha conta">
            <button aria-current={aba === 'anuncios'} onClick={() => ir('anuncios')}><LayoutList className="ico" /> Meus anúncios</button>
            <button aria-current={aba === 'perfil'} onClick={() => ir('perfil')}><UserRound className="ico" /> Perfil e contato</button>
            <button aria-current={aba === 'seguranca'} onClick={() => ir('seguranca')}><KeyRound className="ico" /> Senha</button>
            <button onClick={async () => { await sair(); navegar('/'); }}><LogOut className="ico" /> Sair</button>
          </nav>
          <Link to="/publicar" className="btn btn-primario btn-g"><Plus className="ico" /> Nova publicação</Link>
        </aside>
        <section style={{ minWidth: 0 }}>
          {aba === 'anuncios' && <MeusAnuncios usuarioId={usuario.id} />}
          {aba === 'perfil' && <Perfil />}
          {aba === 'seguranca' && <Seguranca />}
        </section>
      </div>
    </div>
  );
}

function MeusAnuncios({ usuarioId }: { usuarioId: string }) {
  const [lista, setLista] = useState<Publicacao[] | null>(null);
  const [erro, setErro] = useState('');
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const { recado } = useEstado();

  const carregar = useCallback(() => {
    listarMinhas(usuarioId).then(setLista, (e) => setErro(traduzirErro(e)));
  }, [usuarioId]);
  useEffect(carregar, [carregar]);

  const agir = async (id: string, fn: () => Promise<void>, texto: string) => {
    setOcupado(id);
    try {
      await fn();
      recado(texto);
      setConfirmando(null);
      carregar();
    } catch (e) {
      recado(traduzirErro(e));
    } finally {
      setOcupado(null);
    }
  };

  const ativas = lista?.filter((p) => p.status === 'ativa' && diasRestantes(p.expiraEm) > 0) ?? [];
  const vistas = lista?.reduce((s, p) => s + (p.visualizacoes ?? 0), 0) ?? 0;
  const curtidas = lista?.reduce((s, p) => s + p.curtidas, 0) ?? 0;

  return (
    <>
      <div className="cabeca-secao" style={{ marginBottom: 18 }}>
        <div>
          <span className="rotulo">Minha conta</span>
          <h1 className="titulo-2" style={{ marginTop: 6 }}>Meus anúncios</h1>
        </div>
      </div>
      <div className="resumo-conta">
        <div><b className="num">{lista?.length ?? '–'}</b><span>publicações</span></div>
        <div><b className="num">{lista ? ativas.length : '–'}</b><span>no ar agora</span></div>
        <div><b className="num">{lista ? vistas : '–'}</b><span>visualizações</span></div>
        <div><b className="num">{lista ? curtidas : '–'}</b><span>curtidas</span></div>
      </div>
      {erro && <div className="aviso"><span>{erro}</span></div>}
      {!lista && !erro && <div className="meus">{[0, 1, 2].map((i) => <div key={i} className="esqueleto" style={{ height: 116 }} />)}</div>}
      {lista?.length === 0 && (
        <div className="vazio-grade">
          <b>Você ainda não publicou nada</b>
          Leva 2 minutos: tipo, título, preço e fotos. Quem procura na sua região já está aqui.
          <div><Link className="btn btn-primario" to="/publicar"><Plus className="ico" /> Publicar minha primeira oportunidade</Link></div>
        </div>
      )}
      <div className="meus">
        {lista?.map((p, i) => {
          const dias = diasRestantes(p.expiraEm);
          const expirada = dias === 0;
          const pausada = p.status === 'pausada';
          return (
            <article key={p.id} className={'meu' + (pausada ? ' pausada' : '')} style={{ animationDelay: i * 50 + 'ms' }}>
              <Link to={`/publicacoes/${p.id}`} aria-label={`Ver ${p.titulo}`}>
                <Midia src={p.fotos[0] ?? capaGerada(p)} alt="" />
              </Link>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span className={'selo ' + p.tipo}>{p.tipo === 'oferta' ? 'Ofereço' : 'Procuro'}</span>
                  {expirada ? <span className="selo expirada">Expirada</span> : pausada ? <span className="selo pausada">Pausada</span> : <span className="selo ativa">No ar</span>}
                </div>
                <h3>{p.titulo}</h3>
                <div className="linha-meta">
                  <span>{nomeCategoria(p.categoria)} · {p.cidade}/{p.uf}</span>
                  <span>{p.preco != null ? `${moeda(p.preco)}/${p.unidade}` : 'A combinar'}</span>
                  <span><Eye className="ico" />{p.visualizacoes ?? 0}</span>
                  <span><Heart className="ico" />{p.curtidas}</span>
                  <span><CalendarClock className="ico" />{rotuloValidade(dias)}</span>
                </div>
                {confirmando === p.id && (
                  <div className="confirmar" style={{ marginTop: 10 }}>
                    Excluir de vez? As fotos também saem.
                    <button className="btn btn-perigo btn-p" disabled={ocupado === p.id} onClick={() => agir(p.id, () => excluir(p.id), 'Publicação excluída')}>Excluir</button>
                    <button className="btn btn-contorno btn-p" onClick={() => setConfirmando(null)}>Cancelar</button>
                  </div>
                )}
              </div>
              <div className="acoes-meu">
                <button className="btn btn-contorno btn-p" disabled={ocupado === p.id} onClick={() => agir(p.id, () => renovar(p.id, 30), 'Renovada por 30 dias e de volta ao topo')}>
                  <RefreshCw className="ico" /> Renovar
                </button>
                {!expirada && (
                  <button className="btn btn-contorno btn-p" disabled={ocupado === p.id} onClick={() => agir(p.id, () => mudarStatus(p.id, pausada ? 'ativa' : 'pausada'), pausada ? 'Publicação de volta ao ar' : 'Publicação pausada')}>
                    {pausada ? <><Play className="ico" /> Reativar</> : <><Pause className="ico" /> Pausar</>}
                  </button>
                )}
                <button className="btn-icone" aria-label="Excluir" onClick={() => setConfirmando(p.id)}><Trash2 className="ico" /></button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Perfil() {
  const { usuario, atualizarPerfil } = useConta();
  const { recado } = useEstado();
  const [f, setF] = useState({
    nome: usuario?.nome ?? '',
    whatsapp: mascaraTelefone(usuario?.whatsapp ?? ''),
    cidade: usuario?.cidade ?? '',
    uf: usuario?.uf ?? 'MG',
  });
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.nome.trim().length < 2) return setErro('Informe seu nome ou o da empresa.');
    if (f.whatsapp.replace(/\D/g, '').length < 10) return setErro('WhatsApp incompleto: use DDD + número.');
    setOcupado(true);
    setErro('');
    try {
      await atualizarPerfil({ nome: f.nome.trim(), whatsapp: f.whatsapp, cidade: f.cidade.trim(), uf: f.uf });
      recado('Perfil salvo');
    } catch (err) {
      setErro(traduzirErro(err));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <span className="rotulo">Minha conta</span>
      <h1 className="titulo-2" style={{ marginTop: 6, marginBottom: 20 }}>Perfil e contato</h1>
      <form className="formulario" onSubmit={salvar} noValidate style={{ maxWidth: 620 }}>
        <p style={{ margin: 0, color: 'var(--apagado)' }}>Nome e WhatsApp aparecem nos seus anúncios. O número é usado pelo botão de contato e não fica escrito na página.</p>
        <div className="campo">
          <label htmlFor="pf-nome">Nome ou empresa</label>
          <input id="pf-nome" className="entrada" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} autoComplete="name" />
        </div>
        <div className="campo">
          <label htmlFor="pf-whats">WhatsApp</label>
          <input id="pf-whats" className="entrada num" inputMode="tel" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: mascaraTelefone(e.target.value) })} autoComplete="tel" />
        </div>
        <div className="preco-linha" style={{ gridTemplateColumns: '1fr 100px' }}>
          <div className="campo">
            <label htmlFor="pf-cidade">Cidade</label>
            <input id="pf-cidade" className="entrada" value={f.cidade} onChange={(e) => setF({ ...f, cidade: e.target.value })} />
          </div>
          <div className="campo">
            <label htmlFor="pf-uf">UF</label>
            <select id="pf-uf" className="entrada" value={f.uf} onChange={(e) => setF({ ...f, uf: e.target.value })}>
              {UFS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="campo">
          <label htmlFor="pf-email">E-mail</label>
          <input id="pf-email" className="entrada" value={usuario?.email ?? ''} disabled />
          <span className="dica">{usuario?.provedor === 'google' ? 'Conta ligada ao Google.' : 'Usado para entrar e recuperar a senha.'}</span>
        </div>
        {erro && <span className="msg-erro">{erro}</span>}
        <button className="btn btn-primario btn-g" disabled={ocupado}><Pencil className="ico" /> {ocupado ? 'Salvando…' : 'Salvar alterações'}</button>
      </form>
    </>
  );
}

function Seguranca() {
  const { usuario, trocarSenha } = useConta();
  const { recado } = useEstado();
  const [nova, setNova] = useState('');
  const [repetir, setRepetir] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nova.length < 8) return setErro('Use pelo menos 8 caracteres.');
    if (nova !== repetir) return setErro('As duas senhas não estão iguais.');
    setOcupado(true);
    setErro('');
    try {
      await trocarSenha(nova);
      setNova('');
      setRepetir('');
      recado('Senha alterada');
    } catch (err) {
      setErro(traduzirErro(err));
    } finally {
      setOcupado(false);
    }
  };

  return (
    <>
      <span className="rotulo">Minha conta</span>
      <h1 className="titulo-2" style={{ marginTop: 6, marginBottom: 20 }}>Senha</h1>
      <form className="formulario" onSubmit={salvar} noValidate style={{ maxWidth: 520 }}>
        <p style={{ margin: 0, color: 'var(--apagado)' }}>
          {usuario?.provedor === 'google' ? 'Você entra com o Google. Se quiser, crie também uma senha para entrar com e-mail.' : 'Escolha uma senha nova para a sua conta.'}
        </p>
        <div className="campo">
          <label htmlFor="sg-nova">Senha nova</label>
          <input id="sg-nova" type="password" className="entrada" value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="new-password" />
          {nova && <div className={'forca n' + forcaSenha(nova)}><i /><i /><i /><i /></div>}
        </div>
        <div className="campo">
          <label htmlFor="sg-rep">Repita a senha</label>
          <input id="sg-rep" type="password" className="entrada" value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" />
        </div>
        {erro && <span className="msg-erro">{erro}</span>}
        <button className="btn btn-primario btn-g" disabled={ocupado}><KeyRound className="ico" /> {ocupado ? 'Salvando…' : 'Salvar senha'}</button>
      </form>
    </>
  );
}
