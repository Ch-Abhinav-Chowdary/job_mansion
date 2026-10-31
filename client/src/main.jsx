import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* Design system fonts (self-hosted via @fontsource) */
import './index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
