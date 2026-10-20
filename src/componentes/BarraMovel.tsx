import { Heart, Plus, Search, TrendingUp, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';

import { useConta } from '../lib/conta';
import { iniciais } from '../lib/formato';
import { Gaveta } from './Gaveta';

/** Navegação do celular: polegar alcança tudo, Publicar no centro, conta à direita. */
export function BarraMovel() {
  const [mais, setMais] = useState(false);
  const { usuario, sair } = useConta();
  const navegar = useNavigate();
  const fechar = () => setMais(false);
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
        <a href="#conta" onClick={(e) => { e.preventDefault(); setMais(true); }}>
          {usuario ? (
            <span className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>
              {usuario.avatar ? <img src={usuario.avatar} alt="" referrerPolicy="no-referrer" /> : iniciais(usuario.nome)}
            </span>
          ) : (
            <UserRound className="ico" />
          )}
          {usuario ? 'Conta' : 'Entrar'}
        </a>
      </nav>
      <Gaveta aberta={mais} aoFechar={fechar} titulo={usuario ? usuario.nome : 'Campuni'}>
        <div style={{ display: 'grid', gap: 8 }} onClick={(e) => (e.target as HTMLElement).closest('a') && fechar()}>
          {usuario ? (
            <>
              <Link to="/minha-conta" className="btn btn-primario">Meus anúncios</Link>
              <Link to="/minha-conta?aba=perfil" className="btn btn-contorno">Perfil e contato</Link>
            </>
          ) : (
            <>
              <Link to="/entrar" className="btn btn-primario">Entrar</Link>
              <Link to="/cadastro" className="btn btn-contorno">Criar conta grátis</Link>
            </>
          )}
          <div className="ou" style={{ margin: '8px 0' }}>Campuni</div>
          {[
            ['/em-destaque', 'Perfis em destaque'],
            ['/como-funciona', 'Como funciona'],
            ['/como-funciona#video', 'Vídeo explicativo'],
            ['/sobre', 'Sobre o Campuni'],
            ['/contato', 'Fale conosco'],
            ['/termos', 'Termos de uso'],
          ].map(([href, rotulo]) => (
            <Link key={href} to={href} className="btn btn-contorno" style={{ justifyContent: 'flex-start' }}>{rotulo}</Link>
          ))}
          {usuario && (
            <button className="btn btn-contorno" style={{ justifyContent: 'flex-start', color: 'var(--perigo)' }} onClick={async () => { fechar(); await sair(); navegar('/'); }}>
              Sair da conta
            </button>
          )}
        </div>
      </Gaveta>
    </>
  );
}
