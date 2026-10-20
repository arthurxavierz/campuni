import { ChevronDown, Moon, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { modoDemo } from '../lib/dados';
import { useEstado } from '../lib/estado';
import { NAVEGACAO } from '../lib/site';
import { Marca } from './Marca';

export function Cabecalho() {
  const { alternarTema } = useEstado();
  const [menu, setMenu] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const local = useLocation();

  useEffect(() => setMenu(false), [local.pathname]);
  useEffect(() => {
    if (!menu) return;
    const fora = (e: MouseEvent) => !caixa.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener('mousedown', fora);
    return () => document.removeEventListener('mousedown', fora);
  }, [menu]);

  return (
    <>
      {modoDemo && (
        <div className="faixa-demo">
          <b>Protótipo de redesign.</b> <span className="so-desktop">Publicações marcadas como "exemplo" são fictícias e o que você publicar aqui fica só no seu navegador.</span><span className="so-movel">O que você publicar fica só neste aparelho.</span>
        </div>
      )}
      <header className="cabecalho">
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
            <div className="menu-mais so-desktop" ref={caixa}>
              <button className="btn btn-contorno btn-p" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
                Campuni <ChevronDown className="ico" />
              </button>
              {menu && (
                <div className="painel">
                  <Link to="/sobre">
                    <span>Sobre o Campuni<small>Quem somos e por que existimos</small></span>
                  </Link>
                  <Link to="/como-funciona#video">
                    <span>Vídeo explicativo<small>Veja em 1 minuto como funciona</small></span>
                  </Link>
                  <Link to="/contato">
                    <span>Fale conosco<small>WhatsApp, e-mail e formulário</small></span>
                  </Link>
                  <Link to="/salvos">
                    <span>Meus salvos<small>Oportunidades que você guardou</small></span>
                  </Link>
                </div>
              )}
            </div>
            <button className="btn-icone" onClick={alternarTema} aria-label="Alternar tema claro e escuro">
              <Moon className="ico" />
            </button>
            <Link to="/publicar" className="btn btn-primario so-desktop">
              <Plus className="ico" /> Publicar grátis
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
