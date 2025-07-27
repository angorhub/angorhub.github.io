import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// PWA testing in development
if (import.meta.env.DEV) {
  import('./test/pwa-test.ts').then(({ runPWATests }) => {
    runPWATests();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
