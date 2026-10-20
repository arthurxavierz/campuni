import { ChevronDown, LayoutList, LogOut, Moon, Plus, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useConta } from '../lib/conta';
import { useEstado } from '../lib/estado';
import { iniciais } from '../lib/formato';
import { NAVEGACAO } from '../lib/site';
import { Marca } from './Marca';

/** Menu que fecha ao clicar fora ou trocar de página. */
function useMenu() {
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => setAberto(false), [pathname]);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: MouseEvent) => !caixa.current?.contains(e.target as Node) && setAberto(false);
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && setAberto(false);
    document.addEventListener('mousedown', fora);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fora);
      document.removeEventListener('keydown', tecla);
    };
  }, [aberto]);
  return { aberto, setAberto, caixa };
}

export function Cabecalho() {
  const { alternarTema } = useEstado();
  const { usuario, sair } = useConta();
  const { pathname } = useLocation();
  const navegar = useNavigate();
  const institucional = useMenu();
  const conta = useMenu();
  const noInicio = pathname === '/';
  const [rolou, setRolou] = useState(false);

  // No início o cabeçalho flutua transparente sobre o hero e ganha fundo ao rolar.
  useEffect(() => {
    document.body.classList.toggle('no-inicio', noInicio);
    if (!noInicio) return;
    const medir = () => setRolou(window.scrollY > 40);
    medir();
    window.addEventListener('scroll', medir, { passive: true });
    return () => window.removeEventListener('scroll', medir);
  }, [noInicio]);

  return (
    <header className={'cabecalho' + (noInicio ? ' sobre-hero' : '') + (rolou ? ' rolou' : '')}>
      <div className="container">
        <Marca />
        <nav className="nav" aria-label="Principal">
          {NAVEGACAO.map((n) => (
            <NavLink key={n.href} to={n.href} end={n.href === '/'} viewTransition>
              {n.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="acoes-topo">
          <div className="menu-mais so-desktop" ref={institucional.caixa}>
            <button className="btn btn-contorno btn-p" aria-expanded={institucional.aberto} onClick={() => institucional.setAberto((m) => !m)}>
              Campuni <ChevronDown className="ico" />
            </button>
            {institucional.aberto && (
              <div className="painel">
                <Link to="/sobre"><span>Sobre o Campuni<small>Quem somos e por que existimos</small></span></Link>
                <Link to="/como-funciona#video"><span>Vídeo explicativo<small>Veja em 1 minuto como funciona</small></span></Link>
                <Link to="/contato"><span>Fale conosco<small>WhatsApp, e-mail e formulário</small></span></Link>
                <Link to="/salvos"><span>Meus salvos<small>Oportunidades que você guardou</small></span></Link>
              </div>
            )}
          </div>
          <button className="btn-icone" onClick={alternarTema} aria-label="Alternar tema claro e escuro">
            <Moon className="ico" />
          </button>
          {usuario ? (
            <div className="menu-mais so-desktop" ref={conta.caixa}>
              <button className="avatar-btn" aria-expanded={conta.aberto} onClick={() => conta.setAberto((m) => !m)}>
                <span className="avatar">{usuario.avatar ? <img src={usuario.avatar} alt="" referrerPolicy="no-referrer" /> : iniciais(usuario.nome)}</span>
                {usuario.nome.split(' ')[0]}
                <ChevronDown className="ico" />
              </button>
              {conta.aberto && (
                <div className="painel">
                  <Link to="/minha-conta"><LayoutList className="ico" /><span>Meus anúncios<small>Renovar, pausar e acompanhar</small></span></Link>
                  <Link to="/minha-conta?aba=perfil"><UserRound className="ico" /><span>Perfil e contato<small>{usuario.email}</small></span></Link>
                  <a href="#sair" onClick={async (e) => { e.preventDefault(); await sair(); navegar('/'); }}><LogOut className="ico" /><span>Sair</span></a>
                </div>
              )}
            </div>
          ) : (
            <Link to="/entrar" className="btn btn-contorno btn-p so-desktop">Entrar</Link>
          )}
          <Link to="/publicar" className="btn btn-primario so-desktop">
            <Plus className="ico" /> Publicar grátis
          </Link>
          {!usuario && (
            <Link to="/entrar" className="btn btn-contorno btn-p so-movel">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
