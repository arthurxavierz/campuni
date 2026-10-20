import { ArrowRight, Plus, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { movimentoReduzido } from '../lib/guardado';
import { SITE } from '../lib/site';

/**
 * Hero da página inicial.
 *
 * Mesma construção do hero da Achilles Media: tela inteira, cor forte,
 * a marca se montando em partículas de luz que convergem de todos os
 * lados, rede entre vizinhos, poeira subindo, varredura de luz e
 * paralaxe com o mouse. Aqui a marca é o broto do Campuni nascendo do
 * sulco, e por baixo corre a lavoura em perspectiva.
 *
 * O desenho é feito em código (Path2D), não por imagem: nada para
 * baixar, e o contorno fica nítido em qualquer tela.
 */

interface Props {
  busca: string;
  aoDigitar: (v: string) => void;
  aoBuscar: (termo?: string) => void;
  total: number | null;
  cidades: number | null;
}

const SUGESTOES = ['drone', 'calcário', 'novilhas', 'tratorista', 'pivô'];

export function HeroCampuni({ busca, aoDigitar, aoBuscar, total, cidades }: Props) {
  const palavras = 'Oportunidades que aproximam o campo.'.split(' ');
  const [entrou, setEntrou] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setEntrou(true), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section className="hero-c" aria-labelledby="hero-titulo">
      <div className="hero-c-sombra" aria-hidden="true" />
      <Particulas />
      <div className="hero-c-marca" aria-hidden="true">CAMPUNI</div>
      <div className="container hero-c-dentro">
        <div className="hero-c-texto">
          <span className="sobrelinha hero-entra" style={{ ['--atraso' as string]: '60ms' }}>
            <i className="pulso" />O agro acontece perto de você
          </span>
          <h1 id="hero-titulo" className={'dividido' + (entrou ? ' dentro' : '')} aria-label={SITE.tagline}>
            {palavras.map((p, i) => (
              <span key={i} className="pal" aria-hidden="true">
                <span style={{ transitionDelay: `${160 + i * 90}ms` }} className={p === 'campo.' ? 'destaque' : undefined}>{p}</span>
              </span>
            ))}
          </h1>
          <p className="apoio hero-entra" style={{ ['--atraso' as string]: '700ms' }}>
            {SITE.apoio} Publique em 2 minutos, sem pagar nada, e receba o contato direto no WhatsApp.
          </p>
          <form
            className="busca hero-entra"
            style={{ ['--atraso' as string]: '840ms' }}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              aoBuscar();
            }}
          >
            <Search className="ico" />
            <label className="sr" htmlFor="busca">Buscar oportunidades</label>
            <input id="busca" type="search" value={busca} onChange={(e) => aoDigitar(e.target.value)} placeholder="Drone, calcário, novilhas, tratorista…" autoComplete="off" />
            <button className="btn btn-primario btn-p">Buscar</button>
          </form>
          <div className="busca-sugestoes hero-entra" style={{ ['--atraso' as string]: '920ms' }}>
            <span>Buscados agora:</span>
            {SUGESTOES.map((s) => (
              <button key={s} type="button" onClick={() => aoBuscar(s)}>{s}</button>
            ))}
          </div>
          <div className="hero-acoes hero-entra" style={{ ['--atraso' as string]: '1000ms' }}>
            <Link to="/publicar" className="btn btn-ouro btn-g"><Plus className="ico" /> Publicar oportunidade</Link>
            <Link to="/como-funciona" className="btn btn-vidro btn-g">Como funciona <ArrowRight className="ico" /></Link>
          </div>
          <ul className="hero-razao hero-entra" style={{ ['--atraso' as string]: '1120ms' }}>
            <li><b className="num">{total ?? '–'}</b> oportunidades ativas</li>
            <li><b className="num">{cidades ?? '–'}</b> cidades</li>
            <li>Publicar é grátis</li>
            <li>Contato direto no WhatsApp</li>
          </ul>
        </div>
      </div>
      <a href="#resultados" className="hero-rolar" aria-label="Ver oportunidades"><span>ROLE</span><i /></a>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Desenha o símbolo (broto + sulcos) num canvas de 400×400 para amostrar. */
