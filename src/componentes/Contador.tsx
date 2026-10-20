import { useEffect, useRef, useState } from 'react';

import { movimentoReduzido } from '../lib/guardado';

/** Número que sobe até o valor quando entra na tela. Começa visível no valor final para leitores e miniaturas. */
export function Contador({ valor, sufixo = '' }: { valor: number; sufixo?: string }) {
  const [mostrado, setMostrado] = useState(valor);
  const el = useRef<HTMLElement>(null);
  const feito = useRef(false);

  useEffect(() => {
    // O valor certo aparece já; a subida só toca na primeira vez que entra na tela.
    setMostrado(valor);
    if (movimentoReduzido() || !el.current || feito.current || valor === 0) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || feito.current) return;
      feito.current = true;
      const t0 = performance.now();
      const passo = (t: number) => {
        const p = Math.min(1, (t - t0) / 1000);
        setMostrado(Math.round(valor * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    });
    obs.observe(el.current);
    return () => obs.disconnect();
  }, [valor]);

  return (
    <b ref={el} className="num">
      {mostrado.toLocaleString('pt-BR')}
      {sufixo}
    </b>
  );
}
