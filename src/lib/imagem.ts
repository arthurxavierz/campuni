import type { FotoProcessada } from './tipos';

/**
 * Prepara a foto no aparelho de quem publica, antes de subir.
 *
 * O problema que isso resolve: no site atual, quem sobe um flyer em pé
 * (512×640) vê o card cortar o meio dele numa faixa horizontal, e foto
 * de celular deitada às vezes aparece de lado. Aqui:
 *
 *   1. A orientação do EXIF é aplicada (a foto fica de pé como foi tirada).
 *   2. Toda foto vira 1080×1350 (4:5), o formato do card e do Instagram.
 *   3. Se a proporção já é quase 4:5, preenche o quadro.
 *      Se não é, a foto entra INTEIRA, sobre um fundo desfocado dela
 *      mesma. Nada de corte, nada de faixa preta, nada de esticar.
 *   4. Sai em WebP (ou JPEG onde não houver WebP), tipicamente 90% menor.
 *
 * O desfoque é feito reduzindo a foto a 27×34 pixels e ampliando de
 * volta: funciona em todo navegador, inclusive Safari antigo, onde
 * `ctx.filter = 'blur()'` não existe, e custa quase nada.
 */

const LARGURA = 1080;
const ALTURA = 1350;
const TOLERANCIA = 0.06;

type Fonte = ImageBitmap | HTMLImageElement;

async function decodificar(arquivo: File): Promise<Fonte> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(arquivo, { imageOrientation: 'from-image' });
    } catch {
      /* formato que o bitmap não lê: tenta pela tag img */
    }
  }
  const url = URL.createObjectURL(arquivo);
  try {
    return await new Promise<HTMLImageElement>((ok, falha) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => falha(new Error('formato'));
      img.src = url;
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function paraBlob(tela: HTMLCanvasElement): Promise<Blob> {
  return new Promise((ok, falha) => {
    tela.toBlob(
      (webp) => {
        if (webp && webp.type === 'image/webp') return ok(webp);
        tela.toBlob((jpg) => (jpg ? ok(jpg) : falha(new Error('codificar'))), 'image/jpeg', 0.82);
      },
      'image/webp',
      0.8,
    );
  });
}

export async function prepararFoto(arquivo: File): Promise<FotoProcessada> {
  const img = await decodificar(arquivo);
  const iw = img.width;
  const ih = img.height;

  const tela = document.createElement('canvas');
  tela.width = LARGURA;
  tela.height = ALTURA;
  const ctx = tela.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const alvo = LARGURA / ALTURA;
  const proporcao = iw / ih;

  if (Math.abs(proporcao - alvo) / alvo < TOLERANCIA) {
    const s = Math.max(LARGURA / iw, ALTURA / ih);
    ctx.drawImage(img, (LARGURA - iw * s) / 2, (ALTURA - ih * s) / 2, iw * s, ih * s);
  } else {
    const mini = document.createElement('canvas');
    mini.width = 27;
    mini.height = 34;
    const m = mini.getContext('2d');
    if (m) {
      const s0 = Math.max(27 / iw, 34 / ih);
      m.drawImage(img, (27 - iw * s0) / 2, (34 - ih * s0) / 2, iw * s0, ih * s0);
      ctx.drawImage(mini, -24, -24, LARGURA + 48, ALTURA + 48);
    }
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.fillRect(0, 0, LARGURA, ALTURA);
    const s = Math.min(LARGURA / iw, ALTURA / ih);
    ctx.drawImage(img, (LARGURA - iw * s) / 2, (ALTURA - ih * s) / 2, iw * s, ih * s);
  }

  if ('close' in img) img.close();

  const blob = await paraBlob(tela);
  return {
    blob,
    url: URL.createObjectURL(blob),
    antes: arquivo.size,
    depois: blob.size,
    largura: LARGURA,
    altura: ALTURA,
  };
}

/** Aceita imagem por tipo ou, no caso do HEIC do iPhone, pela extensão. */
export function ehImagem(arquivo: File): boolean {
  return arquivo.type.startsWith('image/') || /\.(heic|heif)$/i.test(arquivo.name);
}

/** Converte para data URL. Usado só na demonstração, para a foto sobreviver ao recarregar. */
export function blobParaDataUrl(blob: Blob): Promise<string> {
  return new Promise((ok, falha) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => falha(r.error);
    r.readAsDataURL(blob);
  });
}
