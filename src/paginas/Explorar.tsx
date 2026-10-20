import { ArrowRight, LayoutGrid, List, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { Cartao, GradeEsqueleto } from '../componentes/Cartao';
import { Contador } from '../componentes/Contador';
import { Gaveta } from '../componentes/Gaveta';
import { Esteira } from '../componentes/Esteira';
import { HeroCampuni } from '../componentes/HeroCampuni';
import { Perguntas } from '../componentes/Perguntas';
import { VideoExplicativo } from '../componentes/VideoExplicativo';
import { CATEGORIAS, UFS, nomeCategoria } from '../lib/categorias';
import { listarPublicacoes } from '../lib/dados';
import { transicao } from '../lib/efeitos';
import { useEstado } from '../lib/estado';
import { lerValor, normalizar } from '../lib/formato';
import { guardado } from '../lib/guardado';
import type { Ordem, Publicacao } from '../lib/tipos';

type Modo = 'explorar' | 'alta' | 'destaque' | 'salvos';

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: 'relevantes', rotulo: 'Mais relevantes' },
  { valor: 'recentes', rotulo: 'Mais recentes' },
  { valor: 'expiram', rotulo: 'Expiram primeiro' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
];
const PERIODOS = [
  { valor: '', rotulo: 'Sem limite' },
  { valor: '1', rotulo: '24 horas' },
  { valor: '3', rotulo: '3 dias' },
  { valor: '7', rotulo: '7 dias' },
  { valor: '15', rotulo: '15 dias' },
  { valor: '30', rotulo: '30 dias' },
];

const CABECAS: Record<Exclude<Modo, 'explorar'>, { rotulo: string; titulo: string; texto: string }> = {
  alta: { rotulo: 'Em alta', titulo: 'O que mais chamou atenção esta semana.', texto: 'Ordenado pelo interesse: quem salvou, curtiu e chamou no WhatsApp.' },
  destaque: { rotulo: 'Em destaque', titulo: 'Perfis em destaque no Campuni.', texto: 'Anunciantes com perfil completo e histórico de publicações na plataforma.' },
  salvos: { rotulo: 'Meus salvos', titulo: 'As oportunidades que você guardou.', texto: 'Ficam neste aparelho. Toque no coração de qualquer anúncio para guardar aqui.' },
};

/** Lê e escreve filtros na URL: o link copiado abre a mesma busca. */
function useFiltros() {
  const [params, setParams] = useSearchParams();
  const ler = useCallback((k: string) => params.get(k) ?? '', [params]);
  const definir = useCallback(
    (mudancas: Record<string, string | null>) => {
      transicao(() =>
        setParams(
          (atual) => {
            const novo = new URLSearchParams(atual);
            for (const [k, v] of Object.entries(mudancas)) {
              if (v) novo.set(k, v);
              else novo.delete(k);
            }
            return novo;
          },
          { replace: true, preventScrollReset: true },
        ),
      );
    },
    [setParams],
  );
  return { ler, definir };
}

