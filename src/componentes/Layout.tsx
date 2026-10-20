import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { ligarOndulacao } from '../lib/efeitos';
import { BarraMovel } from './BarraMovel';
import { Cabecalho } from './Cabecalho';
import { Carregador } from './Carregador';
import { AvisoCookies, Recado, WhatsFlutuante } from './Flutuantes';
import { Rodape } from './Rodape';

/** Volta ao topo ao trocar de página, ou rola até a âncora (#video, #perguntas). */
function Rolagem() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => window.clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export function Layout() {
  useEffect(() => ligarOndulacao(), []);
  return (
    <>
      <a className="pular" href="#conteudo">Pular para o conteúdo</a>
      <Carregador />
      <Rolagem />
      <Cabecalho />
      <main id="conteudo">
        <Outlet />
      </main>
      <Rodape />
      <BarraMovel />
      <WhatsFlutuante />
      <AvisoCookies />
      <Recado />
    </>
  );
}
