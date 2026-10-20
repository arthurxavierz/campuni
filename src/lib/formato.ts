const DIA = 86_400_000;

export function moeda(v: number): string {
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: v % 1 ? 2 : 0,
  });
}

/** "1.250,50" ou "1250.5" -> 1250.5. Vazio ou inválido -> null. */
export function lerValor(texto: string): number | null {
  const limpo = texto.replace(/[^\d,.]/g, '');
  if (!limpo) return null;
  const n = limpo.includes(',') ? Number(limpo.replace(/\./g, '').replace(',', '.')) : Number(limpo);
  return Number.isFinite(n) ? n : null;
}

export function diasRestantes(expiraEm: string): number {
  return Math.max(0, Math.ceil((new Date(expiraEm).getTime() - Date.now()) / DIA));
}

export function rotuloValidade(dias: number): string {
  if (dias === 0) return 'expira hoje';
  if (dias === 1) return 'expira amanhã';
  return `expira em ${dias} dias`;
}

export function tempoDesde(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / DIA);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  if (dias < 30) return `há ${dias} dias`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function tamanho(bytes: number): string {
  return bytes > 1_048_576
    ? (bytes / 1_048_576).toFixed(1).replace('.', ',') + ' MB'
    : Math.max(1, Math.round(bytes / 1024)) + ' KB';
}

/** Para busca: sem acento, minúsculo. "Patrocínio" encontra "patrocinio". */
export function normalizar(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function mascaraTelefone(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  if (d.length > 6) return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return d;
}

export function iniciais(nome: string): string {
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2 || /^[A-Z]/.test(p))
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
