import { createBrowserRouter, createMemoryRouter, RouterProvider } from 'react-router-dom';

import { Layout } from './componentes/Layout';
import { ComoFunciona } from './paginas/ComoFunciona';
import { Contato } from './paginas/Contato';
import { Explorar } from './paginas/Explorar';
import { NaoEncontrada, Privacidade, Termos } from './paginas/Legais';
import { PublicacaoPagina } from './paginas/PublicacaoPagina';
import { Publicar } from './paginas/Publicar';
import { Sobre } from './paginas/Sobre';

/**
 * Rotas. A página de publicação mantém o endereço do site atual
 * (/publicacoes/:id), para os links já compartilhados continuarem
 * funcionando quando o novo layout for ao ar.
 */
// VITE_ROTEADOR=memoria: só para a prévia publicada dentro de outra página
// (artifact), onde o endereço da barra não pertence ao app.
const criar = import.meta.env.VITE_ROTEADOR === 'memoria' ? createMemoryRouter : createBrowserRouter;

const rotas = criar([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Explorar /> },
      { path: '/em-alta', element: <Explorar modo="alta" key="alta" /> },
      { path: '/em-destaque', element: <Explorar modo="destaque" key="destaque" /> },
      { path: '/salvos', element: <Explorar modo="salvos" key="salvos" /> },
      { path: '/publicacoes/:id', element: <PublicacaoPagina /> },
      { path: '/publicar', element: <Publicar /> },
      { path: '/como-funciona', element: <ComoFunciona /> },
      { path: '/sobre', element: <Sobre /> },
      { path: '/contato', element: <Contato /> },
      { path: '/privacidade', element: <Privacidade /> },
      { path: '/termos', element: <Termos /> },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
]);

export function App() {
  return <RouterProvider router={rotas} />;
}
