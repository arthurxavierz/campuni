/**
 * Ilustrações vetoriais geradas no navegador para as publicações de exemplo.
 *
 * As fotos reais do Campuni pertencem a quem anunciou e não entram neste
 * repositório. Em vez de imagem de banco genérica, cada exemplo ganha uma
 * cena desenhada (lavoura, curral, drone, máquina, sacaria) ou um flyer em
 * pé, que é justamente o caso que o card novo precisa mostrar sem cortar.
 * Tudo vira data URI: zero requisição, zero foto quebrada.
 */

export type Cena = 'drone' | 'curral' | 'maquina' | 'sacaria' | 'bateria' | 'irrigacao';

function uri(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function escapar(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
}

export function cena(tipo: Cena, semente: number): string {
  let s = semente;
  const r = (n: number) => {
    s = (s * 9301 + 49297) % 233280;
    return (s / 233280) * n;
  };
  const w = 1080;
  const h = 1350;
  const hz = h * 0.46;
  const ceu = ['#A8CBEA', '#CFE0EE', '#F2D9A8', '#E9C9A0'][Math.floor(r(4))];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FA3D6"/><stop offset="1" stop-color="${ceu}"/></linearGradient><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C9A4E"/><stop offset="1" stop-color="#344A1F"/></linearGradient></defs>`;
  svg += `<rect width="${w}" height="${h}" fill="url(#c)"/><circle cx="${w * 0.2 + r(w * 0.6)}" cy="${h * 0.16}" r="${h * 0.06}" fill="#FFF3C8"/>`;
  svg += `<path d="M0 ${hz} Q${w * 0.3} ${hz - 50} ${w * 0.6} ${hz - 12} T${w} ${hz} V${h} H0Z" fill="#5E7B3A"/>`;
  svg += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#t)"/>`;
  for (let i = -16; i <= 16; i++) {
    svg += `<line x1="${w / 2 + i * 12}" y1="${hz}" x2="${w / 2 + i * 120}" y2="${h}" stroke="#25361A" stroke-opacity=".42" stroke-width="5"/>`;
  }

  if (tipo === 'drone') {
    const cx = w * (0.4 + r(0.2));
    const cy = h * 0.3;
    svg += `<path d="M${cx - 70} ${cy + 40} L${cx - 230} ${h * 0.72} L${cx + 230} ${h * 0.72} L${cx + 70} ${cy + 40}Z" fill="#fff" fill-opacity=".16"/>`;
    svg += `<g fill="#1F2422"><rect x="${cx - 70}" y="${cy - 24}" width="140" height="48" rx="16"/>`;
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      svg += `<line x1="${cx}" y1="${cy}" x2="${cx + a * 170}" y2="${cy + b * 44}" stroke="#1F2422" stroke-width="13"/><ellipse cx="${cx + a * 170}" cy="${cy + b * 44 - 16}" rx="78" ry="10" fill-opacity=".5"/>`;
    }
    svg += `</g>`;
  }
  if (tipo === 'curral') {
    for (let i = 0; i < 7; i++) svg += `<rect x="${30 + (i * w) / 6.3}" y="${h * 0.38}" width="38" height="${h * 0.6}" fill="#6B4A2E"/>`;
    for (let j = 0; j < 4; j++) svg += `<rect x="0" y="${h * 0.44 + j * 84}" width="${w}" height="30" fill="#8A6440"/>`;
    svg += `<ellipse cx="${w * 0.6}" cy="${h * 0.84}" rx="170" ry="84" fill="#EDEBE4"/><ellipse cx="${w * 0.76}" cy="${h * 0.76}" rx="54" ry="44" fill="#E2DFD6"/>`;
  }
  if (tipo === 'maquina') {
    const y = h * 0.66;
    svg += `<rect x="${w * 0.24}" y="${y - 170}" width="${w * 0.4}" height="170" rx="18" fill="#2E7D32"/><rect x="${w * 0.48}" y="${y - 300}" width="${w * 0.15}" height="140" rx="10" fill="#26302A" fill-opacity=".85"/><circle cx="${w * 0.32}" cy="${y + 26}" r="100" fill="#1E1E1E"/><circle cx="${w * 0.32}" cy="${y + 26}" r="40" fill="#F2C230"/><circle cx="${w * 0.6}" cy="${y + 50}" r="70" fill="#1E1E1E"/><circle cx="${w * 0.6}" cy="${y + 50}" r="28" fill="#F2C230"/>`;
  }
  if (tipo === 'sacaria') {
    for (let i = 0; i < 5; i++) {
      const x = w * 0.08 + i * 190;
      const y = h * 0.62 - (i % 2) * 40;
      svg += `<rect x="${x}" y="${y}" width="180" height="230" rx="46" fill="#E8DCC0" stroke="#B9A27A" stroke-width="5"/><path d="M${x + 50} ${y + 70} h80" stroke="#7B5E37" stroke-width="10"/>`;
    }
  }
  if (tipo === 'bateria') {
    svg += `<rect x="${w * 0.28}" y="${h * 0.3}" width="${w * 0.44}" height="${h * 0.42}" rx="28" fill="#1C2128"/><rect x="${w * 0.42}" y="${h * 0.26}" width="${w * 0.16}" height="52" rx="10" fill="#1C2128"/><path d="M${w * 0.53} ${h * 0.38} L${w * 0.44} ${h * 0.54} H${w * 0.51} L${w * 0.47} ${h * 0.66} L${w * 0.57} ${h * 0.48} H${w * 0.5}Z" fill="#7BE07B"/>`;
  }
  if (tipo === 'irrigacao') {
    svg += `<line x1="0" y1="${h * 0.42}" x2="${w}" y2="${h * 0.36}" stroke="#CFD6DA" stroke-width="16"/>`;
    for (let i = 0; i < 6; i++) {
      const x = 80 + i * 190;
      svg += `<path d="M${x} ${h * 0.42 - i * 9} l-50 ${h * 0.3} M${x} ${h * 0.42 - i * 9} l50 ${h * 0.3}" stroke="#9AA6AC" stroke-width="10"/>`;
      svg += `<path d="M${x - 60} ${h * 0.46} q60 50 120 0" stroke="#DDF1FF" stroke-opacity=".7" stroke-width="6" fill="none"/>`;
    }
  }
  return uri(svg + '</svg>');
}