function desenharSimbolo(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 400;
  c.height = 400;
  const x = c.getContext('2d')!;
  x.fillStyle = '#fff';
  x.strokeStyle = '#fff';
  x.lineCap = 'round';
  // folha maior, à direita
  x.fill(new Path2D('M200 250 C178 190 190 120 300 70 C318 160 278 222 200 250Z'));
  // folha menor, à esquerda
  x.fill(new Path2D('M196 256 C168 214 120 200 72 214 C98 262 150 276 196 256Z'));
  // caule
  x.lineWidth = 13;
  x.stroke(new Path2D('M200 252 C200 280 198 300 196 330'));
  // sulcos da lavoura
  x.lineWidth = 12;
  x.stroke(new Path2D('M40 330 Q200 288 360 330'));
  x.lineWidth = 9;
  x.stroke(new Path2D('M70 366 Q200 334 330 366'));
  x.lineWidth = 7;
  x.stroke(new Path2D('M110 394 Q200 372 290 394'));
  return c;
}

function bolinha(r: number, g: number, b: number): HTMLCanvasElement {
  const s = 32;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d')!;
  const gr = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.4, `rgba(${r},${g},${b},.85)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, s, s);
  return c;
}

interface Particula {
  tx: number; ty: number; sx: number; sy: number; px: number; py: number; ny: number;
  r: number; brilho: boolean; cor: 0 | 1 | 2; fase: number; vel: number; amp: number; prof: number; a: number; atraso: number;
}
interface Poeira { x: number; y: number; vx: number; vy: number; r: number; base: number; tw: number; tws: number; sp: number; ss: number; sa: number }

function Particulas() {
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = tela.current;
    const ctx = canvas?.getContext('2d');
    const hero = canvas?.parentElement;
    if (!canvas || !ctx || !hero) return;

    const reduzido = movimentoReduzido();
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const sprites = [bolinha(255, 255, 255), bolinha(255, 236, 180), bolinha(230, 174, 69)];
    const halo = bolinha(255, 248, 210);
    const nucleos = navigator.hardwareConcurrency || 4;
    const nivel = reduzido ? 'reduzido' : nucleos >= 8 && innerWidth >= 1200 ? 'alto' : nucleos >= 4 && innerWidth >= 768 ? 'medio' : 'baixo';
    const CFG = {
      alto: { teto: 2600, poeira: 120, arestas: 1200, forma: 2.2, espalha: 0.9 },
      medio: { teto: 1900, poeira: 90, arestas: 800, forma: 1.9, espalha: 0.7 },
      baixo: { teto: 1100, poeira: 50, arestas: 420, forma: 1.6, espalha: 0.5 },
      reduzido: { teto: 1100, poeira: 30, arestas: 0, forma: 0.01, espalha: 0 },
    }[nivel];

    let W = 0, H = 0, inicio = 0, visivel = true, quadro = 0;
    let mx = 0, my = 0, tmx = 0, tmy = 0;
    let parts: Particula[] = [];
    let poeira: Poeira[] = [];
    let arestas: [number, number, number][] = [];
    let caixa = { largo: true, h: 0, cx: 0, cy: 0, alfa: 1 };
    const simbolo = desenharSimbolo();

    const montar = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width;
      H = r.height;
      if (!W || !H) return;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      inicio = 0;

      const largo = W > 1000;
      caixa = largo
        ? { largo, h: Math.min(H * 0.78, W * 0.42), cx: W * 0.74, cy: H * 0.5, alfa: 1 }
        : { largo, h: Math.min(W * 0.95, H * 0.5), cx: W * 0.72, cy: H * 0.3, alfa: 0.42 };

      poeira = Array.from({ length: CFG.poeira }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12, vy: -(0.04 + Math.random() * 0.15),
        r: Math.random() * 1.4 + 0.6, base: Math.random() * 0.35 + 0.12,
        tw: Math.random() * 6.28, tws: Math.random() * 0.8 + 0.3,
        sp: Math.random() * 6.28, ss: Math.random() * 0.3 + 0.12, sa: Math.random() * 18 + 8,
      }));

      const amostra = largo ? 300 : 200;
      const off = document.createElement('canvas');
      off.width = off.height = amostra;
      const o = off.getContext('2d')!;
      o.drawImage(simbolo, 0, 0, amostra, amostra);
      const dados = o.getImageData(0, 0, amostra, amostra).data;
      const escala = caixa.h / amostra;
      const ox = caixa.cx - (amostra * escala) / 2;
      const oy = caixa.cy - (amostra * escala) / 2;

      const coletar = (passo: number) => {
        const achados: { x: number; y: number; a: number }[] = [];
        for (let y = 0; y < amostra; y += passo)
          for (let x = 0; x < amostra; x += passo) {
            const a = dados[(y * amostra + x) * 4 + 3];
            if (a > 90) achados.push({ x, y, a: a / 255 });
          }
        return achados;
      };
      let passo = 1;
      let pts = coletar(passo);
      while (pts.length > CFG.teto) pts = coletar(++passo);
      const vao = passo * escala;
      const raioBase = Math.max(0.8, vao * (largo ? 0.34 : 0.3));

      parts = pts.map((p) => {
        const brilho = Math.random() < 0.04;
        const tx = ox + p.x * escala + (Math.random() - 0.5) * vao * 0.35;
        const ty = oy + p.y * escala + (Math.random() - 0.5) * vao * 0.35;
        const ang = Math.random() * Math.PI * 2;
        const dist = Math.random() * Math.max(W, H) * 0.55 + 80;
        const sx = tx + Math.cos(ang) * dist;
        const sy = ty + Math.sin(ang) * dist;
        // as folhas puxam para o dourado, o sulco fica em luz branca
        const cor: 0 | 1 | 2 = p.y < amostra * 0.66 ? (Math.random() < 0.35 ? 2 : 1) : Math.random() < 0.2 ? 1 : 0;
        return {
          tx, ty, sx, sy, px: sx, py: sy, ny: p.y / amostra,
          r: raioBase * (brilho ? 1.9 : 0.8 + Math.random() * 0.4), brilho, cor,
          fase: Math.random() * 6.28, vel: Math.random() * 0.34 + 0.22, amp: Math.random() * 1.1 + 0.4,
          prof: Math.random() * 0.6 + 0.3, a: p.a, atraso: Math.random() * CFG.espalha,
        };
      });
      for (let i = parts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [parts[i], parts[j]] = [parts[j], parts[i]];
      }
      ligar(parts.slice(0, CFG.arestas), Math.max(vao * 3.2, largo ? 26 : 20));
      desenhar(performance.now());
    };

    /** Rede entre vizinhos por grade espacial: O(n). */
    const ligar = (lista: Particula[], maxD: number) => {
      arestas = [];
      if (!CFG.arestas) return;
      const grade = new Map<string, number[]>();
      const k = (x: number, y: number) => x + ',' + y;
      lista.forEach((p, i) => {
        const chave = k(Math.floor(p.tx / maxD), Math.floor(p.ty / maxD));
        const b = grade.get(chave);
        if (b) b.push(i);
        else grade.set(chave, [i]);
      });
      const max2 = maxD * maxD;
      for (let a = 0; a < lista.length; a++) {
        const gx = Math.floor(lista[a].tx / maxD);
        const gy = Math.floor(lista[a].ty / maxD);
        let achou = 0;
        for (let dy = -1; dy <= 1 && achou < 3; dy++)
          for (let dx = -1; dx <= 1 && achou < 3; dx++) {
            for (const b of grade.get(k(gx + dx, gy + dy)) ?? []) {
              if (b <= a) continue;
              const ddx = lista[a].tx - lista[b].tx;
              const ddy = lista[a].ty - lista[b].ty;
              const d2 = ddx * ddx + ddy * ddy;
              if (d2 < max2) {
                arestas.push([a, b, Math.min(3, Math.floor((Math.sqrt(d2) / maxD) * 4))]);
                if (++achou >= 3) break;
              }
            }
          }
      }
    };

    const desenhar = (agora: number) => {
      if (!inicio) inicio = agora;
      const dec = (agora - inicio) / 1000;
      const t = agora / 1000;
      ctx.clearRect(0, 0, W, H);
      const pxs = mx * 12, pys = my * 12;
      const balanco = Math.sin(t * 0.5) * (caixa.largo ? 14 : 8);
      const pulso = 1 + Math.sin(t * 0.6) * 0.004;
      const formado = Math.min(1, dec / (CFG.forma + CFG.espalha));

      const hr = caixa.h * 0.66;
      ctx.globalAlpha = 0.4 * formado * caixa.alfa;
      ctx.drawImage(halo, caixa.cx - hr + pxs * 0.3, caixa.cy - hr + balanco, hr * 2, hr * 2);

      for (const m of poeira) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < -10) m.x = W + 10;
        else if (m.x > W + 10) m.x = -10;
        if (m.y < -10) {
          m.y = H + 10;
          m.x = Math.random() * W;
        }
        const ginga = Math.sin(t * m.ss + m.sp) * m.sa;
        ctx.globalAlpha = m.base * (0.6 + Math.sin(t * m.tws + m.tw) * 0.4);
        const mr = m.r * 1.6;
        ctx.drawImage(sprites[0], m.x + ginga + pxs * 0.4 - mr, m.y + pys * 0.4 - mr, mr * 2, mr * 2);
      }

      const varre = dec > CFG.forma + 1.2 ? ((dec - CFG.forma - 1.2) % 5.5) / 4 : -1;
      for (const q of parts) {
        const bruto = (dec - q.atraso) / CFG.forma;
        const prog = bruto < 0 ? 0 : bruto > 1 ? 1 : bruto;
        const suave = 1 - Math.pow(1 - prog, 4);
        const ttx = caixa.cx + (q.tx - caixa.cx) * pulso + Math.cos(t * q.vel + q.fase) * q.amp + pxs * q.prof;
        const tty = caixa.cy + (q.ty - caixa.cy) * pulso + Math.sin(t * q.vel + q.fase) * q.amp + pys * q.prof + balanco;
        q.px = q.sx + (ttx - q.sx) * suave;
        q.py = q.sy + (tty - q.sy) * suave;
        if (suave <= 0.01) continue;
        let a = (0.4 + 0.52 * q.a) * suave;
        let r = q.r;
        if (varre >= 0 && varre <= 1) {
          const d = Math.abs(q.ny - varre);
          if (d < 0.07) {
            const f = 1 - d / 0.07;
            a += f * 0.4;
            r *= 1 + f * 0.45;
          }
        }
        a *= caixa.alfa;
        if (q.brilho) {
          ctx.globalAlpha = 0.18 * suave * caixa.alfa;
          const gr = r * 4.2;
          ctx.drawImage(halo, q.px - gr, q.py - gr, gr * 2, gr * 2);
        }
        ctx.globalAlpha = a > 1 ? 1 : a;
        const rr = r * 1.35;
        ctx.drawImage(sprites[q.cor], q.px - rr, q.py - rr, rr * 2, rr * 2);
      }

      const visRede = Math.max(0, Math.min(1, (dec - CFG.forma * 0.5) / 1.4));
      if (visRede > 0 && arestas.length) {
        ctx.globalAlpha = 1;
        ctx.lineWidth = 0.7;
        for (let n = 0; n < 4; n++) {
          ctx.strokeStyle = `rgba(255,250,225,${((0.3 - n * 0.07) * visRede * caixa.alfa).toFixed(3)})`;
          ctx.beginPath();
          for (const [ia, ib, nv] of arestas) {
            if (nv !== n) continue;
            const pa = parts[ia];
            const pb = parts[ib];
            if (!pa || !pb) continue;
            ctx.moveTo(pa.px, pa.py);
            ctx.lineTo(pb.px, pb.py);
          }
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    };

    const ciclo = (agora: number) => {
      quadro = requestAnimationFrame(ciclo);
      if (!visivel || document.hidden) return;
      mx += (tmx - mx) * 0.045;
      my += (tmy - my) * 0.045;
      desenhar(agora);
    };

    montar();
    if (reduzido) {
      inicio = performance.now() - 99_000;
      desenhar(performance.now());
    } else quadro = requestAnimationFrame(ciclo);

    const obs = new IntersectionObserver(([e]) => (visivel = e.isIntersecting));
    obs.observe(hero);
    const mover = (ev: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      tmx = (ev.clientX - r.left) / r.width - 0.5;
      tmy = (ev.clientY - r.top) / r.height - 0.5;
    };
    const sair = () => {
      tmx = 0;
      tmy = 0;
    };
    const comMouse = !reduzido && matchMedia('(hover: hover)').matches;
    if (comMouse) {
      hero.addEventListener('mousemove', mover);
      hero.addEventListener('mouseleave', sair);
    }
    let tempo = 0;
    let ultimaLargura = innerWidth;
    const redimensionar = () => {
      // No celular a barra do navegador muda a altura ao rolar: só refaz quando a largura muda.
      if (Math.abs(innerWidth - ultimaLargura) < 2 && innerWidth < 900) return;
      ultimaLargura = innerWidth;
      window.clearTimeout(tempo);
      tempo = window.setTimeout(montar, 180);
    };
    window.addEventListener('resize', redimensionar, { passive: true });
    return () => {
      cancelAnimationFrame(quadro);
      obs.disconnect();
      window.removeEventListener('resize', redimensionar);
      if (comMouse) {
        hero.removeEventListener('mousemove', mover);
        hero.removeEventListener('mouseleave', sair);
      }
    };
  }, []);

  return <canvas ref={tela} className="hero-c-canvas" aria-hidden="true" />;
}
