/**
 * localStorage com rede de proteção.
 *
 * Aba anônima do Safari, armazenamento cheio ou bloqueado: o acesso
 * lança exceção. Nenhuma tela pode quebrar por causa disso, então tudo
 * passa por aqui e, na falha, segue com o valor padrão.
 */
export const guardado = {
  ler<T>(chave: string, padrao: T): T {
    try {
      const v = localStorage.getItem('campuni:' + chave);
      return v ? (JSON.parse(v) as T) : padrao;
    } catch {
      return padrao;
    }
  },
  gravar(chave: string, valor: unknown): void {
    try {
      if (valor === null || valor === undefined) localStorage.removeItem('campuni:' + chave);
      else localStorage.setItem('campuni:' + chave, JSON.stringify(valor));
    } catch {
      /* sem armazenamento: segue sem lembrar */
    }
  },
};

export const movimentoReduzido = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
