import { HeartHandshake, MapPinned, Sprout, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Contador } from '../componentes/Contador';
import { VideoExplicativo } from '../componentes/VideoExplicativo';
import { listarPublicacoes } from '../lib/dados';
import { SITE } from '../lib/site';
import type { Publicacao } from '../lib/tipos';

/**
 * Sobre o Campuni.
 *
 * O texto institucional abaixo é uma proposta para o protótipo. A
 * história real (quem criou, quando e por quê) precisa vir do Campuni:
 * está listada em DADOS-CAMPUNI.md.
 */

const VALORES = [
  { icone: MapPinned, titulo: 'Perto de quem produz', texto: 'O que interessa ao agro está a poucas dezenas de quilômetros: o vizinho que vende, a revenda da cidade, o prestador da região. O Campuni organiza isso por cidade e estado.' },
  { icone: HeartHandshake, titulo: 'Negócio direto', texto: 'Sem comissão e sem intermediário. A plataforma aproxima, e quem combina preço, prazo e entrega são as partes.' },
  { icone: Zap, titulo: 'Leve no campo', texto: 'Pensado para o celular e para o sinal fraco: fotos otimizadas, páginas que abrem rápido e nada que precise instalar.' },
  { icone: Sprout, titulo: 'Para todo o agro', texto: 'Insumos, máquinas, drones, pecuária, serviços, profissionais, irrigação, análises. Quem oferece e quem procura, no mesmo lugar.' },
];

export function Sobre() {
  const [pubs, setPubs] = useState<Publicacao[]>([]);
  useEffect(() => {
    document.title = 'Sobre o Campuni';
    listarPublicacoes().then(setPubs, () => undefined);
  }, []);
  const cidades = new Set(pubs.map((p) => p.cidade)).size;
  const estados = new Set(pubs.map((p) => p.uf)).size;

  return (
    <>
      <div className="container pagina-topo">
        <span className="rotulo">Quem somos</span>
        <h1>O agro da sua região, <em>mais perto de você</em>.</h1>
      </div>

      <section className="secao" style={{ paddingTop: 32 }}>
        <div className="container duas-colunas">
          <div className="prosa">
            <p style={{ fontSize: 18, color: 'var(--tinta)', fontWeight: 600, marginTop: 0 }}>
              O Campuni nasceu no interior de Minas Gerais, de uma pergunta simples: por que é tão difícil saber o que está sendo oferecido e procurado no agro ali do lado?
            </p>
            <p>
              Hoje essa informação vive espalhada em grupos de WhatsApp, cartazes na revenda, indicação de conhecido e anúncio que some no meio de mil mensagens. Quem tem um serviço de drone não acha o produtor que precisa dele. Quem procura tratorista para a safra pergunta para dez pessoas.
            </p>
            <h2>O que o Campuni faz</h2>
            <p>
              Junta ofertas e demandas do agro num só lugar, organizadas por categoria, região e validade. Publicar é grátis. Encontrar é rápido. E a conversa acontece onde o produtor já está: no WhatsApp.
            </p>
            <h2>Para quem é</h2>
            <p>
              Produtor rural, pecuarista, prestador de serviço, revenda, cooperativa, técnico, consultor e quem precisa contratar. {SITE.abrangencia}
            </p>
          </div>
          <div className="valores">
            {VALORES.map((v) => (
              <div key={v.titulo}>
                <span className="ico-caixa"><v.icone className="ico" /></span>
                <span><b>{v.titulo}</b><p>{v.texto}</p></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="secao tom">
        <div className="container">
          <div className="numeros">
            <div><Contador valor={pubs.length} /><span>oportunidades no ar</span></div>
            <div><Contador valor={cidades} /><span>cidades</span></div>
            <div><Contador valor={estados} /><span>estados</span></div>
            <div><Contador valor={16} /><span>categorias</span></div>
          </div>
        </div>
      </section>

      <section className="secao">
        <div className="container"><VideoExplicativo /></div>
      </section>

      <section className="container">
        <div className="faixa-cta">
          <div>
            <h2>Faça parte do agro conectado da sua região.</h2>
            <p>Publique o que você oferece ou procura. Leva 2 minutos e não custa nada.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/publicar" className="btn btn-g">Publicar grátis</Link>
          </div>
        </div>
      </section>
    </>
  );
}
