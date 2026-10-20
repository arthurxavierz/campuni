import { useEffect, useRef } from 'react';

import { movimentoReduzido } from '../lib/guardado';

/**
 * Fundo do hero: uma lavoura em perspectiva, com os sulcos convergindo
 * para o sol e as linhas de plantio vindo na direção de quem olha.
 * Canvas puro, pausa quando a aba sai de vista ou o hero sai da tela.
 */
export function Lavoura() {
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = tela.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    let w = 0;
    let h = 0;
    let t = 0;
    let quadro = 0;
    let visivel = true;
    const parado = movimentoReduzido();

    const medir = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const desenhar = () => {
      ctx.clearRect(0, 0, w, h);
      const hz = h * 0.16;
      const vx = w * 0.8;
      const sol = ctx.createRadialGradient(vx, hz, 0, vx, hz, w * 0.55);
      sol.addColorStop(0, 'rgba(240,190,90,.38)');
      sol.addColorStop(1, 'rgba(240,190,90,0)');
      ctx.fillStyle = sol;
      ctx.fillRect(0, 0, w, h);
      for (let i = -34; i <= 34; i++) {
        ctx.beginPath();
        ctx.moveTo(vx + i * 3, hz);
        ctx.lineTo(vx + i * 84 + Math.sin(t / 90 + i) * 2, h);
        ctx.strokeStyle = `rgba(255,255,255,${0.05 + 0.05 * Math.abs(Math.sin(i * 0.7 + t / 70))})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      for (let j = 0; j < 16; j++) {
        const p = (j / 16 + t / 1000) % 1;
        const y = hz + (h - hz) * p * p;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.strokeStyle = `rgba(255,255,255,${0.05 * p})`;
        ctx.stroke();
      }
      t++;
      if (!parado && visivel && !document.hidden) quadro = requestAnimationFrame(desenhar);
    };

    const retomar = () => {
      cancelAnimationFrame(quadro);
      if (!parado && visivel && !document.hidden) quadro = requestAnimationFrame(desenhar);
    };

    medir();
    desenhar();
    const obs = new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      retomar();
    });
    obs.observe(cv);
    const redimensionar = () => {
      medir();
      if (parado) desenhar();
    };
    window.addEventListener('resize', redimensionar);
    document.addEventListener('visibilitychange', retomar);
    return () => {
      cancelAnimationFrame(quadro);
      obs.disconnect();
      window.removeEventListener('resize', redimensionar);
      document.removeEventListener('visibilitychange', retomar);
    };
  }, []);

  return <canvas ref={tela} aria-hidden="true" />;
}
