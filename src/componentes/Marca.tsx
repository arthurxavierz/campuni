import { Link } from 'react-router-dom';

/** Símbolo: um sulco de lavoura e um broto. Mesmo desenho do favicon e do carregador. */
export function Simbolo({ tamanho = 32 }: { tamanho?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={tamanho} height={tamanho} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#556B3E" />
      <path d="M6 25 Q16 19 26 25" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M16 21 C12 14 14 9 21 6 C22 13 20 18 16 21Z" fill="#E6AE45" />
    </svg>
  );
}

export function Marca() {
  return (
    <Link to="/" className="marca" aria-label="Campuni, página inicial">
      <Simbolo />
      Campuni
    </Link>
  );
}
