import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { ProvedorEstado } from './lib/estado';
import './estilos/app.css';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <ProvedorEstado>
      <App />
    </ProvedorEstado>
  </StrictMode>,
);
