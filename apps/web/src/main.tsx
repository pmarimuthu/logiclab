import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/base.css';
import './styles/shell.css';
import './styles/slides.css';
import './styles/experiment.css';
import './styles/lab.css';
import './styles/art.css';
import './styles/scenes.css';

const root = document.getElementById('root');
if (root === null) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
