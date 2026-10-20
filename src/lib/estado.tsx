import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

import { registrarCurtida } from './dados';
import { guardado } from './guardado';

/**
 * Estado que atravessa o site: salvos, aviso rápido (recado) e tema.
 * Pouco, de propósito. Filtros moram na URL; publicações, nas páginas.
 */

interface Estado {
  salvos: Set<string>;
  alternarSalvo: (id: string) => boolean;
  recado: (texto: string) => void;
  textoRecado: string | null;
  alternarTema: () => void;
}

const Contexto = createContext<Estado | null>(null);

export function ProvedorEstado({ children }: { children: ReactNode }) {
  const [salvos, setSalvos] = useState(() => new Set(guardado.ler<string[]>('salvos', [])));
  const [textoRecado, setTextoRecado] = useState<string | null>(null);
  const tempo = useRef<number>(0);
  const salvosRef = useRef(salvos);

  const recado = useCallback((texto: string) => {
    setTextoRecado(texto);
    window.clearTimeout(tempo.current);
    tempo.current = window.setTimeout(() => setTextoRecado(null), 2600);
  }, []);

  const alternarSalvo = useCallback(
    (id: string) => {
      const novo = new Set(salvosRef.current);
      const ligado = !novo.has(id);
      if (ligado) novo.add(id);
      else novo.delete(id);
      salvosRef.current = novo;
      setSalvos(novo);
      guardado.gravar('salvos', [...novo]);
      registrarCurtida(id, ligado);
      recado(ligado ? 'Salvo nos seus favoritos' : 'Removido dos salvos');
      return ligado;
    },
    [recado],
  );

  const alternarTema = useCallback(() => {
    const raiz = document.documentElement;
    const escuroAgora = raiz.dataset.theme
      ? raiz.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const novo = escuroAgora ? 'light' : 'dark';
    raiz.dataset.theme = novo;
    // Lido cru pelo script do index.html, antes do React, para não piscar.
    try {
      localStorage.setItem('campuni:tema', novo);
    } catch {
      /* sem armazenamento */
    }
  }, []);

  const valor = useMemo(
    () => ({ salvos, alternarSalvo, recado, textoRecado, alternarTema }),
    [salvos, alternarSalvo, recado, textoRecado, alternarTema],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useEstado(): Estado {
  const v = useContext(Contexto);
  if (!v) throw new Error('useEstado fora do ProvedorEstado');
  return v;
}
