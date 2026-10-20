import { BadgeCheck, Camera, Eye, FileText, HandCoins, MapPin, MessageCircle, Search, ShieldCheck, Timer, Truck, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Perguntas } from '../componentes/Perguntas';
import { VideoExplicativo } from '../componentes/VideoExplicativo';

const JORNADAS = {
  oferta: {
    titulo: 'Para quem oferece',
    passos: [
      ['Monte o anúncio', 'Escolha Ofereço, a categoria e escreva um título que diga o que é, quanto e onde. Ex.: "Calcário dolomítico, PRNT 90%, entregue até 120 km".'],
      ['Mostre de verdade', 'Até 6 fotos. O Campuni ajusta cada uma no seu celular: nenhuma aparece cortada, e o anúncio abre rápido mesmo no 4G.'],
      ['Receba os contatos', 'Quem se interessa chama no seu WhatsApp com o título e o link do anúncio. Você sabe na hora do que se trata.'],
    ],
  },
  procura: {
    titulo: 'Para quem procura',
    passos: [
      ['Busque perto de você', 'Filtre por categoria, estado e período. Salve no coração o que quiser comparar depois.'],
      ['Não achou? Publique', 'Escolha Procuro e diga o que precisa, para quando e quanto pretende pagar. Quem tem vai até você.'],
      ['Combine direto', 'Converse pelo WhatsApp com quem anunciou. Sem comissão, sem intermediário.'],
    ],
  },
} as const;

const DICAS = [
  { icone: FileText, titulo: 'Título que responde', texto: 'O quê, quanto e onde. "Novilhas Nelore, 40 cabeças, ~14 @" chama mais que "Vendo gado".' },
  { icone: Wallet, titulo: 'Preço com unidade', texto: 'Por @, por saca de 60 kg, por hectare, por diária. Quem compra no agro compara assim.' },
  { icone: Camera, titulo: 'Foto na luz do dia', texto: 'A primeira foto é a capa. Mostre o produto inteiro, de frente, sem contraluz.' },
  { icone: MapPin, titulo: 'Cidade certa', texto: 'Quem busca filtra por região. Informe onde está o produto ou onde o serviço é prestado.' },
  { icone: Timer, titulo: 'Validade honesta', texto: 'Escolha um prazo que você consegue atender. Anúncio vencido some da busca sozinho.' },
  { icone: BadgeCheck, titulo: 'Descrição completa', texto: 'Condições, frete, documentação (GTA, nota, laudo). Menos perguntas, negócio mais rápido.' },
];

const SEGURANCA = [
  { icone: Eye, titulo: 'Veja antes de pagar', texto: 'Sempre que possível, confira o produto, o animal ou a máquina pessoalmente ou por vídeo chamada.' },
  { icone: FileText, titulo: 'Tudo por escrito', texto: 'Preço, prazo, frete e forma de pagamento combinados na conversa ou num pedido simples.' },
  { icone: ShieldCheck, titulo: 'Desconfie de pressa', texto: 'Preço muito abaixo do mercado e pedido de sinal urgente são os sinais mais comuns de golpe.' },
  { icone: Truck, titulo: 'Documentação em dia', texto: 'Gado com GTA, insumo com nota fiscal, máquina com procedência. Peça antes de fechar.' },
  { icone: HandCoins, titulo: 'Pagamento rastreável', texto: 'Prefira transferência para conta no nome de quem vende. Evite pagar para terceiros.' },
  { icone: MessageCircle, titulo: 'Denuncie', texto: 'Viu algo estranho? Use "Denunciar publicação". A equipe revisa e remove o que não segue os termos.' },
];

export function ComoFunciona() {
  const [aba, setAba] = useState<'oferta' | 'procura'>('oferta');
  useEffect(() => {
    document.title = 'Como funciona · Campuni';
  }, []);
  const j = JORNADAS[aba];
  return (
    <>
      <div className="container pagina-topo">
        <span className="rotulo">Como funciona</span>
        <h1>Simples para quem anuncia, <em>rápido</em> para quem procura.</h1>
        <p className="intro">O Campuni junta num só lugar o que está sendo oferecido e procurado no agro da sua região. Você publica grátis, e a conversa acontece direto no WhatsApp.</p>
      </div>

      <section className="secao" style={{ paddingTop: 32 }}>
        <div className="container">
          <div className="abas" role="tablist" aria-label="Jornada">
            <button role="tab" aria-selected={aba === 'oferta'} onClick={() => setAba('oferta')}><HandCoins size={15} style={{ verticalAlign: '-2px' }} /> Quero oferecer</button>
            <button role="tab" aria-selected={aba === 'procura'} onClick={() => setAba('procura')}><Search size={15} style={{ verticalAlign: '-2px' }} /> Quero encontrar</button>
          </div>
          <ol className="passos-3" key={aba} role="tabpanel" aria-label={j.titulo}>
            {j.passos.map(([t, x]) => (
              <li key={t} className="etapa" style={{ display: 'flex' }}><h3>{t}</h3><p>{x}</p></li>
            ))}
          </ol>
          <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to={aba === 'oferta' ? '/publicar' : '/'} className="btn btn-primario">{aba === 'oferta' ? 'Publicar minha oferta' : 'Explorar oportunidades'}</Link>
            {aba === 'procura' && <Link to="/publicar?tipo=procura" className="btn btn-contorno">Publicar o que procuro</Link>}
          </div>
        </div>
      </section>

      <section className="secao tom">
        <div className="container"><VideoExplicativo /></div>
      </section>

      <section className="secao" id="dicas">
        <div className="container">
          <div className="cabeca-secao">
            <div>
              <span className="rotulo">Dicas para anunciar</span>
              <h2 className="titulo-2">O que faz um anúncio receber contato.</h2>
            </div>
          </div>
          <div className="cartoes-3">
            {DICAS.map((d) => (
              <div key={d.titulo}><d.icone className="ico" /><h3>{d.titulo}</h3><p>{d.texto}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="secao tom" id="seguranca">
        <div className="container">
          <div className="cabeca-secao">
            <div>
              <span className="rotulo">Negociação segura</span>
              <h2 className="titulo-2">Seis cuidados antes de fechar negócio.</h2>
              <p className="intro">O Campuni aproxima as partes, mas não participa da negociação nem do pagamento. Estes cuidados evitam a maior parte dos problemas.</p>
            </div>
          </div>
          <div className="cartoes-3">
            {SEGURANCA.map((d) => (
              <div key={d.titulo}><d.icone className="ico" /><h3>{d.titulo}</h3><p>{d.texto}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="secao" id="perguntas">
        <div className="container duas-colunas">
          <div>
            <span className="rotulo">Perguntas frequentes</span>
            <h2 className="titulo-2">Tudo o que costumam perguntar.</h2>
            <p className="intro">Ainda ficou dúvida? A equipe responde pelo WhatsApp em horário comercial.</p>
            <Link to="/contato" className="btn btn-primario" style={{ marginTop: 20 }}>Fale conosco</Link>
          </div>
          <Perguntas />
        </div>
      </section>
    </>
  );
}
