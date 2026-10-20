import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CATEGORIAS } from '../lib/categorias';
import { enviarContato, listarPublicacoes } from '../lib/dados';
import { AUTORIA, RODAPE_COLUNAS, SITE, linkWhatsApp, telefoneVisivel } from '../lib/site';
import type { Publicacao } from '../lib/tipos';
import { IconeInstagram, IconeWhatsApp } from './IconesProprios';
import { Marca } from './Marca';

/**
 * Rodapé.
 *
 * As duas listas do topo, categorias e cidades, não são enfeite: cada
 * link é uma busca pronta (/?cat=drones, /?q=Patrocínio) e funciona como
 * porta de entrada para quem chega pelo Google procurando "drone
 * agrícola em Uberlândia". As cidades vêm das publicações no ar; se não
 * houver nenhuma, a lista simplesmente não aparece.
 */
export function Rodape() {
  const [pubs, setPubs] = useState<Publicacao[]>([]);
  useEffect(() => {
    listarPublicacoes().then(setPubs, () => undefined);
  }, []);

  const cidades = useMemo(() => {
    const conta = new Map<string, number>();
    for (const p of pubs) conta.set(`${p.cidade}/${p.uf}`, (conta.get(`${p.cidade}/${p.uf}`) ?? 0) + 1);
    return [...conta.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([c]) => c);
  }, [pubs]);

  const ano = new Date().getFullYear();

  return (
    <footer className="rodape">
      <div className="container">
        <div className="rodape-chamada">
          <div>
            <h2>Receba as oportunidades da sua região antes de todo mundo.</h2>
            <p>Um resumo por semana com o que entrou de novo. Sem spam, e você sai quando quiser.</p>
          </div>
          <Novidades />
        </div>

        <div className="rodape-listas">
          <section>
            <h3>Categorias</h3>
            <div className="itens">
              {CATEGORIAS.map((c) => (
                <Link key={c.slug} to={`/?cat=${c.slug}`}>{c.nome}</Link>
              ))}
            </div>
          </section>
          {cidades.length > 0 && (
            <section>
              <h3>Cidades com oportunidades</h3>
              <div className="itens">
                {cidades.map((c) => (
                  <Link key={c} to={`/?q=${encodeURIComponent(c.split('/')[0])}`}>{c}</Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="rodape-colunas">
          <div className="rodape-coluna rodape-sobre">
            <Marca />
            <p>{SITE.apoio} Feito para quem vive o agro: produtor, prestador de serviço, revenda e comprador.</p>
            <div className="redes">
              <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp do Campuni">
                <IconeWhatsApp />
              </a>
              {SITE.instagram && (
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram do Campuni">
                  <IconeInstagram />
                </a>
              )}
              <a href={`mailto:${SITE.email}`} aria-label="E-mail do Campuni">
                <Mail className="ico" />
              </a>
            </div>
          </div>

          {RODAPE_COLUNAS.map((col) => (
            <div key={col.titulo} className="rodape-coluna">
              <h4>{col.titulo}</h4>
              {col.itens.map((i) => (
                <Link key={i.href} to={i.href}>{i.rotulo}</Link>
              ))}
            </div>
          ))}

          <div className="rodape-coluna rodape-contato">
            <h4>Contato</h4>
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
              <Phone className="ico" />
              <span>{telefoneVisivel()} · WhatsApp</span>
            </a>
            <a href={`mailto:${SITE.email}`}>
              <Mail className="ico" />
              <span>{SITE.email}</span>
            </a>
            <p>
              <MapPin className="ico" />
              <span>{SITE.abrangencia}</span>
            </p>
            <p>
              <Clock className="ico" />
              <span>{SITE.horario}</span>
            </p>
          </div>
        </div>

        <div className="rodape-base">
          <span>© {ano} {SITE.nome}. Todos os direitos reservados.</span>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/termos">Termos de uso</Link>
          <Link to="/contato">Denunciar conteúdo</Link>
          <span className="autoria">
            Desenvolvido por {AUTORIA.nome}.{' '}
            <a href={AUTORIA.url} target="_blank" rel="noopener noreferrer">({AUTORIA.arroba})</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/**
 * Cadastro para novidades. Vai para a mesma rota do contato, com tipo
 * "novidades". O consentimento é explícito porque a LGPD pede base legal
 * para comunicação de marketing; digitar o e-mail não é uma.
 */
function Novidades() {
  const [email, setEmail] = useState('');
  const [aceite, setAceite] = useState(false);
  const [armadilha, setArmadilha] = useState('');
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'ok' | 'erro'>('parado');
  const [retorno, setRetorno] = useState('');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setEstado('erro');
      setRetorno('Confira o e-mail digitado.');
      return;
    }
    if (!aceite) {
      setEstado('erro');
      setRetorno('Marque a autorização para receber o resumo.');
      return;
    }
    setEstado('enviando');
    try {
      await enviarContato({ tipo: 'novidades', email: email.trim().toLowerCase(), consentimento: true, empresa: armadilha });
      setEstado('ok');
      setRetorno('Pronto. O próximo resumo chega no seu e-mail.');
      setEmail('');
    } catch (err) {
      setEstado('erro');
      setRetorno(err instanceof Error ? err.message : 'Não foi possível enviar agora.');
    }
  };

  return (
    <form className="novidades" onSubmit={enviar} noValidate>
      <div className="linha">
        <label className="sr" htmlFor="novidades-email">Seu e-mail</label>
        <input id="novidades-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        <button className="btn btn-ouro" disabled={estado === 'enviando'}>
          <Send className="ico" /> Assinar
        </button>
      </div>
      <input className="armadilha" tabIndex={-1} autoComplete="off" aria-hidden="true" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} name="empresa" />
      <label className="marcar">
        <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
        Autorizo o Campuni a me enviar oportunidades por e-mail, conforme a política de privacidade.
      </label>
      {retorno && <span className="retorno" role="status">{retorno}</span>}
    </form>
  );
}