export function flyer(titulo: string, apoio: string, paleta: number): string {
  const w = 1080;
  const h = 1350;
  const fundo = ['#0E2A1B', '#0B1F33', '#2A1A0E'][paleta % 3];
  const destaque = ['#7BE07B', '#4FC3F7', '#F2B33D'][paleta % 3];
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of titulo.toUpperCase().split(' ')) {
    if ((atual + ' ' + palavra).trim().length > 13) {
      linhas.push(atual.trim());
      atual = palavra;
    } else atual += ' ' + palavra;
  }
  linhas.push(atual.trim());

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${fundo}"/>`;
  for (let i = 0; i < 14; i++) svg += `<line x1="${-260 + i * 110}" y1="${h}" x2="${260 + i * 110}" y2="0" stroke="${destaque}" stroke-opacity=".07" stroke-width="36"/>`;
  svg += `<rect x="${w - 330}" y="90" width="250" height="56" rx="28" fill="${destaque}"/><text x="${w - 205}" y="128" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="700" font-size="28" fill="${fundo}">NOVIDADE</text>`;
  linhas.slice(0, 6).forEach((l, i) => {
    svg += `<text x="80" y="${300 + i * 112}" font-family="Arial Black,Arial,Helvetica,sans-serif" font-weight="900" font-size="98" fill="#fff">${escapar(l)}</text>`;
  });
  svg += `<rect x="80" y="${h - 330}" width="${w - 160}" height="5" fill="${destaque}"/><text x="80" y="${h - 260}" font-family="Arial,Helvetica,sans-serif" font-size="40" fill="#fff" fill-opacity=".85">${escapar(apoio)}</text>`;
  svg += `<rect x="80" y="${h - 190}" width="${w - 160}" height="104" rx="22" fill="${destaque}"/><text x="${w / 2}" y="${h - 124}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="42" fill="${fundo}">CHAME NO WHATSAPP</text>`;
  return uri(svg + '</svg>');
}
