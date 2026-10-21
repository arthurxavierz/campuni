import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useEstado } from '../lib/estado';
import { guardado } from '../lib/guardado';
import { linkWhatsApp } from '../lib/site';
import { IconeWhatsApp } from './IconesProprios';

export function WhatsFlutuante() {
  return (
    <a className="whats-flutuante" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" aria-label="Falar com o Campuni no WhatsApp">
      <IconeWhatsApp />
    </a>
  );
}

export function Recado() {
  const { textoRecado } = useEstado();
  if (!textoRecado) return null;
  return (
    <div className="recado" role="status" key={textoRecado}>
      {textoRecado}
    </div>
  );
}

/**
 * Aviso de cookies. O Campuni só usa armazenamento essencial (sessão,
 * salvos, rascunho), então o aviso informa em vez de pedir permissão
 * para rastreamento que não existe. Se um dia entrar analytics, aqui
 * vira consentimento de verdade.
 */
export function AvisoCookies() {
  const [visto, setVisto] = useState(() => guardado.ler('cookies', false));
  // Espera a abertura do hero terminar antes de aparecer.
  const [pronto, setPronto] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setPronto(true), 3500);
    return () => window.clearTimeout(t);
  }, []);
  if (visto || !pronto) return null;
  return (
    <div className="cookies" role="region" aria-label="Aviso de cookies">
      <p>
        Usamos só o armazenamento necessário para o site funcionar: sessão, salvos e rascunho. Nada de rastreamento.{' '}
        <Link to="/privacidade">Saiba mais</Link>.
      </p>
      <div>
        <button
          className="btn btn-primario btn-p"
          onClick={() => {
            guardado.gravar('cookies', true);
            setVisto(true);
          }}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
