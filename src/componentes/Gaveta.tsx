import { X } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Gaveta: sobe de baixo no celular (arrasta para fechar) e vira painel
 * lateral ou janela central no computador, conforme `jeito`.
 *
 * Fica montada fechada para a animação de saída acontecer; o conteúdo
 * só é renderizado enquanto aberta ou saindo.
 */
interface Props {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  jeito?: 'lateral' | 'central';
  rodape?: ReactNode;
  children: ReactNode;
}

export function Gaveta({ aberta, aoFechar, titulo, jeito = 'central', rodape, children }: Props) {
  const [montada, setMontada] = useState(aberta);
  const [visivel, setVisivel] = useState(false);
  const painel = useRef<HTMLDivElement>(null);
  const fechar = useRef<HTMLButtonElement>(null);
  const arraste = useRef<{ y: number; dy: number } | null>(null);
  const aoFecharRef = useRef(aoFechar);
  aoFecharRef.current = aoFechar;

  useEffect(() => {
    if (aberta) {
      setMontada(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setVisivel(true)));
      document.body.classList.add('travado');
      const anterior = document.activeElement as HTMLElement | null;
      const foco = window.setTimeout(() => fechar.current?.focus({ preventScroll: true }), 80);
      const tecla = (e: KeyboardEvent) => e.key === 'Escape' && aoFecharRef.current();
      document.addEventListener('keydown', tecla);
      return () => {
        cancelAnimationFrame(id);
        window.clearTimeout(foco);
        document.removeEventListener('keydown', tecla);
        document.body.classList.remove('travado');
        anterior?.focus?.({ preventScroll: true });
      };
    }
    setVisivel(false);
    const t = window.setTimeout(() => setMontada(false), 450);
    return () => window.clearTimeout(t);
  }, [aberta]);

  if (!montada) return null;

  const inicio = (e: React.TouchEvent) => {
    if (window.innerWidth > 820) return;
    arraste.current = { y: e.touches[0].clientY, dy: 0 };
    if (painel.current) painel.current.style.transition = 'none';
  };
  const mover = (e: React.TouchEvent) => {
    if (!arraste.current || !painel.current) return;
    arraste.current.dy = Math.max(0, e.touches[0].clientY - arraste.current.y);
    painel.current.style.transform = `translateY(${arraste.current.dy}px)`;
  };
  const soltar = () => {
    if (!arraste.current || !painel.current) return;
    painel.current.style.transition = '';
    painel.current.style.transform = '';
    if (arraste.current.dy > 110) aoFechar();
    arraste.current = null;
  };

  return (
    <div className={`gaveta-raiz ${jeito}${visivel ? ' aberta' : ''}`} role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="veu" onClick={aoFechar} />
      <div className="gaveta" ref={painel}>
        <div className="alca" onTouchStart={inicio} onTouchMove={mover} onTouchEnd={soltar} />
        <div className="gaveta-topo" onTouchStart={inicio} onTouchMove={mover} onTouchEnd={soltar}>
          <h2>{titulo}</h2>
          <button ref={fechar} className="btn-icone" onClick={aoFechar} aria-label="Fechar">
            <X className="ico" />
          </button>
        </div>
        <div className="gaveta-corpo">{children}</div>
        {rodape && <div className="gaveta-pe">{rodape}</div>}
      </div>
    </div>
  );
}
