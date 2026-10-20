import { useEffect, useState } from 'react';

import { movimentoReduzido } from '../lib/guardado';

/**
 * Abertura animada: o sulco é traçado, o broto nasce, o nome sobe e a
 * cortina recolhe para cima revelando o site.
 *
 * Aparece só na primeira visita da sessão. Quem navega e volta não
 * espera de novo, e quem pediu menos movimento no sistema não vê.
 * A página já está montada por baixo: a abertura cobre, não atrasa.
 */
export function Carregador() {
  const [fase, setFase] = useState<'mostrando' | 'saindo' | 'fim'>(() => {
    try {
      if (movimentoReduzido() || sessionStorage.getItem('campuni:abriu')) return 'fim';
    } catch {
      return 'fim';
    }
    return 'mostrando';
  });

  useEffect(() => {
    if (fase !== 'mostrando') return;
    try {
      sessionStorage.setItem('campuni:abriu', '1');
    } catch {
      /* sem armazenamento */
    }
    const a = window.setTimeout(() => setFase('saindo'), 1300);
    const b = window.setTimeout(() => setFase('fim'), 2100);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [fase]);

  if (fase === 'fim') return null;
  return (
    <div className={'carregador' + (fase === 'saindo' ? ' saindo' : '')} aria-hidden="true">
      <div>
        <svg viewBox="0 0 104 104">
          <path className="sulco" d="M10 84 Q52 62 94 84" />
          <path className="sulco" d="M52 94 V64" />
          <path className="sulco" d="M32 94 L43 66" />
          <path className="sulco" d="M72 94 L61 66" />
          <path className="sulco" d="M14 94 L34 70" />
          <path className="broto" d="M52 56 C43 38 50 24 68 18 C70 36 64 50 52 56Z M52 56 C46 47 35 45 26 50 C33 58 44 60 52 56Z" />
        </svg>
        <div className="nome"><span>Campuni</span></div>
        <div className="frase">o agro perto de você</div>
        <div className="progresso"><i /></div>
      </div>
    </div>
  );
}
