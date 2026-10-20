import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { SITE } from '../lib/site';

/**
 * Política de privacidade e termos de uso.
 *
 * Redação-base para o protótipo, escrita a partir do que o sistema de
 * fato faz. Precisa de revisão jurídica antes do lançamento
 * (DADOS-CAMPUNI.md).
 */

const ATUALIZADO = '20 de outubro de 2026';

export function Privacidade() {
  useEffect(() => {
    document.title = 'Política de privacidade · Campuni';
  }, []);
  return (
    <div className="container pagina-topo">
      <span className="rotulo">Privacidade</span>
      <h1>Política de privacidade</h1>
      <div className="prosa" style={{ marginTop: 24 }}>
        <p>Atualizada em {ATUALIZADO}. Esta política explica quais dados o {SITE.nome} usa, para quê e quais são os seus direitos pela Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
        <h2>Dados que usamos</h2>
        <ul>
          <li><b>Para publicar:</b> e-mail (para entrar), nome ou nome da empresa, WhatsApp, cidade e estado, e o conteúdo e as fotos do anúncio.</li>
          <li><b>Para falar com a gente:</b> nome, e-mail ou WhatsApp e a mensagem que você escreveu no formulário de contato.</li>
          <li><b>Para receber novidades:</b> o e-mail, somente com a sua autorização expressa.</li>
          <li><b>No seu aparelho:</b> sessão de login, anúncios salvos, rascunho do anúncio e preferência de tema. Não usamos cookies de rastreamento ou publicidade.</li>
        </ul>
        <h2>Para que usamos</h2>
        <p>Para exibir seu anúncio, permitir que interessados falem com você pelo WhatsApp, responder seus contatos, prevenir fraude e cumprir obrigações legais. Seu número de WhatsApp não aparece escrito na página do anúncio; ele é usado pelo botão de contato.</p>
        <h2>Com quem compartilhamos</h2>
        <p>Com os provedores que mantêm o site no ar (hospedagem e banco de dados), somente o necessário para o serviço funcionar. Não vendemos dados.</p>
        <h2>Por quanto tempo</h2>
        <p>Anúncios saem da busca ao expirar e são apagados de forma definitiva em até 90 dias. Mensagens de contato são guardadas por até 12 meses.</p>
        <h2>Seus direitos</h2>
        <p>Você pode pedir acesso, correção, portabilidade ou exclusão dos seus dados, e retirar a autorização para novidades a qualquer momento, pelo e-mail <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </div>
  );
}

export function Termos() {
  useEffect(() => {
    document.title = 'Termos de uso · Campuni';
  }, []);
  return (
    <div className="container pagina-topo">
      <span className="rotulo">Termos</span>
      <h1>Termos de uso</h1>
      <div className="prosa" style={{ marginTop: 24 }}>
        <p>Atualizados em {ATUALIZADO}. Ao usar o {SITE.nome}, você concorda com estas regras.</p>
        <h2>O que o Campuni é</h2>
        <p>Uma vitrine de ofertas e demandas do agro. O Campuni não vende, não compra, não intermedeia pagamento e não garante produtos ou serviços anunciados. A negociação é feita diretamente entre as partes.</p>
        <h2>O que você pode publicar</h2>
        <ul>
          <li>Produtos, serviços e demandas reais, relacionados ao agro, com informações verdadeiras.</li>
          <li>Fotos suas ou que você tem direito de usar.</li>
        </ul>
        <h2>O que não é permitido</h2>
        <ul>
          <li>Produtos ilegais, defensivos sem registro, animais sem a documentação exigida ou itens de origem duvidosa.</li>
          <li>Anúncios enganosos, duplicados ou com preço fictício para atrair contato.</li>
          <li>Conteúdo ofensivo, discriminatório ou que exponha dados de terceiros.</li>
        </ul>
        <h2>Moderação</h2>
        <p>O Campuni pode remover anúncios que descumpram estes termos, com ou sem denúncia, e suspender quem insistir. Denúncias são feitas pelo link "Denunciar publicação" em cada anúncio.</p>
        <h2>Responsabilidade</h2>
        <p>Quem publica é responsável pelo que anuncia. Antes de fechar negócio, veja as <Link to="/como-funciona#seguranca">dicas de negociação segura</Link>.</p>
        <h2>Contato</h2>
        <p>Dúvidas sobre estes termos: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>
      </div>
    </div>
  );
}

export function NaoEncontrada() {
  return (
    <div className="container pagina-topo">
      <span className="rotulo">Erro 404</span>
      <h1>Esta página não existe ou mudou de lugar.</h1>
      <p className="intro">Confira o endereço ou volte para as oportunidades.</p>
      <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
        <Link className="btn btn-primario" to="/">Ver oportunidades</Link>
        <Link className="btn btn-contorno" to="/contato">Fale conosco</Link>
      </div>
    </div>
  );
}