export function Explorar({ modo = 'explorar' }: { modo?: Modo }) {
  const { salvos } = useEstado();
  const { ler, definir } = useFiltros();
  const [todas, setTodas] = useState<Publicacao[] | null>(null);
  const [erro, setErro] = useState('');
  const [gaveta, setGaveta] = useState(false);
  const [busca, setBusca] = useState(ler('q'));

  const tipo = ler('tipo') || 'todos';
  const cats = ler('cat') ? ler('cat').split(',') : [];
  const q = ler('q');
  const ordem = (ler('ordem') || 'relevantes') as Ordem;
  const visao = ler('visualizacao') || guardado.ler('visualizacao', 'cards');
  const uf = ler('uf');
  const periodo = ler('periodo');
  const pmin = ler('pmin');
  const pmax = ler('pmax');

  useEffect(() => {
    listarPublicacoes().then(setTodas, (e) => setErro(e instanceof Error ? e.message : 'Falha ao carregar.'));
  }, []);
  useEffect(() => setBusca(q), [q]);

  // Busca enquanto digita, com folga de 200 ms para não refiltrar a cada tecla.
  useEffect(() => {
    if (busca === q) return;
    const t = window.setTimeout(() => definir({ q: busca.trim() || null }), 220);
    return () => window.clearTimeout(t);
  }, [busca, q, definir]);

  const lista = useMemo(() => {
    if (!todas) return null;
    const termos = normalizar(q).split(/\s+/).filter(Boolean);
    const min = lerValor(pmin);
    const max = lerValor(pmax);
    const limite = periodo ? Date.now() - Number(periodo) * 86_400_000 : 0;
    let r = todas.filter((p) => {
      if (modo === 'salvos' && !salvos.has(p.id)) return false;
      if (modo === 'destaque' && !p.destaque) return false;
      if (tipo !== 'todos' && p.tipo !== tipo) return false;
      if (cats.length && !cats.includes(p.categoria)) return false;
      if (uf && p.uf !== uf) return false;
      if (limite && new Date(p.publicadaEm).getTime() < limite) return false;
      if (min != null && (p.preco == null || p.preco < min)) return false;
      if (max != null && (p.preco == null || p.preco > max)) return false;
      if (termos.length) {
        const texto = normalizar([p.titulo, nomeCategoria(p.categoria), p.cidade, p.uf, p.descricao, p.autor].join(' '));
        if (!termos.every((t) => texto.includes(t))) return false;
      }
      return true;
    });
    const por: Record<Ordem, (a: Publicacao, b: Publicacao) => number> = {
      relevantes: (a, b) => Number(!!b.minha) - Number(!!a.minha) || Number(b.destaque) - Number(a.destaque) || b.curtidas - a.curtidas,
      recentes: (a, b) => b.publicadaEm.localeCompare(a.publicadaEm),
      expiram: (a, b) => a.expiraEm.localeCompare(b.expiraEm),
      'menor-preco': (a, b) => (a.preco ?? Infinity) - (b.preco ?? Infinity),
      'maior-preco': (a, b) => (b.preco ?? -1) - (a.preco ?? -1),
    };
    r = [...r].sort(modo === 'alta' ? (a, b) => b.curtidas - a.curtidas : por[ordem]);
    return r;
  }, [todas, modo, salvos, tipo, cats.join(), uf, periodo, pmin, pmax, q, ordem]);

  const contagemCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of todas ?? []) m.set(p.categoria, (m.get(p.categoria) ?? 0) + 1);
    return m;
  }, [todas]);
  const categoriasOrdenadas = useMemo(
    () => [...CATEGORIAS].sort((a, b) => (contagemCat.get(b.slug) ?? 0) - (contagemCat.get(a.slug) ?? 0)),
    [contagemCat],
  );
  const cidades = useMemo(() => new Set((todas ?? []).map((p) => p.cidade)).size, [todas]);
  const extras = [uf, periodo, pmin || pmax].filter(Boolean).length;

  const alternarCat = (slug: string) => {
    const nova = slug ? (cats.includes(slug) ? cats.filter((c) => c !== slug) : [...cats, slug]) : [];
    definir({ cat: nova.join(',') || null });
  };
  const trocarVisao = () => {
    const nova = visao === 'cards' ? 'lista' : 'cards';
    guardado.gravar('visualizacao', nova);
    definir({ visualizacao: nova });
  };

  const rolarParaResultados = () =>
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <>
      {modo === 'explorar' && (
        <>
          <HeroCampuni
            busca={busca}
            aoDigitar={setBusca}
            aoBuscar={(termo) => {
              const t = (termo ?? busca).trim();
              if (termo) setBusca(termo);
              definir({ q: t || null });
              rolarParaResultados();
            }}
            total={todas?.length ?? null}
            cidades={todas ? cidades : null}
          />
          {todas && <Esteira pubs={todas} />}
        </>
      )}
      <div className="container">
        {modo !== 'explorar' && (
          <div className="pagina-topo" style={{ paddingBottom: 0 }}>
            <span className="rotulo">{CABECAS[modo].rotulo}</span>
            <h1>{CABECAS[modo].titulo}</h1>
            <p className="intro">{CABECAS[modo].texto}</p>
          </div>
        )}

        <div className="filtros" id="resultados">
          <div className="linha1">
            <Segmentado
              valor={tipo}
              opcoes={[['todos', 'Todos'], ['oferta', 'Ofereço'], ['procura', 'Procuro']]}
              aoMudar={(v) => definir({ tipo: v === 'todos' ? null : v })}
            />
            <span className="vao" />
            {modo !== 'alta' && (
              <select className="selecao so-desktop" value={ordem} onChange={(e) => definir({ ordem: e.target.value === 'relevantes' ? null : e.target.value })} aria-label="Ordenar por">
                {ORDENS.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
              </select>
            )}
            <button className="btn-icone" onClick={trocarVisao} aria-label={visao === 'cards' ? 'Ver em lista' : 'Ver em cards'}>
              {visao === 'cards' ? <List className="ico" /> : <LayoutGrid className="ico" />}
            </button>
            <button className="btn btn-contorno btn-p" onClick={() => setGaveta(true)}>
              <SlidersHorizontal className="ico" /> Filtros{extras > 0 && <span className="num">· {extras}</span>}
            </button>
          </div>
          <div className="chips" role="group" aria-label="Categorias">
            <button className="chip" aria-pressed={!cats.length} onClick={() => alternarCat('')}>Todas</button>
            {categoriasOrdenadas.map((c) => (
              <button key={c.slug} className="chip" aria-pressed={cats.includes(c.slug)} onClick={() => alternarCat(c.slug)}>
                {c.nome}
                {(contagemCat.get(c.slug) ?? 0) > 0 && <span className="qtd">{contagemCat.get(c.slug)}</span>}
              </button>
            ))}
          </div>
          <div className="resumo">
            <span><b className="num">{lista?.length ?? '–'}</b> oportunidades encontradas</span>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {q && <FiltroAtivo rotulo={`"${q}"`} aoTirar={() => definir({ q: null })} />}
              {uf && <FiltroAtivo rotulo={uf} aoTirar={() => definir({ uf: null })} />}
            </span>
          </div>
        </div>

        <section className={'grade' + (visao === 'lista' ? ' lista' : '')} aria-live="polite" aria-busy={!lista}>
          {erro && <div className="vazio-grade"><b>Não foi possível carregar as oportunidades.</b>{erro}</div>}
          {!lista && !erro && <GradeEsqueleto />}
          {lista?.length === 0 && (
            <div className="vazio-grade">
              <b>{modo === 'salvos' ? 'Nada salvo ainda' : 'Nenhuma oportunidade com esses filtros'}</b>
              {modo === 'salvos'
                ? 'Toque no coração de um anúncio para guardar aqui.'
                : 'Tente outra categoria ou limpe os filtros. Se ninguém oferece, publique que você procura.'}
              <div>
                <Link className="btn btn-primario" to={modo === 'salvos' ? '/' : '/publicar?tipo=procura'}>
                  {modo === 'salvos' ? 'Explorar oportunidades' : 'Publicar o que procuro'}
                </Link>
              </div>
            </div>
          )}
          {lista?.map((p, i) => <Cartao key={p.id} pub={p} indice={i} novo={p.minha && i === 0} />)}
        </section>
      </div>

      {modo === 'explorar' && <SecoesInicio total={todas?.length ?? 0} cidades={cidades} />}

      <Gaveta
        aberta={gaveta}
        aoFechar={() => setGaveta(false)}
        titulo="Filtros e localização"
        jeito="lateral"
        rodape={
          <>
            <button className="btn btn-contorno" onClick={() => definir({ uf: null, periodo: null, pmin: null, pmax: null, ordem: null, cat: null })}>Limpar</button>
            <button className="btn btn-primario" onClick={() => setGaveta(false)}>Ver {lista?.length ?? ''} resultados</button>
          </>
        }
      >
        <div className="grupo-filtro">
          <h4>Ordenar por</h4>
          <div className="chips-quebra">
            {ORDENS.map((o) => (
              <button key={o.valor} className="chip" aria-pressed={ordem === o.valor} onClick={() => definir({ ordem: o.valor === 'relevantes' ? null : o.valor })}>{o.rotulo}</button>
            ))}
          </div>
        </div>
        <div className="grupo-filtro">
          <h4>Publicadas ou renovadas</h4>
          <div className="chips-quebra">
            {PERIODOS.map((p) => (
              <button key={p.valor} className="chip" aria-pressed={periodo === p.valor} onClick={() => definir({ periodo: p.valor || null })}>{p.rotulo}</button>
            ))}
          </div>
        </div>
        <div className="grupo-filtro">
          <h4>Preço (R$)</h4>
          <div className="dois">
            <div className="campo">
              <label htmlFor="pmin">Mínimo</label>
              <input id="pmin" className="entrada num" inputMode="decimal" placeholder="0" defaultValue={pmin} onBlur={(e) => definir({ pmin: e.target.value || null })} />
            </div>
            <div className="campo">
              <label htmlFor="pmax">Máximo</label>
              <input id="pmax" className="entrada num" inputMode="decimal" placeholder="Sem limite" defaultValue={pmax} onBlur={(e) => definir({ pmax: e.target.value || null })} />
            </div>
          </div>
          <span className="dica" style={{ fontSize: 12, color: 'var(--apagado)' }}>Anúncios com preço a combinar saem quando há faixa de preço.</span>
        </div>
        <div className="grupo-filtro">
          <h4>Localização</h4>
          <div className="campo">
            <label htmlFor="uf">Estado</label>
            <select id="uf" className="entrada" value={uf} onChange={(e) => definir({ uf: e.target.value || null })}>
              <option value="">Todos os estados</option>
              {UFS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div className="grupo-filtro">
          <h4>Categorias</h4>
          <div className="chips-quebra">
            {CATEGORIAS.map((c) => (
              <button key={c.slug} className="chip" aria-pressed={cats.includes(c.slug)} onClick={() => alternarCat(c.slug)}>{c.nome}</button>
            ))}
          </div>
        </div>
      </Gaveta>
    </>
  );
}

