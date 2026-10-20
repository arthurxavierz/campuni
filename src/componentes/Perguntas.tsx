import { Plus } from 'lucide-react';

export const PERGUNTAS = [
  {
    p: 'Quanto custa publicar no Campuni?',
    r: 'Nada. Publicar oferta ou procura é grátis. Você só precisa entrar com o Google ou com um código enviado ao seu e-mail, na hora de publicar.',
  },
  {
    p: 'Qual a diferença entre Ofereço e Procuro?',
    r: 'Ofereço é para quem vende um produto ou presta um serviço. Procuro é para quem quer comprar ou contratar: publique o que você precisa e deixe quem tem chamar você.',
  },
  {
    p: 'Por quanto tempo meu anúncio fica no ar?',
    r: 'Você escolhe: 7, 15, 30 ou 60 dias. A barra de validade no card mostra quanto falta. Antes de expirar, dá para renovar e o anúncio volta para o topo.',
  },
  {
    p: 'Como o interessado fala comigo?',
    r: 'Pelo WhatsApp. O botão abre a conversa com o título e o link do anúncio já escritos, então você sabe na hora do que se trata.',
  },
  {
    p: 'Minhas fotos vão aparecer cortadas?',
    r: 'Não. O Campuni ajusta cada foto no seu celular antes de enviar: corrige a posição, deixa no formato do card e mostra a imagem inteira, mesmo flyer em pé. Ainda fica até 90% mais leve.',
  },
  {
    p: 'O Campuni participa da negociação?',
    r: 'Não. O Campuni aproxima quem oferece de quem procura. Preço, entrega e pagamento são combinados direto entre as partes. Veja as dicas de negociação segura.',
  },
  {
    p: 'Vi um anúncio suspeito. O que faço?',
    r: 'Use o link "Denunciar publicação" na página do anúncio. A equipe revisa e remove o que não segue os termos de uso.',
  },
];

export function Perguntas({ limite }: { limite?: number }) {
  return (
    <div className="perguntas">
      {PERGUNTAS.slice(0, limite).map((q, i) => (
        <details key={q.p} open={i === 0}>
          <summary>
            {q.p}
            <Plus className="ico" />
          </summary>
          <p>{q.r}</p>
        </details>
      ))}
    </div>
  );
}
