import { ArrowLeft, Check, HandCoins, Info, Search as Procura, ShieldCheck, Upload, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { Cartao } from '../componentes/Cartao';
import { IconeWhatsApp } from '../componentes/IconesProprios';
import { CATEGORIAS, UFS, UNIDADES } from '../lib/categorias';
import { FormularioConta } from '../componentes/FormularioConta';
import { useConta } from '../lib/conta';
import { publicar } from '../lib/dados';
import { confete } from '../lib/efeitos';
import { useEstado } from '../lib/estado';
import { lerValor, mascaraTelefone, tamanho } from '../lib/formato';
import { guardado } from '../lib/guardado';
import { ehImagem, prepararFoto } from '../lib/imagem';
import { SITE, linkWhatsApp } from '../lib/site';
import type { FotoProcessada, Publicacao, TipoPublicacao } from '../lib/tipos';

/**
 * Publicar em quatro passos, com a prévia do card ao lado.
 *
 * A grande mudança em relação ao site atual: o login vem no FIM, não no
 * começo. Hoje o clique em "Publicar" cai direto em "Entre para se
 * conectar", antes de a pessoa investir qualquer coisa. Aqui ela monta o
 * anúncio inteiro, vê como vai ficar, e só então confirma o e-mail.
 * Quem já preencheu tudo raramente desiste. O rascunho fica salvo no
 * aparelho a cada tecla.
 */

interface Rascunho {
  tipo: TipoPublicacao;
  categoria: string;
  titulo: string;
  descricao: string;
  preco: string;
  combinar: boolean;
  unidade: string;
  quantidade: string;
  cidade: string;
  uf: string;
  validade: number;
  autor: string;
  whatsapp: string;
}

const VAZIO: Rascunho = {
  tipo: 'oferta',
  categoria: '',
  titulo: '',
  descricao: '',
  preco: '',
  combinar: false,
  unidade: 'unidade',
  quantidade: '',
  cidade: '',
  uf: 'MG',
  validade: 30,
  autor: '',
  whatsapp: '',
};

const ETAPAS = ['Tipo e categoria', 'Detalhes', 'Fotos', 'Contato'];
const MAX_FOTOS = 6;

export function Publicar() {
  const [params] = useSearchParams();
  const [r, setR] = useState<Rascunho>(() => {
    const salvo = guardado.ler<Rascunho | null>('rascunho', null);
    const tipo = params.get('tipo') === 'procura' ? 'procura' : undefined;
    return { ...VAZIO, ...salvo, ...(tipo ? { tipo } : {}) };
  });
  const [etapa, setEtapa] = useState(0);
  const [fotos, setFotos] = useState<FotoProcessada[]>([]);
  const [processando, setProcessando] = useState(0);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [publicada, setPublicada] = useState<Publicacao | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pedirLogin, setPedirLogin] = useState(false);
  const [rascunhoSalvo, setRascunhoSalvo] = useState(false);
  const { recado } = useEstado();
  const { usuario } = useConta();
  const navegar = useNavigate();
  const topo = useRef<HTMLDivElement>(null);

  // Conta conhecida: preenche nome, WhatsApp e cidade sem pedir de novo.
  useEffect(() => {
    if (!usuario) return;
    setR((a) => ({
      ...a,
      autor: a.autor || usuario.nome,
      whatsapp: a.whatsapp || mascaraTelefone(usuario.whatsapp),
      cidade: a.cidade || usuario.cidade,
      uf: a.cidade ? a.uf : usuario.uf || a.uf,
    }));
  }, [usuario]);

  useEffect(() => {
    document.title = 'Publicar oportunidade · Campuni';
  }, []);

  useEffect(() => {
    if (publicada) return;
    const t = window.setTimeout(() => {
      guardado.gravar('rascunho', r);
      setRascunhoSalvo(JSON.stringify(r) !== JSON.stringify(VAZIO));
    }, 300);
    return () => window.clearTimeout(t);
  }, [r, publicada]);

  const mudar = <K extends keyof Rascunho>(k: K, v: Rascunho[K]) => {
    setR((a) => ({ ...a, [k]: v }));
    if (erros[k]) setErros((e) => ({ ...e, [k]: '' }));
  };

  const previa: Publicacao = useMemo(
    () => ({
      id: 'previa',
      tipo: r.tipo,
      categoria: r.categoria,
      titulo: r.titulo,
      descricao: r.descricao,
      preco: r.combinar ? null : lerValor(r.preco),
      unidade: r.unidade,
      quantidade: r.quantidade,
      cidade: r.cidade,
      uf: r.uf,
      autor: r.autor || 'Você',
      destaque: false,
      curtidas: 0,
      fotos: fotos.map((f) => f.url),
      publicadaEm: new Date().toISOString(),
      expiraEm: new Date(Date.now() + r.validade * 86_400_000).toISOString(),
    }),
    [r, fotos],
  );

  const validar = (n: number): boolean => {
    const e: Record<string, string> = {};
    if (n === 0 && !r.categoria) e.categoria = 'Escolha uma categoria para seu anúncio aparecer na busca certa.';
    if (n === 1) {
      if (r.titulo.trim().length < 6) e.titulo = 'Escreva um título com pelo menos 6 letras.';
      if (!r.cidade.trim()) e.cidade = 'Informe a cidade para quem está perto encontrar você.';
      if (!r.combinar && r.preco && lerValor(r.preco) == null) e.preco = 'Use só números, como 1.250,00.';
    }
    if (n === 3) {
      if (!r.autor.trim()) e.autor = 'Informe um nome para os interessados.';
      if (r.whatsapp.replace(/\D/g, '').length < 10) e.whatsapp = 'Número incompleto. Use DDD + número, como (34) 99999-9999.';
    }
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const irPara = (n: number) => {
    setEtapa(n);
    topo.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const avancar = async () => {
    if (!validar(etapa)) return;
    if (etapa < 3) return irPara(etapa + 1);
    if (!usuario) return setPedirLogin(true);
    await concluir();
  };

  // Entrou ou criou a conta no último passo: publica na sequência.
  useEffect(() => {
    if (pedirLogin && usuario && !enviando && !publicada) concluir();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pedirLogin, usuario]);

  const concluir = async () => {
    if (!usuario) return setPedirLogin(true);
    setEnviando(true);
    try {
      const pub = await publicar(
        {
          tipo: r.tipo,
          categoria: r.categoria,
          titulo: r.titulo.trim(),
          descricao: r.descricao.trim(),
          preco: r.combinar ? null : lerValor(r.preco),
          unidade: r.unidade,
          quantidade: r.quantidade.trim(),
          cidade: r.cidade.trim(),
          uf: r.uf,
          autor: r.autor.trim(),
          whatsapp: r.whatsapp,
          validadeDias: r.validade,
        },
        fotos,
        usuario.id,
      );
      guardado.gravar('rascunho', null);
      setPublicada(pub);
      setPedirLogin(false);
      confete();
      topo.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      recado(e instanceof Error ? e.message : 'Não foi possível publicar agora.');
    } finally {
      setEnviando(false);
    }
  };

  const receberArquivos = async (lista: FileList | File[]) => {
    const arquivos = [...lista].filter(ehImagem).slice(0, MAX_FOTOS - fotos.length);
    if (!arquivos.length) {
      recado(fotos.length >= MAX_FOTOS ? `Limite de ${MAX_FOTOS} fotos` : 'Escolha arquivos de imagem');
      return;
    }
    setProcessando(arquivos.length);
    for (const a of arquivos) {
      try {
        const f = await prepararFoto(a);
        setFotos((atual) => [...atual, f]);
      } catch {
        recado(`Não consegui abrir ${a.name}. Tente uma foto JPG ou PNG.`);
      }
      setProcessando((n) => n - 1);
    }
  };

  if (publicada) {
    return (
      <div className="container" ref={topo}>
        <div className="feito-tela">
          <svg className="selo-ok" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" /><path d="M30 52l14 14 26-30" /></svg>
          <h1>Oportunidade publicada</h1>
          <p>
            Seu anúncio já aparece no topo da busca. Acompanhe visualizações e renove pela sua conta.
            Compartilhe no WhatsApp para alcançar mais gente da região.
          </p>
          <div style={{ width: 260 }}><Cartao pub={publicada} previa /></div>
          <div className="acoes">
            <a className="btn btn-whats" target="_blank" rel="noopener noreferrer" href={linkWhatsApp(`${publicada.titulo}\nVeja no Campuni: ${SITE.url}/publicacoes/${publicada.id}`, '')}>
              <IconeWhatsApp /> Compartilhar no WhatsApp
            </a>
            <button className="btn btn-primario" onClick={() => navegar(`/publicacoes/${publicada.id}`)}>Ver meu anúncio</button>
            <button className="btn btn-contorno" onClick={() => { setPublicada(null); setR({ ...VAZIO, autor: r.autor, whatsapp: r.whatsapp, uf: r.uf, cidade: r.cidade }); setFotos([]); setEtapa(0); }}>
              Publicar outra
            </button>
          </div>
        </div>
      </div>
    );
  }

  const antes = fotos.reduce((s, f) => s + f.antes, 0);
  const depois = fotos.reduce((s, f) => s + f.depois, 0);

  return (
    <div className="container" ref={topo}>
      <div className="publicar">
        <div>
          <div className="passos-barra" aria-hidden="true">
            {ETAPAS.map((e, i) => <i key={e} className={i <= etapa ? 'feito' : ''} />)}
          </div>
          <span className="passo-rotulo">Passo {etapa + 1} de 4 · {ETAPAS[etapa]}</span>

          {etapa === 0 && (
            <section className="etapa" key="e0">
              <h1>O que você quer publicar?</h1>
              <p className="lead">Escolha o tipo e a categoria. Publicar é grátis e leva menos de 2 minutos.</p>
              <div className="escolha">
                <button type="button" aria-pressed={r.tipo === 'oferta'} onClick={() => mudar('tipo', 'oferta')}>
                  <HandCoins className="ico" /><b>Ofereço</b><span>Vendo um produto ou presto um serviço</span>
                </button>
                <button type="button" aria-pressed={r.tipo === 'procura'} onClick={() => mudar('tipo', 'procura')}>
                  <Procura className="ico" /><b>Procuro</b><span>Quero comprar ou contratar</span>
                </button>
              </div>
              <div className="campo">
                <span className="rotulo-campo">Categoria</span>
                <div className="chips-quebra" role="radiogroup" aria-label="Categoria">
                  {CATEGORIAS.map((c) => (
                    <button key={c.slug} type="button" className="chip" role="radio" aria-checked={r.categoria === c.slug} aria-pressed={r.categoria === c.slug} onClick={() => mudar('categoria', c.slug)}>
                      {r.categoria === c.slug && <Check size={14} />}{c.nome}
                    </button>
                  ))}
                </div>
                {erros.categoria && <span className="msg-erro">{erros.categoria}</span>}
              </div>
            </section>
          )}

          {etapa === 1 && (
            <section className="etapa" key="e1">
              <h1>Detalhes da oportunidade</h1>
              <div className="campo">
                <label htmlFor="titulo">Título</label>
                <input id="titulo" className={'entrada' + (erros.titulo ? ' erro' : '')} maxLength={80} value={r.titulo} onChange={(e) => mudar('titulo', e.target.value)} placeholder={r.tipo === 'oferta' ? 'Ex.: Pulverização com drone, até 80 ha por dia' : 'Ex.: Procuro tratorista para a safra de soja'} />
                <span className="dica"><span className="num">{r.titulo.length}</span>/80 · título específico recebe mais contatos</span>
                {erros.titulo && <span className="msg-erro">{erros.titulo}</span>}
              </div>
              <div className="campo">
                <label htmlFor="preco">{r.tipo === 'oferta' ? 'Preço' : 'Quanto pretende pagar'}</label>
                <div className="preco-linha">
                  <input id="preco" className={'entrada num' + (erros.preco ? ' erro' : '')} inputMode="decimal" placeholder="R$ 0,00" value={r.preco} disabled={r.combinar} onChange={(e) => mudar('preco', e.target.value)} />
                  <select className="entrada" aria-label="Unidade" value={r.unidade} onChange={(e) => mudar('unidade', e.target.value)}>
                    {UNIDADES.map((u) => <option key={u} value={u}>por {u}</option>)}
                  </select>
                </div>
                <label className="marcar"><input type="checkbox" checked={r.combinar} onChange={(e) => mudar('combinar', e.target.checked)} /> Preço a combinar</label>
                {erros.preco && <span className="msg-erro">{erros.preco}</span>}
              </div>
              <div className="campo">
                <label htmlFor="quantidade">Quantidade <span style={{ fontWeight: 500, color: 'var(--apagado)' }}>(opcional)</span></label>
                <input id="quantidade" className="entrada" value={r.quantidade} onChange={(e) => mudar('quantidade', e.target.value)} placeholder="Ex.: 5.000 sacas, 40 cabeças, 300 ha" />
              </div>
              <div className="dois">
                <div className="campo">
                  <label htmlFor="cidade">Cidade</label>
                  <input id="cidade" className={'entrada' + (erros.cidade ? ' erro' : '')} value={r.cidade} onChange={(e) => mudar('cidade', e.target.value)} placeholder="Ex.: Patrocínio" autoComplete="address-level2" />
                  {erros.cidade && <span className="msg-erro">{erros.cidade}</span>}
                </div>
                <div className="campo">
                  <label htmlFor="uf-pub">Estado</label>
                  <select id="uf-pub" className="entrada" value={r.uf} onChange={(e) => mudar('uf', e.target.value)}>
                    {UFS.map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="campo">
                <span className="rotulo-campo">Validade do anúncio</span>
                <div className="chips-quebra">
                  {[7, 15, 30, 60].map((d) => (
                    <button key={d} type="button" className="chip" aria-pressed={r.validade === d} onClick={() => mudar('validade', d)}>{d} dias</button>
                  ))}
                </div>
              </div>
              <div className="campo">
                <label htmlFor="descricao">Descrição</label>
                <textarea id="descricao" className="entrada" value={r.descricao} onChange={(e) => mudar('descricao', e.target.value)} placeholder="Condições, área atendida, forma de entrega, o que está incluso…" />
              </div>
            </section>
          )}

          {etapa === 2 && (
            <section className="etapa" key="e2">
              <h1>Fotos</h1>
              <p className="lead">Até {MAX_FOTOS} fotos. Flyer, foto em pé ou deitada: tudo aparece inteiro, sem cortes.</p>
              <ZonaSoltar aoReceber={receberArquivos} desativada={fotos.length >= MAX_FOTOS} />
              {(fotos.length > 0 || processando > 0) && (
                <div className="fotos-grade">
                  {fotos.map((f, i) => (
                    <div key={f.url} className="foto">
                      <img src={f.url} alt={`Foto ${i + 1}`} />
                      {i === 0 ? <span className="capa">CAPA</span> : (
                        <button
                          type="button"
                          className="virar-capa"
                          aria-label="Usar como capa"
                          onClick={() => {
                            setFotos((a) => [a[i], ...a.filter((_, k) => k !== i)]);
                            recado('Capa atualizada');
                          }}
                        />
                      )}
                      <span className="economia">{tamanho(f.antes)} → {tamanho(f.depois)}</span>
                      <button type="button" className="tirar" aria-label="Remover foto" onClick={() => setFotos((a) => a.filter((_, k) => k !== i))}>
                        <X className="ico" />
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: processando }, (_, i) => <div key={'p' + i} className="foto esqueleto" />)}
                </div>
              )}
              {fotos.length > 0 && (
                <div className="economia-total">
                  <Zap className="ico" />
                  <span>
                    {fotos.length} {fotos.length > 1 ? 'fotos otimizadas' : 'foto otimizada'}: <b>{tamanho(antes)} → {tamanho(depois)}</b>
                    {antes > depois && ` · ${Math.round((1 - depois / antes) * 100)}% mais leve para quem abre no 4G do campo`}
                  </span>
                </div>
              )}
              <div className="aviso"><Info className="ico" /><span>Toque numa foto para torná-la a capa. A capa é a primeira coisa que aparece na busca. Sem foto, o anúncio entra com uma capa gerada.</span></div>
            </section>
          )}

          {etapa === 3 && (
            <section className="etapa" key="e3">
              <h1>Como falam com você</h1>
              <p className="lead">Os interessados chamam direto no seu WhatsApp, com o anúncio já na mensagem.</p>
              <div className="campo">
                <label htmlFor="autor">Seu nome ou da empresa</label>
                <input id="autor" className={'entrada' + (erros.autor ? ' erro' : '')} value={r.autor} onChange={(e) => mudar('autor', e.target.value)} placeholder="Ex.: Fazenda Santa Luzia" autoComplete="name" />
                {erros.autor && <span className="msg-erro">{erros.autor}</span>}
              </div>
              <div className="campo">
                <label htmlFor="whats">WhatsApp</label>
                <input id="whats" className={'entrada num' + (erros.whatsapp ? ' erro' : '')} inputMode="tel" value={r.whatsapp} onChange={(e) => mudar('whatsapp', mascaraTelefone(e.target.value))} placeholder="(34) 99999-9999" autoComplete="tel" />
                {erros.whatsapp && <span className="msg-erro">{erros.whatsapp}</span>}
              </div>
              <div className="aviso ok">
                <ShieldCheck className="ico" />
                <span>Seu número não aparece escrito na página: ele só é usado pelo botão do WhatsApp. Ao publicar, você concorda com os <Link to="/termos">termos de uso</Link>.</span>
              </div>
              {pedirLogin && !usuario && (
                <FormularioConta compacta inicial="cadastro" voltarPara="/publicar" sugestao={{ nome: r.autor, whatsapp: r.whatsapp, cidade: r.cidade, uf: r.uf }} />
              )}
              {usuario && (
                <div className="aviso ok"><Check className="ico" /><span>Publicando como <b>{usuario.nome}</b> ({usuario.email}).</span></div>
              )}
            </section>
          )}

          {!pedirLogin && (
            <div className="navegar-etapas">
              {etapa > 0 ? (
                <button className="btn btn-contorno" onClick={() => irPara(etapa - 1)}><ArrowLeft className="ico" /> Voltar</button>
              ) : (
                <Link className="btn btn-contorno" to="/"><ArrowLeft className="ico" /> Cancelar</Link>
              )}
              <button className="btn btn-primario" onClick={avancar} disabled={enviando || processando > 0}>
                {etapa === 3 ? (enviando ? 'Publicando…' : 'Publicar agora') : 'Continuar'}
              </button>
            </div>
          )}
        </div>

        <aside className={'previa' + (etapa === 3 ? ' mostrar' : '')}>
          <h4>
            Prévia ao vivo
            {rascunhoSalvo && <span className="rascunho"><i />Rascunho salvo</span>}
          </h4>
          <Cartao pub={previa} previa />
        </aside>
      </div>
    </div>
  );
}

function ZonaSoltar({ aoReceber, desativada }: { aoReceber: (f: FileList) => void; desativada: boolean }) {
  const [sobre, setSobre] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);
  return (
    <>
      <label
        htmlFor="arquivos"
        className={'soltar' + (sobre ? ' sobre' : '')}
        style={desativada ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
        onDragEnter={(e) => { e.preventDefault(); setSobre(true); }}
        onDragOver={(e) => { e.preventDefault(); setSobre(true); }}
        onDragLeave={() => setSobre(false)}
        onDrop={(e) => { e.preventDefault(); setSobre(false); aoReceber(e.dataTransfer.files); }}
      >
        <Upload className="ico" />
        <b>Toque para escolher ou arraste as fotos aqui</b>
        <small>JPG, PNG, WEBP ou HEIC do iPhone · ajustamos tamanho e posição no seu aparelho</small>
      </label>
      <input
        ref={entrada}
        id="arquivos"
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files) aoReceber(e.target.files);
          e.target.value = '';
        }}
      />
    </>
  );
}