function FiltroAtivo({ rotulo, aoTirar }: { rotulo: string; aoTirar: () => void }) {
  return (
    <span className="filtro-ativo">
      {rotulo}
      <button onClick={aoTirar} aria-label={`Tirar filtro ${rotulo}`}><X size={12} /></button>
    </span>
  );
}

/** Controle segmentado com o fundo deslizando até a opção escolhida. */
function Segmentado({ valor, opcoes, aoMudar }: { valor: string; opcoes: [string, string][]; aoMudar: (v: string) => void }) {
  const caixa = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, w: 0 });
  const medir = useCallback(() => {
    const b = caixa.current?.querySelector<HTMLButtonElement>(`button[data-v="${valor}"]`);
    if (b) setPos({ x: b.offsetLeft - 3, w: b.offsetWidth });
  }, [valor]);
  useLayoutEffect(medir, [medir]);
  useEffect(() => {
    window.addEventListener('resize', medir);
    document.fonts?.ready.then(medir);
    return () => window.removeEventListener('resize', medir);
  }, [medir]);
  return (
    <div className="seg" ref={caixa} role="group" aria-label="Tipo de publicação">
      <span className="botao-ativo" style={{ width: pos.w, transform: `translateX(${pos.x}px)` }} />
      {opcoes.map(([v, r]) => (
        <button key={v} data-v={v} aria-pressed={valor === v} onClick={() => aoMudar(v)}>{r}</button>
      ))}
    </div>
  );
}

