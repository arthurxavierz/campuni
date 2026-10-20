import { ImageOff } from 'lucide-react';
import { useState, type ReactNode } from 'react';

/**
 * Foto que nunca quebra.
 *
 * Duas camadas da mesma imagem: atrás, ela mesma desfocada preenchendo o
 * quadro; na frente, ela inteira (contain). Foto deitada, em pé ou flyer
 * com texto até a borda: aparece completa e o quadro continua cheio.
 * Enquanto baixa, a frente surge do desfoque; se falhar, mostra um aviso
 * no lugar do ícone de imagem quebrada do navegador.
 */
interface Props {
  src?: string;
  alt?: string;
  prioridade?: boolean;
  children?: ReactNode;
  className?: string;
  estilo?: React.CSSProperties;
}

export function Midia({ src, alt = '', prioridade, children, className = '', estilo }: Props) {
  const [estado, setEstado] = useState<'carregando' | 'ok' | 'erro'>('carregando');
  return (
    <div className={'midia ' + className} style={estilo}>
      {src && estado !== 'erro' ? (
        <>
          <img className="fundo" src={src} alt="" aria-hidden="true" loading={prioridade ? 'eager' : 'lazy'} decoding="async" />
          <img
            className={'frente' + (estado === 'carregando' ? ' carregando' : '')}
            src={src}
            alt={alt}
            loading={prioridade ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setEstado('ok')}
            onError={() => setEstado('erro')}
            ref={(el) => {
              if (el?.complete && el.naturalWidth && estado === 'carregando') setEstado('ok');
            }}
          />
        </>
      ) : (
        <div className="vazio">
          <ImageOff className="ico" aria-label={src ? 'Foto indisponível' : 'Sem foto'} />
        </div>
      )}
      {children}
    </div>
  );
}
