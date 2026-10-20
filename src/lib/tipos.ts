export type TipoPublicacao = 'oferta' | 'procura';

export interface Publicacao {
  id: string;
  tipo: TipoPublicacao;
  categoria: string;
  titulo: string;
  descricao: string;
  /** null = preço a combinar */
  preco: number | null;
  unidade: string;
  quantidade?: string;
  cidade: string;
  uf: string;
  autor: string;
  /** Só aparece no WhatsApp. Nunca listado em texto na vitrine. */
  whatsapp?: string;
  destaque: boolean;
  curtidas: number;
  fotos: string[];
  publicadaEm: string;
  expiraEm: string;
  /** Publicações de exemplo da demonstração. */
  exemplo?: boolean;
  /** Publicada pelo próprio visitante nesta sessão. */
  minha?: boolean;
}

export interface NovaPublicacao {
  tipo: TipoPublicacao;
  categoria: string;
  titulo: string;
  descricao: string;
  preco: number | null;
  unidade: string;
  quantidade: string;
  cidade: string;
  uf: string;
  autor: string;
  whatsapp: string;
  validadeDias: number;
}

export interface FotoProcessada {
  blob: Blob;
  url: string;
  antes: number;
  depois: number;
  largura: number;
  altura: number;
}

export type Ordem = 'relevantes' | 'recentes' | 'expiram' | 'menor-preco' | 'maior-preco';
