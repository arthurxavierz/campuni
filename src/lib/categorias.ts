/**
 * As 16 categorias do Campuni, na ordem e com os nomes que o site atual usa.
 * O slug vai na URL (?cat=drones) e no banco; o nome é o que a pessoa lê.
 */
export const CATEGORIAS = [
  { slug: 'insumos', nome: 'Insumos' },
  { slug: 'fertilizantes-e-corretivos', nome: 'Fertilizantes e corretivos' },
  { slug: 'sementes', nome: 'Sementes' },
  { slug: 'defensivos', nome: 'Defensivos' },
  { slug: 'maquinas-e-implementos', nome: 'Máquinas e implementos' },
  { slug: 'pecas-e-manutencao', nome: 'Peças e manutenção' },
  { slug: 'servicos-agricolas', nome: 'Serviços agrícolas' },
  { slug: 'drones', nome: 'Drones' },
  { slug: 'irrigacao', nome: 'Irrigação' },
  { slug: 'agricultura-de-precisao', nome: 'Agricultura de precisão' },
  { slug: 'analises', nome: 'Análises' },
  { slug: 'profissionais-e-consultoria', nome: 'Profissionais e consultoria' },
  { slug: 'pecuaria', nome: 'Pecuária' },
  { slug: 'tecnologia', nome: 'Tecnologia' },
  { slug: 'producao-rural', nome: 'Produção rural' },
  { slug: 'outros', nome: 'Outros' },
] as const;

export type SlugCategoria = (typeof CATEGORIAS)[number]['slug'];

export function nomeCategoria(slug: string): string {
  return CATEGORIAS.find((c) => c.slug === slug)?.nome ?? slug;
}

/** Unidades como o agro negocia. A arroba e a saca de 60 kg não são "kg". */
export const UNIDADES = [
  'unidade',
  'kg',
  'saca 60 kg',
  'saco 40 kg',
  '@',
  'tonelada',
  'litro',
  'hectare',
  'hora',
  'diária',
  'cabeça',
  'serviço',
] as const;

export const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA',
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;
