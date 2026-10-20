import { Heart, Menu, Plus, Search, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Gaveta } from './Gaveta';

/** Navegação do celular: polegar alcança tudo, Publicar no centro. */
export function BarraMovel() {
  const [mais, setMais] = useState(false);
  return (
    <>
      <nav className="barra-movel" aria-label="Navegação">
        <NavLink to="/" end viewTransition>
          <Search className="ico" />Explorar
        </NavLink>
        <NavLink to="/em-alta" viewTransition>
          <TrendingUp className="ico" />Em alta
        </NavLink>
        <NavLink to="/publicar" className="publicar-fab" aria-label="Publicar">
          <span className="bolha"><Plus className="ico" /></span>Publicar
        </NavLink>
        <NavLink to="/salvos" viewTransition>
          <Heart className="ico" />Salvos
        </NavLink>
        <a href="#mais" onClick={(e) => { e.preventDefault(); setMais(true); }}>
          <Menu className="ico" />Mais
        </a>
      </nav>
      <Gaveta aberta={mais} aoFechar={() => setMais(false)} titulo="Campuni">
        <div className="chips-quebra" style={{ flexDirection: 'column', alignItems: 'stretch' }} onClick={() => setMais(false)}>
          {[
            ['/em-destaque', 'Perfis em destaque'],
            ['/como-funciona', 'Como funciona'],
            ['/como-funciona#video', 'Vídeo explicativo'],
            ['/sobre', 'Sobre o Campuni'],
            ['/contato', 'Fale conosco'],
            ['/privacidade', 'Privacidade'],
            ['/termos', 'Termos de uso'],
          ].map(([href, rotulo]) => (
            <Link key={href} to={href} className="btn btn-contorno" style={{ justifyContent: 'flex-start' }}>
              {rotulo}
            </Link>
          ))}
        </div>
      </Gaveta>
    </>
  );
}
