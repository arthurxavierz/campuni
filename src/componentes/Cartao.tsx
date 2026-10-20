import { Camera, Heart, MapPin, Share2, Star } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { nomeCategoria } from '../lib/categorias';
import { estouro } from '../lib/efeitos';
import { useEstado } from '../lib/estado';
import { diasRestantes, moeda, rotuloValidade } from '../lib/formato';
import { SITE } from '../lib/site';
import type { Publicacao } from '../lib/tipos';
import { IconeWhatsApp } from './IconesProprios';
import { Midia } from './Midia';
import { flyer } from '../demo/ilustracoes';

/** Anúncio sem foto ganha uma capa gerada com o próprio título, em vez de um quadro vazio. */
export function capaGerada(pub: Pick<Publicacao, 'titulo' | 'cidade' | 'uf' | 'tipo'>): string {
  return flyer(pub.titulo || 'Sua oportunidade', `${pub.cidade || 'Sua cidade'}/${pub.uf}`, pub.tipo === 'oferta' ? 0 : 2);
}

interface Props {
  pub: Publicacao;
  indice?: number;
  /** Prévia no formulário de publicar: sem link e sem ações. */
  previa?: boolean;
  novo?: boolean;
}

export function Preco({ pub }: { pub: Pick<Publicacao, 'preco' | 'unidade'> }) {
  return pub.preco != null ? (
    <div className="preco">
      <b>{moeda(pub.preco)}</b>
      <small>/ {pub.unidade}</small>
    </div>
  ) : (
    <div className="preco combinar">
      <b>Preço a combinar</b>
    </div>
  );
}

export function Validade({ expiraEm, total = 30 }: { expiraEm: string; total?: number }) {
  const dias = diasRestantes(expiraEm);
  const pct = Math.max(4, Math.min(100, (dias / total) * 100));
  return (
    <div className={'validade' + (dias <= 5 ? ' urgente' : '')}>
      <span className="num">{rotuloValidade(dias)}</span>
      <span className="barra"><i style={{ width: pct + '%' }} /></span>
    </div>
  );
}

export function SeloTipo({ tipo }: { tipo: Publicacao['tipo'] }) {
  return <span className={'selo ' + tipo}>{tipo === 'oferta' ? 'Ofereço' : 'Procuro'}</span>;
}

export function Cartao({ pub, indice = 0, previa, novo }: Props) {
  const { salvos, alternarSalvo, recado } = useEstado();
  const salvo = salvos.has(pub.id);
  const [pulou, setPulou] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);

  const curtir = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ligado = alternarSalvo(pub.id);
    if (ligado && botao.current) {
      estouro(botao.current);
      setPulou(false);
      requestAnimationFrame(() => setPulou(true));
    }
  };

  const compartilhar = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${SITE.url}/publicacoes/${pub.id}`;
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    try {
      if (nav.share) await nav.share({ title: pub.titulo, text: `${pub.titulo} no Campuni`, url });
      else {
        await navigator.clipboard.writeText(url);
        recado('Link copiado');
      }
    } catch {
      /* a pessoa cancelou o compartilhamento */
    }
  };

  const conteudo = (
    <>
      <Midia src={pub.fotos[0] ?? capaGerada(pub)} alt={pub.titulo} prioridade={indice < 4} estilo={previa ? undefined : { viewTransitionName: `foto-${pub.id}` }}>
        <div className="selos">
          {pub.destaque && (
            <span className="selo destaque" title="Perfil em destaque"><Star className="ico" /><span className="txt">Destaque</span></span>
          )}
          <SeloTipo tipo={pub.tipo} />
        </div>
        {pub.fotos.length > 1 && (
          <span className="contagem"><Camera className="ico" />{pub.fotos.length}</span>
        )}
      </Midia>
      <div className="corpo">
        <h3>{pub.titulo || 'Título da sua oportunidade'}</h3>
        <div className="local">
          <MapPin className="ico" />
          <span>{nomeCategoria(pub.categoria) || 'Categoria'} · {pub.cidade || 'Cidade'}/{pub.uf}</span>
        </div>
        <Preco pub={pub} />
        <Validade expiraEm={pub.expiraEm} />
        {!previa && (
          <div className="pe-cartao">
            <button ref={botao} className={'acao-cartao' + (salvo ? ' curtido' : '') + (pulou ? ' pulou' : '')} onClick={curtir} aria-pressed={salvo} aria-label={salvo ? 'Remover dos salvos' : 'Salvar'}>
              <Heart className="ico" />
              <span className="num">{pub.curtidas + (salvo ? 1 : 0)}</span>
            </button>
            <button className="acao-cartao compartilhar" onClick={compartilhar}>
              <Share2 className="ico" /> Compartilhar
            </button>
            <span className="acao-cartao whats" aria-hidden="true"><IconeWhatsApp /></span>
          </div>
        )}
      </div>
    </>
  );

  if (previa) return <article className="cartao">{conteudo}</article>;
  return (
    <Link
      to={`/publicacoes/${pub.id}`}
      viewTransition
      className={'cartao' + (novo ? ' novo' : '')}
      style={{ animationDelay: Math.min(indice, 12) * 45 + 'ms' }}
      aria-label={`${pub.tipo === 'oferta' ? 'Ofereço' : 'Procuro'}: ${pub.titulo}, ${pub.cidade}/${pub.uf}`}
    >
      {conteudo}
    </Link>
  );
}

export function GradeEsqueleto({ quantidade = 8 }: { quantidade?: number }) {
  return (
    <>
      {Array.from({ length: quantidade }, (_, i) => (
        <div key={i} className="esqueleto cartao-esqueleto" aria-hidden="true" />
      ))}
    </>
  );
}
