import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { FormularioConta } from '../componentes/FormularioConta';
import { useConta } from '../lib/conta';
import { guardado } from '../lib/guardado';

/** /entrar e /cadastro: a mesma tela, abrindo no modo certo. */
export function Entrar({ inicial = 'entrar' }: { inicial?: 'entrar' | 'cadastro' }) {
  const { usuario, carregando } = useConta();
  const [params] = useSearchParams();
  const navegar = useNavigate();
  const destino = params.get('voltar') || guardado.ler<string | null>('voltar', null) || '/minha-conta';

  useEffect(() => {
    document.title = (inicial === 'cadastro' ? 'Criar conta' : 'Entrar') + ' · Campuni';
  }, [inicial]);

  if (!carregando && usuario) {
    guardado.gravar('voltar', null);
    return <Navigate to={destino} replace />;
  }

  return (
    <div className="container">
      <div className="conta-tela">
        <div className="conta-lado">
          <span className="rotulo">Sua conta Campuni</span>
          <h1>O agro da sua região, <em>na palma da mão</em>.</h1>
          <ul>
            <li><CheckCircle2 className="ico" /><span><b>Publique grátis</b> ofertas e procuras, com até 6 fotos.</span></li>
            <li><CheckCircle2 className="ico" /><span><b>Acompanhe seus anúncios:</b> visualizações, curtidas e validade.</span></li>
            <li><CheckCircle2 className="ico" /><span><b>Renove com um toque</b> e volte para o topo da busca.</span></li>
            <li><CheckCircle2 className="ico" /><span><b>Contato direto</b> no seu WhatsApp, sem intermediário.</span></li>
          </ul>
        </div>
        <FormularioConta key={inicial} inicial={inicial} voltarPara={destino} aoEntrar={() => navegar(destino, { replace: true })} />
      </div>
    </div>
  );
}
