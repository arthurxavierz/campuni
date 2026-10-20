import { CheckCircle2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';

import { SITE } from '../lib/site';
import { Gaveta } from './Gaveta';

/**
 * Vídeo explicativo.
 *
 * Com VITE_VIDEO_URL configurada, a capa abre o vídeo de verdade
 * (YouTube ou arquivo .mp4). Sem ela, abre um roteiro animado do próprio
 * site em três passos, para a seção nunca ficar com um player vazio
 * enquanto o vídeo oficial não é gravado.
 */

const ROTEIRO = [
  { titulo: 'Encontre', texto: 'Filtre por categoria, cidade e se a pessoa oferece ou procura.' },
  { titulo: 'Publique', texto: 'Tipo, título, preço e fotos. O anúncio fica pronto em 2 minutos.' },
  { titulo: 'Converse', texto: 'O interessado chama no WhatsApp com o anúncio já na mensagem.' },
];

function idYoutube(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export function Celular({ passo }: { passo?: number }) {
  const fixo = passo !== undefined;
  const estilo = (i: number) => (fixo ? { animation: 'none', opacity: i === passo ? 1 : 0, transition: 'opacity .4s' } : undefined);
  return (
    <div className="celular" aria-hidden="true">
      <div className="tela">
        <div className="cena" style={estilo(0)}>
          <div className="t forte" />
          <div className="t curta" />
          <div className="mini-grade"><span /><span /><span /><span /></div>
          <div className="legenda">1 · Encontre</div>
        </div>
        <div className="cena" style={estilo(1)}>
          <div className="t forte" />
          <div className="bloco foto-c" />
          <div className="t" />
          <div className="t curta" />
          <div className="bot" />
          <div className="legenda">2 · Publique</div>
        </div>
        <div className="cena" style={estilo(2)}>
          <div className="bloco foto-c" />
          <div className="t forte" />
          <div className="t curta" />
          <div className="bot whats" />
          <div className="legenda">3 · Converse</div>
        </div>
      </div>
    </div>
  );
}

export function VideoExplicativo() {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);
  const yt = SITE.videoUrl ? idYoutube(SITE.videoUrl) : null;

  useEffect(() => {
    if (!aberto || SITE.videoUrl) return;
    setPasso(0);
    const t = window.setInterval(() => setPasso((p) => (p + 1) % 3), 2600);
    return () => window.clearInterval(t);
  }, [aberto]);

  return (
    <div className="video-bloco" id="video">
      <div className="video-texto">
        <span className="rotulo">Vídeo explicativo</span>
        <h2 className="titulo-2">O Campuni em <em>1 minuto</em>.</h2>
        <p className="intro">Veja como encontrar uma oportunidade, publicar a sua e fechar negócio direto com quem está perto.</p>
        <ul>
          {ROTEIRO.map((r) => (
            <li key={r.titulo}>
              <CheckCircle2 className="ico" />
              <span><b>{r.titulo}.</b> {r.texto}</span>
            </li>
          ))}
        </ul>
      </div>
      <button className="video-capa" onClick={() => setAberto(true)} aria-label="Assistir ao vídeo explicativo">
        <Celular />
        <span className="tocar">
          <span className="circulo"><Play className="ico" fill="currentColor" /></span>
          Assistir
        </span>
        <span className="duracao">1:00</span>
      </button>

      <Gaveta aberta={aberto} aoFechar={() => setAberto(false)} titulo="Como funciona o Campuni">
        {SITE.videoUrl ? (
          <div className="player">
            {yt ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
                title="Vídeo explicativo do Campuni"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={SITE.videoUrl} controls autoPlay playsInline />
            )}
          </div>
        ) : (
          <div className="demo-roteiro">
            <Celular passo={passo} />
            <ol>
              {ROTEIRO.map((r, i) => (
                <li key={r.titulo} className={i === passo ? 'on' : ''}>
                  <b>{i + 1}. {r.titulo}</b>
                  {r.texto}
                </li>
              ))}
            </ol>
          </div>
        )}
      </Gaveta>
    </div>
  );
}
