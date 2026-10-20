import { Link } from 'react-router-dom';

import { nomeCategoria } from '../lib/categorias';
import { moeda } from '../lib/formato';
import type { Publicacao } from '../lib/tipos';

/**
 * Faixa corrida logo abaixo do hero com o que entrou por último.
 * Mostra que a plataforma está viva antes de a pessoa rolar até a grade.
 * A lista é duplicada para a volta ser contínua; a segunda cópia fica
 * escondida de leitores de tela.
 */
export function Esteira({ pubs }: { pubs: Publicacao[] }) {
  const itens = [...pubs].sort((a, b) => b.publicadaEm.localeCompare(a.publicadaEm)).slice(0, 10);
  if (itens.length < 3) return null;
  const faixa = (copia: boolean) =>
    itens.map((p) => (
      <Link key={(copia ? 'c' : '') + p.id} to={`/publicacoes/${p.id}`} className="esteira-item" tabIndex={copia ? -1 : undefined} aria-hidden={copia || undefined}>
        <span className={'selo ' + p.tipo}>{p.tipo === 'oferta' ? 'Ofereço' : 'Procuro'}</span>
        <b>{p.titulo}</b>
        <span className="esteira-apoio">{nomeCategoria(p.categoria)} · {p.cidade}/{p.uf}{p.preco != null ? ` · ${moeda(p.preco)}/${p.unidade}` : ''}</span>
      </Link>
    ));
  return (
    <section className="esteira" aria-label="Publicadas por último">
      <div className="esteira-trilho">
        {faixa(false)}
        {faixa(true)}
      </div>
    </section>
  );
}
