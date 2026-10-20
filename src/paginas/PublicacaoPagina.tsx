import { ChevronLeft, ChevronRight, Flag, Heart, Share2, ShieldCheck, Star } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Cartao, Preco, SeloTipo, Validade, capaGerada } from '../componentes/Cartao';
import { Gaveta } from '../componentes/Gaveta';
import { IconeWhatsApp } from '../componentes/IconesProprios';
import { Midia } from '../componentes/Midia';
import { nomeCategoria } from '../lib/categorias';
import { enviarContato, listarPublicacoes, obterPublicacao } from '../lib/dados';
import { estouro } from '../lib/efeitos';
import { useEstado } from '../lib/estado';
import { diasRestantes, iniciais, tempoDesde } from '../lib/formato';
import { SITE, linkWhatsApp } from '../lib/site';
import type { Publicacao } from '../lib/tipos';

export function PublicacaoPagina() {
  const { id = '' } = useParams();
  const [pub, setPub] = useState<Publicacao | null | undefined>(undefined);
  const [parecidas, setParecidas] = useState<Publicacao[]>([]);
  const { salvos, alternarSalvo, recado } = useEstado();
  const coracao = useRef<HTMLButtonElement>(null);
  const [denuncia, setDenuncia] = useState(false);

  useEffect(() => {
    setPub(undefined);
    obterPublicacao(id).then(setPub, () => setPub(null));
  }, [id]);

  useEffect(() => {
    if (!pub) return;
    document.title = `${pub.titulo} · Campuni`;
    listarPublicacoes().then((todas) =>
      setParecidas(
        todas
          .filter((p) => p.id !== pub.id)
          .sort((a, b) => Number(b.categoria === pub.categoria) - Number(a.categoria === pub.categoria) || Number(b.cidade === pub.cidade) - Number(a.cidade === pub.cidade))
          .slice(0, 4),
      ),
    );
    return () => {
      document.title = 'Campuni · Oportunidades que aproximam o campo';
    };
  }, [pub]);

  const mensagem = useMemo(
    () => (pub ? `Olá! Vi "${pub.titulo}" no Campuni e tenho interesse.\n${SITE.url}/publicacoes/${pub.id}` : ''),
    [pub],
  );

  if (pub === undefined) {
    return (
      <div className="container" style={{ paddingTop: 24 }}>
        <div className="pub">
          <div className="esqueleto" style={{ aspectRatio: '4 / 5' }} />
          <div style={{ display: 'grid', gap: 14 }}>
            <div className="esqueleto" style={{ height: 40 }} />
            <div className="esqueleto" style={{ height: 30, width: '50%' }} />
            <div className="esqueleto" style={{ height: 140 }} />
          </div>
        </div>
      </div>
    );
  }

  if (pub === null) {
    return (
      <div className="container pagina-topo">
        <span className="rotulo">Publicação</span>
        <h1>Esta oportunidade não está mais no ar.</h1>
        <p className="intro">Ela pode ter expirado ou sido removida por quem publicou.</p>
        <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
          <Link className="btn btn-primario" to="/">Ver oportunidades ativas</Link>
          <Link className="btn btn-contorno" to="/publicar">Publicar uma oportunidade</Link>
        </div>
      </div>
    );
  }

  const salvo = salvos.has(pub.id);
  const dias = diasRestantes(pub.expiraEm);

  const compartilhar = async () => {
    const url = `${SITE.url}/publicacoes/${pub.id}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try {
      if (nav.share) await nav.share({ title: pub.titulo, url });
      else {
        await navigator.clipboard.writeText(url);
        recado('Link copiado');
      }
    } catch {
      /* cancelado */
    }
  };

  const botaoWhats = (
    <a className="btn btn-whats" href={linkWhatsApp(mensagem, pub.whatsapp ?? '')} target="_blank" rel="noopener noreferrer">
      <IconeWhatsApp /> Conversar no WhatsApp
    </a>
  );

  return (
    <div className="container">
      <nav className="migalhas" aria-label="Você está em">
        <Link to="/">Explorar</Link> /
        <Link to={`/?cat=${pub.categoria}`}>{nomeCategoria(pub.categoria)}</Link> /
        <span>{pub.cidade}/{pub.uf}</span>
      </nav>

      <div className="pub">
        <Galeria fotos={pub.fotos.length ? pub.fotos : [capaGerada(pub)]} titulo={pub.titulo} id={pub.id} />

        <div className="ficha">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {pub.destaque && <span className="selo destaque"><Star className="ico" />Perfil em destaque</span>}
            <SeloTipo tipo={pub.tipo} />
            <span className="selo ativa">Ativa</span>
            {pub.exemplo && <span className="selo procura">exemplo</span>}
          </div>
          <h1>{pub.titulo}</h1>
          <Preco pub={pub} />
          <Validade expiraEm={pub.expiraEm} />

          <dl className="dados">
            <div><dt>Categoria</dt><dd>{nomeCategoria(pub.categoria)}</dd></div>
            <div><dt>Local</dt><dd>{pub.cidade}/{pub.uf}</dd></div>
            <div><dt>Quantidade</dt><dd>{pub.quantidade ?? 'Consultar'}</dd></div>
            <div><dt>Validade</dt><dd className="num">{dias} {dias === 1 ? 'dia' : 'dias'}</dd></div>
          </dl>

          {pub.descricao && <p className="descricao">{pub.descricao}</p>}

          <div className="vendedor">
            <span className="avatar">{iniciais(pub.autor)}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ color: 'var(--tinta)' }}>{pub.autor}</b>
              <small>Publicada {tempoDesde(pub.publicadaEm)} · {pub.cidade}/{pub.uf}</small>
            </div>
            <button
              ref={coracao}
              className={'acao-cartao' + (salvo ? ' curtido' : '')}
              aria-pressed={salvo}
              aria-label={salvo ? 'Remover dos salvos' : 'Salvar'}
              onClick={() => {
                if (alternarSalvo(pub.id) && coracao.current) estouro(coracao.current);
              }}
            >
              <Heart className="ico" /><span className="num">{pub.curtidas + (salvo ? 1 : 0)}</span>
            </button>
            <button className="acao-cartao" onClick={compartilhar} aria-label="Compartilhar"><Share2 className="ico" /></button>
          </div>

          <div className="contato-pub">
            {botaoWhats}
            <p>Abrimos o WhatsApp com o título e o link desta publicação já na mensagem.</p>
          </div>

          <div className="aviso ok">
            <ShieldCheck className="ico" />
            <span>
              Combine tudo por escrito e, sempre que possível, veja o produto antes de pagar.{' '}
              <Link to="/como-funciona#seguranca">Dicas de negociação segura</Link>.
            </span>
          </div>

          <button className="denunciar" onClick={() => setDenuncia(true)}>
            <Flag size={13} style={{ verticalAlign: '-2px' }} /> Denunciar publicação
          </button>
        </div>
      </div>

      {parecidas.length > 0 && (
        <section className="secao" style={{ paddingBottom: 0 }}>
          <div className="cabeca-secao">
            <div>
              <span className="rotulo">Continue explorando</span>
              <h2 className="titulo-2" style={{ fontSize: 'clamp(24px,3vw,32px)' }}>Oportunidades parecidas</h2>
            </div>
            <Link className="btn btn-contorno" to={`/?cat=${pub.categoria}`}>Ver todas em {nomeCategoria(pub.categoria)}</Link>
          </div>
          <div className="grade">
            {parecidas.map((p, i) => <Cartao key={p.id} pub={p} indice={i} />)}
          </div>
        </section>
      )}

      <div className="cta-fixa">{botaoWhats}</div>

      <Denuncia aberta={denuncia} aoFechar={() => setDenuncia(false)} pub={pub} />
    </div>
  );
}

function Galeria({ fotos, titulo, id }: { fotos: string[]; titulo: string; id: string }) {
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const ir = (i: number) => {
    const t = trilho.current;
    if (t) t.scrollTo({ left: t.clientWidth * Math.max(0, Math.min(fotos.length - 1, i)), behavior: 'smooth' });
  };
  const lista = fotos.length ? fotos : [''];
  return (
    <div>
      <div className="galeria">
        <div
          className="trilho"
          ref={trilho}
          onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {lista.map((f, i) => (
            <div className="quadro" key={i}>
              <Midia src={f || undefined} alt={`${titulo}, foto ${i + 1} de ${lista.length}`} prioridade={i === 0} estilo={i === 0 ? { viewTransitionName: `foto-${id}` } : undefined} />
            </div>
          ))}
        </div>
        {lista.length > 1 && (
          <>
            <button className="seta ant" onClick={() => ir(atual - 1)} aria-label="Foto anterior"><ChevronLeft className="ico" /></button>
            <button className="seta prox" onClick={() => ir(atual + 1)} aria-label="Próxima foto"><ChevronRight className="ico" /></button>
            <div className="pontos">{lista.map((_, i) => <i key={i} className={i === atual ? 'on' : ''} />)}</div>
          </>
        )}
      </div>
      {lista.length > 1 && (
        <div className="miniaturas">
          {lista.map((f, i) => (
            <button key={i} className={i === atual ? 'on' : ''} onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`}>
              <img src={f} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const MOTIVOS = ['Golpe ou fraude', 'Produto proibido', 'Informação falsa', 'Anúncio duplicado', 'Outro motivo'];

function Denuncia({ aberta, aoFechar, pub }: { aberta: boolean; aoFechar: () => void; pub: Publicacao }) {
  const [motivo, setMotivo] = useState('');
  const [detalhe, setDetalhe] = useState('');
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'ok'>('parado');
  const [erro, setErro] = useState('');
  const { recado } = useEstado();

  const enviar = async () => {
    if (!motivo) return setErro('Escolha um motivo.');
    setEstado('enviando');
    try {
      await enviarContato({ tipo: 'denuncia', publicacaoId: pub.id, assunto: motivo, mensagem: detalhe, consentimento: true });
      setEstado('ok');
      recado('Denúncia enviada. Obrigado por avisar.');
      aoFechar();
    } catch (e) {
      setEstado('parado');
      setErro(e instanceof Error ? e.message : 'Não foi possível enviar.');
    }
  };

  return (
    <Gaveta
      aberta={aberta}
      aoFechar={aoFechar}
      titulo="Denunciar publicação"
      rodape={<button className="btn btn-primario" onClick={enviar} disabled={estado === 'enviando'}>Enviar denúncia</button>}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <p style={{ margin: 0, color: 'var(--apagado)' }}>A equipe do Campuni revisa cada denúncia. Quem publicou não fica sabendo quem denunciou.</p>
        <div className="chips-quebra" role="radiogroup" aria-label="Motivo">
          {MOTIVOS.map((m) => (
            <button key={m} className="chip" role="radio" aria-checked={motivo === m} aria-pressed={motivo === m} onClick={() => { setMotivo(m); setErro(''); }}>{m}</button>
          ))}
        </div>
        <div className="campo">
          <label htmlFor="den-detalhe">Detalhes (opcional)</label>
          <textarea id="den-detalhe" className="entrada" value={detalhe} onChange={(e) => setDetalhe(e.target.value)} placeholder="O que você percebeu?" />
        </div>
        {erro && <span className="msg-erro">{erro}</span>}
      </div>
    </Gaveta>
  );
}
