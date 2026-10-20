import { CheckCircle2, Clock, Mail, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { IconeInstagram, IconeWhatsApp } from '../componentes/IconesProprios';
import { Perguntas } from '../componentes/Perguntas';
import { enviarContato } from '../lib/dados';
import { mascaraTelefone } from '../lib/formato';
import { SITE, linkWhatsApp, telefoneVisivel } from '../lib/site';

const ASSUNTOS = ['Dúvida sobre como usar', 'Problema no meu anúncio', 'Parceria ou divulgação', 'Denunciar conteúdo', 'Imprensa', 'Outro assunto'];

export function Contato() {
  const [f, setF] = useState({ nome: '', email: '', whatsapp: '', assunto: ASSUNTOS[0], mensagem: '', aceite: false, empresa: '' });
  const [erros, setErros] = useState<Record<string, string>>({});
  const [estado, setEstado] = useState<'parado' | 'enviando' | 'ok'>('parado');
  const [falha, setFalha] = useState('');

  useEffect(() => {
    document.title = 'Fale conosco · Campuni';
  }, []);

  const mudar = (k: keyof typeof f, v: string | boolean) => {
    setF((a) => ({ ...a, [k]: v }));
    setErros((e) => ({ ...e, [k]: '' }));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.nome.trim().length < 2) er.nome = 'Informe seu nome.';
    const temEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email);
    const temWhats = f.whatsapp.replace(/\D/g, '').length >= 10;
    if (!temEmail && !temWhats) er.email = 'Deixe um e-mail ou WhatsApp para a resposta.';
    if (f.mensagem.trim().length < 10) er.mensagem = 'Conte um pouco mais, pelo menos 10 letras.';
    if (!f.aceite) er.aceite = 'Precisamos da sua autorização para responder.';
    setErros(er);
    if (Object.keys(er).length) return;

    setEstado('enviando');
    setFalha('');
    try {
      await enviarContato({
        tipo: 'contato',
        nome: f.nome.trim(),
        email: f.email.trim().toLowerCase() || undefined,
        whatsapp: f.whatsapp || undefined,
        assunto: f.assunto,
        mensagem: f.mensagem.trim(),
        consentimento: true,
        empresa: f.empresa,
      });
      setEstado('ok');
    } catch (err) {
      setEstado('parado');
      setFalha(err instanceof Error ? err.message : 'Não foi possível enviar agora. Tente pelo WhatsApp.');
    }
  };

  return (
    <>
      <div className="container pagina-topo">
        <span className="rotulo">Fale conosco</span>
        <h1>Uma pergunta, uma ideia ou um problema? <em>Fale com a gente.</em></h1>
      </div>

      <section className="secao" style={{ paddingTop: 32 }}>
        <div className="container">
          <div className="cartoes-3">
            <a className="canal" href={linkWhatsApp()} target="_blank" rel="noopener noreferrer">
              <IconeWhatsApp className="ico" />
              <h3>WhatsApp</h3>
              <p>O jeito mais rápido. Respondemos em horário comercial.</p>
              <span className="valor num">{telefoneVisivel()}</span>
            </a>
            <a className="canal" href={`mailto:${SITE.email}`}>
              <Mail className="ico" />
              <h3>E-mail</h3>
              <p>Para parcerias, imprensa e assuntos que pedem anexo.</p>
              <span className="valor">{SITE.email}</span>
            </a>
            {SITE.instagram ? (
              <a className="canal" href={SITE.instagram} target="_blank" rel="noopener noreferrer">
                <IconeInstagram className="ico" />
                <h3>Instagram</h3>
                <p>Novidades, oportunidades em destaque e bastidores.</p>
                <span className="valor">Seguir o Campuni</span>
              </a>
            ) : (
              <div>
                <Clock className="ico" />
                <h3>Horário</h3>
                <p>{SITE.horario}</p>
                <span className="valor">{SITE.abrangencia}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="secao tom">
        <div className="container duas-colunas">
          <div>
            <span className="rotulo">Formulário</span>
            <h2 className="titulo-2">Escreva para a equipe.</h2>
            <p className="intro">Sua mensagem chega direto para quem cuida do Campuni. Respondemos pelo canal que você preferir.</p>
            <div style={{ marginTop: 28 }}>
              <Perguntas limite={3} />
            </div>
          </div>

          {estado === 'ok' ? (
            <div className="formulario" style={{ justifyItems: 'center', textAlign: 'center', padding: 40 }}>
              <CheckCircle2 size={56} style={{ color: 'var(--oliva)' }} />
              <h3 style={{ margin: 0, fontSize: 22, color: 'var(--tinta)' }}>Mensagem enviada</h3>
              <p style={{ margin: 0, color: 'var(--apagado)' }}>Obrigado, {f.nome.split(' ')[0]}. Respondemos em até um dia útil.</p>
              <button className="btn btn-contorno" onClick={() => { setEstado('parado'); setF((a) => ({ ...a, mensagem: '' })); }}>Enviar outra mensagem</button>
            </div>
          ) : (
            <form className="formulario" onSubmit={enviar} noValidate>
              <div className="campo">
                <label htmlFor="c-nome">Nome</label>
                <input id="c-nome" className={'entrada' + (erros.nome ? ' erro' : '')} value={f.nome} onChange={(e) => mudar('nome', e.target.value)} autoComplete="name" />
                {erros.nome && <span className="msg-erro">{erros.nome}</span>}
              </div>
              <div className="dois">
                <div className="campo">
                  <label htmlFor="c-email">E-mail</label>
                  <input id="c-email" type="email" className={'entrada' + (erros.email ? ' erro' : '')} value={f.email} onChange={(e) => mudar('email', e.target.value)} autoComplete="email" />
                </div>
                <div className="campo">
                  <label htmlFor="c-whats">WhatsApp</label>
                  <input id="c-whats" className="entrada num" inputMode="tel" value={f.whatsapp} onChange={(e) => mudar('whatsapp', mascaraTelefone(e.target.value))} placeholder="(34) 99999-9999" autoComplete="tel" />
                </div>
              </div>
              {erros.email && <span className="msg-erro">{erros.email}</span>}
              <div className="campo">
                <label htmlFor="c-assunto">Assunto</label>
                <select id="c-assunto" className="entrada" value={f.assunto} onChange={(e) => mudar('assunto', e.target.value)}>
                  {ASSUNTOS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="campo">
                <label htmlFor="c-msg">Mensagem</label>
                <textarea id="c-msg" className={'entrada' + (erros.mensagem ? ' erro' : '')} value={f.mensagem} onChange={(e) => mudar('mensagem', e.target.value)} />
                {erros.mensagem && <span className="msg-erro">{erros.mensagem}</span>}
              </div>
              <input className="armadilha" tabIndex={-1} autoComplete="off" aria-hidden="true" name="empresa" value={f.empresa} onChange={(e) => mudar('empresa', e.target.value)} />
              <label className="marcar">
                <input type="checkbox" checked={f.aceite} onChange={(e) => mudar('aceite', e.target.checked)} />
                <span>Autorizo o Campuni a usar estes dados para responder ao meu contato, conforme a <Link to="/privacidade">política de privacidade</Link>.</span>
              </label>
              {erros.aceite && <span className="msg-erro">{erros.aceite}</span>}
              {falha && <span className="msg-erro">{falha}</span>}
              <button className="btn btn-primario btn-g" disabled={estado === 'enviando'}>
                <Send className="ico" /> {estado === 'enviando' ? 'Enviando…' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
