/**
 * Dados institucionais do Campuni.
 *
 * Ficam num arquivo só porque aparecem em muitos lugares: cabeçalho,
 * rodapé, contato, link do WhatsApp e mensagens de compartilhamento.
 * Mudar o telefone aqui muda em todo o site.
 *
 * ATENÇÃO ANTES DE ENTREGAR: telefone, e-mail e Instagram abaixo são
 * provisórios. A lista do que conferir com o Campuni está em
 * DADOS-CAMPUNI.md.
 */

const env = import.meta.env;

export const SITE = {
  nome: 'Campuni',
  descricao: 'Ofertas e demandas do agro por categoria, região e validade.',
  tagline: 'Oportunidades que aproximam o campo.',
  apoio:
    'Tudo que está sendo oferecido e procurado no agro da sua região, organizado em um só lugar.',

  url: (env.VITE_SITE_URL as string | undefined) ?? 'https://campuni.achillesmedia.com.br',
  whatsapp: (env.VITE_WHATSAPP as string | undefined) ?? '5534900000000',
  email: (env.VITE_EMAIL as string | undefined) ?? 'contato@campuni.com.br',
  instagram: (env.VITE_INSTAGRAM as string | undefined) ?? '',
  videoUrl: (env.VITE_VIDEO_URL as string | undefined) ?? '',

  horario: 'Atendimento de segunda a sábado, das 7h às 19h. Publicações a qualquer hora.',
  abrangencia: 'Feito no interior de Minas Gerais, aberto ao agro de todo o Brasil.',
} as const;

/** Quem desenvolveu. Aparece discreto na última linha do rodapé. */
export const AUTORIA = {
  nome: 'Achilles',
  arroba: '@achilles.mediaz',
  url: 'https://instagram.com/achilles.mediaz',
} as const;

/** "(34) 90000-0000" a partir do número cru do WhatsApp. */
export function telefoneVisivel(numero: string = SITE.whatsapp): string {
  const d = numero.replace(/\D/g, '').replace(/^55/, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return numero;
}

/** Link do WhatsApp com a mensagem já escrita. Sem número, abre a escolha de contato. */
export function linkWhatsApp(mensagem?: string, numero: string = SITE.whatsapp): string {
  const texto = encodeURIComponent(
    mensagem ?? `Olá! Vim pelo site do ${SITE.nome} e gostaria de mais informações.`,
  );
  const n = numero.replace(/\D/g, '');
  return n ? `https://wa.me/${n.startsWith('55') ? n : '55' + n}?text=${texto}` : `https://wa.me/?text=${texto}`;
}

export const NAVEGACAO = [
  { rotulo: 'Explorar', href: '/' },
  { rotulo: 'Em alta', href: '/em-alta' },
  { rotulo: 'Em destaque', href: '/em-destaque' },
  { rotulo: 'Como funciona', href: '/como-funciona' },
] as const;

export const RODAPE_COLUNAS = [
  {
    titulo: 'Campuni',
    itens: [
      { rotulo: 'Sobre o Campuni', href: '/sobre' },
      { rotulo: 'Como funciona', href: '/como-funciona' },
      { rotulo: 'Vídeo explicativo', href: '/como-funciona#video' },
      { rotulo: 'Fale conosco', href: '/contato' },
    ],
  },
  {
    titulo: 'Explorar',
    itens: [
      { rotulo: 'Quem oferece', href: '/?tipo=oferta' },
      { rotulo: 'Quem procura', href: '/?tipo=procura' },
      { rotulo: 'Em alta', href: '/em-alta' },
      { rotulo: 'Perfis em destaque', href: '/em-destaque' },
      { rotulo: 'Meus salvos', href: '/salvos' },
    ],
  },
  {
    titulo: 'Para anunciar',
    itens: [
      { rotulo: 'Publicar grátis', href: '/publicar' },
      { rotulo: 'Dicas para um bom anúncio', href: '/como-funciona#dicas' },
      { rotulo: 'Negociação segura', href: '/como-funciona#seguranca' },
      { rotulo: 'Perguntas frequentes', href: '/como-funciona#perguntas' },
    ],
  },
] as const;
