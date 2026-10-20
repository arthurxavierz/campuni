import { movimentoReduzido } from './guardado';

/**
 * Pequenos efeitos que não merecem biblioteca.
 */

/** Ondulação no ponto do toque. Ligada uma vez para o documento inteiro. */
export function ligarOndulacao(): () => void {
  const aoTocar = (e: PointerEvent) => {
    if (movimentoReduzido()) return;
    const alvo = (e.target as HTMLElement).closest<HTMLElement>('.btn, .chip, .seg button, .escolha button');
    if (!alvo) return;
    const r = alvo.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const onda = document.createElement('span');
    onda.className = 'onda';
    onda.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
    alvo.appendChild(onda);
    window.setTimeout(() => onda.remove(), 650);
  };
  document.addEventListener('pointerdown', aoTocar);
  return () => document.removeEventListener('pointerdown', aoTocar);
}

/** Estouro de partículas em volta de um elemento (coração ao salvar). */
export function estouro(origem: Element, cor = 'var(--perigo)'): void {
  if (movimentoReduzido()) return;
  const r = origem.getBoundingClientRect();
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('i');
    const a = (i / 8) * Math.PI * 2;
    p.className = 'estouro';
    p.style.cssText = `left:${r.left + r.width / 2 - 3}px;top:${r.top + r.height / 2 - 3}px;--dx:${Math.cos(a) * 28}px;--dy:${Math.sin(a) * 28}px;background:${cor}`;
    document.body.appendChild(p);
    window.setTimeout(() => p.remove(), 650);
  }
}

/** Chuva de folhas e grãos ao publicar. Um canvas temporário, removido no fim. */
export function confete(): void {
  if (movimentoReduzido()) return;
  const tela = document.createElement('canvas');
  tela.className = 'confete';
  document.body.appendChild(tela);
  const dpr = window.devicePixelRatio || 1;
  tela.width = innerWidth * dpr;
  tela.height = innerHeight * dpr;
  const ctx = tela.getContext('2d');
  if (!ctx) return tela.remove();
  ctx.scale(dpr, dpr);
  const cs = getComputedStyle(document.documentElement);
  const cores = ['--colheita', '--oliva', '--oliva-2'].map((v) => cs.getPropertyValue(v).trim()).concat('#F4E3B0');
  const p = Array.from({ length: 120 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.42,
    vx: (Math.random() - 0.5) * 15,
    vy: -Math.random() * 15 - 4,
    r: Math.random() * Math.PI,
    s: 4 + Math.random() * 7,
    c: cores[Math.floor(Math.random() * cores.length)],
    folha: Math.random() < 0.55,
  }));
  let quadro = 0;
  const passo = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const q of p) {
      q.vy += 0.35;
      q.vx *= 0.99;
      q.x += q.vx;
      q.y += q.vy;
      q.r += 0.1;
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.r);
      ctx.fillStyle = q.c;
      if (q.folha) {
        ctx.beginPath();
        ctx.ellipse(0, 0, q.s, q.s / 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else ctx.fillRect(-q.s / 2, -q.s / 2, q.s, q.s / 2);
      ctx.restore();
    }
    if (++quadro < 130) requestAnimationFrame(passo);
    else tela.remove();
  };
  requestAnimationFrame(passo);
}

/** Transição de tela pelo navegador quando existe; senão, aplica direto. */
export function transicao(fn: () => void): void {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !movimentoReduzido()) doc.startViewTransition(fn);
  else fn();
}