function SecoesInicio({ total, cidades }: { total: number; cidades: number }) {
  return (
    <>
      <section className="secao">
        <div className="container">
          <div className="cabeca-secao">
            <div>
              <span className="rotulo">Como funciona</span>
              <h2 className="titulo-2">Do anúncio ao <em>aperto de mão</em>, sem intermediário.</h2>
            </div>
            <Link to="/como-funciona" className="btn btn-contorno">Entender em detalhes <ArrowRight className="ico" /></Link>
          </div>
          <ol className="passos-3">
            <li><h3>Publique o que oferece ou procura</h3><p>Escolha a categoria, escreva o título, coloque o preço e as fotos. Leva menos de 2 minutos e não custa nada.</p></li>
            <li><h3>Quem está perto encontra</h3><p>Seu anúncio aparece para quem busca por categoria, cidade e estado, com a validade sempre à vista.</p></li>
            <li><h3>A conversa vai para o WhatsApp</h3><p>O interessado chama você com o anúncio na mensagem. Preço e entrega vocês combinam direto.</p></li>
          </ol>
        </div>
      </section>

      <section className="secao tom">
        <div className="container"><VideoExplicativo /></div>
      </section>

      <section className="secao">
        <div className="container">
          <div className="numeros">
            <div><Contador valor={total} /><span>oportunidades no ar agora</span></div>
            <div><Contador valor={cidades} /><span>cidades com anúncios</span></div>
            <div><Contador valor={16} /><span>categorias do agro</span></div>
            <div><b className="num">R$ 0</b><span>para publicar e para contatar</span></div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="faixa-cta">
          <div>
            <h2>Tem algo para oferecer? Quem procura já está aqui.</h2>
            <p>Máquina parada, serviço de drone, lote de gado, insumo sobrando. Publique grátis e receba o contato direto no WhatsApp.</p>
          </div>
          <Link to="/publicar" className="btn btn-g"><Plus className="ico" /> Publicar grátis</Link>
        </div>
      </section>

      <section className="secao">
        <div className="container duas-colunas">
          <div>
            <span className="rotulo">Perguntas frequentes</span>
            <h2 className="titulo-2">Dúvidas de quem está começando.</h2>
            <p className="intro">Não achou a sua? Fale com a gente pelo WhatsApp ou pelo formulário de contato.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
              <Link to="/contato" className="btn btn-primario">Fale conosco</Link>
              <Link to="/como-funciona#perguntas" className="btn btn-contorno">Ver todas</Link>
            </div>
          </div>
          <Perguntas limite={5} />
        </div>
      </section>
    </>
  );
}
